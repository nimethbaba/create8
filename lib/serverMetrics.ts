import 'server-only';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Font } from 'three-stdlib';
import { computeMetrics, contoursToGeometry, textToContours } from './geometry';
import { fontUrl } from './fonts';
import type { SignConfig, SignMetrics } from './types';

const fonts = new Map<string, Font>();
function loadFont(id: SignConfig['fontId']): Font {
  const url = fontUrl(id);
  let f = fonts.get(url);
  if (!f) {
    const file = path.join(process.cwd(), 'public', url);
    f = new Font(JSON.parse(readFileSync(file, 'utf8')));
    fonts.set(url, f);
  }
  return f;
}

/** Re-run the exact client pipeline in Node so text-sign prices can't be tampered with. */
export function measureTextSign(c: SignConfig): SignMetrics | null {
  const contours = textToContours(loadFont(c.fontId), c);
  if (!contours.length) return null;
  const geo = contoursToGeometry(contours, c.depthMm / 10);
  const m = computeMetrics(geo, contours);
  geo.dispose();
  return m;
}
