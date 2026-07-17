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

export const checkOwnership = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
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
