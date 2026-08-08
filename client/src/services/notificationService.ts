import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './apiClient';

export interface NotificationItem {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: {
    orderNumber?: string;
    restaurantId?: string;
    foodId?: string;
    couponCode?: string;
  };
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export const useNotifications = (page = 1, limit = 20, isRead?: boolean, type?: string) => {
  return useQuery({
    queryKey: ['user_notifications', page, limit, isRead, type],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (typeof isRead === 'boolean') params.append('isRead', isRead.toString());
      if (type && type !== 'ALL') params.append('type', type);
      const res = await apiClient.get(`/notifications?${params.toString()}`);
      return res.data.data as {
        notifications: NotificationItem[];
        unreadCount: number;
        pagination: { page: number; limit: number; total: number; totalPages: number };
      };
    },
    refetchInterval: 30000,
  });
};

export const useUnreadNotificationCount = (enabled = true) => {
  return useQuery({
    queryKey: ['unread_notification_count'],
    queryFn: async () => {
      const res = await apiClient.get('/notifications/unread-count');
      return (res.data.data?.unreadCount || 0) as number;
    },
    enabled,
    refetchInterval: 25000,
  });
};

export const useMarkNotificationReadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.patch(`/notifications/${id}/read`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread_notification_count'] });
    },
  });
};

export const useMarkAllNotificationsReadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.patch('/notifications/read-all');
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread_notification_count'] });
    },
  });
};

export const useDeleteNotificationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/notifications/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread_notification_count'] });
    },
  });
};
