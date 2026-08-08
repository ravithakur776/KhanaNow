import mongoose from 'mongoose';
import { Food, IFoodDocument } from '../models/food.model.js';
import { Restaurant, IRestaurantDocument } from '../models/restaurant.model.js';
import { Order } from '../models/order.model.js';
import { Favorite } from '../models/favorite.model.js';

export interface RecommendationProvider {
  getHomeRecommendations(userId?: string): Promise<any>;
  getFrequentlyOrdered(userId: string): Promise<any[]>;
  getSimilarFoods(foodId: string): Promise<any[]>;
  getTrendingFoods(): Promise<any[]>;
}

export class RuleBasedRecommendationProvider implements RecommendationProvider {
  /**
   * Cold Start: Popular & Trending for Guests or New Customers
   */
  async getColdStartHome() {
    const [popularFoods, topRestaurants, trendingFoods] = await Promise.all([
      Food.find({ isAvailable: true, isDeleted: { $ne: true } })
        .populate('restaurantId', 'name avgRating deliveryTimeMinutes')
        .sort({ isBestseller: -1, isRecommended: -1, rating: -1 })
        .limit(8)
        .lean(),
      Restaurant.find({ status: 'active', isOpen: true })
        .sort({ avgRating: -1, totalRatings: -1 })
        .limit(6)
        .lean(),
      Food.find({ isAvailable: true, isDeleted: { $ne: true } })
        .populate('restaurantId', 'name avgRating deliveryTimeMinutes')
        .sort({ createdAt: -1, isBestseller: -1 })
        .limit(8)
        .lean(),
    ]);

    return {
      isPersonalized: false,
      sections: [
        {
          id: 'popular_near_you',
          title: 'Popular Near You 🔥',
          subtitle: 'Most ordered and loved dishes across your city',
          type: 'foods',
          items: popularFoods,
        },
        {
          id: 'top_rated_restaurants',
          title: 'Top Rated Kitchens ⭐',
          subtitle: 'Certified kitchens with 4.5+ customer ratings',
          type: 'restaurants',
          items: topRestaurants,
        },
        {
          id: 'trending_now',
          title: 'Trending Now ⚡',
          subtitle: 'Dishes experiencing high demand right now',
          type: 'foods',
          items: trendingFoods,
        },
      ],
    };
  }

