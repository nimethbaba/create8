import { z } from 'zod';
import { MAX_SVG_BYTES } from './svgSafety';

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const bool01 = z.number().finite();

export const configSchema = z.object({
  source: z.enum(['text', 'svg']),
  text: z.string().max(60),
  fontId: z.enum(['helvetiker', 'helvetiker-bold', 'optimer', 'optimer-bold', 'gentilis', 'gentilis-bold']),
  sizeCm: bool01.min(5).max(100),
  letterSpacing: bool01.min(-0.1).max(0.6),
  lineSpacing: bool01.min(0.8).max(2),
  depthMm: bool01.min(3).max(80),
  svgMarkup: z.string().max(MAX_SVG_BYTES).nullable(),
  svgFileName: z.string().max(200).nullable(),
  svgWidthCm: bool01.min(10).max(200),
  finish: z.enum(['brushed-steel', 'polished-chrome', 'matte-acrylic', 'painted-wood']),
  color: hex,
  light: z.object({
    mode: z.enum(['off', 'front', 'halo', 'edge']),
    colorMode: z.enum(['kelvin', 'rgb']),
    kelvin: z.union([z.literal(3000), z.literal(4000), z.literal(6000)]),
    rgb: hex,
    intensity: bool01.min(0.5).max(6),
  }),
  environment: z.enum(['studio', 'night']),
});

export const metricsSchema = z.object({
  widthCm: bool01.positive().max(400),
  heightCm: bool01.positive().max(400),
  depthCm: bool01.positive().max(12),
  volumeCm3: bool01.positive().max(1_000_000),
  surfaceAreaCm2: bool01.positive().max(2_000_000),
  perimeterCm: bool01.positive().max(500_000),
});

export const customerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(30).optional().default(''),
  address1: z.string().trim().min(1).max(200),
  address2: z.string().trim().max(200).optional().default(''),
  city: z.string().trim().min(1).max(100),
  postcode: z.string().trim().min(1).max(20),
  country: z.string().trim().min(2).max(60),
});

export const orderRequestSchema = z.object({
  customer: customerSchema,
  items: z
    .array(z.object({ config: configSchema, metrics: metricsSchema, qty: z.number().int().min(1).max(100) }))
    .min(1)
    .max(20),
});

export type OrderRequest = z.infer<typeof orderRequestSchema>;
