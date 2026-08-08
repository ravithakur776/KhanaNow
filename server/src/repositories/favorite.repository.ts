import { Favorite, IFavoriteDocument } from '../models/favorite.model.js';

export class FavoriteRepository {
  async findByUser(userId: string): Promise<IFavoriteDocument[]> {
    return Favorite.find({ userId }).populate('restaurantId foodId').sort({ createdAt: -1 });
  }

  async isFavorited(userId: string, restaurantId?: string, foodId?: string): Promise<boolean> {
    const query: any = { userId };
    if (restaurantId) query.restaurantId = restaurantId;
    if (foodId) query.foodId = foodId;

    const count = await Favorite.countDocuments(query);
    return count > 0;
  }

  async addFavorite(userId: string, restaurantId?: string, foodId?: string): Promise<IFavoriteDocument> {
    const existing = await Favorite.findOne({
      userId,
      ...(restaurantId ? { restaurantId } : { foodId }),
    });

    if (existing) return existing;

    const fav = new Favorite({ userId, restaurantId, foodId });
    return fav.save();
  }

  async removeFavorite(userId: string, targetId: string): Promise<boolean> {
    const result = await Favorite.deleteOne({
      userId,
      $or: [{ _id: targetId }, { restaurantId: targetId }, { foodId: targetId }],
    });
    return result.deletedCount > 0;
  }

  async toggleFavorite(userId: string, restaurantId?: string, foodId?: string): Promise<{ isFavorited: boolean }> {
    const query: any = { userId };
    if (restaurantId) query.restaurantId = restaurantId;
    if (foodId) query.foodId = foodId;

    const existing = await Favorite.findOne(query);
    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      return { isFavorited: false };
    } else {
      await Favorite.create(query);
      return { isFavorited: true };
    }
  }
}

export const favoriteRepository = new FavoriteRepository();
