import Link from 'next/link';
import { CartLink } from '../CartLink';
import { NavLink } from './NavLink';
import { NAV, SITE } from '@/lib/site';

const link = 'text-neutral-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2d6f]';
const item = (n: (typeof NAV)[number], cls: string) =>
  n.href.includes('#') ? <Link key={n.href} href={n.href} className={cls}>{n.label}</Link>
                       : <NavLink key={n.href} href={n.href} className={cls}>{n.label}</NavLink>;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0b0d]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-display text-xl font-bold tracking-[0.15em] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2d6f]">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#ff2d6f] shadow-[0_0_10px_#ff2d6f]" aria-hidden="true" />{SITE.name}
        </Link>

        <nav aria-label="Main" className="hidden gap-6 text-sm md:flex">
          {NAV.map((n) => item(n, link))}
        </nav>

        <div className="flex items-center gap-2">
          <CartLink />
          <Link href={SITE.designPath}
            className="hidden rounded-full bg-[#ff2d6f] px-4 py-2 text-sm font-semibold text-black hover:bg-[#ff5c8d] focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:inline-block">
            Design your sign
          </Link>
          {/* Small screens: a no-JavaScript dropdown */}
          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none rounded-full border border-white/20 px-4 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2d6f]">Menu</summary>
            <nav aria-label="Mobile" className="absolute right-0 mt-2 flex w-52 flex-col gap-1 rounded-xl border border-white/10 bg-neutral-950 p-2 text-sm shadow-xl">
              {NAV.map((n) => item(n, `rounded-lg px-3 py-2 ${link} hover:bg-white/5`))}
              <Link href={SITE.designPath} className="mt-1 rounded-lg bg-[#ff2d6f] px-3 py-2 text-center font-semibold text-black">Design your sign</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