  /**
   * Personalized Home for Logged-In Users with Order History & Favorites
   */
  async getPersonalizedHome(userId: string) {
    const startObjId = new mongoose.Types.ObjectId(userId);

    // 1. Fetch user's delivered orders and favorite restaurants
    const [pastOrders, userFavorites] = await Promise.all([
      Order.find({ userId: startObjId, status: 'DELIVERED' })
        .sort({ createdAt: -1 })
        .limit(15)
        .lean(),
      Favorite.find({ userId: startObjId }).select('restaurantId').lean(),
    ]);

    // If user has zero past orders, return Cold Start
    if (pastOrders.length === 0 && userFavorites.length === 0) {
      return this.getColdStartHome();
    }

    // 2. Extract frequently ordered food IDs, category preferences, and restaurant IDs
    const orderedFoodMap = new Map<string, number>();
    const pastRestaurantIds = new Set<string>();

    pastOrders.forEach((order) => {
      pastRestaurantIds.add(order.restaurantId.toString());
      order.items?.forEach((item) => {
        const fId = item.foodId?.toString();
        if (fId) {
          orderedFoodMap.set(fId, (orderedFoodMap.get(fId) || 0) + item.quantity);
        }
      });
    });

    const topFoodIds = Array.from(orderedFoodMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id]) => new mongoose.Types.ObjectId(id));

    // 3. Query "Order Again" foods (only currently available items)
    const orderAgainFoods = await Food.find({
      _id: { $in: topFoodIds },
      isAvailable: true,
      isDeleted: { $ne: true },
    })
      .populate('restaurantId', 'name avgRating isOpen')
      .lean();

    // 4. Query Favorite & Preferred Restaurants
    const favoriteRestIds = userFavorites.map((f) => f.restaurantId);
    const preferredRestIds = Array.from(new Set([...favoriteRestIds, ...Array.from(pastRestaurantIds).map((id) => new mongoose.Types.ObjectId(id))]));

    const [favoriteRestaurants, recommendedFoods] = await Promise.all([
      Restaurant.find({
        _id: { $in: preferredRestIds },
        status: 'active',
      })
        .sort({ avgRating: -1 })
        .limit(6)
        .lean(),
      Food.find({
        restaurantId: { $in: preferredRestIds },
        _id: { $nin: topFoodIds },
        isAvailable: true,
        isDeleted: { $ne: true },
      })
        .populate('restaurantId', 'name avgRating deliveryTimeMinutes')
        .sort({ isBestseller: -1, rating: -1 })
        .limit(8)
        .lean(),
    ]);

    const sections: any[] = [];

    if (orderAgainFoods.length > 0) {
      sections.push({
        id: 'order_again',
        title: 'Order Again 🔄',
        subtitle: 'Reorder your previous favorites in 1-click',
        type: 'foods',
        items: orderAgainFoods,
      });
    }

    if (recommendedFoods.length > 0) {
      sections.push({
        id: 'for_you',
        title: 'Curated For You 🎯',
        subtitle: 'Dishes from kitchens you enjoy and top rated specialties',
        type: 'foods',
        items: recommendedFoods,
      });
    }

    if (favoriteRestaurants.length > 0) {
      sections.push({
        id: 'favorite_kitchens',
        title: 'From Your Favorite Kitchens ❤️',
        subtitle: 'Explore the full menus of places you love',
        type: 'restaurants',
        items: favoriteRestaurants,
      });
    }

    // Fallback: Add Popular Near You if fewer than 2 sections
    if (sections.length < 2) {
      const popular = await Food.find({ isAvailable: true, isDeleted: { $ne: true } })
        .populate('restaurantId', 'name avgRating deliveryTimeMinutes')
        .sort({ isBestseller: -1, rating: -1 })
        .limit(6)
        .lean();

      sections.push({
        id: 'popular_near_you',
        title: 'Popular Near You 🔥',
        subtitle: 'Most ordered across KhanaNow',
        type: 'foods',
        items: popular,
      });
    }

    return {
      isPersonalized: true,
      sections,
    };
  }

  async getHomeRecommendations(userId?: string) {
    if (userId) {
      return this.getPersonalizedHome(userId);
    }
    return this.getColdStartHome();
  }

  async getFrequentlyOrdered(userId: string) {
    const orders = await Order.find({
      userId: new mongoose.Types.ObjectId(userId),
      status: 'DELIVERED',
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const frequencyMap = new Map<string, { count: number; name: string }>();
    orders.forEach((o) => {
      o.items?.forEach((i) => {
        const id = i.foodId?.toString();
        if (id) {
          const current = frequencyMap.get(id) || { count: 0, name: i.name };
          frequencyMap.set(id, { count: current.count + i.quantity, name: i.name });
        }
      });
    });

    const topIds = Array.from(frequencyMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([id]) => new mongoose.Types.ObjectId(id));

    return Food.find({
      _id: { $in: topIds },
      isAvailable: true,
      isDeleted: { $ne: true },
    })
      .populate('restaurantId', 'name avgRating isOpen')
      .lean();
  }

  async getSimilarFoods(foodId: string) {
    const targetFood = await Food.findById(foodId);
    if (!targetFood) return [];

    const minPrice = Math.max(0, targetFood.price - 150);
    const maxPrice = targetFood.price + 200;

    return Food.find({
      _id: { $ne: targetFood._id },
      $or: [
        { categoryId: targetFood.categoryId },
        { dietaryType: targetFood.dietaryType },
        { price: { $gte: minPrice, $lte: maxPrice } },
      ],
      isAvailable: true,
      isDeleted: { $ne: true },
    })
      .populate('restaurantId', 'name avgRating deliveryTimeMinutes')
      .sort({ isBestseller: -1, rating: -1 })
      .limit(6)
      .lean();
  }

  async getTrendingFoods() {
    // Aggregate top ordered food items in the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $ne: 'CANCELLED' } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.foodId', orderCount: { $sum: '$items.quantity' } } },
      { $sort: { orderCount: -1 } },
      { $limit: 8 },
    ]);

    const topFoodIds = recentAgg
      .map((r) => {
        try {
          return new mongoose.Types.ObjectId(r._id);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    if (topFoodIds.length > 0) {
      const trendingFromOrders = await Food.find({
        _id: { $in: topFoodIds },
        isAvailable: true,
        isDeleted: { $ne: true },
      })
        .populate('restaurantId', 'name avgRating deliveryTimeMinutes')
        .lean();

      if (trendingFromOrders.length > 0) {
        return trendingFromOrders;
      }
    }

    return Food.find({ isAvailable: true, isDeleted: { $ne: true } })
      .populate('restaurantId', 'name avgRating deliveryTimeMinutes')
      .sort({ isBestseller: -1, isRecommended: -1, createdAt: -1 })
      .limit(8)
      .lean();
  }
}

export class RecommendationService {
  private provider: RecommendationProvider;

  constructor(provider: RecommendationProvider = new RuleBasedRecommendationProvider()) {
    this.provider = provider;
  }

  setProvider(provider: RecommendationProvider) {
    this.provider = provider;
  }

  async getHome(userId?: string) {
    return this.provider.getHomeRecommendations(userId);
  }

  async getFrequentlyOrdered(userId: string) {
    return this.provider.getFrequentlyOrdered(userId);
  }

  async getSimilarFoods(foodId: string) {
    return this.provider.getSimilarFoods(foodId);
  }

  async getTrendingFoods() {
    return this.provider.getTrendingFoods();
  }
}

export const recommendationService = new RecommendationService();
