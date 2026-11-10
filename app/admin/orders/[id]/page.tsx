'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { STATUS_FLOW, type Order } from '@/lib/orders';
import { aggregateBom, bomToCsv, buildItemBom } from '@/lib/production/bom';
import { contoursFromConfig } from '@/lib/production/fromConfig';
import { downloadText } from '@/lib/production/export';
import type { LoopSet } from '@/lib/production/loops';
import { ItemPanel } from '@/components/admin/ItemPanel';
import { money } from '@/lib/format';

type Loaded = { contours: LoopSet[] | null; error: string | null };

export default function AdminOrder() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState<Loaded[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/orders/${id}`, { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) return setError(data.error ?? `HTTP ${res.status}`);
    setOrder(data);
  }, [id]);
  useEffect(() => { load(); }, [load]);

  // Rebuild the flat outlines once per order (not on every status change).
  const orderId = order?.id;
  useEffect(() => {
    if (!order) return;
    let cancelled = false;
    Promise.all(
      order.items.map((it) =>
        contoursFromConfig(it.config).then(
          (contours): Loaded => ({ contours, error: null }),
          (e): Loaded => ({ contours: null, error: e instanceof Error ? e.message : 'Failed' }),
        ),
      ),
    ).then((r) => !cancelled && setLoaded(r));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const boms = useMemo(
    () =>
      (order?.items ?? []).map((it, i) => {
        const c = loaded[i]?.contours;
        if (!c) return null;
        return buildItemBom(
          { finish: it.config.finish, depthMm: it.config.depthMm, lightMode: it.config.light.mode, lightColorMode: it.config.light.colorMode, kelvin: it.config.light.kelvin, metrics: it.metrics, qty: it.qty },
          c,
        );
      }),
    [order, loaded],
  );

  async function setStatus(status: string) {
    setBusy(true);
    const res = await fetch(`/api/admin/orders/${id}/status`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    });
    if (!res.ok) setError((await res.json()).error ?? 'Could not update status');
    await load();
    setBusy(false);
  }

  if (error) return <main className="p-8"><p className="text-red-300">{error}</p><Link href="/admin" className="underline">← Orders</Link></main>;
  if (!order) return <div className="p-8 text-neutral-500">Loading…</div>;

  const cur = STATUS_FLOW.findIndex((s) => s.id === order.status);
  const next = STATUS_FLOW[cur + 1];
  const allBoms = boms.every(Boolean) ? (boms as NonNullable<(typeof boms)[number]>[]) : null;
  const c = order.customer;

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">
      <Link href="/admin" className="text-sm text-neutral-400 underline">← Orders</Link>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Order {order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-xs text-neutral-500">{new Date(order.createdAt).toLocaleString()} · total {money(order.totals.total)} · payment: demo (unpaid)</p>
        </div>
        <div className="text-right text-sm">
          <div className="mb-1 text-neutral-300">Status: <strong>{STATUS_FLOW[cur].label}</strong></div>
          {next && (
            <button disabled={busy} onClick={() => setStatus(next.id)}
              className="rounded bg-white px-3 py-1.5 text-sm font-medium text-black hover:bg-neutral-200 disabled:opacity-50">
              Mark as {next.label}
            </button>
          )}
        </div>
      </header>

      <section className="rounded border border-neutral-800 p-4 text-sm text-neutral-300">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-400">Ship to</div>
        {c.name} · {c.email}{c.phone && ` · ${c.phone}`}<br />
        {c.address1}{c.address2 && `, ${c.address2}`}, {c.city} {c.postcode}, {c.country}
      </section>

      {order.items.map((it, i) => (
        <ItemPanel key={i} index={i} orderId={order.id} item={it}
          contours={loaded[i]?.contours ?? null} loadError={loaded[i]?.error ?? null} bom={boms[i] ?? null} />
      ))}

      <section className="flex items-center justify-between rounded border border-neutral-800 p-4">
        <div>
          <div className="text-sm font-medium">Order-level shopping list</div>
          <div className="text-xs text-neutral-500">All items combined (same material / LED / PSU specs are summed).</div>
        </div>
        <button disabled={!allBoms}
          onClick={() => allBoms && downloadText(`CRE8-${order.id.slice(0, 8)}-bom.csv`, 'text/csv', bomToCsv(aggregateBom(allBoms)))}
          className="rounded bg-white px-3 py-1.5 text-sm font-medium text-black hover:bg-neutral-200 disabled:opacity-40">
          Download order BOM (CSV)
        </button>
      </section>
    </main>
  );
}
