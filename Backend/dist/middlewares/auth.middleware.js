"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOwnership = exports.optionalAuth = exports.authorize = exports.authenticate = void 0;
exports.invalidateUserCache = invalidateUserCache;
const constants_1 = require("../constants");
const jwt_1 = require("../utils/jwt");
const error_helper_1 = require("../helpers/error.helper");
const database_1 = require("../database");
// ─── In-Memory User Cache (LRU with TTL) ────────────────────────────────
// Eliminates ~30ms DB lookup per request for recently authenticated users.
const USER_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const USER_CACHE_MAX_SIZE = 500;
const userCache = new Map();
function getCachedUser(userId) {
    const entry = userCache.get(userId);
    if (!entry)
        return null;
    if (Date.now() > entry.expiresAt) {
        userCache.delete(userId);
        return null;
    }
    return entry.data;
}
function setCachedUser(userId, data) {
    // Evict oldest entries if cache is full
    if (userCache.size >= USER_CACHE_MAX_SIZE) {
        const firstKey = userCache.keys().next().value;
        if (firstKey !== undefined)
            userCache.delete(firstKey);
    }
    userCache.set(userId, {
        data,
        expiresAt: Date.now() + USER_CACHE_TTL_MS,
    });
}
/** Clear a specific user from cache (call on profile update / role change) */
function invalidateUserCache(userId) {
    userCache.delete(userId);
}
// User select fields — single source of truth
const AUTH_USER_SELECT = {
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
};
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
        // Fast path: check in-memory cache first
        let user = getCachedUser(decoded.userId);
        if (!user) {
            // Cache miss — hit DB and cache the result
            user = await database_1.prisma.user.findUnique({
                where: { id: decoded.userId },
                select: AUTH_USER_SELECT,
            });
            if (user) {
                setCachedUser(decoded.userId, user);
            }
        }
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