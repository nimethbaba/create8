import type { MeshPhysicalMaterialParameters, Texture } from 'three';
import type { FinishId } from './types';

export const FINISHES: Record<FinishId, { label: string; tintable: boolean; swatch: string }> = {
  'brushed-steel':   { label: 'Brushed Steel',   tintable: false, swatch: '#b9bdc3' },
  'polished-chrome': { label: 'Polished Chrome', tintable: false, swatch: '#f4f6f8' },
  'matte-acrylic':   { label: 'Matte Acrylic',   tintable: true,  swatch: '#e8e8ea' },
  'painted-wood':    { label: 'Painted Wood',    tintable: true,  swatch: '#8a5a33' },
};

export interface FinishTextures { brushed: Texture; wood: Texture }

/** PBR parameters per finish. Spread directly onto <meshPhysicalMaterial /> so edits are live. */
export function getFinishProps(id: FinishId, color: string, tex: Partial<FinishTextures> = {}): MeshPhysicalMaterialParameters {
  switch (id) {
    case 'brushed-steel':
      return { color: '#b9bdc3', metalness: 1, roughness: 0.38, bumpMap: tex.brushed, bumpScale: 0.4 };
    case 'polished-chrome':
      return { color: '#ffffff', metalness: 1, roughness: 0.04 };
    case 'matte-acrylic':
      return { color, metalness: 0, roughness: 0.55, clearcoat: 0.15, clearcoatRoughness: 0.5 };
    case 'painted-wood':
      return { color, metalness: 0, roughness: 0.82, bumpMap: tex.wood, bumpScale: 0.6 };
  }
}
