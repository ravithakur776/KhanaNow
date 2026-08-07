"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAddressSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email address'),
    phone: zod_1.z.string().regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    role: zod_1.z
        .enum(['customer', 'restaurant_owner', 'delivery_partner', 'admin'])
        .optional()
        .default('customer'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.addAddressSchema = zod_1.z.object({
    label: zod_1.z.enum(['Home', 'Work', 'Other']).default('Home'),
    streetAddress: zod_1.z.string().min(5, 'Street address is required'),
    city: zod_1.z.string().min(2, 'City is required'),
    state: zod_1.z.string().min(2, 'State is required'),
    pincode: zod_1.z.string().min(6, 'Valid 6-digit pincode required'),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
    isDefault: zod_1.z.boolean().optional().default(false),
});
