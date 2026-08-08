export interface PricingInput {
  itemTotal: number;
  discountAmount?: number;
  tipAmount?: number;
  deliveryThreshold?: number;
  standardDeliveryFee?: number;
  platformFee?: number;
  gstRate?: number;
}

export interface PricingBreakdown {
  itemTotal: number;
  deliveryFee: number;
  isFreeDelivery: boolean;
  platformFee: number;
  taxAmount: number;
  discountAmount: number;
  tipAmount: number;
  grandTotal: number;
  savingsTotal: number;
}

export const PRICING_CONFIG = {
  DELIVERY_FREE_THRESHOLD: 500, // Free delivery above ₹500
  STANDARD_DELIVERY_FEE: 35,
  PLATFORM_FEE: 6,
  GST_RATE: 0.05, // 5% GST
  TIP_PRESETS: [0, 20, 30, 50] as const,
};

/**
 * Calculates complete order bill breakdown using integer-safe arithmetic.
 */
export const calculateOrderPricing = (input: PricingInput): PricingBreakdown => {
  const itemTotal = Math.max(0, Math.round(input.itemTotal));
  const discountAmount = Math.max(0, Math.min(itemTotal, Math.round(input.discountAmount || 0)));
  const tipAmount = Math.max(0, Math.round(input.tipAmount || 0));

  const threshold = input.deliveryThreshold ?? PRICING_CONFIG.DELIVERY_FREE_THRESHOLD;
  const standardFee = input.standardDeliveryFee ?? PRICING_CONFIG.STANDARD_DELIVERY_FEE;
  const platformFee = itemTotal > 0 ? (input.platformFee ?? PRICING_CONFIG.PLATFORM_FEE) : 0;
  const gstRate = input.gstRate ?? PRICING_CONFIG.GST_RATE;

  const isFreeDelivery = itemTotal >= threshold;
  const deliveryFee = itemTotal > 0 ? (isFreeDelivery ? 0 : standardFee) : 0;

  const taxableAmount = Math.max(0, itemTotal - discountAmount);
  const taxAmount = itemTotal > 0 ? Math.round(taxableAmount * gstRate) : 0;

  const grandTotal = itemTotal > 0
    ? Math.max(0, itemTotal + deliveryFee + platformFee + taxAmount + tipAmount - discountAmount)
    : 0;

  const savingsTotal = discountAmount + (isFreeDelivery && itemTotal > 0 ? standardFee : 0);

  return {
    itemTotal,
    deliveryFee,
    isFreeDelivery,
    platformFee,
    taxAmount,
    discountAmount,
    tipAmount,
    grandTotal,
    savingsTotal,
  };
};
