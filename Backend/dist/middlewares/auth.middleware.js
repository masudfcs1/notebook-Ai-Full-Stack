"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOwnership = exports.optionalAuth = exports.authorize = exports.authenticate = void 0;
const constants_1 = require("../constants");
const jwt_1 = require("../utils/jwt");
const error_helper_1 = require("../helpers/error.helper");
const database_1 = require("../database");
const authenticate = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token;
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        else if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }
        if (!token) {
            throw error_helper_1.AppError.unauthorized(constants_1.MESSAGES.UNAUTHORIZED);
        }
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        const user = await database_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                uuid: true,
                email: true,
                name: true,
                username: true,
                role: true,
                status: true,
                isVerified: true,
                avatar: true,
                phone: true,
                provider: true,
                lastLogin: true,
                loginCount: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
            },
        });
        if (!user) {
            throw error_helper_1.AppError.unauthorized(constants_1.MESSAGES.USER_NOT_FOUND);
        }
        if (user.status === 'SUSPENDED') {
            throw error_helper_1.AppError.forbidden(constants_1.MESSAGES.ACCOUNT_SUSPENDED);
        }
        if (user.status === 'INACTIVE') {
            throw error_helper_1.AppError.forbidden(constants_1.MESSAGES.ACCOUNT_INACTIVE);
        }
        req.user = user;
        req.userId = user.id;
        next();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : constants_1.MESSAGES.TOKEN_INVALID;
        next(error_helper_1.AppError.unauthorized(message));
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            next(error_helper_1.AppError.unauthorized());
            return;
        }
        const hasRole = roles.includes(req.user.role);
        if (!hasRole) {
            next(error_helper_1.AppError.forbidden());
            return;
        }
        next();
    };
};
exports.authorize = authorize;
const optionalAuth = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token;
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        else if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }
        if (token) {
            const decoded = (0, jwt_1.verifyAccessToken)(token);
            const user = await database_1.prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    uuid: true,
                    email: true,
                    name: true,
                    username: true,
                    role: true,
                    status: true,
                    isVerified: true,
                    avatar: true,
                    phone: true,
                    provider: true,
                    lastLogin: true,
                    loginCount: true,
                    createdAt: true,
                    updatedAt: true,
                    deletedAt: true,
                },
            });
            if (user && user.status !== 'SUSPENDED' && user.status !== 'INACTIVE') {
                req.user = user;
                req.userId = user.id;
            }
        }
        next();
    }
    catch {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const checkOwnership = (req, _res, next) => {
    const { id } = req.params;
    const userId = req.user?.id?.toString();
    const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN';
    if (isAdmin) {
        next();
        return;
    }
    if (id === userId) {
        next();
        return;
    }
    next(error_helper_1.AppError.forbidden());
};
exports.checkOwnership = checkOwnership;
//# sourceMappingURL=auth.middleware.js.map