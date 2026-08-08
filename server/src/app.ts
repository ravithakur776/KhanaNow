import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import v1Routes from './routes/v1/index.js';
import healthRoutes from './routes/v1/health.routes.js';
import { requestIdMiddleware } from './middlewares/requestId.middleware.js';
import { generalApiLimiter } from './middlewares/rateLimit.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { sendResponse } from './utils/apiResponse.js';

const app: Application = express();

// Request ID & Body Parsing Middlewares
app.use(requestIdMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Production-Grade CORS Configuration
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID', 'Idempotency-Key'],
  })
);

// Global Rate Limiting
app.use('/api', generalApiLimiter);

// Health Check Endpoints
app.use('/health', healthRoutes);
app.use('/api/v1/health', healthRoutes);

// API v1 Routes
app.use('/api/v1', v1Routes);

// 404 Fallback Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    errorCode: 'ROUTE_NOT_FOUND',
    message: 'The requested API endpoint does not exist on this server.',
  });
});

// Global Production Error Handler
app.use(errorHandler);

export default app;
