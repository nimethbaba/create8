import type { CSSProperties } from 'react';
import type { Preset } from '@/lib/presets';
import { getLedColor } from '@/lib/lighting';
import { FINISHES } from '@/lib/materials';
import type { FinishId, FontId, LightConfig } from '@/lib/types';

const FONT_STACK: Record<string, string> = {
  helvetiker: 'Helvetica, Arial, sans-serif',
  optimer: 'Optima, Candara, "Segoe UI", sans-serif',
  gentilis: 'Georgia, "Times New Roman", serif',
};

const METAL: Partial<Record<FinishId, string>> = {
  'brushed-steel': 'linear-gradient(180deg,#eceef0 0%,#9aa0a8 52%,#d3d6da 100%)',
  'polished-chrome': 'linear-gradient(180deg,#ffffff 0%,#7f8892 38%,#f6f8fa 58%,#8c95a0 100%)',
};

/** A quick CSS impression of a design (not the real 3D render) — for the gallery. Decorative: the caption carries the info. */
export function SignTile({ preset }: { preset: Preset }) {
  const c = preset.config;
  const finish: FinishId = c.finish ?? 'brushed-steel';
  const light: LightConfig = c.light ?? { mode: 'off', colorMode: 'rgb', kelvin: 4000, rgb: '#ffffff', intensity: 3 };
  const led = getLedColor(light);
  const family = FONT_STACK[(c.fontId as FontId | undefined)?.replace('-bold', '') ?? 'helvetiker'];
  const bold = (c.fontId ?? '').endsWith('bold');
  const text = c.text ?? '';
  const metal = METAL[finish];

  const style: CSSProperties = {
    fontFamily: family,
    fontWeight: bold ? 800 : 500,
    fontSize: text.length > 6 ? '2.6rem' : '3.6rem',
    letterSpacing: `${(c.letterSpacing ?? 0.1) + 0.05}em`,
    lineHeight: 1,
  };
  let filter = 'drop-shadow(0 4px 5px rgba(0,0,0,.65))';

  if (metal) {
    Object.assign(style, { backgroundImage: metal, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' });
  } else {
    style.color = c.color ?? '#ffffff';
  }
  if (light.mode === 'edge') {
    style.WebkitTextStroke = `1.5px ${led}`;
    filter = `drop-shadow(0 0 5px ${led}) drop-shadow(0 0 16px ${led})`;
  } else if (light.mode === 'front') {
    style.color = '#fffaf0';
    style.backgroundImage = 'none';
    filter = `drop-shadow(0 0 6px ${led}) drop-shadow(0 0 18px ${led})`;
  } else if (light.mode === 'halo') {
    filter = `drop-shadow(0 0 14px ${led}) drop-shadow(0 0 30px ${led})`;
  }
  style.filter = filter;

  const wall = light.mode === 'halo' ? `radial-gradient(ellipse at center, ${led}55, transparent 62%), linear-gradient(180deg,#26262b,#17171a)` : 'linear-gradient(180deg,#26262b,#17171a)';

  return (
    <div aria-hidden="true" className="grid h-48 place-items-center overflow-hidden rounded-t-xl" style={{ background: wall }}>
      <span style={style} className="select-none whitespace-nowrap">{text}</span>
    </div>
  );
}

export const describePreset = (p: Preset, lightLabel: string) =>
  `${FINISHES[p.config.finish ?? 'brushed-steel'].label} · ${lightLabel} · ${p.config.depthMm ?? 12} mm deep`;
