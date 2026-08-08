import mongoose from 'mongoose';
import { Restaurant, IRestaurantDocument } from '../models/restaurant.model.js';
import { Food, IFoodDocument } from '../models/food.model.js';
import { Order, IOrderDocument, OrderStatus } from '../models/order.model.js';
import { Coupon } from '../models/coupon.model.js';
import { Review } from '../models/review.model.js';

export class RestaurantOwnerRepository {
  async findRestaurantByOwner(ownerId: string): Promise<IRestaurantDocument | null> {
    return Restaurant.findOne({ ownerId });
  }

  async getDashboardMetrics(restaurantId: string) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      restaurant,
      totalOrders,
      todayOrdersAgg,
      activeOrdersCount,
      completedOrdersCount,
      revenueTodayAgg,
      topFoodsAgg,
    ] = await Promise.all([
      Restaurant.findById(restaurantId),
      Order.countDocuments({ restaurantId }),
      Order.countDocuments({ restaurantId, createdAt: { $gte: startOfToday } }),
      Order.countDocuments({
        restaurantId,
        status: { $in: ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY'] },
      }),
      Order.countDocuments({ restaurantId, status: 'DELIVERED' }),
      Order.aggregate([
        {
          $match: {
            restaurantId: new mongoose.Types.ObjectId(restaurantId),
            createdAt: { $gte: startOfToday },
            status: { $ne: 'CANCELLED' },
          },
        },
        { $group: { _id: null, total: { $sum: '$pricing.subtotal' } } },
      ]),
      Order.aggregate([
        { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId), status: 'DELIVERED' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: '$items.itemTotal' },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 },
      ]),
    ]);

    return {
      restaurantName: restaurant?.name || 'My Kitchen',
      isOpen: restaurant?.isOpen || false,
      status: restaurant?.status || 'pending',
      avgRating: restaurant?.avgRating || 4.5,
      totalRatings: restaurant?.totalRatings || 0,
      todayOrders: todayOrdersAgg,
      activeOrders: activeOrdersCount,
      completedOrders: completedOrdersCount,
      todayRevenue: revenueTodayAgg[0]?.total || 0,
      totalOrders,
      topFoods: topFoodsAgg,
    };
  }

  async getAnalytics(restaurantId: string, from: Date, to: Date) {
    const [revenueByDay, ordersByStatus, topDishes] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            restaurantId: new mongoose.Types.ObjectId(restaurantId),
            createdAt: { $gte: from, $lte: to },
            status: { $ne: 'CANCELLED' },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$pricing.subtotal' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        {
          $match: {
            restaurantId: new mongoose.Types.ObjectId(restaurantId),
            createdAt: { $gte: from, $lte: to },
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            restaurantId: new mongoose.Types.ObjectId(restaurantId),
            createdAt: { $gte: from, $lte: to },
            status: 'DELIVERED',
          },
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            quantity: { $sum: '$items.quantity' },
            revenue: { $sum: '$items.itemTotal' },
          },
        },
        { $sort: { quantity: -1 } },
        { $limit: 8 },
      ]),
    ]);

    return {
      revenueByDay,
      ordersByStatus,
      topDishes,
    };
  }

  async findOrders(restaurantId: string, page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const query: any = { restaurantId };
    if (status && status !== 'ALL') {
      if (status === 'ACTIVE') {
        query.status = { $in: ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY'] };
      } else {
        query.status = status.toUpperCase();
      }
    }

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findMenu(restaurantId: string, page = 1, limit = 50, search?: string, categoryId?: string) {
    const skip = (page - 1) * limit;
    const query: any = { restaurantId, isDeleted: { $ne: true } };
    if (categoryId && categoryId !== 'ALL') query.categoryId = categoryId;
    if (search) query.name = { $regex: search, $options: 'i' };

    const [foods, total] = await Promise.all([
      Food.find(query).populate('categoryId', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Food.countDocuments(query),
    ]);

    return {
      foods,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createFood(restaurantId: string, data: any): Promise<IFoodDocument> {
    const food = new Food({ ...data, restaurantId });
    return food.save();
  }

  async updateFood(restaurantId: string, foodId: string, data: any): Promise<IFoodDocument | null> {
    return Food.findOneAndUpdate({ _id: foodId, restaurantId }, { $set: data }, { new: true });
  }

  async toggleFoodAvailability(restaurantId: string, foodId: string, isAvailable: boolean): Promise<IFoodDocument | null> {
    return Food.findOneAndUpdate({ _id: foodId, restaurantId }, { $set: { isAvailable } }, { new: true });
  }

  async softDeleteFood(restaurantId: string, foodId: string): Promise<boolean> {
    const res = await Food.findOneAndUpdate({ _id: foodId, restaurantId }, { $set: { isAvailable: false, isDeleted: true } });
    return Boolean(res);
  }

  async findCoupons(restaurantId: string) {
    return Coupon.find({ restaurantId }).sort({ createdAt: -1 });
  }

  async createCoupon(restaurantId: string, data: any) {
    const coupon = new Coupon({ ...data, restaurantId });
    return coupon.save();
  }

  async findReviews(restaurantId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      Review.find({ restaurantId }).populate('userId', 'firstName lastName avatarUrl').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Review.countDocuments({ restaurantId }),
    ]);

    return {
      reviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

export const restaurantOwnerRepository = new RestaurantOwnerRepository();
