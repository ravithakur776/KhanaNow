"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const apiError_js_1 = require("../utils/apiError.js");
const validateRequest = (schema) => async (req, _res, next) => {
    try {
        await schema.parseAsync(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const formattedErrors = error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));
            next(new apiError_js_1.ApiError(400, 'Validation Failed', 'VALIDATION_ERROR', formattedErrors));
        }
        else {
            next(error);
        }
    }
};
exports.validateRequest = validateRequest;
