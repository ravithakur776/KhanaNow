import { z } from 'zod';

export const checkoutItemSchema = z.object({
  foodId: z.string().min(1, 'foodId is required'),
  name: z.string().optional(),
  price: z.number().optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(20, 'Max 20 per item'),
  selectedOptions: z
    .array(
      z.object({
        groupName: z.string(),
        optionName: z.string(),
        price: z.number().min(0),
      })
    )
    .optional(),
});

export const validateCheckoutSchema = z.object({
  cartItems: z.array(checkoutItemSchema).min(1, 'Cart cannot be empty'),
  restaurantId: z.string().min(1, 'restaurantId is required'),
  addressId: z.string().min(1, 'addressId is required'),
  couponCode: z.string().optional(),
  tipAmount: z.number().min(0).optional().default(0),
  deliveryInstructions: z.string().max(200, 'Instructions cannot exceed 200 characters').optional(),
  deliveryOption: z.enum(['standard', 'scheduled']).optional().default('standard'),
  idempotencyKey: z.string().optional(),
});
