import Link from 'next/link';
import { SITE } from '@/lib/site';

const col = 'space-y-2.5 text-sm';
const link = 'text-neutral-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2d6f]';

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/40 px-4 pb-8 pt-14">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <p className="font-display text-2xl font-bold tracking-[0.15em]">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#ff2d6f] shadow-[0_0_10px_#ff2d6f]" aria-hidden="true" />{SITE.name}
          </p>
          <p className="max-w-xs text-sm text-neutral-400">{SITE.tagline}. Design it, see it in 3D, order it.</p>
          {SITE.contactEmail && <a href={`mailto:${SITE.contactEmail}`} className={`${link} inline-block text-sm`}>{SITE.contactEmail}</a>}
        </div>

        <nav aria-label="Explore"><p className="mb-3 text-xs uppercase tracking-[0.2em] text-neutral-500">Explore</p>
          <ul className={col}>
            <li><Link href={SITE.designPath} className={link}>Designer</Link></li>
            <li><Link href="/gallery" className={link}>Gallery</Link></li>
            <li><Link href="/#how" className={link}>How it works</Link></li>
          </ul></nav>

        <nav aria-label="Company"><p className="mb-3 text-xs uppercase tracking-[0.2em] text-neutral-500">Company</p>
          <ul className={col}>
            <li><Link href="/about" className={link}>About</Link></li>
            <li><Link href="/contact" className={link}>Contact</Link></li>
          </ul></nav>

        <nav aria-label="Shop"><p className="mb-3 text-xs uppercase tracking-[0.2em] text-neutral-500">Shop</p>
          <ul className={col}>
            <li><Link href="/cart" className={link}>Cart</Link></li>
            <li><Link href="/#faq" className={link}>FAQ</Link></li>
          </ul></nav>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-neutral-500">
        <p>© {new Date().getFullYear()} {SITE.name}</p>
        <p>Made to be seen.</p>
      </div>
    </footer>
  );
}
