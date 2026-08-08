export class ApiError extends Error {
    statusCode;
    errorCode;
    errors;
    isOperational;
    constructor(statusCode, message, errorCode = 'INTERNAL_ERROR', errors = [], isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.errors = errors;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
