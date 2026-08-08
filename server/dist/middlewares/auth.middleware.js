import { verifyAccessToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';
export const authenticate = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new ApiError(401, 'Access token missing or invalid', 'UNAUTHORIZED'));
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = verifyAccessToken(token);
        req.user = payload;
        next();
    }
    catch (error) {
        return next(new ApiError(401, 'Invalid or expired access token', 'TOKEN_EXPIRED'));
    }
};
export const authorizeRoles = (...roles) => {
    return (req, _res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new ApiError(403, 'Forbidden: You do not have permission to perform this action', 'FORBIDDEN'));
        }
        next();
    };
};
