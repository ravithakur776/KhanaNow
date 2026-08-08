import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service.js';
import { sendResponse } from '../utils/apiResponse.js';

export class AdminController {
  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { from, to } = req.query as any;
      const metrics = await adminService.getDashboardMetrics(from, to);
      sendResponse(res, 200, 'Admin platform metrics retrieved successfully', metrics);
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { from, to } = req.query as any;
      const analytics = await adminService.getAnalytics(from, to);
      sendResponse(res, 200, 'Admin revenue analytics retrieved successfully', analytics);
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, search, role, status } = req.query as any;
      const users = await adminService.getUsers({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        search,
        role,
        status,
      });
      sendResponse(res, 200, 'Platform users list retrieved successfully', users);
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminUserId = req.user!.userId;
      const targetUserId = req.params.id as string;
      const { status } = req.body;

      const user = await adminService.updateUserStatus(targetUserId, status, adminUserId);
      sendResponse(res, 200, `User account status updated to ${status}`, user);
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminUserId = req.user!.userId;
      const targetUserId = req.params.id as string;
      const { role } = req.body;

      const user = await adminService.updateUserRole(targetUserId, role, adminUserId);
      sendResponse(res, 200, `User role updated to ${role}`, user);
    } catch (error) {
      next(error);
    }
  }

  async getRestaurants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, search, status, city } = req.query as any;
      const restaurants = await adminService.getRestaurants({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        search,
        status,
        city,
      });
      sendResponse(res, 200, 'Restaurants directory retrieved successfully', restaurants);
    } catch (error) {
      next(error);
    }
  }

  async updateRestaurantStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminUserId = req.user!.userId;
      const restaurantId = req.params.id as string;
      const { status, reason } = req.body;

      const restaurant = await adminService.updateRestaurantStatus(restaurantId, status, adminUserId, reason);
      sendResponse(res, 200, `Restaurant status updated to ${status}`, restaurant);
    } catch (error) {
      next(error);
    }
  }

  async getOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, orderNumber, status, restaurantId, from, to } = req.query as any;
      const orders = await adminService.getOrders({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        orderNumber,
        status,
        restaurantId,
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
      });
      sendResponse(res, 200, 'Admin orders list retrieved successfully', orders);
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminUserId = req.user!.userId;
      const orderNumber = req.params.orderNumber as string;
      const { status, note } = req.body;

      const order = await adminService.updateOrderStatus(orderNumber, status, adminUserId, note);
      sendResponse(res, 200, `Order status overridden to ${status}`, order);
    } catch (error) {
      next(error);
    }
  }

  async getPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, status } = req.query as any;
      const payments = await adminService.getPayments(
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 10,
        status
      );
      sendResponse(res, 200, 'Platform payments list retrieved successfully', payments);
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = req.query as any;
      const logs = await adminService.getAuditLogs(
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20
      );
      sendResponse(res, 200, 'Audit logs retrieved successfully', logs);
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await adminService.getCategories();
      sendResponse(res, 200, 'Categories retrieved successfully', categories);
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminUserId = req.user!.userId;
      const category = await adminService.createCategory(req.body, adminUserId);
      sendResponse(res, 201, 'Category created successfully', category);
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminUserId = req.user!.userId;
      const category = await adminService.updateCategory(req.params.id as string, req.body, adminUserId);
      sendResponse(res, 200, 'Category updated successfully', category);
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminUserId = req.user!.userId;
      const result = await adminService.deleteCategory(req.params.id as string, adminUserId);
      sendResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  async getCoupons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupons = await adminService.getCoupons();
      sendResponse(res, 200, 'Coupons directory retrieved successfully', coupons);
    } catch (error) {
      next(error);
    }
  }

  async createCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminUserId = req.user!.userId;
      const coupon = await adminService.createPlatformCoupon(req.body, adminUserId);
      sendResponse(res, 201, 'Platform coupon created successfully', coupon);
    } catch (error) {
      next(error);
    }
  }

  async toggleCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminUserId = req.user!.userId;
      const coupon = await adminService.toggleCouponStatus(req.params.id as string, req.body.isActive, adminUserId);
      sendResponse(res, 200, 'Coupon status updated successfully', coupon);
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
