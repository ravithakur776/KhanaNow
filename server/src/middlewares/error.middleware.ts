import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';
import { env } from '../config/env.js';

export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected server error occurred';
  let errors: any[] = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
    errors = err.errors || [];
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'MONGOOSE_VALIDATION_ERROR';
    message = err.message;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID_FORMAT';
    message = 'Invalid database document ID format';
  }

  if (env.NODE_ENV === 'development') {
    console.error('💥 Error Stack:', err);
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    errorCode,
    message,
    ...(errors.length > 0 && { errors }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
