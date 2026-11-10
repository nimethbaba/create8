import { NextResponse } from 'next/server';
import { getOrder } from '@/lib/orders';

export const runtime = 'nodejs';

/** Full order incl. ship-to address and raw design configs (SVG markup) — needed to generate production files. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const o = getOrder(params.id);
  return o ? NextResponse.json(o) : NextResponse.json({ error: 'Order not found.' }, { status: 404 });
}
