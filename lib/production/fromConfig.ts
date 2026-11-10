import { FontLoader, type Font } from 'three-stdlib';
import { svgToContours, textToContours } from '../geometry';
import { fontUrl } from '../fonts';
import type { SignConfig } from '../types';
import type { LoopSet } from './loops';

const loader = new FontLoader();
const fonts = new Map<string, Promise<Font>>();

/**
 * Rebuild the flat design outlines (cm) from a saved config using the SAME pipeline as the customer's
 * viewer. Runs in the admin's browser because SVG parsing needs DOMParser.
 * (Moving this server-side later = polyfill DOMParser with @xmldom/xmldom and test thoroughly.)
 */
export async function contoursFromConfig(c: SignConfig): Promise<LoopSet[]> {
  if (c.source === 'svg') {
    if (!c.svgMarkup) throw new Error('SVG design has no artwork attached.');
    return svgToContours(c.svgMarkup, c.svgWidthCm);
  }
  const url = fontUrl(c.fontId);
  if (!fonts.has(url)) fonts.set(url, loader.loadAsync(url));
  return textToContours(await fonts.get(url)!, c);
}
