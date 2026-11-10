import * as THREE from 'three';
import { GLTFExporter } from 'three-stdlib';
import { getFinishProps } from '../materials';
import { getLedColor } from '../lighting';
import { CM_TO_M } from '../constants';
import type { SignConfig } from '../types';

/**
 * Build a clean, real-world-size GLB of just the sign (no wall, lights or helpers).
 * Units: metres (geometry is in cm → scaled by 0.01); centred in XY, back face at z = 0, front faces +Z.
 *
 * What does NOT carry over to AR (glTF has no equivalent): the procedural bump grain (brushed steel / wood),
 * bloom glow, and halo backlighting. Front-lit and edge-lit survive as emissive materials.
 */
export function exportSignGlb(
  source: THREE.BufferGeometry,
  c: Pick<SignConfig, 'finish' | 'color' | 'light'>,
): Promise<ArrayBuffer> {
  const geometry = source.clone();
  geometry.deleteAttribute('uv'); // no textures are exported, so UVs are dead weight

  const base = getFinishProps(c.finish, c.color); // no textures → no bumpMap
  const led = getLedColor(c.light);
  const make = (name: string, glow: boolean) =>
    new THREE.MeshPhysicalMaterial({
      ...base,
      name,
      emissive: glow ? led : '#000000',
      emissiveIntensity: glow ? 1 : 0, // >1 needs KHR_materials_emissive_strength, not all AR viewers read it
    });
  const face = make('sign-face', c.light.mode === 'front');
  const side = make('sign-side', c.light.mode === 'edge');

  const mesh = new THREE.Mesh(geometry, [face, side]); // ExtrudeGeometry groups: 0 faces, 1 sides
  mesh.name = 'CRE8_sign';
  mesh.scale.setScalar(CM_TO_M);
  const root = new THREE.Group();
  root.name = 'CRE8_root';
  root.add(mesh);
  root.updateMatrixWorld(true);

  const cleanup = () => { geometry.dispose(); face.dispose(); side.dispose(); };

  return new Promise<ArrayBuffer>((resolve, reject) => {
    new GLTFExporter().parse(
      root,
      (result) => (result instanceof ArrayBuffer ? resolve(result) : reject(new Error('GLB export returned JSON instead of binary.'))),
      (err: unknown) => reject(err instanceof Error ? err : new Error('GLB export failed.')),
      { binary: true, onlyVisible: true },
    );
  }).finally(cleanup);
}
