import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

export interface CreateRazorpayOrderInput {
  amountInPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}

export class RazorpayService {
  private razorpayInstance: Razorpay | null = null;

  constructor() {
    if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
      try {
        this.razorpayInstance = new Razorpay({
          key_id: env.RAZORPAY_KEY_ID,
          key_secret: env.RAZORPAY_KEY_SECRET,
        });
      } catch (error) {
        console.warn('⚠️ Razorpay initialization warning:', error);
      }
    }
  }

  async createOrder(input: CreateRazorpayOrderInput) {
    if (input.amountInPaise <= 0 || !Number.isInteger(input.amountInPaise)) {
      throw new ApiError(400, 'Payment amount must be a positive integer in paise', 'INVALID_AMOUNT');
    }

    const options = {
      amount: input.amountInPaise,
      currency: 'INR',
      receipt: input.receipt,
      notes: input.notes || {},
    };

    // If real credentials are provided and SDK initialized
    if (
      this.razorpayInstance &&
      env.RAZORPAY_KEY_ID &&
      !env.RAZORPAY_KEY_ID.startsWith('rzp_test_placeholder')
    ) {
      try {
        const order = await this.razorpayInstance.orders.create(options);
        return {
          id: order.id,
          amount: order.amount as number,
          currency: order.currency,
          receipt: order.receipt,
        };
      } catch (err: any) {
        console.error('❌ Razorpay order creation failed:', err?.message || err);
        throw new ApiError(502, 'Failed to create payment order with gateway. Please try again.', 'GATEWAY_ERROR');
      }
    }

    // In production, failure to connect to Razorpay must fail closed
    if (env.NODE_ENV === 'production') {
      throw new ApiError(500, 'Production Razorpay gateway credentials are not configured.', 'GATEWAY_CONFIG_MISSING');
    }

    // Deterministic Mock Order for test/dev environments
    const mockOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
    return {
      id: mockOrderId,
      amount: input.amountInPaise,
      currency: 'INR',
      receipt: input.receipt,
    };
  }

  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    if (!orderId || !paymentId || !signature) {
      return false;
    }

    if (!env.RAZORPAY_KEY_SECRET) {
      throw new ApiError(500, 'Razorpay key secret is not configured on server.', 'SERVER_CONFIG_ERROR');
    }

    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    // Constant time string comparison to prevent timing attacks
    return (
      expectedSignature.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))
    );
  }

  verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
    if (!signature || !env.RAZORPAY_WEBHOOK_SECRET) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    return (
      expectedSignature.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))
    );
  }
}

export const razorpayService = new RazorpayService();
