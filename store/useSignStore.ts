import { create } from 'zustand';
import type { LightConfig, SignConfig, SignMetrics } from '@/lib/types';

interface SignState extends SignConfig {
  /** Derived by the viewport after each geometry rebuild; consumed by the price panel. */
  metrics: SignMetrics | null;
  error: string | null;

  patch: (p: Partial<SignConfig>) => void;
  patchLight: (p: Partial<LightConfig>) => void;
  loadConfig: (c: SignConfig) => void;
  loadSvg: (markup: string, fileName: string) => void;
  clearSvg: () => void;
  setDerived: (metrics: SignMetrics | null, error: string | null) => void;
}

export const useSignStore = create<SignState>((set) => ({
  source: 'text',
  text: 'CRE 8',
  fontId: 'helvetiker-bold',
  sizeCm: 30,
  letterSpacing: 0.05,
  lineSpacing: 1.25,
  depthMm: 12,
  svgMarkup: null,
  svgFileName: null,
  svgWidthCm: 60,

  finish: 'brushed-steel',
  color: '#e8e8ea',
  light: { mode: 'edge', colorMode: 'rgb', kelvin: 4000, rgb: '#ff2d6f', intensity: 2.5 },
  environment: 'studio',

  metrics: null,
  error: null,

  patch: (p) => set(p),
  patchLight: (p) => set((s) => ({ light: { ...s.light, ...p } })),
  loadConfig: (c) => set({ ...c, error: null }),
  loadSvg: (svgMarkup, svgFileName) => set({ source: 'svg', svgMarkup, svgFileName, error: null }),
  clearSvg: () => set({ source: 'text', svgMarkup: null, svgFileName: null }),
  setDerived: (metrics, error) => set({ metrics, error }),
}));

/**
 * Only these fields invalidate the extruded geometry. Wrap with useShallow so changing
 * finish / colour / lighting never triggers an (expensive) geometry rebuild.
 */
export const selectGeometryParams = (s: SignConfig) => ({
  source: s.source,
  text: s.text,
  fontId: s.fontId,
  sizeCm: s.sizeCm,
  letterSpacing: s.letterSpacing,
  lineSpacing: s.lineSpacing,
  depthMm: s.depthMm,
  svgMarkup: s.svgMarkup,
  svgWidthCm: s.svgWidthCm,
});

/** Pull the serialisable config (no derived state / actions) out of the store. */
export function snapshotConfig(s: SignConfig): SignConfig {
  const { source, text, fontId, sizeCm, letterSpacing, lineSpacing, depthMm, svgMarkup, svgFileName, svgWidthCm, finish, color, light, environment } = s;
  return { source, text, fontId, sizeCm, letterSpacing, lineSpacing, depthMm, svgMarkup, svgFileName, svgWidthCm, finish, color, light: { ...light }, environment };
}
