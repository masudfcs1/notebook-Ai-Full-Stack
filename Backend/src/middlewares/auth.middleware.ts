import { NextFunction, Request, Response } from 'express';
import { MESSAGES } from '@/constants';
import { verifyAccessToken } from '@/utils/jwt';
import { AppError } from '@/helpers/error.helper';
import { prisma } from '@/database';
import { Role } from '@prisma/client';

export interface AuthUser {
  id: number;
  uuid: string;
  email: string;
  role: Role;
}

// ─── In-Memory User Cache (LRU with TTL) ────────────────────────────────
// Eliminates ~30ms DB lookup per request for recently authenticated users.
const USER_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const USER_CACHE_MAX_SIZE = 500;

interface CachedUser {
  data: any;
  expiresAt: number;
}

const userCache = new Map<number, CachedUser>();

function getCachedUser(userId: number): any | null {
  const entry = userCache.get(userId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    userCache.delete(userId);
    return null;
  }
  return entry.data;
}

function setCachedUser(userId: number, data: any): void {
  // Evict oldest entries if cache is full
  if (userCache.size >= USER_CACHE_MAX_SIZE) {
    const firstKey = userCache.keys().next().value;
    if (firstKey !== undefined) userCache.delete(firstKey);
  }
  userCache.set(userId, {
    data,
    expiresAt: Date.now() + USER_CACHE_TTL_MS,
  });
}

/** Clear a specific user from cache (call on profile update / role change) */
export function invalidateUserCache(userId: number): void {
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
} as const;

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw AppError.unauthorized(MESSAGES.UNAUTHORIZED);
    }

    const decoded = verifyAccessToken(token);

    // Fast path: check in-memory cache first
    let user = getCachedUser(decoded.userId);

    if (!user) {
      // Cache miss — hit DB and cache the result
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: AUTH_USER_SELECT,
      });

      if (user) {
        setCachedUser(decoded.userId, user);
      }
    }

    if (!user) {
      throw AppError.unauthorized(MESSAGES.USER_NOT_FOUND);
    }

    if (user.status === 'SUSPENDED') {
      throw AppError.forbidden(MESSAGES.ACCOUNT_SUSPENDED);
    }

    if (user.status === 'INACTIVE') {
      throw AppError.forbidden(MESSAGES.ACCOUNT_INACTIVE);
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : MESSAGES.TOKEN_INVALID;
    next(AppError.unauthorized(message));
  }
};

export const authorize = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorized());
      return;
    }

    const hasRole = roles.includes(req.user.role);

    if (!hasRole) {
      next(AppError.forbidden());
      return;
    }

    next();
  };
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = verifyAccessToken(token);

      const user = await prisma.user.findUnique({
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
  } catch {
    next();
  }
};

export const checkOwnership = (req: Request, _res: Response, next: NextFunction): void => {
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

  next(AppError.forbidden());
};
