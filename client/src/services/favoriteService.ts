import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './apiClient';

export interface FavoriteItem {
  _id: string;
  userId: string;
  restaurantId?: {
    _id: string;
    name: string;
    bannerImageUrl: string;
    avgRating: number;
    cuisines: string[];
    costForTwo: number;
  };
  foodId?: {
    _id: string;
    name: string;
    imageUrl: string;
    price: number;
    dietaryType: string;
  };
}

export const useUserFavorites = (isEnabled: boolean = true) => {
  return useQuery({
    queryKey: ['user_favorites'],
    queryFn: async () => {
      const response = await apiClient.get('/favorites');
      return response.data.data as FavoriteItem[];
    },
    enabled: isEnabled,
  });
};

export const useCheckFavorite = (
  target: { restaurantId?: string; foodId?: string },
  isEnabled: boolean = true
) => {
  return useQuery({
    queryKey: ['favorite_check', target.restaurantId, target.foodId],
    queryFn: async () => {
      const response = await apiClient.get('/favorites/check', { params: target });
      return response.data.data?.isFavorited as boolean;
    },
    enabled: isEnabled && Boolean(target.restaurantId || target.foodId),
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { restaurantId?: string; foodId?: string }) => {
      const response = await apiClient.post('/favorites/toggle', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorite_check'] });
    },
  });
};
