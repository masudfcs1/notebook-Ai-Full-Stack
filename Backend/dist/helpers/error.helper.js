"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
const constants_1 = require("../constants");
class AppError extends Error {
    statusCode;
    errors;
    isOperational;
    constructor(statusCode, message, errors) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(message, errors) {
        return new AppError(400, message, errors);
    }
    static unauthorized(message) {
        return new AppError(401, message || constants_1.MESSAGES.UNAUTHORIZED);
    }
    static forbidden(message) {
        return new AppError(403, message || constants_1.MESSAGES.FORBIDDEN);
    }
    static notFound(message) {
        return new AppError(404, message);
    }
    static conflict(message) {
        return new AppError(409, message);
    }
    static invalidCredentials() {
        return new AppError(401, constants_1.MESSAGES.INVALID_CREDENTIALS);
    }
    static validationFailed(errors) {
        return new AppError(422, constants_1.MESSAGES.VALIDATION_FAILED, errors);
    }
    static tooManyRequests(message) {
        return new AppError(429, message || constants_1.MESSAGES.RATE_LIMIT_EXCEEDED);
    }
    static internal(message) {
        return new AppError(500, message || constants_1.MESSAGES.SERVER_ERROR);
    }
}
exports.AppError = AppError;
//# sourceMappingURL=error.helper.js.map