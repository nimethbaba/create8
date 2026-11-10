export type FinishId = 'brushed-steel' | 'polished-chrome' | 'matte-acrylic' | 'painted-wood';
export type IlluminationMode = 'off' | 'front' | 'halo' | 'edge';
export type LightColorMode = 'kelvin' | 'rgb';
export type SignSource = 'text' | 'svg';
export type EnvironmentId = 'studio' | 'night';
export type FontId =
  | 'helvetiker' | 'helvetiker-bold'
  | 'optimer' | 'optimer-bold'
  | 'gentilis' | 'gentilis-bold';

export interface LightConfig {
  mode: IlluminationMode;
  colorMode: LightColorMode;
  kelvin: 3000 | 4000 | 6000;
  rgb: string;        // hex, used when colorMode === 'rgb'
  intensity: number;  // 0–6, drives emissiveIntensity / halo light power
}

/** Everything the user can change. Serialisable → can be saved to cart / DB later. */
export interface SignConfig {
  // geometry-affecting
  source: SignSource;
  text: string;
  fontId: FontId;
  sizeCm: number;        // font em-size in cm
  letterSpacing: number; // tracking, in em (−0.1 … 0.6)
  lineSpacing: number;   // line height multiplier
  depthMm: number;       // extrusion depth
  svgMarkup: string | null;
  svgFileName: string | null;
  svgWidthCm: number;
  // appearance-only (never rebuilds geometry)
  finish: FinishId;
  color: string;
  light: LightConfig;
  environment: EnvironmentId;
}

/** Measured from the generated BufferGeometry / contours (all in cm, cm², cm³). */
export interface SignMetrics {
  widthCm: number;
  heightCm: number;
  depthCm: number;
  volumeCm3: number;
  surfaceAreaCm2: number;
  perimeterCm: number;
}
