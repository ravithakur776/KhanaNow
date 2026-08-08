import { Request, Response, NextFunction } from 'express';
import { couponService } from '../services/coupon.service.js';
import { sendResponse } from '../utils/apiResponse.js';

export class CouponController {
  async getCoupons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const restaurantId = (req.query.restaurantId || '') as string;
      const coupons = await couponService.getActiveCoupons(restaurantId || undefined);
      sendResponse(res, 200, 'Active coupons retrieved successfully', coupons);
    } catch (error) {
      next(error);
    }
  }

  async validateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, itemTotal, restaurantId } = req.body;
      const result = await couponService.validateCoupon({
        code,
        itemTotal: Number(itemTotal),
        restaurantId,
        userId: req.user?.userId,
      });
      sendResponse(res, 200, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  async applyCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, itemTotal, restaurantId } = req.body;
      const result = await couponService.validateCoupon({
        code,
        itemTotal: Number(itemTotal),
        restaurantId,
        userId: req.user?.userId,
      });
      sendResponse(res, 200, `Coupon '${code.toUpperCase()}' applied successfully`, result);
    } catch (error) {
      next(error);
    }
  }

  async removeCoupon(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendResponse(res, 200, 'Coupon removed successfully', { discountAmount: 0 });
    } catch (error) {
      next(error);
    }
  }
}

export const couponController = new CouponController();
