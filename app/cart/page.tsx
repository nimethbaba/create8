'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useSignStore } from '@/store/useSignStore';
import { useHydrated } from '@/lib/useHydrated';
import { lineTotal, quantityDiscountRate, round2 } from '@/lib/pricing';
import { money } from '@/lib/format';
import { describeSign } from '@/components/SignSummary';

export default function CartPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { items, setQty, removeItem } = useCartStore();

  if (!hydrated) return <div className="p-8 text-neutral-500">Loading cart…</div>;

  const lines = items.map((it) => ({ it, t: lineTotal(it.unitPrice, it.qty) }));
  const subtotal = round2(lines.reduce((s, l) => s + l.t.gross, 0));
  const discount = round2(lines.reduce((s, l) => s + l.t.discount, 0));
  const total = round2(subtotal - discount);

  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-8">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Your cart</h1>
        <Link href="/design" className="text-sm text-neutral-400 underline">← Back to designer</Link>
      </div>

      {!lines.length ? (
        <div className="rounded border border-neutral-800 p-10 text-center text-neutral-400">
          Your cart is empty. <Link href="/design" className="underline">Design a sign</Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <ul className="space-y-4">
            {lines.map(({ it, t }) => (
              <li key={it.id} className="flex gap-4 rounded border border-neutral-800 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {it.thumbnail ? <img src={it.thumbnail} alt="Sign preview" className="h-24 w-36 rounded object-cover" />
                  : <div className="grid h-24 w-36 place-items-center rounded bg-neutral-900 text-xs text-neutral-600">No preview</div>}
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <div className="truncate font-medium">
                      {it.config.source === 'svg' ? it.config.svgFileName ?? 'Custom logo' : it.config.text.replace(/\n/g, ' / ')}
                    </div>
                    <div className="text-xs text-neutral-400">
                      {describeSign({ finish: it.config.finish, mode: it.config.light.mode, widthCm: it.metrics.widthCm, heightCm: it.metrics.heightCm, depthMm: it.config.depthMm })}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center rounded border border-neutral-700">
                      <button className="px-2 py-1" onClick={() => setQty(it.id, it.qty - 1)} aria-label="Decrease quantity">−</button>
                      <span className="w-8 text-center tabular-nums">{it.qty}</span>
                      <button className="px-2 py-1" onClick={() => setQty(it.id, it.qty + 1)} aria-label="Increase quantity">+</button>
                    </div>
                    <button className="text-neutral-400 underline"
                      onClick={() => { useSignStore.getState().loadConfig(it.config); router.push('/design'); }}>
                      Duplicate &amp; edit
                    </button>
                    <button className="text-neutral-500 underline" onClick={() => removeItem(it.id)}>Remove</button>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-semibold">{money(t.net)}</div>
                  {t.rate > 0 && <div className="text-xs text-emerald-400">−{Math.round(t.rate * 100)}% bulk</div>}
                  <div className="text-xs text-neutral-500">{money(it.unitPrice)} each</div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit space-y-2 rounded border border-neutral-800 p-4 text-sm">
            <div className="flex justify-between text-neutral-300"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-emerald-400"><span>Bulk discount</span><span>−{money(discount)}</span></div>}
            <div className="flex justify-between text-neutral-500"><span>Shipping</span><span>Included per sign</span></div>
            <div className="flex justify-between border-t border-neutral-800 pt-2 text-lg font-semibold"><span>Total</span><span>{money(total)}</span></div>
            <Link href="/checkout" className="mt-2 block rounded bg-white py-2 text-center font-medium text-black hover:bg-neutral-200">
              Checkout
            </Link>
            <p className="pt-1 text-xs text-neutral-500">
              Prices are re-verified when you place the order. Bulk discount: {Math.round(quantityDiscountRate(5) * 100)}% at 5+, {Math.round(quantityDiscountRate(10) * 100)}% at 10+ of one design.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
