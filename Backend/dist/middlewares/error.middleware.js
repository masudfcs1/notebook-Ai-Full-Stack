"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const zod_1 = require("zod");
const config_1 = require("../config");
const constants_1 = require("../constants");
const error_helper_1 = require("../helpers/error.helper");
const logger_1 = require("../logger");
const client_1 = require("@prisma/client");
const formatZodErrors = (errors) => {
    return errors.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
    }));
};
const handlePrismaError = (error) => {
    switch (error.code) {
        case 'P2002':
            return { statusCode: 409, message: `Duplicate entry: ${error.meta?.target}` };
        case 'P2025':
            return { statusCode: 404, message: constants_1.MESSAGES.NOT_FOUND };
        case 'P2003':
            return { statusCode: 400, message: 'Foreign key constraint failed' };
        default:
            return { statusCode: 500, message: constants_1.MESSAGES.SERVER_ERROR };
    }
};
const errorHandler = (error, req, res) => {
    let statusCode = constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
    let message = constants_1.MESSAGES.SERVER_ERROR;
    let errors;
    if (error instanceof error_helper_1.AppError) {
        statusCode = error.statusCode;
        message = error.message;
        errors = error.errors;
    }
    else if (error instanceof zod_1.ZodError) {
        statusCode = constants_1.HTTP_STATUS.UNPROCESSABLE_ENTITY;
        message = constants_1.MESSAGES.VALIDATION_FAILED;
        errors = formatZodErrors(error);
    }
    else if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        const result = handlePrismaError(error);
        statusCode = result.statusCode;
        message = result.message;
    }
    else if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        statusCode = constants_1.HTTP_STATUS.BAD_REQUEST;
        message = 'Database validation error';
    }
    else if (error.name === 'JsonWebTokenError') {
        statusCode = constants_1.HTTP_STATUS.UNAUTHORIZED;
        message = constants_1.MESSAGES.TOKEN_INVALID;
    }
    else if (error.name === 'TokenExpiredError') {
        statusCode = constants_1.HTTP_STATUS.UNAUTHORIZED;
        message = constants_1.MESSAGES.TOKEN_EXPIRED;
    }
    logger_1.logger.error({
        message: error.message,
        statusCode,
        requestId: req.requestId,
        path: req.path,
        method: req.method,
        ...(config_1.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
        stack: config_1.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    return res.status(constants_1.HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: `${req.method} ${req.path} not found`,
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=error.middleware.js.map