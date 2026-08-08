import { z } from 'zod';

export const createOrderSchema = z.object({
  paymentReference: z.string().min(1, 'paymentReference is required'),
  deliveryInstructions: z.string().max(200).optional(),
  deliveryOption: z.enum(['standard', 'scheduled']).optional().default('standard'),
  idempotencyKey: z.string().optional(),
});

export const cancelOrderSchema = z.object({
  cancelReason: z.string().min(3, 'Cancel reason must be at least 3 characters').max(300),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PLACED',
    'CONFIRMED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'PICKED_UP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'FAILED',
  ]),
  note: z.string().max(300).optional(),
});

export const queryOrdersSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
  status: z.string().optional(),
  sort: z.string().optional(),
});
