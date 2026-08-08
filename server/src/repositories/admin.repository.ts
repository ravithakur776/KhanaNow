import { User, IUserDocument } from '../models/user.model.js';
import { Restaurant, IRestaurantDocument } from '../models/restaurant.model.js';
import { Order, IOrderDocument } from '../models/order.model.js';
import { Payment, IPaymentDocument } from '../models/payment.model.js';
import { Category } from '../models/category.model.js';
import { Coupon } from '../models/coupon.model.js';
import { AuditLog } from '../models/auditLog.model.js';

export interface AdminUserQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export interface AdminRestaurantQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  city?: string;
}

export interface AdminOrderQueryOptions {
  page?: number;
  limit?: number;
  orderNumber?: string;
  status?: string;
  restaurantId?: string;
  from?: Date;
  to?: Date;
}

export class AdminRepository {
  async getPlatformDashboardMetrics(from?: Date, to?: Date) {
    const dateFilter: any = {};
    if (from || to) {
      dateFilter.createdAt = {};
      if (from) dateFilter.createdAt.$gte = from;
      if (to) dateFilter.createdAt.$lte = to;
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      newUsersToday,
      activeRestaurants,
      pendingRestaurants,
      totalOrders,
      ordersToday,
      orderMetricsAgg,
      revenueTodayAgg,
      revenueMonthAgg,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfToday } }),
      Restaurant.countDocuments({ status: 'active' }),
      Restaurant.countDocuments({ status: 'pending' }),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalGrossValue: { $sum: '$pricing.grandTotal' },
            totalPlatformFees: { $sum: '$pricing.platformFee' },
            totalDeliveryFees: { $sum: '$pricing.deliveryFee' },
            totalTaxes: { $sum: '$pricing.taxAmount' },
            totalDiscounts: { $sum: '$pricing.discount' },
            avgOrderValue: { $avg: '$pricing.grandTotal' },
            cancelledCount: {
              $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] },
            },
            deliveredCount: {
              $sum: { $cond: [{ $eq: ['$status', 'DELIVERED'] }, 1, 0] },
            },
          },
        },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfToday }, status: { $ne: 'CANCELLED' } } },
        { $group: { _id: null, total: { $sum: '$pricing.grandTotal' } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, status: { $ne: 'CANCELLED' } } },
        { $group: { _id: null, total: { $sum: '$pricing.grandTotal' } } },
      ]),
    ]);

    const orderStats = orderMetricsAgg[0] || {
      totalGrossValue: 0,
      totalPlatformFees: 0,
      totalDeliveryFees: 0,
      totalTaxes: 0,
      totalDiscounts: 0,
      avgOrderValue: 0,
      cancelledCount: 0,
      deliveredCount: 0,
    };

    const cancellationRate =
      totalOrders > 0 ? ((orderStats.cancelledCount / totalOrders) * 100).toFixed(1) : '0.0';

    return {
      totalUsers,
      newUsersToday,
      activeRestaurants,
      pendingRestaurants,
      totalOrders,
      ordersToday,
      revenueToday: revenueTodayAgg[0]?.total || 0,
      revenueThisMonth: revenueMonthAgg[0]?.total || 0,
      grossOrderValue: orderStats.totalGrossValue,
      platformFees: orderStats.totalPlatformFees,
      deliveryFees: orderStats.totalDeliveryFees,
      taxesCollected: orderStats.totalTaxes,
      discountsGiven: orderStats.totalDiscounts,
      averageOrderValue: Math.round(orderStats.avgOrderValue || 0),
      cancellationRate: `${cancellationRate}%`,
    };
  }

  async getRevenueAnalytics(from: Date, to: Date) {
    return Order.aggregate([
      {
        $match: {
          createdAt: { $gte: from, $lte: to },
          status: { $ne: 'CANCELLED' },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          grossValue: { $sum: '$pricing.grandTotal' },
          platformRevenue: { $sum: '$pricing.platformFee' },
          deliveryFees: { $sum: '$pricing.deliveryFee' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async getOrderStatusDistribution() {
    return Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
  }

  async findUsers(options: AdminUserQueryOptions = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (options.role && options.role !== 'ALL') query.role = options.role;
    if (options.status && options.status !== 'ALL') query.status = options.status;
    if (options.search) {
      query.$or = [
        { firstName: { $regex: options.search, $options: 'i' } },
        { lastName: { $regex: options.search, $options: 'i' } },
        { email: { $regex: options.search, $options: 'i' } },
        { phone: { $regex: options.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).select('-passwordHash -verificationOTP -resetPasswordToken').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    return {
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findRestaurants(options: AdminRestaurantQueryOptions = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (options.status && options.status !== 'ALL') query.status = options.status;
    if (options.city) query['address.city'] = { $regex: options.city, $options: 'i' };
    if (options.search) {
      query.$or = [
        { name: { $regex: options.search, $options: 'i' } },
        { description: { $regex: options.search, $options: 'i' } },
        { cuisines: { $in: [new RegExp(options.search, 'i')] } },
      ];
    }

    const [restaurants, total] = await Promise.all([
      Restaurant.find(query).populate('ownerId', 'firstName lastName email phone').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Restaurant.countDocuments(query),
    ]);

    return {
      restaurants,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOrders(options: AdminOrderQueryOptions = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (options.status && options.status !== 'ALL') query.status = options.status;
    if (options.restaurantId) query.restaurantId = options.restaurantId;
    if (options.orderNumber) query.orderNumber = { $regex: options.orderNumber, $options: 'i' };
    if (options.from || options.to) {
      query.createdAt = {};
      if (options.from) query.createdAt.$gte = options.from;
      if (options.to) query.createdAt.$lte = options.to;
    }

    const [orders, total] = await Promise.all([
      Order.find(query).populate('restaurantId', 'name address phone').populate('userId', 'firstName lastName email phone').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findPayments(page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    const query: any = {};
    if (status && status !== 'ALL') query.status = status;

    const [payments, total] = await Promise.all([
      Payment.find(query).populate('userId', 'firstName lastName email phone').populate('restaurantId', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Payment.countDocuments(query),
    ]);

    return {
      payments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createAuditLog(
    actorId: string,
    actorRole: string,
    action: string,
    entityType: 'User' | 'Restaurant' | 'Order' | 'Food' | 'Category' | 'Coupon' | 'Platform',
    entityId: string,
    metadata?: Record<string, any>
  ) {
    return AuditLog.create({
      actorId,
      actorRole,
      action,
      entityType,
      entityId,
      metadata,
    });
  }

  async getAuditLogs(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find().populate('actorId', 'firstName lastName email role').sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(),
    ]);

    return {
      logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

export const adminRepository = new AdminRepository();
