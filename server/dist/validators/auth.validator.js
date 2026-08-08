"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendVerificationSchema = exports.verifyOTPSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.registerSchema = exports.passwordComplexitySchema = void 0;
const zod_1 = require("zod");
exports.passwordComplexitySchema = zod_1.z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');
exports.registerSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2, 'First name must be at least 2 characters'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    email: zod_1.z.string().email('Invalid email address'),
    phone: zod_1.z.string().regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
    password: exports.passwordComplexitySchema,
    role: zod_1.z
        .enum(['customer', 'restaurant_owner', 'delivery_partner', 'admin'])
        .optional()
        .default('customer'),
    acceptTerms: zod_1.z.boolean().refine((val) => val === true, 'You must accept Terms and Privacy Policy'),
    newsletterOptIn: zod_1.z.boolean().optional().default(false),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
    rememberMe: zod_1.z.boolean().optional().default(false),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
});
exports.resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    otp: zod_1.z.string().min(6, 'Valid 6-digit OTP code required'),
    newPassword: exports.passwordComplexitySchema,
});
exports.verifyOTPSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    otp: zod_1.z.string().min(6, 'Valid 6-digit OTP code required'),
});
exports.resendVerificationSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
});
