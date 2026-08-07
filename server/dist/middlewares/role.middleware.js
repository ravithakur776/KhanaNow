"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = void 0;
const apiError_js_1 = require("../utils/apiError.js");
const authorizeRoles = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new apiError_js_1.ApiError(401, 'Authentication required', 'UNAUTHORIZED'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new apiError_js_1.ApiError(403, `Access denied. Requires one of roles: [${roles.join(', ')}]`, 'FORBIDDEN'));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
