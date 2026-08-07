import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required', 'UNAUTHORIZED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied. Requires one of roles: [${roles.join(', ')}]`,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
};
