export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly errors?: any[];
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    errorCode: string = 'INTERNAL_ERROR',
    errors: any[] = [],
    isOperational = true,
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
