import * as THREE from 'three';

/**
 * Tiny procedural bump textures so we ship no image assets in the MVP.
 * Swap for calibrated roughness/normal/AO maps (see Tech Arch §2.2) when art is ready.
 * UVs from ExtrudeGeometry are in geometry units (cm), so repeat ≈ 1 tile per 10 cm.
 */
export function makeStreakTexture(kind: 'brushed' | 'wood'): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const g = canvas.getContext('2d')!;
  g.fillStyle = '#808080';
  g.fillRect(0, 0, size, size);

  const count = kind === 'brushed' ? 1800 : 260;
  for (let i = 0; i < count; i++) {
    const y = Math.random() * size;
    const v = Math.random() > 0.5 ? 255 : 0;
    g.strokeStyle = `rgba(${v},${v},${v},${kind === 'brushed' ? 0.08 + Math.random() * 0.12 : 0.1 + Math.random() * 0.2})`;
    g.lineWidth = kind === 'brushed' ? 0.5 + Math.random() * 0.8 : 1 + Math.random() * 3;
    g.beginPath();
    g.moveTo(0, y);
    if (kind === 'brushed') {
      g.lineTo(size, y + (Math.random() - 0.5));
    } else {
      for (let x = 0; x <= size; x += 16) g.lineTo(x, y + Math.sin(x * 0.05 + i) * 2);
    }
    g.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(0.1, 0.1);
  tex.anisotropy = 4;
  return tex;
}
