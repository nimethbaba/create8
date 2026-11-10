import { PRICING } from '../pricing';
import { STANDOFF_M } from '../constants';
import { bounds, netArea, type LoopSet } from './loops';
import type { FinishId, IlluminationMode, LightColorMode, SignMetrics } from '../types';

/**
 * Bill of materials (PRD §3.3). ALL STOCK DATA BELOW IS PLACEHOLDER — replace with your real
 * suppliers' sheet sizes/thicknesses, LED strip spec and PSU catalogue.
 */
export const STOCK: Record<FinishId, { material: string; thicknessMm: number; densityGcm3: number }> = {
  'brushed-steel':   { material: 'Stainless steel 304, brushed',        thicknessMm: 3,  densityGcm3: 7.93 },
  'polished-chrome': { material: 'Mirror-polished stainless / chrome',  thicknessMm: 3,  densityGcm3: 7.85 },
  'matte-acrylic':   { material: 'Matte cast acrylic',                  thicknessMm: 5,  densityGcm3: 1.18 },
  'painted-wood':    { material: 'Birch ply / MDF (paint finish)',      thicknessMm: 12, densityGcm3: 0.70 },
};
export const SHEET = { widthCm: 122, heightCm: 244, usable: 0.85 }; // 4 × 8 ft, 85% usable
export const LED = { ledsPerMeter: 60, wattsPerMeter: 14.4, voltage: 12, allowance: 0.1, psuHeadroom: 1.25 };
export const PSU_WATTS = [12, 18, 24, 36, 60, 100, 150, 200, 300];

export interface BomLine { item: string; spec: string; qty: number; unit: string; note?: string }
export interface ItemBom {
  lines: BomLine[];
  summary: {
    layers: number;
    partAreaCm2: number;
    sheetAreaCm2: number;
    sheets: number;
    ledStripM: number;
    ledWattsPerSign: number;
    psuWatts: number | null;
    weightKgPerSign: number;
  };
}

export interface BomInput {
  finish: FinishId;
  depthMm: number;
  lightMode: IlluminationMode;
  lightColorMode: LightColorMode;
  kelvin: number;
  metrics: SignMetrics;
  qty: number;
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const r2 = (n: number) => Math.round(n * 100) / 100;

/** `contoursCm` are the flat design outlines in CENTIMETRES (as produced by the geometry pipeline). */
export function buildItemBom(i: BomInput, contoursCm: LoopSet[]): ItemBom {
  const stock = STOCK[i.finish];
  const layers = Math.max(1, Math.ceil(i.depthMm / stock.thicknessMm));
  const box = bounds(contoursCm);
  const partAreaCm2 = netArea(contoursCm);
  // Conservative: each layer consumes its bounding rectangle (no nesting software yet).
  const sheetAreaCm2 = box.width * box.height * layers * i.qty;
  const sheets = Math.max(1, Math.ceil(sheetAreaCm2 / (SHEET.widthCm * SHEET.heightCm * SHEET.usable)));
  const weightKgPerSign = (i.metrics.volumeCm3 * stock.densityGcm3) / 1000;

  const lines: BomLine[] = [
    {
      item: 'Face / body material',
      spec: `${stock.material}, ${SHEET.widthCm * 10}×${SHEET.heightCm * 10} mm sheet, ${stock.thicknessMm} mm`,
      qty: sheets, unit: 'sheet',
      note: `${layers} layer(s) × ${i.qty} sign(s); ${r1(sheetAreaCm2)} cm² bounding area, ${r1(partAreaCm2 * layers * i.qty)} cm² net`,
    },
  ];

  let ledStripM = 0, wattsPerSign = 0, psuWatts: number | null = null;
  if (i.lightMode !== 'off') {
    const perSignM = (i.metrics.perimeterCm * PRICING.ledPerimeterFactor[i.lightMode]) / 100;
    const withAllowance = perSignM * (1 + LED.allowance);
    ledStripM = withAllowance * i.qty;
    wattsPerSign = withAllowance * LED.wattsPerMeter;
    const needed = wattsPerSign * LED.psuHeadroom;
    psuWatts = PSU_WATTS.find((w) => w >= needed) ?? PSU_WATTS[PSU_WATTS.length - 1];
    const psusPerSign = needed > PSU_WATTS[PSU_WATTS.length - 1] ? Math.ceil(needed / PSU_WATTS[PSU_WATTS.length - 1]) : 1;
    const rgb = i.lightColorMode === 'rgb';

    lines.push(
      {
        item: 'LED strip',
        spec: rgb ? `RGB ${LED.voltage} V, ${LED.ledsPerMeter} LED/m` : `White ${i.kelvin} K ${LED.voltage} V, ${LED.ledsPerMeter} LED/m`,
        qty: r2(ledStripM), unit: 'm',
        note: `${r2(perSignM)} m per sign + ${LED.allowance * 100}% allowance; ${Math.ceil(ledStripM * LED.ledsPerMeter)} LEDs total`,
      },
      {
        item: 'Power supply',
        spec: `${LED.voltage} V DC, ${psuWatts} W`,
        qty: psusPerSign * i.qty, unit: 'pc',
        note: `${r1(wattsPerSign)} W load per sign + ${(LED.psuHeadroom - 1) * 100}% headroom`,
      },
      { item: 'Low-voltage cable', spec: '2-core, 2 m run per sign', qty: 2 * i.qty, unit: 'm' },
    );
    if (rgb) lines.push({ item: 'RGB controller', spec: `${LED.voltage} V, remote`, qty: i.qty, unit: 'pc' });
  }

  lines.push({
    item: 'Wall standoffs',
    spec: `M6 stainless, ${Math.round(STANDOFF_M * 1000)} mm`,
    qty: Math.max(4, 2 * Math.ceil(i.metrics.widthCm / 30)) * i.qty, unit: 'pc',
    note: 'Placeholder rule: min 4, +2 per 30 cm of width',
  });

  return {
    lines,
    summary: {
      layers, partAreaCm2: r1(partAreaCm2), sheetAreaCm2: r1(sheetAreaCm2), sheets,
      ledStripM: r2(ledStripM), ledWattsPerSign: r1(wattsPerSign), psuWatts, weightKgPerSign: r2(weightKgPerSign),
    },
  };
}

/** Merge BOMs of several line items (same item+spec are summed; notes are dropped when merged). */
export function aggregateBom(boms: ItemBom[]): BomLine[] {
  const map = new Map<string, BomLine>();
  for (const line of boms.flatMap((b) => b.lines)) {
    const key = `${line.item}|${line.spec}|${line.unit}`;
    const hit = map.get(key);
    if (hit) { hit.qty = r2(hit.qty + line.qty); hit.note = undefined; }
    else map.set(key, { ...line });
  }
  return [...map.values()];
}

/** CSV with spreadsheet-formula-injection guard (cells starting with = + - @ get a leading apostrophe). */
export function bomToCsv(lines: BomLine[]): string {
  const cell = (v: string | number | undefined) => {
    let s = v === undefined ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const rows = [['Item', 'Specification', 'Quantity', 'Unit', 'Notes'], ...lines.map((l) => [l.item, l.spec, l.qty, l.unit, l.note])];
  return rows.map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n';
}
