import { HeroScene } from './HeroScene';
import { FloatCard } from './FloatCard';
import { ParallaxField, ParallaxLayer } from './ParallaxField';

/**
 * The sign on its wall, ringed by three 3D renders at different "depths".
 * Move the mouse anywhere on the page: the far ring barely moves, the sign moves a little, the near cube and orb move most.
 */
export function HeroStage() {
  return (
    <ParallaxField className="relative mx-auto w-full max-w-xl py-6">
      <ParallaxLayer depth={14} tilt={4} aria-hidden className="absolute -right-4 -top-8 z-0 w-[74%] sm:-right-10">
        <div className="rotate-3"><div className="drift-2"><FloatCard src="/images/ring.webp" w={1280} h={720} /></div></div>
      </ParallaxLayer>

      <ParallaxLayer depth={9} tilt={3} className="relative z-10">
        <HeroScene />
      </ParallaxLayer>

      <ParallaxLayer depth={48} tilt={9} aria-hidden className="absolute -left-4 top-2 z-20 w-[30%] sm:-left-10">
        <div className="-rotate-6"><div className="drift"><FloatCard src="/images/cube.webp" w={800} h={800} /></div></div>
      </ParallaxLayer>

      <ParallaxLayer depth={70} tilt={11} aria-hidden className="absolute -bottom-2 -right-3 z-20 w-[32%] sm:-right-8">
        <div className="rotate-6"><div className="drift-3"><FloatCard src="/images/orb.webp" w={800} h={800} /></div></div>
      </ParallaxLayer>
    </ParallaxField>
  );
}
