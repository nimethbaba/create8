import { ExtrudedText } from './ExtrudedText';

/** Hero visual: an extruded, halo-lit sign swaying on a wall. Decorative — described once for screen readers. */
export function HeroScene() {
  return (
    <div role="img" aria-label="Illustration of a glowing 3D sign reading CRE 8 mounted on a wall" className="relative mx-auto w-full max-w-xl">
      <div className="relative aspect-[5/4] overflow-hidden rounded-3xl border border-white/10 bg-[#101012] shadow-[0_30px_80px_-20px_rgba(0,0,0,.8)]"
        style={{
          backgroundImage:
            'radial-gradient(110% 70% at 50% 0%, rgba(255,255,255,.09), transparent 60%), repeating-linear-gradient(90deg, rgba(255,255,255,.03) 0 1px, transparent 1px 72px), repeating-linear-gradient(0deg, rgba(255,255,255,.03) 0 1px, transparent 1px 72px)',
        }}>
        {/* halo light on the wall behind the letters */}
        <div aria-hidden="true" className="absolute left-1/2 top-[46%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff2d6f]/45 blur-[90px]" />
        <div aria-hidden="true" className="absolute left-[18%] top-[30%] h-32 w-32 rounded-full bg-[#ff9a5c]/20 blur-[60px]" />

        <div aria-hidden="true" className="absolute inset-0 grid place-items-center">
          <div className="sway">
            <ExtrudedText className="flicker select-none text-5xl font-bold tracking-[0.14em] sm:text-7xl" depth={12}>CRE 8</ExtrudedText>
          </div>
        </div>

        {/* soft floor shine */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div aria-hidden="true" className="absolute -bottom-4 left-4 rounded-full border border-white/15 bg-neutral-950/90 px-4 py-2 text-xs text-neutral-200 shadow-xl backdrop-blur sm:left-8">
        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#ff2d6f] shadow-[0_0_8px_#ff2d6f]" />Halo backlit
      </div>
      <div aria-hidden="true" className="absolute -right-2 top-8 rounded-full border border-white/15 bg-neutral-950/90 px-4 py-2 text-xs text-neutral-200 shadow-xl backdrop-blur sm:-right-4">
        Brushed steel · 12 mm
      </div>
    </div>
  );
}
