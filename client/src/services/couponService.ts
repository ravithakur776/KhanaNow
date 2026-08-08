import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from './apiClient';

export interface CouponItem {
  _id?: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minimumOrderValue: number;
  maximumDiscount?: number;
  startDate?: string;
  endDate?: string;
}

export const useAvailableCoupons = (restaurantId?: string) => {
  return useQuery({
    queryKey: ['coupons', restaurantId],
    queryFn: async () => {
      const response = await apiClient.get('/coupons', {
        params: restaurantId ? { restaurantId } : undefined,
      });
      return response.data.data as CouponItem[];
    },
  });
};

export const useValidateCouponMutation = () => {
  return useMutation({
    mutationFn: async (payload: { code: string; itemTotal: number; restaurantId?: string }) => {
      const response = await apiClient.post('/coupons/validate', payload);
      return response.data.data;
    },
  });
};
