import { NextResponse } from 'next/server';
import { orderRequestSchema } from '@/lib/orderSchema';
import { computePrice, lineTotal, round2 } from '@/lib/pricing';
import { measureTextSign } from '@/lib/serverMetrics';
import { validateSvg } from '@/lib/svgSafety';
import { saveOrder, type Order, type OrderItem } from '@/lib/orders';
import type { SignMetrics } from '@/lib/types';

export const runtime = 'nodejs';

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail('Invalid JSON.');
  }

  const parsed = orderRequestSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return fail(`Invalid order: ${first.path.join('.')} — ${first.message}`);
  }
  const { customer, items } = parsed.data;

  const orderItems: OrderItem[] = [];
  for (const [i, it] of items.entries()) {
    const { config, qty } = it;
    let metrics: SignMetrics;
    let metricsSource: OrderItem['metricsSource'];
    let needsReview = false;

    if (config.source === 'text') {
      if (!config.text.trim()) return fail(`Item ${i + 1}: sign has no text.`);
      // Never trust client metrics for text: regenerate the geometry here and measure it.
      const m = measureTextSign(config);
      if (!m) return fail(`Item ${i + 1}: could not build geometry.`);
      metrics = m;
      metricsSource = 'server';
    } else {
      // SVG parsing needs a DOM (DOMParser), so for now we accept client metrics after sanity checks
      // and flag the line for manual geometry review before production.
      if (!config.svgMarkup) return fail(`Item ${i + 1}: SVG source selected but no SVG attached.`);
      const svgErr = validateSvg(config.svgMarkup);
      if (svgErr) return fail(`Item ${i + 1}: ${svgErr}`);
      const m = it.metrics;
      const widthOff = Math.abs(m.widthCm - config.svgWidthCm) / config.svgWidthCm;
      const depthOff = Math.abs(m.depthCm * 10 - config.depthMm);
      const bboxVolume = m.widthCm * m.heightCm * m.depthCm;
      if (widthOff > 0.06 || depthOff > 3 || m.volumeCm3 > bboxVolume * 1.001) {
        return fail(`Item ${i + 1}: measurements don't match the design. Please re-add it from the configurator.`);
      }
      metrics = m;
      metricsSource = 'client';
      needsReview = true;
    }

    const price = computePrice(metrics, config.finish, config.light.mode);
    const unitPrice = round2(price.total);
    const line = lineTotal(unitPrice, qty);
    orderItems.push({
      config, metrics, metricsSource, needsReview, qty, unitPrice,
      ledLengthM: price.ledLengthM,
      lineGross: line.gross, lineDiscount: line.discount, lineNet: line.net,
    });
  }

  const now = new Date().toISOString();
  const order: Order = {
    id: crypto.randomUUID(),
    createdAt: now,
    status: 'configured',
    history: [{ status: 'configured', at: now }],
    customer,
    items: orderItems,
    totals: {
      subtotal: round2(orderItems.reduce((s, x) => s + x.lineGross, 0)),
      discount: round2(orderItems.reduce((s, x) => s + x.lineDiscount, 0)),
      total: round2(orderItems.reduce((s, x) => s + x.lineNet, 0)),
    },
    currency: 'USD',
    paymentStatus: 'unpaid_demo', // TODO: create a Stripe Checkout Session here and return its URL instead
  };
  saveOrder(order);
  return NextResponse.json({ id: order.id, total: order.totals.total }, { status: 201 });
}
