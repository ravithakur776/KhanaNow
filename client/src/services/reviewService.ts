import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './apiClient';

export interface RatingSummary {
  avgRating: number;
  totalRatings: number;
  distribution?: Record<number, number>;
}

export interface ReviewItem {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  orderId: string;
  restaurantId: string;
  foodId?: {
    _id: string;
    name: string;
    imageUrl?: string;
  };
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  status: string;
  createdAt: string;
}

export const useRestaurantReviews = (restaurantId?: string, page = 1, limit = 10, rating?: number) => {
  return useQuery({
    queryKey: ['restaurant_reviews', restaurantId, page, limit, rating],
    queryFn: async () => {
      if (!restaurantId) return null;
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (rating) params.append('rating', rating.toString());
      const res = await apiClient.get(`/reviews/restaurants/${restaurantId}/reviews?${params.toString()}`);
      return res.data.data as {
        summary: RatingSummary;
        reviews: ReviewItem[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      };
    },
    enabled: Boolean(restaurantId),
  });
};

export const useFoodReviews = (foodId?: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['food_reviews', foodId, page, limit],
    queryFn: async () => {
      if (!foodId) return null;
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      const res = await apiClient.get(`/reviews/foods/${foodId}/reviews?${params.toString()}`);
      return res.data.data as {
        summary: RatingSummary;
        reviews: ReviewItem[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      };
    },
    enabled: Boolean(foodId),
  });
};

export const useCreateReviewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      orderId: string;
      restaurantId: string;
      foodId?: string;
      rating: number;
      title?: string;
      comment: string;
      images?: string[];
    }) => {
      const res = await apiClient.post('/reviews/reviews', data);
      return res.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['restaurant_reviews', variables.restaurantId] });
      if (variables.foodId) {
        queryClient.invalidateQueries({ queryKey: ['food_reviews', variables.foodId] });
      }
      queryClient.invalidateQueries({ queryKey: ['customer_order'] });
      queryClient.invalidateQueries({ queryKey: ['user_orders'] });
    },
  });
};

export const useUpdateReviewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiClient.patch(`/reviews/reviews/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant_reviews'] });
    },
  });
};

export const useDeleteReviewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/reviews/reviews/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant_reviews'] });
    },
  });
};

export const useAdminReviews = (page = 1, limit = 20, status?: string) => {
  return useQuery({
    queryKey: ['admin_reviews', page, limit, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (status) params.append('status', status);
      const res = await apiClient.get(`/reviews/admin/reviews-list?${params.toString()}`);
      return res.data.data;
    },
  });
};

export const useAdminModerateReviewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      const res = await apiClient.patch(`/reviews/admin/reviews/${id}/moderate`, { status, reason });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_reviews'] });
    },
  });
};
