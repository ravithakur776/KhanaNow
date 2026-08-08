import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service.js';
import { razorpayService } from '../services/razorpay.service.js';
import { sendResponse } from '../utils/apiResponse.js';

export class PaymentController {
  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const idempotencyKey =
        (req.headers['idempotency-key'] as string) || req.body.idempotencyKey;

      const result = await paymentService.createPaymentOrder(
        {
          ...req.body,
          idempotencyKey,
        },
        userId
      );

      sendResponse(res, 201, 'Razorpay payment order created successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await paymentService.verifyPayment(req.body, userId);
      sendResponse(res, 200, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  async getPaymentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const paymentReference = req.params.paymentReference as string;
      const result = await paymentService.getPaymentStatus(paymentReference, userId);
      sendResponse(res, 200, 'Payment status retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async cancelPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const paymentReference = req.params.paymentReference as string;
      const result = await paymentService.cancelPayment(paymentReference, userId);
      sendResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  async webhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const rawBody = JSON.stringify(req.body);

      const isValid = razorpayService.verifyWebhookSignature(rawBody, signature);
      if (!isValid) {
        res.status(400).json({ success: false, message: 'Invalid webhook signature' });
        return;
      }

      // Webhook event received safely
      const event = req.body.event;
      console.log(`📡 Razorpay Webhook Event Received [${event}]`);

      res.status(200).json({ status: 'ok', received: true });
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
