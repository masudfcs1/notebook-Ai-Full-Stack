"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpRateLimiter = exports.passwordResetRateLimiter = exports.loginRateLimiter = exports.authRateLimiter = exports.rateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const constants_1 = require("../constants");
const isDev = process.env.NODE_ENV === 'development';
exports.rateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isDev ? 10000 : 100, // Limit each IP to 100 requests per windowMs
    skip: () => isDev,
    message: {
        success: false,
        message: constants_1.MESSAGES.RATE_LIMIT_EXCEEDED,
    },
    statusCode: constants_1.HTTP_STATUS.TOO_MANY_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
});
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isDev ? 1000 : 10, // Limit each IP to 10 auth requests per windowMs
    skip: () => isDev,
    message: {
        success: false,
        message: constants_1.MESSAGES.RATE_LIMIT_EXCEEDED,
    },
    statusCode: constants_1.HTTP_STATUS.TOO_MANY_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
});
exports.loginRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: isDev ? 1000 : 5, // Limit each IP to 5 login attempts per windowMs
    skip: () => isDev,
    message: {
        success: false,
        message: 'Too many login attempts, please try again later',
    },
    statusCode: constants_1.HTTP_STATUS.TOO_MANY_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
});
exports.passwordResetRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: isDev ? 1000 : 3, // Limit each IP to 3 password reset requests per hour
    skip: () => isDev,
    message: {
        success: false,
        message: 'Too many password reset requests, please try again later',
    },
    statusCode: constants_1.HTTP_STATUS.TOO_MANY_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
});
exports.otpRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: isDev ? 1000 : 3, // Limit each IP to 3 OTP requests per windowMs
    skip: () => isDev,
    message: {
        success: false,
        message: 'Too many OTP requests, please try again later',
    },
    statusCode: constants_1.HTTP_STATUS.TOO_MANY_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
});
//# sourceMappingURL=rate-limiter.middleware.js.map