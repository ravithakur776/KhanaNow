import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './apiClient';

export interface RestaurantFilters {
  search?: string;
  cuisine?: string;
  isPureVeg?: boolean;
  minRating?: number;
  maxCostForTwo?: number;
  sortBy?: string;
  page?: number;
}

export const useRestaurants = (filters: RestaurantFilters = {}) => {
  return useQuery({
    queryKey: ['restaurants', filters],
    queryFn: async () => {
      const response = await apiClient.get('/restaurants', { params: filters });
      return response.data;
    },
  });
};

export const useRestaurantDetail = (id: string) => {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: async () => {
      const response = await apiClient.get(`/restaurants/${id}`);
      return response.data.data;
    },
    enabled: Boolean(id),
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('/categories');
      return response.data.data;
    },
  });
};

export const useSearchRestaurants = (query: string) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const response = await apiClient.get('/restaurants/search', { params: { q: query } });
      return response.data.data;
    },
    enabled: Boolean(query && query.trim().length > 0),
  });
};

export const useFavorites = () => {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await apiClient.get('/favorites');
      return response.data.data;
    },
  });
};

export const useToggleFavoriteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (restaurantId: string) => {
      const response = await apiClient.post('/favorites/toggle', { restaurantId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
};
