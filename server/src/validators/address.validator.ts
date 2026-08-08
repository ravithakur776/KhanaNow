import { z } from 'zod';

export const addressSchema = z.object({
  label: z.enum(['Home', 'Work', 'Other']).default('Home'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
  addressLine1: z.string().min(5, 'Address line 1 must be at least 5 characters'),
  addressLine2: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().regex(/^[0-9]{6}$/, 'Postal code must be exactly 6 digits'),
  country: z.string().default('India'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = addressSchema.partial();
