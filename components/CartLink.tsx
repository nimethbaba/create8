'use client';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useHydrated } from '@/lib/useHydrated';

export function CartLink() {
  const hydrated = useHydrated();
  const count = useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0));
  return (
    <Link href="/cart" className="rounded-full bg-neutral-900/80 px-4 py-2 text-sm backdrop-blur hover:bg-neutral-800">
      Cart{hydrated && count > 0 ? ` (${count})` : ''}
    </Link>
  );
}
