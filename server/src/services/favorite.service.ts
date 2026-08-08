import { favoriteRepository } from '../repositories/favorite.repository.js';
import { ApiError } from '../utils/apiError.js';

export class FavoriteService {
  async getFavorites(userId: string) {
    return favoriteRepository.findByUser(userId);
  }

  async checkFavorite(userId: string, restaurantId?: string, foodId?: string) {
    if (!restaurantId && !foodId) {
      throw new ApiError(400, 'Either restaurantId or foodId must be provided', 'TARGET_REQUIRED');
    }
    const isFavorited = await favoriteRepository.isFavorited(userId, restaurantId, foodId);
    return { isFavorited };
  }

  async addFavorite(userId: string, restaurantId?: string, foodId?: string) {
    if (!restaurantId && !foodId) {
      throw new ApiError(400, 'Either restaurantId or foodId must be provided', 'TARGET_REQUIRED');
    }
    return favoriteRepository.addFavorite(userId, restaurantId, foodId);
  }

  async removeFavorite(userId: string, targetId: string) {
    const deleted = await favoriteRepository.removeFavorite(userId, targetId);
    if (!deleted) {
      throw new ApiError(404, 'Favorite record not found', 'FAVORITE_NOT_FOUND');
    }
    return { message: 'Removed from favorites' };
  }

  async toggleFavorite(userId: string, restaurantId?: string, foodId?: string) {
    if (!restaurantId && !foodId) {
      throw new ApiError(400, 'Either restaurantId or foodId must be provided', 'TARGET_REQUIRED');
    }
    return favoriteRepository.toggleFavorite(userId, restaurantId, foodId);
  }
}

export const favoriteService = new FavoriteService();
