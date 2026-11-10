'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { STATUS_FLOW, type OrderStatus } from '@/lib/orders';
import { FINISHES } from '@/lib/materials';
import { money } from '@/lib/format';
import type { FinishId, IlluminationMode } from '@/lib/types';

interface OrderView {
  id: string;
  createdAt: string;
  status: OrderStatus;
  history: { status: OrderStatus; at: string }[];
  customerName: string;
  city: string;
  totals: { subtotal: number; discount: number; total: number };
  items: { label: string; finish: FinishId; lighting: IlluminationMode; sizeCm: [number, number]; depthMm: number; qty: number; unitPrice: number; lineNet: number; needsReview: boolean }[];
}

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderView | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/orders/${id}`, { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) return setError(data.error ?? 'Order not found.');
    setOrder(data);
  }, [id]);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000); // light polling; swap for SSE/webhooks later
    return () => clearInterval(t);
  }, [load]);

  async function devAdvance() {
    await fetch(`/api/orders/${id}/advance`, { method: 'POST' });
    load();
  }

  if (error) return <main className="p-8"><p className="text-red-300">{error}</p><Link href="/" className="underline">Back home</Link></main>;
  if (!order) return <div className="p-8 text-neutral-500">Loading order…</div>;

  const current = STATUS_FLOW.findIndex((s) => s.id === order.status);

  return (
    <main className="mx-auto max-w-3xl space-y-8 p-4 sm:p-8">
      <header>
        <p className="text-sm text-emerald-400">Order received — thank you, {order.customerName}!</p>
        <h1 className="text-2xl font-semibold">Order {order.id.slice(0, 8).toUpperCase()}</h1>
        <p className="text-xs text-neutral-500">Bookmark this page to track your order. Placed {new Date(order.createdAt).toLocaleString()}.</p>
      </header>

      <ol className="grid grid-cols-4 gap-2">
        {STATUS_FLOW.map((s, i) => (
          <li key={s.id} className="text-center text-xs">
            <div className={`mb-2 h-1.5 rounded ${i <= current ? 'bg-emerald-500' : 'bg-neutral-800'}`} />
            <span className={i <= current ? 'text-neutral-100' : 'text-neutral-500'}>{s.label}</span>
          </li>
        ))}
      </ol>

      <ul className="space-y-3">
        {order.items.map((it, i) => (
          <li key={i} className="flex justify-between rounded border border-neutral-800 p-3 text-sm">
            <div>
              <div className="font-medium">{it.label} <span className="text-neutral-500">× {it.qty}</span></div>
              <div className="text-xs text-neutral-400">
                {FINISHES[it.finish].label} · {it.lighting === 'off' ? 'Unlit' : it.lighting} · {it.sizeCm[0].toFixed(0)} × {it.sizeCm[1].toFixed(0)} cm · {it.depthMm} mm
              </div>
              {it.needsReview && <div className="mt-1 text-xs text-amber-300">Logo geometry will be checked by our team before production.</div>}
            </div>
            <div className="text-right">{money(it.lineNet)}</div>
          </li>
        ))}
      </ul>

      <div className="space-y-1 text-right text-sm">
        <div className="text-neutral-400">Subtotal {money(order.totals.subtotal)}</div>
        {order.totals.discount > 0 && <div className="text-emerald-400">Bulk discount −{money(order.totals.discount)}</div>}
        <div className="text-lg font-semibold">Total {money(order.totals.total)}</div>
      </div>

      {process.env.NODE_ENV !== 'production' && (
        <button onClick={devAdvance} className="rounded border border-dashed border-neutral-600 px-3 py-1.5 text-xs text-neutral-400">
          Dev: advance production stage
        </button>
      )}
      <Link href="/design" className="block text-sm text-neutral-400 underline">Design another sign</Link>
    </main>
  );
}
