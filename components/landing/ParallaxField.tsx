'use client';
import { useEffect, useRef } from 'react';

/**
 * Mouse parallax. One listener turns the pointer position (anywhere in the window) into two CSS variables,
 * --mx and --my in the range -1…1, eased with requestAnimationFrame. Every <ParallaxLayer> inside reads them,
 * so deeper layers travel further and tilt more — the images follow the pointer and feel like they sit at different distances.
 * Skipped for touch pointers and for visitors who prefer reduced motion. The loop sleeps when nothing is moving.
 */
export function ParallaxField({ children, className = '', ...rest }: { children: React.ReactNode; className?: string; 'aria-hidden'?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) return;

    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      el.style.setProperty('--mx', cx.toFixed(4));
      el.style.setProperty('--my', cy.toFixed(4));
      raf = Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
      wake();
    };
    const onLeave = () => { tx = 0; ty = 0; wake(); }; // pointer left the window → ease back to centre

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className={className} style={{ '--mx': 0, '--my': 0 } as React.CSSProperties} {...rest}>
      {children}
    </div>
  );
}

/** depth = pixels travelled at full pointer deflection; tilt = degrees of 3D rotation. Bigger = closer to the viewer. */
export function ParallaxLayer({
  depth = 30, tilt = 6, className = '', children, ...rest
}: { depth?: number; tilt?: number; className?: string; children: React.ReactNode; 'aria-hidden'?: boolean }) {
  return (
    <div
      className={className}
      style={{
        '--d': depth,
        '--t': tilt,
        transform:
          'translate3d(calc(var(--mx) * var(--d) * 1px), calc(var(--my) * var(--d) * 1px), 0) perspective(900px) rotateX(calc(var(--my) * var(--t) * -1deg)) rotateY(calc(var(--mx) * var(--t) * 1deg))',
        willChange: 'transform',
      } as React.CSSProperties}
      {...rest}
    >
      {children}
    </div>
  );
}
