import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './apiClient';

export interface KitchenDashboardMetrics {
  restaurantId: string;
  restaurantName: string;
  isOpen: boolean;
  status: string;
  avgRating: number;
  totalRatings: number;
  todayOrders: number;
  activeOrders: number;
  completedOrders: number;
  todayRevenue: number;
  totalOrders: number;
  topFoods: Array<{ _id: string; totalQuantity: number; totalRevenue: number }>;
}

export const useRestaurantDashboard = () => {
  return useQuery({
    queryKey: ['restaurant_dashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/restaurant/dashboard');
      return res.data.data as KitchenDashboardMetrics;
    },
  });
};

export const useRestaurantAnalytics = (from?: string, to?: string) => {
  return useQuery({
    queryKey: ['restaurant_analytics', from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      const res = await apiClient.get(`/restaurant/analytics?${params.toString()}`);
      return res.data.data;
    },
  });
};

export const useRestaurantOrders = (page = 1, limit = 20, status?: string) => {
  return useQuery({
    queryKey: ['restaurant_orders', page, limit, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (status) params.append('status', status);
      const res = await apiClient.get(`/restaurant/orders?${params.toString()}`);
      return res.data.data;
    },
    refetchInterval: 12000, // Live poll kitchen queue every 12 seconds
  });
};

export const useRestaurantUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderNumber, status, note }: { orderNumber: string; status: string; note?: string }) => {
      const res = await apiClient.patch(`/restaurant/orders/${orderNumber}/status`, { status, note });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant_orders'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant_dashboard'] });
    },
  });
};

export const useRestaurantMenu = (page = 1, limit = 50, search?: string, categoryId?: string) => {
  return useQuery({
    queryKey: ['restaurant_menu', page, limit, search, categoryId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (categoryId) params.append('categoryId', categoryId);
      const res = await apiClient.get(`/restaurant/menu?${params.toString()}`);
      return res.data.data;
    },
  });
};

export const useRestaurantCreateFood = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/restaurant/menu', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant_menu'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant_dashboard'] });
    },
  });
};

export const useRestaurantUpdateFood = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiClient.patch(`/restaurant/menu/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant_menu'] });
    },
  });
};

export const useRestaurantToggleFoodAvailability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isAvailable }: { id: string; isAvailable: boolean }) => {
      const res = await apiClient.patch(`/restaurant/menu/${id}/availability`, { isAvailable });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant_menu'] });
    },
  });
};

export const useRestaurantDeleteFood = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/restaurant/menu/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant_menu'] });
    },
  });
};

export const useRestaurantUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.patch('/restaurant/profile', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant_dashboard'] });
    },
  });
};

export const useRestaurantToggleOpenStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (isOpen: boolean) => {
      const res = await apiClient.patch('/restaurant/status', { isOpen });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant_dashboard'] });
    },
  });
};

export const useRestaurantCoupons = () => {
  return useQuery({
    queryKey: ['restaurant_coupons'],
    queryFn: async () => {
      const res = await apiClient.get('/restaurant/coupons');
      return res.data.data;
    },
  });
};

export const useRestaurantCreateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/restaurant/coupons', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant_coupons'] });
    },
  });
};

export const useRestaurantReviews = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['restaurant_reviews', page, limit],
    queryFn: async () => {
      const res = await apiClient.get(`/restaurant/reviews?page=${page}&limit=${limit}`);
      return res.data.data;
    },
  });
};
