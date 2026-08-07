"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const apiError_js_1 = require("../utils/apiError.js");
const env_js_1 = require("../config/env.js");
const errorHandler = (err, _req, res, _next) => {
    let statusCode = 500;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected server error occurred';
    let errors = [];
    if (err instanceof apiError_js_1.ApiError) {
        statusCode = err.statusCode;
        errorCode = err.errorCode;
        message = err.message;
        errors = err.errors || [];
    }
    else if (err.name === 'ValidationError') {
        statusCode = 400;
        errorCode = 'MONGOOSE_VALIDATION_ERROR';
        message = err.message;
    }
    else if (err.name === 'CastError') {
        statusCode = 400;
        errorCode = 'INVALID_ID_FORMAT';
        message = 'Invalid database document ID format';
    }
    if (env_js_1.env.NODE_ENV === 'development') {
        console.error('💥 Error Stack:', err);
    }
    return res.status(statusCode).json({
        success: false,
        statusCode,
        errorCode,
        message,
        ...(errors.length > 0 && { errors }),
        ...(env_js_1.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
