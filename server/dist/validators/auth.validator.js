import { z } from 'zod';
export const passwordComplexitySchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');
export const registerSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
    password: passwordComplexitySchema,
    role: z
        .enum(['customer', 'restaurant_owner', 'delivery_partner', 'admin'])
        .optional()
        .default('customer'),
    acceptTerms: z.boolean().refine((val) => val === true, 'You must accept Terms and Privacy Policy'),
    newsletterOptIn: z.boolean().optional().default(false),
});
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional().default(false),
});
export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});
export const resetPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().min(6, 'Valid 6-digit OTP code required'),
    newPassword: passwordComplexitySchema,
});
export const verifyOTPSchema = z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().min(6, 'Valid 6-digit OTP code required'),
});
export const resendVerificationSchema = z.object({
    email: z.string().email('Invalid email address'),
});
