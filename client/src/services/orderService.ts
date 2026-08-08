import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './apiClient';

export interface CreateOrderPayload {
  paymentReference: string;
  deliveryInstructions?: string;
  deliveryOption?: 'standard' | 'scheduled';
  idempotencyKey?: string;
}

export interface OrderItemSnapshot {
  foodId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  dietaryType: 'veg' | 'non_veg' | 'vegan' | 'egg';
  quantity: number;
  unitPrice: number;
  unitPricePaise: number;
  selectedOptions?: Array<{
    groupName: string;
    optionName: string;
    price: number;
  }>;
  optionsTotal: number;
  itemTotal: number;
}

export interface OrderDocument {
  _id: string;
  orderNumber: string;
  userId: string;
  restaurantId: {
    _id: string;
    name: string;
    address?: { street: string; city: string };
    phone?: string;
    logoUrl?: string;
  };
  paymentId: string;
  paymentReference: string;
  addressSnapshot: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    postalCode: string;
    formattedAddress: string;
  };
  contactSnapshot: {
    name: string;
    phone: string;
    email: string;
  };
  items: OrderItemSnapshot[];
  pricing: {
    subtotal: number;
    discount: number;
    deliveryFee: number;
    platformFee: number;
    taxAmount: number;
    tipAmount: number;
    grandTotal: number;
    savingsTotal: number;
    currency: string;
  };
  coupon?: {
    code: string;
    description?: string;
    discountAmount: number;
  } | null;
  tip: number;
  deliveryInstructions?: string;
  deliveryOption: 'standard' | 'scheduled';
  status:
    | 'PLACED'
    | 'CONFIRMED'
    | 'PREPARING'
    | 'READY_FOR_PICKUP'
    | 'PICKED_UP'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'FAILED';
  statusHistory: Array<{
    status: string;
    changedAt: string;
    actorType: string;
    note?: string;
  }>;
  estimatedDeliveryTime: string;
  placedAt: string;
  acceptedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  deliveryPartner?: {
    name: string;
    phone: string;
    avatar?: string;
    vehicleType: string;
    vehicleNumber: string;
    rating: number;
    assignedAt: string;
  } | null;
  createdAt: string;
}

export interface UserOrdersResponse {
  orders: OrderDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      const response = await apiClient.post('/orders', payload, {
        headers: payload.idempotencyKey ? { 'Idempotency-Key': payload.idempotencyKey } : {},
      });
      return response.data.data as OrderDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_orders'] });
    },
  });
};

export const useUserOrders = (options: { page?: number; limit?: number; status?: string } = {}) => {
  return useQuery({
    queryKey: ['user_orders', options.page, options.limit, options.status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.status) params.append('status', options.status);

      const response = await apiClient.get(`/orders?${params.toString()}`);
      return response.data.data as UserOrdersResponse;
    },
  });
};

export const useOrderDetails = (orderNumber?: string) => {
  return useQuery({
    queryKey: ['order_details', orderNumber],
    queryFn: async () => {
      if (!orderNumber) return null;
      const response = await apiClient.get(`/orders/${orderNumber}`);
      return response.data.data as OrderDocument;
    },
    enabled: Boolean(orderNumber),
  });
};

export const useOrderTracking = (orderNumber?: string, enabled = true) => {
  return useQuery({
    queryKey: ['order_tracking', orderNumber],
    queryFn: async () => {
      if (!orderNumber) return null;
      const response = await apiClient.get(`/orders/${orderNumber}/tracking`);
      return response.data.data;
    },
    enabled: Boolean(orderNumber) && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'DELIVERED' || status === 'CANCELLED' || status === 'FAILED') {
        return false; // Stop polling when terminal state reached
      }
      return 15000; // Poll every 15 seconds for active delivery updates
    },
  });
};

export const useCancelOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderNumber, cancelReason }: { orderNumber: string; cancelReason: string }) => {
      const response = await apiClient.post(`/orders/${orderNumber}/cancel`, { cancelReason });
      return response.data.data as OrderDocument;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user_orders'] });
      queryClient.invalidateQueries({ queryKey: ['order_details', variables.orderNumber] });
      queryClient.invalidateQueries({ queryKey: ['order_tracking', variables.orderNumber] });
    },
  });
};

export const useReorderMutation = () => {
  return useMutation({
    mutationFn: async (orderNumber: string) => {
      const response = await apiClient.post(`/orders/${orderNumber}/reorder`);
      return response.data.data;
    },
  });
};
