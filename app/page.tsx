import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/landing/PageShell';
import { HeroStage } from '@/components/landing/HeroStage';
import { FloatCard } from '@/components/landing/FloatCard';
import { ParallaxField, ParallaxLayer } from '@/components/landing/ParallaxField';
import { Marquee } from '@/components/landing/Marquee';
import { SectionLabel } from '@/components/landing/SectionLabel';
import { FeatureBento } from '@/components/landing/FeatureBento';
import { SignTile } from '@/components/landing/SignTile';
import { getPreset, LIGHT_LABELS } from '@/lib/presets';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: { absolute: 'CRE 8' },
  description:
    'Design a custom 3D sign in your browser: type your name or upload your logo, choose steel, chrome, acrylic or wood, add lighting, see the live price and preview it on your wall in AR.',
};

const TICKER = ['Brushed steel', 'Polished chrome', 'Matte acrylic', 'Painted wood', 'Front-lit', 'Halo backlit', 'Edge neon', 'Live 3D preview', 'AR on your wall', 'Live price', 'Cut files'];

const STEPS = [
  { title: 'Design', body: 'Type your text or upload an SVG logo. Choose a font, spacing, size and depth.' },
  { title: 'Preview', body: 'Spin it around in 3D, switch finishes and lighting, then place it on your own wall in AR at real size.' },
  { title: 'Order', body: 'The price updates as you design, from size, material and LED length. Add to cart and check out.' },
  { title: 'We build it', body: 'Cut files are made from your exact design, and you can follow your order from Configured to Shipped.' },
];

