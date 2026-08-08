import { adminRepository, AdminUserQueryOptions, AdminRestaurantQueryOptions, AdminOrderQueryOptions } from '../repositories/admin.repository.js';
import { User } from '../models/user.model.js';
import { Restaurant } from '../models/restaurant.model.js';
import { Order, OrderStatus } from '../models/order.model.js';
import { Category } from '../models/category.model.js';
import { Coupon } from '../models/coupon.model.js';
import { orderService } from './order.service.js';
import { ApiError } from '../utils/apiError.js';

export class AdminService {
  async getDashboardMetrics(fromStr?: string, toStr?: string) {
    const from = fromStr ? new Date(fromStr) : undefined;
    const to = toStr ? new Date(toStr) : undefined;
    return adminRepository.getPlatformDashboardMetrics(from, to);
  }

  async getAnalytics(fromStr?: string, toStr?: string) {
    const to = toStr ? new Date(toStr) : new Date();
    const from = fromStr
      ? new Date(fromStr)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days default

    const [dailyRevenue, statusDistribution] = await Promise.all([
      adminRepository.getRevenueAnalytics(from, to),
      adminRepository.getOrderStatusDistribution(),
    ]);

    return {
      dateRange: { from, to },
      dailyRevenue,
      statusDistribution,
    };
  }

  async getUsers(options: AdminUserQueryOptions) {
    return adminRepository.findUsers(options);
  }

  async updateUserStatus(targetUserId: string, status: 'active' | 'suspended' | 'blocked', adminUserId: string) {
    if (targetUserId === adminUserId) {
      throw new ApiError(400, 'Administrators cannot modify their own account status', 'ADMIN_SELF_ACTION_DENIED');
    }

    const updatedUser = await User.findByIdAndUpdate(targetUserId, { $set: { status } }, { new: true });
    if (!updatedUser) {
      throw new ApiError(404, 'User account not found', 'USER_NOT_FOUND');
    }

    await adminRepository.createAuditLog(adminUserId, 'admin', `UPDATED_USER_STATUS_TO_${status.toUpperCase()}`, 'User', targetUserId, {
      status,
      userEmail: updatedUser.email,
    });

    return updatedUser;
  }

  async updateUserRole(targetUserId: string, role: 'customer' | 'restaurant_owner' | 'admin' | 'delivery_partner', adminUserId: string) {
    if (targetUserId === adminUserId) {
      throw new ApiError(400, 'Administrators cannot modify their own role', 'ADMIN_SELF_ACTION_DENIED');
    }

    const updatedUser = await User.findByIdAndUpdate(targetUserId, { $set: { role } }, { new: true });
    if (!updatedUser) {
      throw new ApiError(404, 'User account not found', 'USER_NOT_FOUND');
    }

    await adminRepository.createAuditLog(adminUserId, 'admin', `UPDATED_USER_ROLE_TO_${role.toUpperCase()}`, 'User', targetUserId, {
      role,
      userEmail: updatedUser.email,
    });

    return updatedUser;
  }

  async getRestaurants(options: AdminRestaurantQueryOptions) {
    return adminRepository.findRestaurants(options);
  }

  async updateRestaurantStatus(
    restaurantId: string,
    status: 'pending' | 'active' | 'suspended' | 'rejected',
    adminUserId: string,
    reason?: string
  ) {
    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { $set: { status, ...(status === 'suspended' || status === 'rejected' ? { isOpen: false } : {}) } },
      { new: true }
    );

    if (!restaurant) {
      throw new ApiError(404, 'Restaurant not found', 'RESTAURANT_NOT_FOUND');
    }

    await adminRepository.createAuditLog(adminUserId, 'admin', `UPDATED_RESTAURANT_STATUS_TO_${status.toUpperCase()}`, 'Restaurant', restaurantId, {
      status,
      restaurantName: restaurant.name,
      reason,
    });

    return restaurant;
  }

  async getOrders(options: AdminOrderQueryOptions) {
    return adminRepository.findOrders(options);
  }

  async updateOrderStatus(orderNumber: string, status: OrderStatus, adminUserId: string, note?: string) {
    const updatedOrder = await orderService.restaurantUpdateOrderStatus(orderNumber, status, note, 'admin');

    await adminRepository.createAuditLog(adminUserId, 'admin', `OVERRIDE_ORDER_STATUS_TO_${status}`, 'Order', orderNumber, {
      orderNumber,
      status,
      note,
    });

    return updatedOrder;
  }

  async getPayments(page = 1, limit = 10, status?: string) {
    return adminRepository.findPayments(page, limit, status);
  }

  async getAuditLogs(page = 1, limit = 20) {
    return adminRepository.getAuditLogs(page, limit);
  }

  // Categories
  async getCategories() {
    return Category.find().sort({ sortOrder: 1, name: 1 });
  }

  async createCategory(data: any, adminUserId: string) {
    const category = await Category.create(data);
    await adminRepository.createAuditLog(adminUserId, 'admin', 'CREATED_CATEGORY', 'Category', category._id.toString(), { name: category.name });
    return category;
  }

  async updateCategory(id: string, data: any, adminUserId: string) {
    const category = await Category.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!category) throw new ApiError(404, 'Category not found', 'CATEGORY_NOT_FOUND');
    await adminRepository.createAuditLog(adminUserId, 'admin', 'UPDATED_CATEGORY', 'Category', id, { name: category.name });
    return category;
  }

  async deleteCategory(id: string, adminUserId: string) {
    const category = await Category.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true });
    if (!category) throw new ApiError(404, 'Category not found', 'CATEGORY_NOT_FOUND');
    await adminRepository.createAuditLog(adminUserId, 'admin', 'DEACTIVATED_CATEGORY', 'Category', id);
    return { message: 'Category deactivated successfully' };
  }

  // Coupons
  async getCoupons() {
    return Coupon.find().populate('restaurantId', 'name').sort({ createdAt: -1 });
  }

  async createPlatformCoupon(data: any, adminUserId: string) {
    const coupon = await Coupon.create(data);
    await adminRepository.createAuditLog(adminUserId, 'admin', 'CREATED_PLATFORM_COUPON', 'Coupon', coupon._id.toString(), { code: coupon.code });
    return coupon;
  }

  async toggleCouponStatus(id: string, isActive: boolean, adminUserId: string) {
    const coupon = await Coupon.findByIdAndUpdate(id, { $set: { isActive } }, { new: true });
    if (!coupon) throw new ApiError(404, 'Coupon not found', 'COUPON_NOT_FOUND');
    await adminRepository.createAuditLog(adminUserId, 'admin', `TOGGLED_COUPON_ACTIVE_${isActive}`, 'Coupon', id, { code: coupon.code });
    return coupon;
  }
}

export const adminService = new AdminService();
