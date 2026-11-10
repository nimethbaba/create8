/**
 * Planar loop maths for manufacturing output. Pure TypeScript, no three.js, so it runs anywhere.
 * Everything here works in whatever unit you give it (the exporters pass millimetres).
 */
export interface Pt { x: number; y: number }
export interface LoopSet { outer: Pt[]; holes: Pt[][] }

export const signedArea = (p: Pt[]): number => {
  let a = 0;
  for (let i = 0; i < p.length; i++) {
    const q = p[(i + 1) % p.length];
    a += p[i].x * q.y - q.x * p[i].y;
  }
  return a / 2;
};

const copy = (p: Pt[]): Pt[] => p.map(({ x, y }) => ({ x, y }));

/** Outer loops counter-clockwise, holes clockwise → material is always on the LEFT of travel. */
export function orient(contours: LoopSet[]): LoopSet[] {
  return contours.map((c) => ({
    outer: signedArea(c.outer) >= 0 ? copy(c.outer) : copy(c.outer).reverse(),
    holes: c.holes.map((h) => (signedArea(h) <= 0 ? copy(h) : copy(h).reverse())),
  }));
}

export function bounds(contours: LoopSet[]) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const c of contours) for (const p of c.outer) {
    if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

/** Net material area: outer areas minus hole areas. */
export const netArea = (contours: LoopSet[]): number =>
  contours.reduce((s, c) => s + Math.abs(signedArea(c.outer)) - c.holes.reduce((h, l) => h + Math.abs(signedArea(l)), 0), 0);

/* ───────────── intersection tests (used to refuse bad offsets) ───────────── */

function segIntersect(a: Pt, b: Pt, c: Pt, d: Pt): boolean {
  const o = (p: Pt, q: Pt, r: Pt) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  const d1 = o(c, d, a), d2 = o(c, d, b), d3 = o(a, b, c), d4 = o(a, b, d);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

/** Like segIntersect but touching / collinear-overlapping counts: two shapes that touch would fuse in the material. */
function segTouch(a: Pt, b: Pt, c: Pt, d: Pt): boolean {
  if (segIntersect(a, b, c, d)) return true;
  const o = (p: Pt, q: Pt, r: Pt) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  const within = (p: Pt, q: Pt, r: Pt) =>
    r.x >= Math.min(p.x, q.x) - 1e-9 && r.x <= Math.max(p.x, q.x) + 1e-9 &&
    r.y >= Math.min(p.y, q.y) - 1e-9 && r.y <= Math.max(p.y, q.y) + 1e-9;
  const e = 1e-9;
  return (
    (Math.abs(o(c, d, a)) < e && within(c, d, a)) || (Math.abs(o(c, d, b)) < e && within(c, d, b)) ||
    (Math.abs(o(a, b, c)) < e && within(a, b, c)) || (Math.abs(o(a, b, d)) < e && within(a, b, d))
  );
}

const loopBox = (p: Pt[]) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const q of p) { x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y); }
  return { x0, y0, x1, y1 };
};

export function selfIntersects(p: Pt[]): boolean {
  const n = p.length;
  for (let i = 0; i < n; i++) {
    const a = p[i], b = p[(i + 1) % n];
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue; // adjacent via wrap-around
      const c = p[j], d = p[(j + 1) % n];
      if (Math.max(a.x, b.x) < Math.min(c.x, d.x) || Math.max(c.x, d.x) < Math.min(a.x, b.x)) continue;
      if (Math.max(a.y, b.y) < Math.min(c.y, d.y) || Math.max(c.y, d.y) < Math.min(a.y, b.y)) continue;
      if (segIntersect(a, b, c, d)) return true;
    }
  }
  return false;
}

export function loopsCross(a: Pt[], b: Pt[]): boolean {
  const A = loopBox(a), B = loopBox(b);
  if (A.x1 < B.x0 || B.x1 < A.x0 || A.y1 < B.y0 || B.y1 < A.y0) return false;
  for (let i = 0; i < a.length; i++) {
    const p = a[i], q = a[(i + 1) % a.length];
    for (let j = 0; j < b.length; j++) if (segTouch(p, q, b[j], b[(j + 1) % b.length])) return true;
  }
  return false;
}

/* ───────────── tool / kerf offset ───────────── */

