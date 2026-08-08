import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from './apiClient';

export interface CreatePaymentPayload {
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
  idempotencyKey: string;
}

export interface CreatePaymentOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  razorpayKeyId?: string;
  paymentReference: string;
  status: string;
  checkoutSummary: any;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  paymentReference: string;
}

export const useCreatePaymentOrderMutation = () => {
  return useMutation({
    mutationFn: async (payload: CreatePaymentPayload) => {
      const response = await apiClient.post('/payments/create-order', payload, {
        headers: { 'Idempotency-Key': payload.idempotencyKey },
      });
      return response.data.data as CreatePaymentOrderResponse;
    },
  });
};

export const useVerifyPaymentMutation = () => {
  return useMutation({
    mutationFn: async (payload: VerifyPaymentPayload) => {
      const response = await apiClient.post('/payments/verify', payload);
      return response.data.data;
    },
  });
};

export const usePaymentStatus = (paymentReference?: string | null) => {
  return useQuery({
    queryKey: ['payment_status', paymentReference],
    queryFn: async () => {
      if (!paymentReference) return null;
      const response = await apiClient.get(`/payments/${paymentReference}`);
      return response.data.data;
    },
    enabled: Boolean(paymentReference),
  });
};

export const useCancelPaymentMutation = () => {
  return useMutation({
    mutationFn: async (paymentReference: string) => {
      const response = await apiClient.post(`/payments/${paymentReference}/cancel`);
      return response.data.data;
    },
  });
};
