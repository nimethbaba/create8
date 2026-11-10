import * as THREE from 'three';
import { SVGLoader } from 'three-stdlib';
import type { Font } from 'three-stdlib';
import { CURVE_DIVISIONS } from './constants';
import type { SignMetrics } from './types';

/** A planar outer loop plus its holes, in centimetres. Stage 02 output of the pipeline. */
export interface Contour {
  outer: THREE.Vector2[];
  holes: THREE.Vector2[][];
}

const EPS_SQ = 1e-8;
const MAX_CONTOURS = 3000;
const MAX_POINTS = 250_000;

interface TypefaceData {
  resolution: number;
  glyphs: Record<string, { ha: number; o?: string }>;
}

/* ───────────────────────── Path cleaning ───────────────────────── */

/** Drop duplicate and colinear vertices so triangulation (earcut) stays robust. */
function cleanLoop(pts: THREE.Vector2[]): THREE.Vector2[] {
  const dedup: THREE.Vector2[] = [];
  for (const p of pts) {
    const last = dedup[dedup.length - 1];
    if (!last || last.distanceToSquared(p) > EPS_SQ) dedup.push(p);
  }
  if (dedup.length > 1 && dedup[0].distanceToSquared(dedup[dedup.length - 1]) <= EPS_SQ) dedup.pop();

  const n = dedup.length;
  const out: THREE.Vector2[] = [];
  for (let i = 0; i < n; i++) {
    const a = dedup[(i - 1 + n) % n], b = dedup[i], c = dedup[(i + 1) % n];
    const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
    if (Math.abs(cross) > 1e-9) out.push(b);
  }
  return out;
}

function toContour(shape: THREE.Shape, dx = 0, dy = 0, flipY = false): Contour | null {
  const { shape: outerRaw, holes: holesRaw } = shape.extractPoints(CURVE_DIVISIONS);
  const map = (p: THREE.Vector2) => new THREE.Vector2(p.x + dx, (flipY ? -p.y : p.y) + dy);
  const outer = cleanLoop(outerRaw.map(map));
  if (outer.length < 3) return null;
  const holes = holesRaw.map((h) => cleanLoop(h.map(map))).filter((h) => h.length >= 3);
  return { outer, holes };
}

/* ─────────────────────── Stage 01/02: text → contours ─────────────────────── */

export interface TextOptions {
  text: string;
  sizeCm: number;
  letterSpacing: number; // em
  lineSpacing: number;   // multiplier
}

/**
 * Custom glyph layout. THREE's Font.generateShapes() has no tracking or line control,
 * so we lay out glyph-by-glyph using each glyph's advance width (`ha`).
 * Note: typeface.json carries no kerning pairs — only uniform tracking is possible here.
 * True pair kerning needs opentype.js (GPOS table); see roadmap.
 */
export function textToContours(font: Font, o: TextOptions): Contour[] {
  const data = (font as unknown as { data: TypefaceData }).data;
  const scale = o.sizeCm / data.resolution;
  const result: Contour[] = [];

  o.text.split('\n').forEach((line, lineIdx) => {
    const y = -lineIdx * o.sizeCm * o.lineSpacing;
    const lineContours: Contour[] = [];
    let x = 0;

    for (const ch of line) {
      const glyph = data.glyphs[ch] ?? data.glyphs['?'];
      if (!glyph) continue;
      if (ch !== ' ' && glyph.o) {
        for (const shape of font.generateShapes(ch, o.sizeCm)) {
          const c = toContour(shape, x, y);
          if (c) lineContours.push(c);
        }
      }
      x += glyph.ha * scale + o.letterSpacing * o.sizeCm;
    }

    // centre each line horizontally
    const width = x - o.letterSpacing * o.sizeCm;
    const shift = -width / 2;
    for (const c of lineContours) {
      c.outer.forEach((p) => (p.x += shift));
      c.holes.forEach((h) => h.forEach((p) => (p.x += shift)));
      result.push(c);
    }
  });

  return normalise(result);
}

/* ─────────────────────── Stage 01/02: SVG → contours ─────────────────────── */

