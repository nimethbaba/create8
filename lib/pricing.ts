import type { FinishId, IlluminationMode, SignMetrics } from './types';

/**
 * PRD §3.2:  Price = Base Setup Fee + (Material Volume × Rate) + (LED Length × LED Rate) + Shipping Surcharge
 * ALL RATES ARE PLACEHOLDERS — replace with real shop costs (ideally fetched from the CMS/DB).
 */
export const PRICING = {
  currency: 'USD',
  baseSetupFee: 45,
  materialRatePerCm3: {
    'brushed-steel': 0.22,
    'polished-chrome': 0.30,
    'matte-acrylic': 0.09,
    'painted-wood': 0.06,
  } satisfies Record<FinishId, number>,
  ledRatePerMeter: 14,
  /** Fraction of contour perimeter that needs LED strip for each mode. */
  ledPerimeterFactor: { off: 0, front: 0.5, halo: 0.8, edge: 1 } satisfies Record<IlluminationMode, number>,
  shipping: [
    { maxDimCm: 60, fee: 8 },
    { maxDimCm: 120, fee: 20 },
    { maxDimCm: Infinity, fee: 45 },
  ],
};

export interface PriceBreakdown {
  base: number;
  material: number;
  led: number;
  shipping: number;
  total: number;
  ledLengthM: number;
}

export function computePrice(m: SignMetrics, finish: FinishId, mode: IlluminationMode): PriceBreakdown {
  const base = PRICING.baseSetupFee;
  const material = m.volumeCm3 * PRICING.materialRatePerCm3[finish];
  const ledLengthM = (m.perimeterCm * PRICING.ledPerimeterFactor[mode]) / 100;
  const led = ledLengthM * PRICING.ledRatePerMeter;
  const maxDim = Math.max(m.widthCm, m.heightCm);
  const shipping = PRICING.shipping.find((s) => maxDim <= s.maxDimCm)!.fee;
  return { base, material, led, shipping, ledLengthM, total: base + material + led + shipping };
}

/** PRD §3.2 bulk discounts. PLACEHOLDER tiers — trade/contractor pricing comes later. */
export const QUANTITY_DISCOUNTS = [
  { minQty: 10, rate: 0.1 },
  { minQty: 5, rate: 0.05 },
];

export const quantityDiscountRate = (qty: number) =>
  QUANTITY_DISCOUNTS.find((t) => qty >= t.minQty)?.rate ?? 0;

export const round2 = (n: number) => Math.round(n * 100) / 100;

/** Line total after bulk discount. Used by the cart UI AND the server, so both agree. */
export function lineTotal(unitPrice: number, qty: number) {
  const rate = quantityDiscountRate(qty);
  const gross = unitPrice * qty;
  return { gross: round2(gross), discount: round2(gross * rate), net: round2(gross * (1 - rate)), rate };
}
