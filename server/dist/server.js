"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = __importDefault(require("./app.js"));
const db_js_1 = require("./config/db.js");
const env_js_1 = require("./config/env.js");
const startServer = async () => {
    try {
        await (0, db_js_1.connectDB)();
        const server = app_js_1.default.listen(env_js_1.env.PORT, () => {
            console.log(`🚀 Server running in [${env_js_1.env.NODE_ENV}] mode on http://localhost:${env_js_1.env.PORT}`);
        });
        const gracefulShutdown = (signal) => {
            console.log(`\n⚠️ Received ${signal}. Shutting down gracefully...`);
            server.close(() => {
                console.log('💤 HTTP Server closed.');
                process.exit(0);
            });
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
