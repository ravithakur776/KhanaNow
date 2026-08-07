"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_js_1 = require("./config/env.js");
const index_js_1 = __importDefault(require("./routes/v1/index.js"));
const error_middleware_js_1 = require("./middlewares/error.middleware.js");
const apiResponse_js_1 = require("./utils/apiResponse.js");
const app = (0, express_1.default)();
// Global Middlewares
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('dev'));
// CORS Configuration
app.use((0, cors_1.default)({
    origin: [env_js_1.env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
// Global Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
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
app.get('/health', (_req, res) => {
    (0, apiResponse_js_1.sendResponse)(res, 200, 'KhanaNow API Server Healthy', {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        env: env_js_1.env.NODE_ENV,
    });
});
// API Routes
app.use('/api/v1', index_js_1.default);
// Global Error Handler
app.use(error_middleware_js_1.errorHandler);
exports.default = app;
