"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authenticate = void 0;
const jwt_js_1 = require("../utils/jwt.js");
const apiError_js_1 = require("../utils/apiError.js");
const authenticate = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new apiError_js_1.ApiError(401, 'Access token missing or invalid', 'UNAUTHORIZED'));
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = (0, jwt_js_1.verifyAccessToken)(token);
        req.user = payload;
        next();
    }
    catch (error) {
        return next(new apiError_js_1.ApiError(401, 'Invalid or expired access token', 'TOKEN_EXPIRED'));
    }
};
exports.authenticate = authenticate;
const authorizeRoles = (...roles) => {
    return (req, _res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new apiError_js_1.ApiError(403, 'Forbidden: You do not have permission to perform this action', 'FORBIDDEN'));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
