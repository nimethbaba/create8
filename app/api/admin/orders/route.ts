import { NextResponse } from 'next/server';
import { listOrders } from '@/lib/orders';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(
    listOrders().map((o) => ({
      id: o.id,
      createdAt: o.createdAt,
      status: o.status,
      customerName: o.customer.name,
      city: o.customer.city,
      country: o.customer.country,
      total: o.totals.total,
      itemCount: o.items.reduce((n, i) => n + i.qty, 0),
      needsReview: o.items.some((i) => i.needsReview),
    })),
  );
}
