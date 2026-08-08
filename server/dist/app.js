"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const env_js_1 = require("./config/env.js");
const index_js_1 = __importDefault(require("./routes/v1/index.js"));
const health_routes_js_1 = __importDefault(require("./routes/v1/health.routes.js"));
const requestId_middleware_js_1 = require("./middlewares/requestId.middleware.js");
const rateLimit_middleware_js_1 = require("./middlewares/rateLimit.middleware.js");
const error_middleware_js_1 = require("./middlewares/error.middleware.js");
const app = (0, express_1.default)();
// Request ID & Body Parsing Middlewares
app.use(requestId_middleware_js_1.requestIdMiddleware);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
if (env_js_1.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// Production-Grade CORS Configuration
app.use((0, cors_1.default)({
    origin: [env_js_1.env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID', 'Idempotency-Key'],
}));
// Global Rate Limiting
app.use('/api', rateLimit_middleware_js_1.generalApiLimiter);
// Health Check Endpoints
app.use('/health', health_routes_js_1.default);
app.use('/api/v1/health', health_routes_js_1.default);
// API v1 Routes
app.use('/api/v1', index_js_1.default);
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
app.use(error_middleware_js_1.errorHandler);
exports.default = app;
