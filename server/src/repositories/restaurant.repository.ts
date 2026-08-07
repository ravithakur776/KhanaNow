import { Restaurant, IRestaurantDocument } from '../models/restaurant.model.js';
import { Food, IFoodDocument } from '../models/food.model.js';
import { Category, ICategoryDocument } from '../models/category.model.js';
import { Review, IReviewDocument } from '../models/review.model.js';
import { Favorite } from '../models/favorite.model.js';

export interface RestaurantQueryFilters {
  search?: string;
  cuisine?: string;
  isPureVeg?: boolean;
  minRating?: number;
  maxCostForTwo?: number;
  sortBy?: 'newest' | 'popularity' | 'rating' | 'price_low' | 'price_high';
  page?: number;
  limit?: number;
}

export class RestaurantRepository {
  async findRestaurants(filters: RestaurantQueryFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const skip = (page - 1) * limit;

    const query: any = { status: 'active' };

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { cuisines: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    if (filters.cuisine) {
      query.cuisines = { $regex: filters.cuisine, $options: 'i' };
    }

    if (filters.isPureVeg) {
      query.isPureVeg = true;
    }

    if (filters.minRating) {
      query.avgRating = { $gte: filters.minRating };
    }

    if (filters.maxCostForTwo) {
      query.costForTwo = { $lte: filters.maxCostForTwo };
    }

    const sortOptions: any = {};
    if (filters.sortBy === 'rating') sortOptions.avgRating = -1;
    else if (filters.sortBy === 'price_low') sortOptions.costForTwo = 1;
    else if (filters.sortBy === 'price_high') sortOptions.costForTwo = -1;
    else if (filters.sortBy === 'newest') sortOptions.createdAt = -1;
    else sortOptions.totalRatings = -1; // default popularity

    const [restaurants, totalDocs] = await Promise.all([
      Restaurant.find(query).sort(sortOptions).skip(skip).limit(limit),
      Restaurant.countDocuments(query),
    ]);

    return {
      restaurants,
      pagination: {
        page,
        limit,
        totalDocs,
        totalPages: Math.ceil(totalDocs / limit),
      },
    };
  }

  async findById(id: string): Promise<IRestaurantDocument | null> {
    return Restaurant.findById(id);
  }

  async findFoodsByRestaurant(restaurantId: string): Promise<IFoodDocument[]> {
    return Food.find({ restaurantId, isAvailable: true }).populate('categoryId');
  }

  async findCategories(): Promise<ICategoryDocument[]> {
    return Category.find().sort({ sortOrder: 1, name: 1 });
  }

  async findFoods(queryFilters: { search?: string; categoryId?: string; isVeg?: boolean }): Promise<IFoodDocument[]> {
    const query: any = { isAvailable: true };
    if (queryFilters.search) {
      query.$or = [
        { name: { $regex: queryFilters.search, $options: 'i' } },
        { description: { $regex: queryFilters.search, $options: 'i' } },
      ];
    }
    if (queryFilters.categoryId) {
      query.categoryId = queryFilters.categoryId;
    }
    if (queryFilters.isVeg) {
      query.dietaryType = 'veg';
    }
    return Food.find(query).populate('restaurantId categoryId').limit(20);
  }

  async findFoodById(id: string): Promise<IFoodDocument | null> {
    return Food.findById(id).populate('restaurantId categoryId');
  }

  async findReviewsByRestaurant(restaurantId: string): Promise<IReviewDocument[]> {
    return Review.find({ restaurantId }).sort({ createdAt: -1 }).limit(10);
  }

  async getUserFavorites(userId: string) {
    return Favorite.find({ userId }).populate('restaurantId foodId');
  }

  async toggleFavoriteRestaurant(userId: string, restaurantId: string): Promise<boolean> {
    const existing = await Favorite.findOne({ userId, restaurantId });
    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      return false; // un-favorited
    } else {
      await Favorite.create({ userId, restaurantId });
      return true; // favorited
    }
  }
}

export const restaurantRepository = new RestaurantRepository();