const FINISHES = [
  { name: 'Brushed Steel', body: 'Satin metal for modern shopfronts and offices.', style: { backgroundImage: 'linear-gradient(180deg,#f2f4f6 0%,#8f969e 55%,#d3d6da 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }, dots: [] as string[] },
  { name: 'Polished Chrome', body: 'Mirror finish that catches the eye from across the street.', style: { backgroundImage: 'linear-gradient(180deg,#ffffff 0%,#76808b 40%,#f7f9fb 58%,#8995a1 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }, dots: [] },
  { name: 'Matte Acrylic', body: 'Soft and non-reflective, in the colour you choose.', style: { color: '#f4f1ea' }, dots: ['#f4f1ea', '#ff2d6f', '#35d6ff', '#7cff5c'] },
  { name: 'Painted Wood', body: 'Warm and handcrafted, painted in your brand colour.', style: { color: '#c0603a' }, dots: ['#c0603a', '#2f5d3a', '#1f3a6b', '#e8d8b0'] },
];

const LIGHT_IDEAS = [
  { id: 'welcome-front', title: 'Front-lit', body: 'The faces of the letters glow, so your name reads clearly day and night.' },
  { id: 'lounge-chrome', title: 'Halo backlit', body: 'LEDs sit behind the letters and wash a soft halo onto the wall.' },
  { id: 'open-neon', title: 'Edge neon', body: 'The edges light up in warm or cool white, or any colour you pick.' },
];

const PROMISES = [
  { k: 'A', title: 'See before you buy', body: 'A live 3D preview and an AR view at real size, so there are fewer surprises on delivery day.' },
  { k: 'B', title: 'A price you can follow', body: 'Setup, material, LED and shipping are all visible, and they update as you change the design.' },
  { k: 'C', title: 'Exactly what you designed', body: 'The same geometry you see on screen is what the cut files are made from.' },
];

const FAQ = [
  { q: 'Can I use my own logo?', a: 'Yes. Upload an SVG with filled shapes. Convert any outline-only strokes to filled shapes first, otherwise they are ignored. Logos are checked by our team before production.' },
  { q: 'How is the price worked out?', a: 'A setup fee, plus material (by the volume of your sign), plus LED strip length if you add lighting, plus shipping. You see it update live while you design. The final price is confirmed when you place the order.' },
  { q: 'Is the AR preview really the right size?', a: 'Yes, it is placed at the real-world size of your design. Use a recent iPhone (Safari) or Android phone (Chrome). Glow effects and the brushed grain are not shown in AR.' },
  // TODO: update once online payment is live.
  { q: 'Do I pay online?', a: 'Not yet. Checkout currently places an order request and nothing is charged. Secure online payment is coming soon.' },
];

const btn = 'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white';
const primary = `${btn} bg-[#ff2d6f] text-black shadow-[0_0_34px_-6px_#ff2d6f] hover:bg-[#ff5c8d]`;
const ghost = `${btn} border border-white/25 text-white hover:border-white/60 hover:bg-white/5`;

export default function LandingPage() {
  return (
    <PageShell>
      {/* ───────── Hero ───────── */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10"
          style={{ backgroundImage: 'radial-gradient(55% 45% at 78% 18%, rgba(255,45,111,.20), transparent 70%), radial-gradient(40% 40% at 8% 85%, rgba(53,214,255,.09), transparent 70%)' }} />
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <p className="fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-neutral-300">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff2d6f] shadow-[0_0_8px_#ff2d6f]" aria-hidden="true" />
              Design · Preview · Order
            </p>
            <h1 className="fade-up-2 mt-6 text-6xl font-bold leading-[0.95] tracking-tight sm:text-7xl lg:text-[4.75rem]">
              Design it.<br />
              <span className="bg-gradient-to-r from-[#ff9fbd] via-[#ff2d6f] to-[#ff9a5c] bg-clip-text text-transparent">See it in 3D.</span><br />
              Order it.
            </h1>
            <p className="fade-up-3 mt-6 max-w-lg text-lg text-neutral-300">
              Custom 3D signs in steel, chrome, acrylic or wood. Build yours in the browser, watch the price update, and try it on your own wall in AR.
            </p>
            <div className="fade-up-3 mt-8 flex flex-wrap gap-3">
              <Link href={SITE.designPath} className={primary}>Start designing</Link>
              <Link href="/gallery" className={ghost}>Browse ideas</Link>
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.18em] text-neutral-500">Steel · Chrome · Acrylic · Wood &nbsp;—&nbsp; Live price &nbsp;—&nbsp; AR preview</p>
          </div>
          <HeroStage />
        </div>
      </section>

      <div className="border-y border-white/10 bg-black/30"><Marquee items={TICKER} /></div>

      {/* ───────── 01 How it works ───────── */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24">
        <SectionLabel n="01">How it works</SectionLabel>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">From an idea to a sign on your wall, in four steps.</h2>
        <ol className="mt-12 divide-y divide-white/10 border-y border-white/10">
          {STEPS.map((s, i) => (
            <li key={s.title} className="grid items-baseline gap-2 py-7 sm:grid-cols-[7rem_14rem_1fr] sm:gap-6">
              <span className="text-4xl font-bold text-white/15" aria-hidden="true">0{i + 1}</span>
              <h3 className="text-xl font-semibold">{s.title}</h3>
              <p className="text-neutral-300">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ───────── 02 Features ───────── */}
      <section className="border-y border-white/10 bg-neutral-950/70">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <SectionLabel n="02">The designer</SectionLabel>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">The control that sketches can&apos;t give you.</h2>
          <p className="mt-3 max-w-xl text-neutral-300">Everything you need to get a sign right before anything is made.</p>
          <FeatureBento />
        </div>
      </section>

      {/* ───────── 03 Finishes ───────── */}
      <section id="materials" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24">
        <SectionLabel n="03">Finishes</SectionLabel>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">Four finishes, each with realistic reflections.</h2>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FINISHES.map((f) => (
            <li key={f.name} className="group overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60 transition hover:-translate-y-1 hover:border-white/25">
              <div aria-hidden="true" className="grid h-40 place-items-center bg-gradient-to-b from-[#1b1b1e] to-[#121214]">
                <span className="text-6xl font-bold tracking-tight" style={{ ...f.style, filter: 'drop-shadow(0 6px 8px rgba(0,0,0,.6))' }}>Aa</span>
              </div>
              <div className="p-6">
                <h3 className="font-semibold">{f.name}</h3>
                <p className="mt-2 text-sm text-neutral-300">{f.body}</p>
                {f.dots.length > 0 && (
                  <p className="mt-4 flex items-center gap-1.5 text-xs text-neutral-500">
                    {f.dots.map((c) => <span key={c} className="h-3.5 w-3.5 rounded-full border border-white/20" style={{ background: c }} aria-hidden="true" />)}
                    <span className="ml-1">Any colour</span>
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ───────── 04 Lighting ───────── */}
      <section id="lighting" className="scroll-mt-20 border-y border-white/10 bg-neutral-950/70">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <SectionLabel n="04">Lighting</SectionLabel>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">Light it up, or keep it quiet.</h2>
          <p className="mt-3 max-w-xl text-neutral-300">Pick a style and open it in the designer to make it yours.</p>
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {LIGHT_IDEAS.map((l) => {
              const preset = getPreset(l.id);
              if (!preset) return null;
              return (
                <li key={l.id} className="overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60 transition hover:border-white/25">
                  <SignTile preset={preset} />
                  <div className="p-6">
                    <h3 className="font-semibold">{l.title}</h3>
                    <p className="mt-2 text-sm text-neutral-300">{l.body}</p>
                    <Link href={`${SITE.designPath}?preset=${preset.id}`} className="mt-4 inline-block text-sm font-semibold text-[#ff6f9f] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2d6f]">
                      Try this style <span aria-hidden="true">→</span><span className="sr-only"> ({LIGHT_LABELS[preset.config.light?.mode ?? 'off']})</span>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ───────── 05 Promises ───────── */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <SectionLabel n="05">Why design it here</SectionLabel>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">No guesswork between your screen and your wall.</h2>
        <ul className="mt-12 grid gap-8 md:grid-cols-3">
          {PROMISES.map((p) => (
            <li key={p.k} className="border-t border-white/15 pt-6">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-[#ff2d6f]/60 text-sm font-bold text-[#ff6f9f]" aria-hidden="true">{p.k}</span>
              <h3 className="mt-5 text-xl font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-neutral-300">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ───────── 06 FAQ ───────── */}
      <section id="faq" className="scroll-mt-20 border-t border-white/10 bg-neutral-950/70">
        <div className="mx-auto max-w-3xl px-4 py-24">
          <SectionLabel n="06">Questions</SectionLabel>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Good to know.</h2>
          <div className="mt-10 divide-y divide-white/10 rounded-3xl border border-white/10 bg-neutral-900/40">
            {FAQ.map((f) => (
              <details key={f.q} className="group p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2d6f]">
                  {f.q}
                  <span className="text-xl text-[#ff6f9f] transition group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-sm text-neutral-300">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Final choice ───────── */}
      <section className="relative isolate overflow-hidden border-t border-white/10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10"
          style={{ backgroundImage: 'radial-gradient(50% 60% at 50% 100%, rgba(255,45,111,.22), transparent 70%)' }} />
        <ParallaxField aria-hidden className="pointer-events-none absolute inset-0 hidden xl:block">
          <ParallaxLayer depth={42} tilt={8} className="absolute left-[5%] top-[10%] w-40">
            <div className="-rotate-6"><div className="drift"><FloatCard src="/images/cube.webp" w={800} h={800} /></div></div>
          </ParallaxLayer>
          <ParallaxLayer depth={64} tilt={10} className="absolute bottom-[12%] right-[5%] w-44">
            <div className="rotate-6"><div className="drift-2"><FloatCard src="/images/orb.webp" w={800} h={800} /></div></div>
          </ParallaxLayer>
        </ParallaxField>
        <div className="relative mx-auto max-w-6xl px-4 py-24">
          <div className="text-center">
            <SectionLabel n="07">Start</SectionLabel>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Ready to see your name in lights?</h2>
            <p className="mx-auto mt-4 max-w-xl text-neutral-300">It takes a couple of minutes, and you can change anything until you order.</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-[#ff2d6f]/40 bg-neutral-900/70 p-8 shadow-[0_0_60px_-20px_#ff2d6f]">
              <h3 className="text-2xl font-semibold">Start from scratch</h3>
              <p className="mt-2 text-sm text-neutral-300">Type your name or upload your logo and build it your way.</p>
              <Link href={SITE.designPath} className={`${primary} mt-6`}>Open the designer</Link>
            </div>
            <div className="rounded-3xl border border-white/15 bg-neutral-900/70 p-8">
              <h3 className="text-2xl font-semibold">Start from an idea</h3>
              <p className="mt-2 text-sm text-neutral-300">Pick a style you like and change the details in the designer.</p>
              <Link href="/gallery" className={`${ghost} mt-6`}>Browse the gallery</Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
