import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';
const envSchema = z.object({
    PORT: z.string().default('5001'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    CLIENT_URL: z.string().default('http://localhost:5173'),
    MONGODB_URI: isProduction
        ? z.string({ required_error: 'MONGODB_URI is required in production' }).min(1)
        : z.string().default('mongodb://127.0.0.1:27017/khananow'),
    JWT_ACCESS_SECRET: isProduction
        ? z.string({ required_error: 'JWT_ACCESS_SECRET is strictly required in production' }).min(16)
        : z.string().default(isTest ? 'test_access_secret_12345_safe_ci' : 'dev_jwt_access_secret_only_for_local_development_not_for_prod_123'),
    JWT_REFRESH_SECRET: isProduction
        ? z.string({ required_error: 'JWT_REFRESH_SECRET is strictly required in production' }).min(16)
        : z.string().default(isTest ? 'test_refresh_secret_12345_safe_ci' : 'dev_jwt_refresh_secret_only_for_local_development_not_for_prod_456'),
    JWT_ACCESS_EXPIRATION: z.string().default('15m'),
    JWT_REFRESH_EXPIRATION: z.string().default('7d'),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    RAZORPAY_KEY_ID: isProduction
        ? z.string({ required_error: 'RAZORPAY_KEY_ID is strictly required in production' }).min(1)
        : z.string().default('rzp_test_placeholder_key'),
    RAZORPAY_KEY_SECRET: isProduction
        ? z.string({ required_error: 'RAZORPAY_KEY_SECRET is strictly required in production' }).min(1)
        : z.string().default(isTest ? 'test_razorpay_secret_ci' : 'dev_razorpay_secret_placeholder'),
    RAZORPAY_WEBHOOK_SECRET: isProduction
        ? z.string({ required_error: 'RAZORPAY_WEBHOOK_SECRET is strictly required in production' }).min(1)
        : z.string().default(isTest ? 'test_razorpay_webhook_ci' : 'dev_razorpay_webhook_secret_placeholder'),
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.error('❌ FATAL: Production Environment Configuration Error:');
    const issues = _env.error.issues.map((i) => `   - ${i.path.join('.')}: ${i.message}`);
    console.error(issues.join('\n'));
    process.exit(1);
}
export const env = _env.data;
