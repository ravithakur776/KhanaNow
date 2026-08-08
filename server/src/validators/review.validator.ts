import { z } from 'zod';

export const createReviewSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  restaurantId: z.string().min(1, 'Restaurant ID is required'),
  foodId: z.string().optional(),
  rating: z.number().int().min(1, 'Minimum rating is 1').max(5, 'Maximum rating is 5'),
  title: z.string().max(120, 'Title cannot exceed 120 characters').optional(),
  comment: z.string().min(3, 'Review comment must be at least 3 characters').max(1000, 'Comment cannot exceed 1000 characters'),
  images: z.array(z.string()).optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(120).optional(),
  comment: z.string().min(3).max(1000).optional(),
  images: z.array(z.string()).optional(),
});

export const moderateReviewSchema = z.object({
  status: z.enum(['published', 'hidden', 'flagged']),
  reason: z.string().max(300).optional(),
});
