import { bounds, orient, type LoopSet } from './loops';

/**
 * Minimal ASCII DXF writer (AutoCAD R12 / AC1009 entity set: POLYLINE + VERTEX + SEQEND).
 * R12 is the lowest common denominator that LightBurn, RDWorks, VCarve, Fusion, AutoCAD, etc. all read,
 * and writing it by hand means zero dependencies and a format we can verify in tests.
 *
 * Input contours must already be in MILLIMETRES. Layers:
 *   CUT_INNER (colour 5, blue) — holes/counters, written first so they are cut before the outline
 *   CUT_OUTER (colour 1, red)  — outside profile
 */
export const DXF_LAYERS = { inner: 'CUT_INNER', outer: 'CUT_OUTER' } as const;

const num = (n: number) => (Math.abs(n) < 5e-6 ? 0 : n).toFixed(4);

export function contoursToDxf(contoursMm: LoopSet[]): string {
  const contours = orient(contoursMm);
  const b = bounds(contours);
  const rows: (string | number)[] = [];
  const add = (code: number, value: string | number) => rows.push(String(code).padStart(3, ' '), value);

  // HEADER
  add(0, 'SECTION'); add(2, 'HEADER');
  add(9, '$ACADVER'); add(1, 'AC1009');
  add(9, '$INSUNITS'); add(70, 4);      // 4 = millimetres
  add(9, '$MEASUREMENT'); add(70, 1);   // metric
  add(9, '$EXTMIN'); add(10, num(b.minX)); add(20, num(b.minY)); add(30, num(0));
  add(9, '$EXTMAX'); add(10, num(b.maxX)); add(20, num(b.maxY)); add(30, num(0));
  add(0, 'ENDSEC');

  // TABLES
  add(0, 'SECTION'); add(2, 'TABLES');
  add(0, 'TABLE'); add(2, 'LTYPE'); add(70, 1);
  add(0, 'LTYPE'); add(2, 'CONTINUOUS'); add(70, 0); add(3, 'Solid line'); add(72, 65); add(73, 0); add(40, num(0));
  add(0, 'ENDTAB');
  add(0, 'TABLE'); add(2, 'LAYER'); add(70, 2);
  add(0, 'LAYER'); add(2, DXF_LAYERS.inner); add(70, 0); add(62, 5); add(6, 'CONTINUOUS');
  add(0, 'LAYER'); add(2, DXF_LAYERS.outer); add(70, 0); add(62, 1); add(6, 'CONTINUOUS');
  add(0, 'ENDTAB');
  add(0, 'ENDSEC');

  // ENTITIES
  add(0, 'SECTION'); add(2, 'ENTITIES');
  const polyline = (layer: string, pts: { x: number; y: number }[]) => {
    add(0, 'POLYLINE'); add(8, layer); add(66, 1);
    add(10, num(0)); add(20, num(0)); add(30, num(0));
    add(70, 1); // closed
    for (const p of pts) {
      add(0, 'VERTEX'); add(8, layer);
      add(10, num(p.x)); add(20, num(p.y)); add(30, num(0));
    }
    add(0, 'SEQEND'); add(8, layer);
  };
  for (const c of contours) for (const h of c.holes) polyline(DXF_LAYERS.inner, h);
  for (const c of contours) polyline(DXF_LAYERS.outer, c.outer);
  add(0, 'ENDSEC');
  add(0, 'EOF');

  return rows.join('\n') + '\n';
}
