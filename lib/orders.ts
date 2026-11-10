import type { SignConfig, SignMetrics } from './types';

export type OrderStatus = 'configured' | 'manufacturing' | 'quality_check' | 'shipped';
/** PRD §3.4 tracking flow. */
export const STATUS_FLOW: { id: OrderStatus; label: string }[] = [
  { id: 'configured', label: 'Configured' },
  { id: 'manufacturing', label: 'Manufacturing' },
  { id: 'quality_check', label: 'Quality Check' },
  { id: 'shipped', label: 'Shipped' },
];

export interface OrderItem {
  config: SignConfig;
  metrics: SignMetrics;      // server-measured for text signs; client-supplied for SVG signs
  metricsSource: 'server' | 'client';
  needsReview: boolean;      // SVG signs: a human verifies geometry before production
  qty: number;
  unitPrice: number;
  ledLengthM: number;
  lineGross: number;
  lineDiscount: number;
  lineNet: number;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  history: { status: OrderStatus; at: string }[];
  customer: { name: string; email: string; phone: string; address1: string; address2: string; city: string; postcode: string; country: string };
  items: OrderItem[];
  totals: { subtotal: number; discount: number; total: number };
  currency: 'USD';
  paymentStatus: 'unpaid_demo';
}

/**
 * DEMO PERSISTENCE: process-local Map (survives dev HMR via globalThis, lost on restart,
 * and not shared across serverless instances). Replace with Postgres/Prisma + Stripe webhooks.
 */
const g = globalThis as unknown as { __cre8Orders?: Map<string, Order> };
const store = (g.__cre8Orders ??= new Map<string, Order>());

export const saveOrder = (o: Order) => void store.set(o.id, o);
export const getOrder = (id: string) => store.get(id);

export const listOrders = () => [...store.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

/** Forward-only status change. Returns the updated order, or an error string. */
export function advanceTo(id: string, status: OrderStatus): Order | string {
  const o = store.get(id);
  if (!o) return 'Order not found.';
  const cur = STATUS_FLOW.findIndex((s) => s.id === o.status);
  const next = STATUS_FLOW.findIndex((s) => s.id === status);
  if (next <= cur) return `Order is already at or past "${status}".`;
  o.status = status;
  o.history.push({ status, at: new Date().toISOString() });
  return o;
}
