import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './apiClient';

export interface AdminDashboardMetrics {
  totalUsers: number;
  newUsersToday: number;
  activeRestaurants: number;
  pendingRestaurants: number;
  totalOrders: number;
  ordersToday: number;
  revenueToday: number;
  revenueThisMonth: number;
  grossOrderValue: number;
  platformFees: number;
  deliveryFees: number;
  taxesCollected: number;
  discountsGiven: number;
  averageOrderValue: number;
  cancellationRate: string;
}

export const useAdminDashboard = (from?: string, to?: string) => {
  return useQuery({
    queryKey: ['admin_dashboard', from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      const res = await apiClient.get(`/admin/dashboard?${params.toString()}`);
      return res.data.data as AdminDashboardMetrics;
    },
  });
};

export const useAdminAnalytics = (from?: string, to?: string) => {
  return useQuery({
    queryKey: ['admin_analytics', from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      const res = await apiClient.get(`/admin/analytics?${params.toString()}`);
      return res.data.data;
    },
  });
};

export const useAdminUsers = (options: { page?: number; limit?: number; search?: string; role?: string; status?: string } = {}) => {
  return useQuery({
    queryKey: ['admin_users', options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.search) params.append('search', options.search);
      if (options.role) params.append('role', options.role);
      if (options.status) params.append('status', options.status);
      const res = await apiClient.get(`/admin/users?${params.toString()}`);
      return res.data.data;
    },
  });
};

export const useAdminUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiClient.patch(`/admin/users/${id}/status`, { status });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
      queryClient.invalidateQueries({ queryKey: ['admin_dashboard'] });
    },
  });
};

export const useAdminUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const res = await apiClient.patch(`/admin/users/${id}/role`, { role });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
    },
  });
};

export const useAdminRestaurants = (options: { page?: number; limit?: number; search?: string; status?: string; city?: string } = {}) => {
  return useQuery({
    queryKey: ['admin_restaurants', options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.search) params.append('search', options.search);
      if (options.status) params.append('status', options.status);
      if (options.city) params.append('city', options.city);
      const res = await apiClient.get(`/admin/restaurants?${params.toString()}`);
      return res.data.data;
    },
  });
};

export const useAdminUpdateRestaurantStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      const res = await apiClient.patch(`/admin/restaurants/${id}/status`, { status, reason });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['admin_dashboard'] });
    },
  });
};

export const useAdminOrders = (options: { page?: number; limit?: number; orderNumber?: string; status?: string; restaurantId?: string; from?: string; to?: string } = {}) => {
  return useQuery({
    queryKey: ['admin_orders', options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.orderNumber) params.append('orderNumber', options.orderNumber);
      if (options.status) params.append('status', options.status);
      if (options.restaurantId) params.append('restaurantId', options.restaurantId);
      if (options.from) params.append('from', options.from);
      if (options.to) params.append('to', options.to);
      const res = await apiClient.get(`/admin/orders?${params.toString()}`);
      return res.data.data;
    },
  });
};

export const useAdminUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderNumber, status, note }: { orderNumber: string; status: string; note?: string }) => {
      const res = await apiClient.patch(`/admin/orders/${orderNumber}/status`, { status, note });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin_dashboard'] });
    },
  });
};

export const useAdminPayments = (page = 1, limit = 10, status?: string) => {
  return useQuery({
    queryKey: ['admin_payments', page, limit, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (status) params.append('status', status);
      const res = await apiClient.get(`/admin/payments?${params.toString()}`);
      return res.data.data;
    },
  });
};

export const useAdminAuditLogs = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['admin_audit_logs', page, limit],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/audit-logs?page=${page}&limit=${limit}`);
      return res.data.data;
    },
  });
};

export const useAdminCategories = () => {
  return useQuery({
    queryKey: ['admin_categories'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/categories');
      return res.data.data;
    },
  });
};

export const useAdminCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/admin/categories', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_categories'] });
    },
  });
};

export const useAdminCoupons = () => {
  return useQuery({
    queryKey: ['admin_coupons'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/coupons');
      return res.data.data;
    },
  });
};

export const useAdminCreateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/admin/coupons', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_coupons'] });
    },
  });
};

export const useAdminToggleCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await apiClient.patch(`/admin/coupons/${id}/toggle`, { isActive });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_coupons'] });
    },
  });
};
