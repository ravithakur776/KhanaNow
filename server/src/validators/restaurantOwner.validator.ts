import { z } from 'zod';

export const createFoodSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  price: z.number().min(0, 'Price cannot be negative'),
  discountedPrice: z.number().min(0).optional(),
  imageUrl: z.string().min(1, 'Image is required'),
  categoryId: z.string().min(1, 'Category is required'),
  dietaryType: z.enum(['veg', 'non_veg', 'vegan', 'egg']).default('veg'),
  spiceLevel: z.enum(['none', 'mild', 'medium', 'hot', 'extra_hot']).default('medium'),
  preparationTimeMinutes: z.number().min(5).max(120).default(20),
  isAvailable: z.boolean().default(true),
  isBestseller: z.boolean().default(false),
  isRecommended: z.boolean().default(false),
  options: z
    .array(
      z.object({
        name: z.string(),
        choices: z.array(
          z.object({
            name: z.string(),
            additionalPrice: z.number().min(0).default(0),
          })
        ),
      })
    )
    .optional(),
});

export const updateFoodSchema = createFoodSchema.partial();

export const updateRestaurantProfileSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  bannerImageUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  cuisines: z.array(z.string()).optional(),
  costForTwo: z.number().min(50).optional(),
  deliveryTimeMinutes: z
    .object({
      min: z.number(),
      max: z.number(),
    })
    .optional(),
  isPureVeg: z.boolean().optional(),
  offerBadge: z.string().optional(),
  openingHours: z
    .array(
      z.object({
        day: z.string(),
        open: z.string(),
        close: z.string(),
      })
    )
    .optional(),
});

export const ownerCouponSchema = z.object({
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
});
