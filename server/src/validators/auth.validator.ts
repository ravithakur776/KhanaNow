import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z
    .enum(['customer', 'restaurant_owner', 'delivery_partner', 'admin'])
    .optional()
    .default('customer'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const addAddressSchema = z.object({
  label: z.enum(['Home', 'Work', 'Other']).default('Home'),
  streetAddress: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Valid 6-digit pincode required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isDefault: z.boolean().optional().default(false),
});
