import { ZodError } from 'zod';
import { ApiError } from '../utils/apiError.js';
export const validateRequest = (schema) => async (req, _res, next) => {
    try {
        await schema.parseAsync(req.body);
        next();
    }
    catch (error) {
        if (error instanceof ZodError) {
            const formattedErrors = error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));
            next(new ApiError(400, 'Validation Failed', 'VALIDATION_ERROR', formattedErrors));
        }
        else {
            next(error);
        }
    }
};