/**
 * Offset one oriented loop by `d` (positive = grow material outwards). Mitred corners with a limit;
 * beyond the limit we bevel. Returns 'spike' for a degenerate (180°) corner, or 'inverted' when the
 * offset is larger than the feature and the loop has turned inside-out (every edge must still point the
 * way it did originally; a winding/area check alone misses a loop that collapses through itself).
 */
export function offsetLoop(loop: Pt[], d: number, miterLimit = 3): Pt[] | 'spike' | 'inverted' {
  const n = loop.length;
  const out: Pt[] = [];
  const first: number[] = [], last: number[] = [];
  for (let i = 0; i < n; i++) {
    const prev = loop[(i - 1 + n) % n], cur = loop[i], next = loop[(i + 1) % n];
    const l1 = Math.hypot(cur.x - prev.x, cur.y - prev.y), l2 = Math.hypot(next.x - cur.x, next.y - cur.y);
    if (l1 < 1e-9 || l2 < 1e-9) return 'spike';
    // right-hand normals; material is on the left, so +d moves away from material
    const n1 = { x: (cur.y - prev.y) / l1, y: -(cur.x - prev.x) / l1 };
    const n2 = { x: (next.y - cur.y) / l2, y: -(next.x - cur.x) / l2 };
    const denom = 1 + n1.x * n2.x + n1.y * n2.y;
    if (denom < 1e-6) return 'spike';
    first[i] = out.length;
    if (Math.sqrt(2 / denom) > miterLimit) {
      out.push({ x: cur.x + n1.x * d, y: cur.y + n1.y * d }, { x: cur.x + n2.x * d, y: cur.y + n2.y * d });
    } else {
      const k = d / denom;
      out.push({ x: cur.x + (n1.x + n2.x) * k, y: cur.y + (n1.y + n2.y) * k });
    }
    last[i] = out.length - 1;
  }
  // edge i of the original maps to out[last[i]] → out[first[i+1]]
  for (let i = 0; i < n; i++) {
    const a = out[last[i]], b = out[first[(i + 1) % n]];
    const next = loop[(i + 1) % n];
    if ((b.x - a.x) * (next.x - loop[i].x) + (b.y - a.y) * (next.y - loop[i].y) <= 0) return 'inverted';
  }
  return out;
}

export interface OffsetResult { contours: LoopSet[]; error: string | null }

/**
 * Tool-path / kerf compensation for the whole design. Instead of silently emitting a bad file, we
 * validate the result and return an error if any loop self-intersects, flips, or collides with another.
 * (Production-grade alternative: Clipper. This is deliberately conservative.)
 */
export function offsetContours(contours: LoopSet[], d: number): OffsetResult {
  const oriented = orient(contours);
  if (Math.abs(d) < 1e-9) return { contours: oriented, error: null };

  const result: LoopSet[] = [];
  const all: { loop: Pt[]; owner: number }[] = [];

  for (let ci = 0; ci < oriented.length; ci++) {
    const c = oriented[ci];
    const o = offsetLoop(c.outer, d);
    if (o === 'spike') return { contours, error: 'Offset failed: a contour has a degenerate spike.' };
    if (o === 'inverted' || selfIntersects(o)) {
      return { contours, error: `Offset of ${d.toFixed(2)} mm is too large for fine detail in this design (an outer contour collapses or self-intersects).` };
    }
    const holes: Pt[][] = [];
    for (const h of c.holes) {
      const oh = offsetLoop(h, d);
      if (oh === 'spike') return { contours, error: 'Offset failed: a hole has a degenerate spike.' };
      // a shrinking hole that turns inside-out has closed up completely
      if (oh === 'inverted' || selfIntersects(oh)) {
        return { contours, error: `Offset of ${d.toFixed(2)} mm closes up a counter/hole (too small for this tool).` };
      }
      holes.push(oh);
    }
    result.push({ outer: o, holes });
    all.push({ loop: o, owner: ci }, ...holes.map((h) => ({ loop: h, owner: ci })));
  }

  // Different letters/shapes must not collide after growing (e.g. letters closer than the tool).
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
    if (all[i].owner !== all[j].owner && loopsCross(all[i].loop, all[j].loop)) {
      return { contours, error: `Offset of ${d.toFixed(2)} mm makes neighbouring shapes touch (gap smaller than the tool). Increase letter spacing or use a smaller tool.` };
    }
  }
  return { contours: result, error: null };
}
