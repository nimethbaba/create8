'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useHydrated } from '@/lib/useHydrated';
import { lineTotal, round2 } from '@/lib/pricing';
import { money } from '@/lib/format';

const EMPTY = { name: '', email: '', phone: '', address1: '', address2: '', city: '', postcode: '', country: '' };
type Field = keyof typeof EMPTY;

const FIELDS: { key: Field; label: string; required?: boolean; type?: string; span?: boolean; auto?: string }[] = [
  { key: 'name', label: 'Full name', required: true, auto: 'name' },
  { key: 'email', label: 'Email', required: true, type: 'email', auto: 'email' },
  { key: 'phone', label: 'Phone (optional)', type: 'tel', auto: 'tel' },
  { key: 'country', label: 'Country', required: true, auto: 'country-name' },
  { key: 'address1', label: 'Address', required: true, span: true, auto: 'address-line1' },
  { key: 'address2', label: 'Apartment, suite… (optional)', span: true, auto: 'address-line2' },
  { key: 'city', label: 'City', required: true, auto: 'address-level2' },
  { key: 'postcode', label: 'Postcode', required: true, auto: 'postal-code' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { items, clear } = useCartStore();
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && !items.length && !busy) router.replace('/cart');
  }, [hydrated, items.length, busy, router]);

  if (!hydrated || !items.length) return <div className="p-8 text-neutral-500">Loading…</div>;

  const total = round2(items.reduce((s, it) => s + lineTotal(it.unitPrice, it.qty).net, 0));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Prices are deliberately NOT sent: the server computes them.
        body: JSON.stringify({
          customer: form,
          items: items.map(({ config, metrics, qty }) => ({ config, metrics, qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not place the order.');
      clear();
      router.push(`/order/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-8">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <Link href="/cart" className="text-sm text-neutral-400 underline">← Back to cart</Link>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <label key={f.key} className={`block text-sm ${f.span ? 'sm:col-span-2' : ''}`}>
              <span className="mb-1 block text-neutral-300">{f.label}</span>
              <input
                required={f.required} type={f.type ?? 'text'} autoComplete={f.auto}
                value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full rounded border border-neutral-700 bg-neutral-900 p-2 outline-none focus:border-neutral-400"
              />
            </label>
          ))}
        </div>

        <div className="rounded border border-amber-700/50 bg-amber-950/30 p-3 text-xs text-amber-200">
          <strong>Demo payment.</strong> No card details are collected and nothing is charged. In production, this step redirects to a
          hosted Stripe Checkout page so card data never touches our servers (keeps us out of PCI-DSS scope).
        </div>

        {error && <p className="rounded bg-red-900/40 p-3 text-sm text-red-200">{error}</p>}

        <button disabled={busy} className="w-full rounded bg-white py-3 font-medium text-black hover:bg-neutral-200 disabled:opacity-50">
          {busy ? 'Placing order…' : `Place order · ${money(total)}`}
        </button>
      </form>
    </main>
  );
}
