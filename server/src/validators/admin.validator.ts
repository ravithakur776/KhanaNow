import { z } from 'zod';

export const updateUserStatusSchema = z.object({
  status: z.enum(['active', 'suspended', 'blocked']),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['customer', 'restaurant_owner', 'admin', 'delivery_partner']),
});

export const updateRestaurantStatusSchema = z.object({
  status: z.enum(['pending', 'active', 'suspended', 'rejected']),
  reason: z.string().max(300).optional(),
});

export const adminCategorySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const adminCouponSchema = z.object({
  code: z.string().min(3).max(15).toUpperCase(),
  description: z.string().min(5),
  discountType: z.enum(['percentage', 'flat']),
  discountValue: z.number().min(1),
  maxDiscount: z.number().optional(),
  minOrderValue: z.number().min(0).default(0),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  usageLimit: z.number().optional(),
  isActive: z.boolean().default(true),
  applicableRestaurants: z.array(z.string()).optional(),
});
