import { useMutation } from '@tanstack/react-query';
import { apiClient } from './apiClient';

export interface CheckoutValidationPayload {
  cartItems: Array<{
    foodId: string;
    name?: string;
    price?: number;
    quantity: number;
    selectedOptions?: Array<{ groupName: string; optionName: string; price: number }>;
  }>;
  restaurantId: string;
  addressId: string;
  couponCode?: string;
  tipAmount?: number;
  deliveryInstructions?: string;
  deliveryOption?: 'standard' | 'scheduled';
  idempotencyKey?: string;
}

export interface CheckoutSummaryResponse {
  valid: boolean;
  isReadyForPayment: boolean;
  idempotencyKey: string;
  restaurant: {
    id: string;
    name: string;
    address: string;
    isOpen: boolean;
  };
  address: {
    id: string;
    fullName: string;
    phone: string;
    label: string;
    fullFormatted: string;
  };
  items: Array<{
    foodId: string;
    name: string;
    imageUrl: string;
    dietaryType: string;
    price: number;
    originalPrice: number;
    quantity: number;
    itemTotal: number;
  }>;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  isFreeDelivery: boolean;
  platformFee: number;
  taxAmount: number;
  tipAmount: number;
  grandTotal: number;
  savingsTotal: number;
  coupon?: {
    code: string;
    description: string;
    discountAmount: number;
  } | null;
  validationWarnings: string[];
  priceChanges: Array<{
    foodId: string;
    name: string;
    clientPrice: number;
    currentPrice: number;
    difference: number;
  }>;
  unavailableItems: Array<{
    foodId: string;
    name: string;
    reason: string;
  }>;
}

export const useValidateCheckoutMutation = () => {
  return useMutation({
    mutationFn: async (payload: CheckoutValidationPayload) => {
      const response = await apiClient.post('/checkout/validate', payload, {
        headers: payload.idempotencyKey ? { 'Idempotency-Key': payload.idempotencyKey } : {},
      });
      return response.data.data as CheckoutSummaryResponse;
    },
  });
};
