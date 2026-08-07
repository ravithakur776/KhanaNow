import { restaurantRepository, RestaurantQueryFilters } from '../repositories/restaurant.repository.js';
import { ApiError } from '../utils/apiError.js';

export class RestaurantService {
  async getRestaurants(filters: RestaurantQueryFilters) {
    return restaurantRepository.findRestaurants(filters);
  }

  async getRestaurantById(id: string) {
    const restaurant = await restaurantRepository.findById(id);
    if (!restaurant) {
      throw new ApiError(404, 'Restaurant not found', 'RESTAURANT_NOT_FOUND');
    }

    const [foods, reviews] = await Promise.all([
      restaurantRepository.findFoodsByRestaurant(id),
      restaurantRepository.findReviewsByRestaurant(id),
    ]);

    return {
      restaurant,
      foods,
      reviews,
    };
  }

  async search(query: string) {
    if (!query || query.trim().length === 0) {
      return { restaurants: [], foods: [] };
    }

    const [restaurantsResult, foods] = await Promise.all([
      restaurantRepository.findRestaurants({ search: query, limit: 6 }),
      restaurantRepository.findFoods({ search: query }),
    ]);

    return {
      restaurants: restaurantsResult.restaurants,
      foods,
    };
  }

  async getCategories() {
    return restaurantRepository.findCategories();
  }

  async getFoods(queryFilters: { search?: string; categoryId?: string; isVeg?: boolean }) {
    return restaurantRepository.findFoods(queryFilters);
  }

  async getFoodById(id: string) {
    const food = await restaurantRepository.findFoodById(id);
    if (!food) {
      throw new ApiError(404, 'Food item not found', 'FOOD_NOT_FOUND');
    }
    return food;
  }

  async getReviews(restaurantId: string) {
    return restaurantRepository.findReviewsByRestaurant(restaurantId);
  }

  async getUserFavorites(userId: string) {
    return restaurantRepository.getUserFavorites(userId);
  }

  async toggleFavorite(userId: string, restaurantId: string) {
    return restaurantRepository.toggleFavoriteRestaurant(userId, restaurantId);
  }
}

export const restaurantService = new RestaurantService();
