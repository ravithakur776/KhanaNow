import { ApiError } from '../utils/apiError.js';
export const authorizeRoles = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new ApiError(401, 'Authentication required', 'UNAUTHORIZED'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, `Access denied. Requires one of roles: [${roles.join(', ')}]`, 'FORBIDDEN'));
        }
        next();
    };
};
