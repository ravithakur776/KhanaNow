import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service.js';
import { sendResponse } from '../utils/apiResponse.js';

export class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const idempotencyKey = (req.headers['idempotency-key'] as string) || req.body.idempotencyKey;

      const result = await orderService.createOrderFromPayment(
        {
          ...req.body,
          idempotencyKey,
        },
        userId
      );

      sendResponse(res, 201, result.message, result.order);
    } catch (error) {
      next(error);
    }
  }

  async getMyOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { page, limit, status } = req.query as any;

      const result = await orderService.getUserOrders(userId, {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        status: status as string,
      });

      sendResponse(res, 200, 'User orders retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getOrderDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const orderNumber = req.params.orderNumber as string;

      const order = await orderService.getOrderDetails(orderNumber, userId, userRole);
      sendResponse(res, 200, 'Order details retrieved successfully', order);
    } catch (error) {
      next(error);
    }
  }

  async getOrderTracking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const orderNumber = req.params.orderNumber as string;

      const tracking = await orderService.getOrderTracking(orderNumber, userId);
      sendResponse(res, 200, 'Order live tracking retrieved successfully', tracking);
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const orderNumber = req.params.orderNumber as string;
      const { cancelReason } = req.body;

      const result = await orderService.cancelOrder(orderNumber, userId, cancelReason);
      sendResponse(res, 200, result.message, result.order);
    } catch (error) {
      next(error);
    }
  }

  async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const orderNumber = req.params.orderNumber as string;

      const result = await orderService.reorder(orderNumber, userId);
      sendResponse(res, 200, 'Reorder cart payload prepared successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async restaurantUpdateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderNumber = req.params.orderNumber as string;
      const { status, note } = req.body;
      const actorType = req.user?.role === 'admin' ? 'admin' : 'restaurant';

      const updatedOrder = await orderService.restaurantUpdateOrderStatus(orderNumber, status, note, actorType);
      sendResponse(res, 200, `Order status updated to ${status}`, updatedOrder);
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
