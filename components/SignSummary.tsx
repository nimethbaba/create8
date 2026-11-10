import { FINISHES } from '@/lib/materials';
import type { FinishId, IlluminationMode } from '@/lib/types';

const LIGHT_LABEL: Record<IlluminationMode, string> = { off: 'Unlit', front: 'Front-lit', halo: 'Halo backlit', edge: 'Edge-lit neon' };

export function describeSign(p: { finish: FinishId; mode: IlluminationMode; widthCm: number; heightCm: number; depthMm: number }) {
  return `${FINISHES[p.finish].label} · ${LIGHT_LABEL[p.mode]} · ${p.widthCm.toFixed(0)} × ${p.heightCm.toFixed(0)} cm · ${p.depthMm} mm deep`;
}
