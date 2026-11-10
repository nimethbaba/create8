// Copies Three.js typeface.json fonts into /public/fonts so FontLoader can fetch them.
import { cpSync, existsSync, mkdirSync } from 'node:fs';

const src = 'node_modules/three/examples/fonts';
const dst = 'public/fonts';
const files = [
  'helvetiker_regular', 'helvetiker_bold',
  'optimer_regular', 'optimer_bold',
  'gentilis_regular', 'gentilis_bold',
].map((n) => `${n}.typeface.json`);

mkdirSync(dst, { recursive: true });
for (const f of files) {
  if (existsSync(`${src}/${f}`)) cpSync(`${src}/${f}`, `${dst}/${f}`);
  else console.warn(`[copy-fonts] missing ${f}`);
}
