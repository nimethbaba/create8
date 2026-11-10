import { ExtrudedText } from './ExtrudedText';

const card = 'relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60 p-6 transition hover:border-white/25';
const glow = (c: string) => ({ backgroundImage: `radial-gradient(70% 60% at 85% 0%, ${c}, transparent 70%)` });

/** Five feature cards, each with a small CSS illustration (decorative, so hidden from screen readers). */
export function FeatureBento() {
  return (
    <ul className="mt-10 grid gap-4 md:grid-cols-6">
      <li className={`${card} md:col-span-4`} style={glow('rgba(255,45,111,.22)')}>
        <div aria-hidden="true" className="grid h-44 place-items-center">
          <div className="sway"><ExtrudedText className="text-5xl font-bold tracking-[0.12em] sm:text-6xl" depth={9} face="#e9edf1" sideFrom="#aab2bb" sideTo="#4a4f55" glow="#7cc7ff">STUDIO</ExtrudedText></div>
        </div>
        <h3 className="mt-2 text-xl font-semibold">Live 3D preview</h3>
        <p className="mt-2 max-w-md text-sm text-neutral-300">Spin your sign around, change the finish and lighting, and see every edit instantly, with real reflections.</p>
      </li>

      <li className={`${card} md:col-span-2`} style={glow('rgba(53,214,255,.18)')}>
        <div aria-hidden="true" className="mx-auto h-44 w-24 rounded-[1.6rem] border-2 border-neutral-600 bg-neutral-950 p-2">
          <div className="grid h-full place-items-center rounded-[1.1rem] bg-gradient-to-b from-neutral-800 to-neutral-900">
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#ffd3e0]" style={{ textShadow: '0 0 10px #ff2d6f' }}>CRE 8</span>
          </div>
        </div>
        <h3 className="mt-4 text-xl font-semibold">On your wall, in AR</h3>
        <p className="mt-2 text-sm text-neutral-300">Point your phone at a wall and see the sign at its real size.</p>
      </li>

      <li className={`${card} md:col-span-2`} style={glow('rgba(255,154,92,.18)')}>
        <div aria-hidden="true" className="space-y-2 pt-2 text-xs text-neutral-400">
          {[['Setup', 'w-10'], ['Material', 'w-20'], ['LED strip', 'w-14'], ['Shipping', 'w-8']].map(([k, w]) => (
            <div key={k} className="flex items-center justify-between"><span>+ {k}</span><span className={`h-1.5 rounded-full bg-neutral-600 ${w}`} /></div>
          ))}
          <div className="flex items-center justify-between border-t border-white/10 pt-2 text-neutral-100"><span>= Your price</span><span className="h-2 w-16 rounded-full bg-[#ff2d6f]" /></div>
        </div>
        <h3 className="mt-6 text-xl font-semibold">A price you can follow</h3>
        <p className="mt-2 text-sm text-neutral-300">See where every part of the cost comes from, updating as you design.</p>
      </li>

      <li className={`${card} md:col-span-2`} style={glow('rgba(124,255,92,.14)')}>
        <div aria-hidden="true" className="flex flex-wrap gap-2 pt-2">
          {['DXF', 'SVG', 'BOM'].map((f) => (
            <span key={f} className="rounded-lg border border-white/15 bg-neutral-950 px-3 py-2 text-sm font-semibold text-neutral-100">.{f.toLowerCase()}</span>
          ))}
        </div>
        <h3 className="mt-6 text-xl font-semibold">Ready to cut</h3>
        <p className="mt-2 text-sm text-neutral-300">Cut files and a materials list come straight from your exact design.</p>
      </li>

      <li className={`${card} md:col-span-2`} style={glow('rgba(255,45,111,.16)')}>
        <div aria-hidden="true" className="pt-3">
          <div className="grid grid-cols-4 gap-1.5">
            {[true, true, false, false].map((on, i) => <span key={i} className={`h-1.5 rounded-full ${on ? 'bg-[#ff2d6f]' : 'bg-neutral-700'}`} />)}
          </div>
          <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-neutral-500"><span>Configured</span><span>Shipped</span></div>
        </div>
        <h3 className="mt-6 text-xl font-semibold">Follow your order</h3>
        <p className="mt-2 text-sm text-neutral-300">From configured to manufacturing, quality check and shipped.</p>
      </li>
    </ul>
  );
}
