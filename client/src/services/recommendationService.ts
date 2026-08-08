import { useQuery } from '@tanstack/react-query';
import { apiClient } from './apiClient';

export interface RecommendationSection {
  id: string;
  title: string;
  subtitle: string;
  type: 'foods' | 'restaurants';
  items: any[];
}

export interface HomeRecommendationsResponse {
  isPersonalized: boolean;
  sections: RecommendationSection[];
}

export const useHomeRecommendations = () => {
  return useQuery({
    queryKey: ['home_recommendations'],
    queryFn: async () => {
      const res = await apiClient.get('/recommendations/home');
      return res.data.data as HomeRecommendationsResponse;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

export const useFrequentlyOrderedFoods = (enabled = true) => {
  return useQuery({
    queryKey: ['frequently_ordered_foods'],
    queryFn: async () => {
      const res = await apiClient.get('/recommendations/frequently-ordered');
      return res.data.data as any[];
    },
    enabled,
    staleTime: 1000 * 60 * 10,
  });
};

export const useSimilarFoods = (foodId?: string) => {
  return useQuery({
    queryKey: ['similar_foods', foodId],
    queryFn: async () => {
      if (!foodId) return [];
      const res = await apiClient.get(`/recommendations/similar/${foodId}`);
      return res.data.data as any[];
    },
    enabled: Boolean(foodId),
  });
};

export const useTrendingFoods = () => {
  return useQuery({
    queryKey: ['trending_foods'],
    queryFn: async () => {
      const res = await apiClient.get('/recommendations/foods');
      return res.data.data as any[];
    },
    staleTime: 1000 * 60 * 15,
  });
};
