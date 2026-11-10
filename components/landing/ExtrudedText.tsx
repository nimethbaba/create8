import type { CSSProperties } from 'react';

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = rgb(a), B = rgb(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`;
};

/** Stacked text-shadows that fake a solid, extruded letter (front face + side wall) — the CRE 8 look in pure CSS. */
export function extrudeShadow(depth: number, sideFrom: string, sideTo: string, glow?: string) {
  const layers = Array.from({ length: depth }, (_, i) => `${i + 1}px ${i + 1}px 0 ${mix(sideFrom, sideTo, depth === 1 ? 0 : i / (depth - 1))}`);
  if (glow) layers.push(`0 0 28px ${glow}`, `0 0 70px ${glow}`);
  return layers.join(', ');
}

export function ExtrudedText({
  children, face = '#ffe3ec', sideFrom = '#e0245f', sideTo = '#4a0a22', depth = 10, glow = '#ff2d6f', className = '', style,
}: { children: React.ReactNode; face?: string; sideFrom?: string; sideTo?: string; depth?: number; glow?: string | null; className?: string; style?: CSSProperties }) {
  return (
    <span className={className} style={{ color: face, textShadow: extrudeShadow(depth, sideFrom, sideTo, glow ?? undefined), ...style }}>
      {children}
    </span>
  );
}
