import { z } from 'zod';
import { checkoutItemSchema } from './checkout.validator.js';

export const createPaymentOrderSchema = z.object({
  cartItems: z.array(checkoutItemSchema).min(1, 'Cart cannot be empty'),
  restaurantId: z.string().min(1, 'restaurantId is required'),
  addressId: z.string().min(1, 'addressId is required'),
  couponCode: z.string().optional(),
  tipAmount: z.number().min(0).optional().default(0),
  deliveryInstructions: z.string().max(200).optional(),
  deliveryOption: z.enum(['standard', 'scheduled']).optional().default('standard'),
  idempotencyKey: z.string().min(8, 'idempotencyKey must be at least 8 characters'),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, 'razorpay_order_id is required'),
  razorpay_payment_id: z.string().min(1, 'razorpay_payment_id is required'),
  razorpay_signature: z.string().min(1, 'razorpay_signature is required'),
  paymentReference: z.string().min(1, 'paymentReference is required'),
});
