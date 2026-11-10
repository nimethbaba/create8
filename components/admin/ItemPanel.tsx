'use client';
import { useMemo, useState } from 'react';
import type { OrderItem } from '@/lib/orders';
import type { ItemBom } from '@/lib/production/bom';
import { bomToCsv } from '@/lib/production/bom';
import { buildExports, downloadText } from '@/lib/production/export';
import type { LoopSet } from '@/lib/production/loops';
import { FINISHES } from '@/lib/materials';

const TOOL_PRESETS = [
  { label: 'Exact outline', mm: 0 },
  { label: 'Laser kerf 0.15', mm: 0.15 },
  { label: 'Router 3 mm', mm: 3 },
  { label: 'Router 6 mm', mm: 6 },
];

interface Props {
  index: number;
  orderId: string;
  item: OrderItem;
  contours: LoopSet[] | null;
  loadError: string | null;
  bom: ItemBom | null;
}

export function ItemPanel({ index, orderId, item, contours, loadError, bom }: Props) {
  const [tool, setTool] = useState(0);
  const exp = useMemo(() => (contours ? buildExports(contours, tool) : null), [contours, tool]);

  const base = `CRE8-${orderId.slice(0, 8)}-item${index + 1}-${item.config.finish}${tool > 0 ? `-tool${tool}mm` : ''}`;
  const title = item.config.source === 'svg' ? item.config.svgFileName ?? 'Custom logo' : item.config.text.replace(/\n/g, ' / ');

  return (
    <section className="space-y-4 rounded border border-neutral-800 p-4">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-medium">
          Item {index + 1}: <span className="text-neutral-300">{title}</span>{' '}
          <span className="text-neutral-500">× {item.qty}</span>
        </h3>
        <span className="text-xs text-neutral-400">
          {FINISHES[item.config.finish].label} · {item.config.depthMm} mm · {item.config.light.mode === 'off' ? 'unlit' : item.config.light.mode}
        </span>
      </header>

      {item.needsReview && (
        <p className="rounded bg-amber-950/40 p-2 text-xs text-amber-200">
          Customer-supplied logo: compare the preview below with their artwork before cutting. Measurements for this line came from the customer&apos;s browser.
        </p>
      )}
      {loadError && <p className="rounded bg-red-900/40 p-2 text-sm text-red-200">Could not rebuild geometry: {loadError}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Cut files</div>
          <div className="flex flex-wrap gap-2">
            {TOOL_PRESETS.map((p) => (
              <button key={p.mm} onClick={() => setTool(p.mm)}
                className={`rounded border px-2 py-1 text-xs ${tool === p.mm ? 'border-white bg-white text-black' : 'border-neutral-700 text-neutral-300'}`}>
                {p.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-300">
            Tool / kerf diameter
            <input type="number" min={0} max={20} step={0.05} value={tool}
              onChange={(e) => setTool(Math.max(0, Math.min(20, parseFloat(e.target.value) || 0)))}
              className="w-20 rounded border border-neutral-700 bg-neutral-900 p-1 text-right" /> mm
          </label>

          {exp && !exp.ok && <p className="rounded bg-red-900/40 p-2 text-xs text-red-200">{exp.error}</p>}
          {exp?.ok && (
            <>
              <p className="text-xs text-neutral-400">Flat profile {exp.widthMm.toFixed(1)} × {exp.heightMm.toFixed(1)} mm · origin at bottom-left</p>
              <div className="flex gap-2">
                <button onClick={() => downloadText(`${base}.dxf`, 'application/dxf', exp.dxf)}
                  className="rounded bg-white px-3 py-1.5 text-sm font-medium text-black hover:bg-neutral-200">Download DXF</button>
                <button onClick={() => downloadText(`${base}.svg`, 'image/svg+xml', exp.svg)}
                  className="rounded border border-neutral-600 px-3 py-1.5 text-sm hover:border-neutral-400">Download SVG</button>
              </div>
              <p className="text-xs text-neutral-500">
                Layers: <span className="text-blue-300">CUT_INNER</span> (cut first) · <span className="text-red-300">CUT_OUTER</span>. Units: mm.
                One file = one piece{bom && bom.summary.layers > 1 ? `; cut ${bom.summary.layers} layers` : ''}{item.qty > 1 ? ` × ${item.qty} signs` : ''}.
              </p>
            </>
          )}
        </div>

        <div>
          {/* SVG markup is generated from numbers only (see lib/production/svg.ts), so it is safe to inline. */}
          {exp?.ok ? (
            <div className="rounded bg-white p-2 [&>svg]:h-auto [&>svg]:max-h-56 [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: exp.svg }} />
          ) : (
            <div className="grid h-40 place-items-center rounded bg-neutral-900 text-xs text-neutral-600">{contours ? 'No preview' : 'Building preview…'}</div>
          )}
        </div>
      </div>

      {bom && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Bill of materials</div>
            <button onClick={() => downloadText(`${base}-bom.csv`, 'text/csv', bomToCsv(bom.lines))} className="text-xs text-neutral-400 underline">Download CSV</button>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="text-neutral-500"><tr><th className="py-1">Item</th><th>Specification</th><th className="text-right">Qty</th><th>Unit</th></tr></thead>
            <tbody>
              {bom.lines.map((l, i) => (
                <tr key={i} className="border-t border-neutral-800 align-top">
                  <td className="py-1.5 pr-2">{l.item}</td>
                  <td className="pr-2 text-neutral-300">{l.spec}{l.note && <div className="text-neutral-500">{l.note}</div>}</td>
                  <td className="text-right tabular-nums">{l.qty}</td>
                  <td className="pl-2">{l.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-neutral-500">
            ≈ {bom.summary.weightKgPerSign} kg per sign · {bom.summary.layers} layer(s) · stock sizes, LED and PSU data are placeholders until supplier data is entered.
          </p>
        </div>
      )}
    </section>
  );
}
