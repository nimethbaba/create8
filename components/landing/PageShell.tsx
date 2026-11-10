import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-black">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="marketing">{children}</main>
      <SiteFooter />
    </>
  );
}

export function PageHeading({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-6 pt-14 text-center sm:pt-20">
      {eyebrow && <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff6f9f]">{eyebrow}</p>}
      <h1 className="mt-2 text-4xl font-extrabold sm:text-5xl">{title}</h1>
      {children && <p className="mt-4 text-lg text-neutral-300">{children}</p>}
    </div>
  );
}
