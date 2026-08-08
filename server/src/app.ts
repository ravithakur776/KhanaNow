import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import v1Routes from './routes/v1/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { sendResponse } from './utils/apiResponse.js';

const app: Application = express();

// Global Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// CORS Configuration
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Idempotency-Key'],
  })
);

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: {
    success: false,
    statusCode: 429,
    errorCode: 'TOO_MANY_REQUESTS',
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api', limiter);

// Health Check Route
app.get('/health', (_req: Request, res: Response) => {
  sendResponse(res, 200, 'KhanaNow API Server Healthy', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

// API Routes
app.use('/api/v1', v1Routes);

// Global Error Handler
app.use(errorHandler);

export default app;
