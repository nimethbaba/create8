import { bounds, offsetContours, type LoopSet } from './loops';
import { contoursToDxf } from './dxf';
import { contoursToSvg } from './svg';

const scale = (cs: LoopSet[], k: number): LoopSet[] =>
  cs.map((c) => ({
    outer: c.outer.map((p) => ({ x: p.x * k, y: p.y * k })),
    holes: c.holes.map((h) => h.map((p) => ({ x: p.x * k, y: p.y * k }))),
  }));

const moveToOrigin = (cs: LoopSet[]): LoopSet[] => {
  const b = bounds(cs);
  return cs.map((c) => ({
    outer: c.outer.map((p) => ({ x: p.x - b.minX, y: p.y - b.minY })),
    holes: c.holes.map((h) => h.map((p) => ({ x: p.x - b.minX, y: p.y - b.minY }))),
  }));
};

export type ExportResult =
  | { ok: true; dxf: string; svg: string; widthMm: number; heightMm: number }
  | { ok: false; error: string };

/**
 * cm contours → millimetres → tool/kerf offset (toolDiameterMm / 2, 0 = exact design outline) → origin at (0,0).
 * The flat profile is the design outline; the 3D bevel is cosmetic and not part of the cut path.
 */
export function buildExports(contoursCm: LoopSet[], toolDiameterMm: number): ExportResult {
  if (!contoursCm.length) return { ok: false, error: 'Design has no geometry.' };
  const r = offsetContours(scale(contoursCm, 10), toolDiameterMm / 2);
  if (r.error) return { ok: false, error: r.error };
  const mm = moveToOrigin(r.contours);
  const b = bounds(mm);
  return { ok: true, dxf: contoursToDxf(mm), svg: contoursToSvg(mm), widthMm: b.width, heightMm: b.height };
}

export function downloadText(filename: string, mime: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
