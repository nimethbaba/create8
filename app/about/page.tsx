import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeading, PageShell } from '@/components/landing/PageShell';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description: 'What CRE 8 does, how a sign goes from your screen to the wall, and what to expect when you order.',
};

const PROCESS = [
  { title: 'You design it', body: 'Everything starts in the designer: your text or SVG logo, the finish, the depth and the lighting. What you see is the sign you get.' },
  { title: 'We check the geometry', body: 'Your design is turned into flat outlines at its exact real-world size. Uploaded logos are checked by a person before anything is cut.' },
  { title: 'Cut files are generated', body: 'We produce production-ready DXF and SVG files for laser or CNC cutting, plus a bill of materials listing the sheet material, LED strip and power supply your sign needs.' },
  { title: 'Built and tracked', body: 'Your order moves from Configured to Manufacturing, Quality Check and Shipped, and you can follow each step from your order page.' },
];

const PRINCIPLES = [
  { title: 'See before you buy', body: 'A live 3D preview and an AR view at real size, so there are fewer surprises when it arrives.' },
  { title: 'A price you can follow', body: 'The price is built from setup, material, LED length and shipping, and updates as you change the design.' },
  { title: 'Your design, exactly', body: 'The same geometry you see on screen is what the cut files are made from.' },
];

export default function AboutPage() {
  const story = SITE.story.split(/\n\s*\n/).filter(Boolean);
  return (
    <PageShell>
      <PageHeading eyebrow="About" title="Signs you can see before they exist">
        {SITE.name} lets business owners design, preview and order custom 3D signboards online, without back-and-forth sketches or guesswork.
      </PageHeading>

      {story.length > 0 && (
        <section aria-labelledby="story" className="mx-auto max-w-3xl space-y-4 px-4 py-10">
          <h2 id="story" className="text-2xl font-bold">Our story</h2>
          {story.map((p, i) => <p key={i} className="text-neutral-300">{p}</p>)}
        </section>
      )}

      <section aria-labelledby="process" className="border-t border-white/10 bg-neutral-950/60">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 id="process" className="text-2xl font-bold">From screen to wall</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2">
            {PROCESS.map((s, i) => (
              <li key={s.title} className="flex gap-4 rounded-xl border border-white/10 bg-neutral-900/60 p-5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#ff2d6f] text-sm font-bold text-black">{i + 1}</span>
                <div><h3 className="font-semibold">{s.title}</h3><p className="mt-1 text-sm text-neutral-300">{s.body}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="principles" className="mx-auto max-w-6xl px-4 py-14">
        <h2 id="principles" className="text-2xl font-bold">What we care about</h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <li key={p.title} className="rounded-xl border border-white/10 bg-neutral-900/60 p-5">
              <h3 className="font-semibold text-[#ff9fbd]">{p.title}</h3>
              <p className="mt-2 text-sm text-neutral-300">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-white/10 bg-gradient-to-b from-neutral-950 to-[#2a0a16]">
        <div className="mx-auto max-w-3xl space-y-5 px-4 py-16 text-center">
          <h2 className="text-3xl font-bold">Let&apos;s make your sign</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={SITE.designPath} className="rounded-full bg-[#ff2d6f] px-6 py-3 text-sm font-semibold text-black hover:bg-[#ff5c8d]">Start designing</Link>
            <Link href="/contact" className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold hover:border-white/60">Talk to us</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
