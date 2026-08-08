import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/khananow'),
  JWT_ACCESS_SECRET: z.string().default('khananowDefaultAccessSecretKey123!'),
  JWT_REFRESH_SECRET: z.string().default('khananowDefaultRefreshSecretKey456!'),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional().default('rzp_test_mockKey12345'),
  RAZORPAY_KEY_SECRET: z.string().optional().default('mockRazorpaySecret67890'),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default('mockRazorpayWebhookSecret'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid Environment Variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
