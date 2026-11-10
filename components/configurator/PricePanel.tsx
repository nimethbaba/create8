'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { snapshotConfig, useSignStore } from '@/store/useSignStore';
import { useCartStore } from '@/store/useCartStore';
import { computePrice, round2 } from '@/lib/pricing';
import { captureThumbnail } from '@/lib/snapshot';
import { money } from '@/lib/format';

export function PricePanel() {
  const metrics = useSignStore((s) => s.metrics);
  const finish = useSignStore((s) => s.finish);
  const mode = useSignStore((s) => s.light.mode);
  const hasError = useSignStore((s) => !!s.error);
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  // Recomputes on finish/lighting changes without touching geometry — metrics only change on rebuild.
  const price = useMemo(() => (metrics ? computePrice(metrics, finish, mode) : null), [metrics, finish, mode]);
  if (!metrics || !price) return <p className="text-sm text-neutral-500">Enter text or upload an SVG to see a price.</p>;

  function handleAdd() {
    if (!metrics || !price) return;
    addItem({
      config: snapshotConfig(useSignStore.getState()),
      metrics,
      unitPrice: round2(price.total),
      thumbnail: captureThumbnail(),
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 4000);
  }

  const rows: [string, string][] = [
    ['Setup fee', money(price.base)],
    [`Material (${metrics.volumeCm3.toFixed(0)} cm³)`, money(price.material)],
    [`LED (${price.ledLengthM.toFixed(2)} m)`, money(price.led)],
    ['Shipping', money(price.shipping)],
  ];

  return (
    <div className="space-y-2">
      <div className="text-xs text-neutral-400">
        {metrics.widthCm.toFixed(1)} × {metrics.heightCm.toFixed(1)} × {(metrics.depthCm * 10).toFixed(0)} mm
      </div>
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between text-sm text-neutral-300">
          <span>{k}</span><span>{v}</span>
        </div>
      ))}
      <div className="flex justify-between border-t border-neutral-800 pt-2 text-lg font-semibold">
        <span>Total</span><span>{money(price.total)}</span>
      </div>
      <button
        onClick={handleAdd}
        disabled={hasError}
        className="mt-2 w-full rounded bg-white py-2 text-sm font-medium text-black hover:bg-neutral-200 disabled:opacity-40"
      >
        Add to cart
      </button>
      {added && (
        <p className="text-center text-sm text-emerald-400">
          Added! <Link href="/cart" className="underline">View cart →</Link>
        </p>
      )}
    </div>
  );
}
