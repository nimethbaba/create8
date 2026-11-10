import { NextResponse } from 'next/server';
import { getOrder } from '@/lib/orders';

export const runtime = 'nodejs';

/**
 * Public tracking endpoint. The unguessable UUID is the only access key, so we return a redacted view:
 * no address, email, phone or raw SVG markup.
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const o = getOrder(params.id);
  if (!o) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

  return NextResponse.json({
    id: o.id,
    createdAt: o.createdAt,
    status: o.status,
    history: o.history,
    customerName: o.customer.name,
    city: o.customer.city,
    totals: o.totals,
    currency: o.currency,
    paymentStatus: o.paymentStatus,
    items: o.items.map((i) => ({
      label: i.config.source === 'svg' ? i.config.svgFileName ?? 'Custom logo' : i.config.text.replace(/\n/g, ' / '),
      finish: i.config.finish,
      lighting: i.config.light.mode,
      sizeCm: [i.metrics.widthCm, i.metrics.heightCm],
      depthMm: i.config.depthMm,
      qty: i.qty,
      unitPrice: i.unitPrice,
      lineNet: i.lineNet,
      needsReview: i.needsReview,
    })),
  });
}
