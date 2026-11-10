import type { LightConfig, SignConfig } from './types';

export type PresetConfig = Partial<Pick<SignConfig, 'text' | 'fontId' | 'sizeCm' | 'letterSpacing' | 'depthMm' | 'finish' | 'color' | 'light'>>;
export interface Preset { id: string; title: string; blurb: string; config: PresetConfig }

const light = (mode: LightConfig['mode'], o: Partial<LightConfig> = {}): LightConfig => ({
  mode, colorMode: 'rgb', kelvin: 4000, rgb: '#ff2d6f', intensity: 3, ...o,
});

/**
 * Starting points used by the Gallery ("Design one like this") and by /design?preset=<id>.
 * The designer only accepts ids from this list — nothing from the URL is applied as free-form data.
 */
export const PRESETS: Preset[] = [
  { id: 'open-neon', title: 'Neon “open” sign', blurb: 'Hot-pink edge glow on dark acrylic.',
    config: { text: 'OPEN', fontId: 'helvetiker-bold', sizeCm: 30, letterSpacing: 0.12, depthMm: 15, finish: 'matte-acrylic', color: '#16161a', light: light('edge', { rgb: '#ff2d6f' }) } },
  { id: 'studio-steel', title: 'Brushed steel nameplate', blurb: 'Clean satin metal letters, no lighting.',
    config: { text: 'STUDIO', fontId: 'optimer-bold', sizeCm: 25, letterSpacing: 0.2, depthMm: 12, finish: 'brushed-steel', light: light('off') } },
  { id: 'bakery-wood', title: 'Painted wood with a warm halo', blurb: 'Terracotta paint with a soft glow on the wall behind.',
    config: { text: 'BAKERY', fontId: 'gentilis-bold', sizeCm: 30, letterSpacing: 0.08, depthMm: 20, finish: 'painted-wood', color: '#b8452a', light: light('halo', { colorMode: 'kelvin', kelvin: 3000, intensity: 3 }) } },
  { id: 'lounge-chrome', title: 'Chrome with a cool halo', blurb: 'Mirror-polished letters lit from behind in icy blue.',
    config: { text: 'LOUNGE', fontId: 'optimer-bold', sizeCm: 28, letterSpacing: 0.15, depthMm: 15, finish: 'polished-chrome', light: light('halo', { rgb: '#35d6ff' }) } },
  { id: 'welcome-front', title: 'Front-lit welcome', blurb: 'Soft white acrylic with glowing faces.',
    config: { text: 'WELCOME', fontId: 'helvetiker', sizeCm: 26, letterSpacing: 0.1, depthMm: 10, finish: 'matte-acrylic', color: '#f4f1ea', light: light('front', { colorMode: 'kelvin', kelvin: 4000, intensity: 2.5 }) } },
  { id: 'fit-edge', title: 'Electric green edge-lit', blurb: 'Navy acrylic with a bright green neon edge.',
    config: { text: 'FIT', fontId: 'helvetiker-bold', sizeCm: 35, letterSpacing: 0.1, depthMm: 18, finish: 'matte-acrylic', color: '#0f1f3a', light: light('edge', { rgb: '#7cff5c', intensity: 3.5 }) } },
];

export const getPreset = (id: string | undefined) => PRESETS.find((p) => p.id === id);

export const LIGHT_LABELS: Record<LightConfig['mode'], string> = {
  off: 'Unlit', front: 'Front-lit', halo: 'Halo backlit', edge: 'Edge-lit neon',
};
