import { Request, Response, NextFunction } from 'express';
import { checkoutService } from '../services/checkout.service.js';
import { sendResponse } from '../utils/apiResponse.js';

export class CheckoutController {
  async validateCheckout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const idempotencyKey = (req.headers['idempotency-key'] as string) || req.body.idempotencyKey;

      const summary = await checkoutService.validateCheckout({
        ...req.body,
        userId,
        idempotencyKey,
      });

      sendResponse(res, 200, 'Checkout validated successfully', summary);
    } catch (error) {
      next(error);
    }
  }
}

export const checkoutController = new CheckoutController();
