import { Request, Response, NextFunction } from 'express';
import { restaurantOwnerService } from '../services/restaurantOwner.service.js';
import { sendResponse } from '../utils/apiResponse.js';

export class RestaurantOwnerController {
  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!.userId;
      const metrics = await restaurantOwnerService.getDashboard(ownerId);
      sendResponse(res, 200, 'Kitchen dashboard metrics retrieved successfully', metrics);
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!.userId;
      const { from, to } = req.query as any;
      const analytics = await restaurantOwnerService.getAnalytics(ownerId, from, to);
      sendResponse(res, 200, 'Kitchen sales analytics retrieved successfully', analytics);
    } catch (error) {
      next(error);
    }
  }

  async getOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!.userId;
      const { page, limit, status } = req.query as any;
      const orders = await restaurantOwnerService.getOrders(
        ownerId,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20,
        status
      );
      sendResponse(res, 200, 'Kitchen orders queue retrieved successfully', orders);
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!.userId;
      const orderNumber = req.params.orderNumber as string;
      const { status, note } = req.body;

      const order = await restaurantOwnerService.updateOrderStatus(ownerId, orderNumber, status, note);
      sendResponse(res, 200, `Order ${orderNumber} transitioned to ${status}`, order);
    } catch (error) {
      next(error);
    }
  }

  async getMenu(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!.userId;
      const { page, limit, search, categoryId } = req.query as any;
      const menu = await restaurantOwnerService.getMenu(
        ownerId,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 50,
        search,
        categoryId
      );
      sendResponse(res, 200, 'Menu items retrieved successfully', menu);
    } catch (error) {
      next(error);
    }
  }

  async createFood(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!.userId;
      const food = await restaurantOwnerService.createFood(ownerId, req.body);
      sendResponse(res, 201, 'Dish added to kitchen menu successfully', food);
    } catch (error) {
      next(error);
    }
  }

  async updateFood(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!.userId;
      const foodId = req.params.id as string;
      const food = await restaurantOwnerService.updateFood(ownerId, foodId, req.body);
      sendResponse(res, 200, 'Dish updated successfully', food);
    } catch (error) {
      next(error);
    }
  }

  async toggleFoodAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!.userId;
      const foodId = req.params.id as string;
      const { isAvailable } = req.body;

      const food = await restaurantOwnerService.toggleFoodAvailability(ownerId, foodId, isAvailable);
      sendResponse(res, 200, `Dish availability set to ${isAvailable}`, food);
    } catch (error) {
      next(error);
    }
  }

  async deleteFood(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!.userId;
      const foodId = req.params.id as string;
      const result = await restaurantOwnerService.deleteFood(ownerId, foodId);
      sendResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!.userId;
      const profile = await restaurantOwnerService.updateProfile(ownerId, req.body);
      sendResponse(res, 200, 'Kitchen profile updated successfully', profile);
    } catch (error) {
      next(error);
    }
  }

  async toggleOpenStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!.userId;
      const { isOpen } = req.body;
      const updated = await restaurantOwnerService.toggleOpenStatus(ownerId, isOpen);
      sendResponse(res, 200, `Restaurant is now ${isOpen ? 'OPEN' : 'CLOSED'}`, updated);
    } catch (error) {
      next(error);
    }
  }

  async getCoupons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!.userId;
      const coupons = await restaurantOwnerService.getCoupons(ownerId);
      sendResponse(res, 200, 'Restaurant coupons retrieved successfully', coupons);
    } catch (error) {
      next(error);
    }
  }

  async createCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!.userId;
      const coupon = await restaurantOwnerService.createCoupon(ownerId, req.body);
      sendResponse(res, 201, 'Coupon created successfully for your kitchen', coupon);
    } catch (error) {
      next(error);
    }
  }

  async getReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user!.userId;
      const { page, limit } = req.query as any;
      const reviews = await restaurantOwnerService.getReviews(
        ownerId,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20
      );
      sendResponse(res, 200, 'Customer reviews retrieved successfully', reviews);
    } catch (error) {
      next(error);
    }
  }
}

export const restaurantOwnerController = new RestaurantOwnerController();
