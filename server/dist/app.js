import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import v1Routes from './routes/v1/index.js';
import healthRoutes from './routes/v1/health.routes.js';
import { requestIdMiddleware } from './middlewares/requestId.middleware.js';
import { generalApiLimiter } from './middlewares/rateLimit.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
const app = express();
// Request ID Middleware
app.use(requestIdMiddleware);
// Security Headers with Helmet (Narrow CSP for Razorpay, Google Fonts & Cloudinary)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", 'https://checkout.razorpay.com'],
            frameSrc: ["'self'", 'https://api.razorpay.com', 'https://checkout.razorpay.com'],
            connectSrc: ["'self'", 'https://api.razorpay.com', 'https://lumberjack.razorpay.com', env.CLIENT_URL],
            imgSrc: ["'self'", 'data:', 'https:', 'https://images.unsplash.com', 'https://res.cloudinary.com'],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
// Raw Body capture for webhook signature verification + Standard JSON & URLencoded parsers
app.use(express.json({
    limit: '1mb',
    verify: (req, _res, buf) => {
        req.rawBody = buf;
    },
}));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
// Production-Grade CORS Configuration
const allowedOrigins = env.NODE_ENV === 'production'
    ? [env.CLIENT_URL]
    : [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-Request-ID',
        'Idempotency-Key',
        'x-razorpay-signature',
    ],
}));
// Global Rate Limiting
app.use('/api', generalApiLimiter);
// Health Check Endpoints
app.use('/health', healthRoutes);
app.use('/api/v1/health', healthRoutes);
// API v1 Routes
app.use('/api/v1', v1Routes);
// 404 Fallback Handler
app.use((_req, res) => {
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
