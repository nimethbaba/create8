import { NextResponse } from 'next/server';
import { getOrder, STATUS_FLOW } from '@/lib/orders';

export const runtime = 'nodejs';

/** DEV ONLY: moves an order to the next production stage so you can see the tracker work. */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  const o = getOrder(params.id);
  if (!o) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

  const idx = STATUS_FLOW.findIndex((s) => s.id === o.status);
  const next = STATUS_FLOW[idx + 1];
  if (next) {
    o.status = next.id;
    o.history.push({ status: next.id, at: new Date().toISOString() });
  }
  return NextResponse.json({ status: o.status });
}
