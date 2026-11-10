import { bounds, orient, type LoopSet } from './loops';

const f = (n: number) => (Math.abs(n) < 5e-4 ? 0 : n).toFixed(3);

/**
 * Clean laser/CNC SVG in real-world millimetres (width/height carry the mm unit, viewBox is 1 user unit = 1 mm).
 * Hairline strokes, no fills, one <g> per layer (ids match the DXF layer names). Output is numbers only,
 * so nothing user-supplied can end up in the markup.
 */
export function contoursToSvg(contoursMm: LoopSet[], opts: { margin?: number; hairline?: number } = {}): string {
  const margin = opts.margin ?? 2;
  const hair = opts.hairline ?? 0.1;
  const contours = orient(contoursMm);
  const b = bounds(contours);
  const w = b.width + margin * 2, h = b.height + margin * 2;
  // SVG's y axis points down: flip so the exported part matches the DXF orientation
  const X = (x: number) => x - b.minX + margin;
  const Y = (y: number) => b.maxY - y + margin;
  const d = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i ? 'L' : 'M'}${f(X(p.x))} ${f(Y(p.y))}`).join('') + 'Z';

  const inner = contours.flatMap((c) => c.holes.map(d)).join('');
  const outer = contours.map((c) => d(c.outer)).join('');
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${f(w)}mm" height="${f(h)}mm" viewBox="0 0 ${f(w)} ${f(h)}">`,
    `<g id="CUT_INNER" fill="none" stroke="#0000ff" stroke-width="${hair}"><path d="${inner}"/></g>`,
    `<g id="CUT_OUTER" fill="none" stroke="#ff0000" stroke-width="${hair}"><path d="${outer}"/></g>`,
    `</svg>`,
  ].join('\n');
}
