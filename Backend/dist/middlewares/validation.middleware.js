"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateParams = exports.validateBody = exports.validate = void 0;
const zod_1 = require("zod");
const error_helper_1 = require("../helpers/error.helper");
const validate = (schema) => async (req, _res, next) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const errors = error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));
            next(error_helper_1.AppError.validationFailed(errors));
            return;
        }
        next(error);
    }
};
exports.validate = validate;
const validateBody = (schema) => async (req, _res, next) => {
    try {
        req.body = await schema.parseAsync(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const errors = error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));
            next(error_helper_1.AppError.validationFailed(errors));
            return;
        }
        next(error);
    }
};
exports.validateBody = validateBody;
const validateParams = (schema) => async (req, _res, next) => {
    try {
        req.params = await schema.parseAsync(req.params);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const errors = error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));
            next(error_helper_1.AppError.validationFailed(errors));
            return;
        }
        next(error);
    }
};
exports.validateParams = validateParams;
const validateQuery = (schema) => async (req, _res, next) => {
    try {
        req.query = await schema.parseAsync(req.query);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const errors = error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));
            next(error_helper_1.AppError.validationFailed(errors));
            return;
        }
        next(error);
    }
};
exports.validateQuery = validateQuery;
//# sourceMappingURL=validation.middleware.js.map