export function svgToContours(markup: string, targetWidthCm: number): Contour[] {
  const data = new SVGLoader().parse(markup);
  const contours: Contour[] = [];

  for (const path of data.paths) {
    const fill = path.userData?.style?.fill;
    if (fill === undefined || fill === 'none') continue; // stroke-only paths are ignored in the MVP
    for (const shape of SVGLoader.createShapes(path)) {
      const c = toContour(shape, 0, 0, true); // SVG y-axis points down → flip
      if (c) contours.push(c);
      if (contours.length > MAX_CONTOURS) throw new Error('SVG is too complex (too many shapes).');
    }
  }
  return normalise(contours, targetWidthCm);
}

/** Centre on origin; optionally scale so overall width == targetWidthCm (real-world metric). */
function normalise(contours: Contour[], targetWidthCm?: number): Contour[] {
  if (!contours.length) return contours;
  const box = new THREE.Box2();
  let total = 0;
  for (const c of contours) {
    for (const p of c.outer) { box.expandByPoint(p); total++; }
  }
  if (total > MAX_POINTS) throw new Error('Design has too many points.');

  const centre = box.getCenter(new THREE.Vector2());
  const k = targetWidthCm && box.max.x - box.min.x > 1e-6 ? targetWidthCm / (box.max.x - box.min.x) : 1;
  const fix = (p: THREE.Vector2) => p.sub(centre).multiplyScalar(k);
  for (const c of contours) {
    c.outer.forEach(fix);
    c.holes.forEach((h) => h.forEach(fix));
  }
  return contours;
}

/* ─────────────────────── Stage 03: contours → 3D ─────────────────────── */

/**
 * ExtrudeGeometry triangulates each cap with THREE.ShapeUtils → Earcut (bundled with three),
 * so earcut is already in the pipeline; our cleanLoop() above is the pre-pass the spec asks for.
 * Material groups: 0 = front/back faces, 1 = side walls (lets us light them independently).
 */
export function contoursToGeometry(contours: Contour[], depthCm: number): THREE.ExtrudeGeometry {
  const shapes = contours.map((c) => {
    const s = new THREE.Shape(c.outer);
    s.holes = c.holes.map((h) => new THREE.Path(h));
    return s;
  });

  const bevel = Math.min(depthCm * 0.08, 0.12);
  const geo = new THREE.ExtrudeGeometry(shapes, {
    depth: depthCm,
    steps: 1,
    curveSegments: 1, // curves are already flattened
    bevelEnabled: bevel > 0.005,
    bevelThickness: bevel,
    bevelSize: bevel * 0.8,
    bevelSegments: 2,
  });

  geo.computeBoundingBox();
  geo.translate(0, 0, -geo.boundingBox!.min.z); // back of sign sits at z = 0
  geo.computeBoundingBox();
  return geo;
}

/* ─────────────────────── Stage 04: metrics for pricing / BOM ─────────────────────── */

export function computeMetrics(geo: THREE.BufferGeometry, contours: Contour[]): SignMetrics {
  const box = geo.boundingBox ?? (geo.computeBoundingBox(), geo.boundingBox!);
  const size = box.getSize(new THREE.Vector3());

  const pos = geo.getAttribute('position'); // ExtrudeGeometry is non-indexed
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const ab = new THREE.Vector3(), ac = new THREE.Vector3();
  let volume = 0, area = 0;
  for (let i = 0; i < pos.count; i += 3) {
    a.fromBufferAttribute(pos, i);
    b.fromBufferAttribute(pos, i + 1);
    c.fromBufferAttribute(pos, i + 2);
    volume += a.dot(ab.copy(b).cross(c)) / 6;           // signed tetra volume
    area += ab.copy(b).sub(a).cross(ac.copy(c).sub(a)).length() / 2;
  }

  const loopLen = (pts: THREE.Vector2[]) =>
    pts.reduce((s, p, i) => s + p.distanceTo(pts[(i + 1) % pts.length]), 0);
  const perimeter = contours.reduce((s, c) => s + loopLen(c.outer) + c.holes.reduce((h, l) => h + loopLen(l), 0), 0);

  return {
    widthCm: size.x,
    heightCm: size.y,
    depthCm: size.z,
    volumeCm3: Math.abs(volume),
    surfaceAreaCm2: area,
    perimeterCm: perimeter,
  };
}
