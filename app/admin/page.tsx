'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { STATUS_FLOW, type OrderStatus } from '@/lib/orders';
import { money } from '@/lib/format';

interface Row {
  id: string; createdAt: string; status: OrderStatus; customerName: string; city: string; country: string;
  total: number; itemCount: number; needsReview: boolean;
}

export default function AdminOrders() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/orders', { cache: 'no-store' })
      .then(async (r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setRows)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-8">
      <h1 className="mb-6 text-2xl font-semibold">Orders</h1>
      {error && <p className="text-red-300">{error}</p>}
      {!rows && !error && <p className="text-neutral-500">Loading…</p>}
      {rows && !rows.length && <p className="text-neutral-500">No orders yet. (Orders are held in memory in this demo and reset when the server restarts.)</p>}
      {rows && rows.length > 0 && (
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-neutral-500">
            <tr><th className="py-2">Order</th><th>Placed</th><th>Customer</th><th>Items</th><th className="text-right">Total</th><th className="pl-4">Status</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-neutral-800">
                <td className="py-2">
                  <Link href={`/admin/orders/${r.id}`} className="underline">{r.id.slice(0, 8).toUpperCase()}</Link>
                  {r.needsReview && <span className="ml-2 rounded bg-amber-900/60 px-1.5 py-0.5 text-[10px] text-amber-200">review</span>}
                </td>
                <td className="text-neutral-400">{new Date(r.createdAt).toLocaleString()}</td>
                <td>{r.customerName} <span className="text-neutral-500">· {r.city}, {r.country}</span></td>
                <td>{r.itemCount}</td>
                <td className="text-right tabular-nums">{money(r.total)}</td>
                <td className="pl-4">{STATUS_FLOW.find((s) => s.id === r.status)?.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
