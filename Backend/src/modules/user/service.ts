import { userRepository } from './repository';
import { notificationService } from '../notification/service';
import { NotificationType, Prisma, Role, UserStatus } from '@prisma/client';
import { hashPassword } from '@/utils/password';

import { generateUUID } from '@/utils/generators';
import { MESSAGES } from '@/constants';
import { AppError } from '@/helpers/error.helper';
import { toUserResponse, toUserListResponse } from './dto';
import { logger } from '@/logger';
import { invalidateUserCache } from '@/middlewares/auth.middleware';

export class UserService {
  async findAll(options: {
    page: number;
    limit: number;
    search?: string;
    role?: Role;
    status?: UserStatus;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    const result = await userRepository.findAll(options);

    return {
      data: toUserListResponse(result.data),
      meta: result.meta,
    };
  }

  async findById(id: number) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw AppError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    return toUserResponse(user);
  }

  async findByUuid(uuid: string) {
    const user = await userRepository.findByUuid(uuid);

    if (!user) {
      throw AppError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    return toUserResponse(user);
  }

  async create(data: {
    name?: string;
    username?: string;
    email: string;
    password: string;
    phone?: string;
    role?: Role;
    status?: UserStatus;
  }) {
    const hashedPassword = await hashPassword(data.password);
    let user;

    try {
      user = await userRepository.create({
        name: data.name,
        username: data.username || generateUUID().split('-')[0],
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        role: data.role,
        status: data.status,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = String(error.meta?.target || '');
        if (target.includes('email')) throw AppError.conflict(MESSAGES.EMAIL_ALREADY_EXISTS);
        if (target.includes('username')) throw AppError.conflict(MESSAGES.USERNAME_ALREADY_EXISTS);
        throw AppError.conflict('Email or username already exists');
      }
      throw error;
    }

    logger.info({ userId: user.id, email: user.email }, 'User created by admin');

    notificationService
      .create({
        type: NotificationType.USER_CREATED,
        title: 'User Created',
        message: `User ${user.name || user.username || user.email} was created with role ${user.role}.`,
        data: {
          userId: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      })
      .catch((notifErr) =>
        logger.error({ notifErr }, 'Failed to emit USER_CREATED notification in userService.create')
      );

    return toUserResponse(user);
  }

  async update(
    id: number,
    data: { name?: string; username?: string; email?: string; phone?: string }
  ) {
    let updatedUser;
    try {
      updatedUser = await userRepository.update(id, data);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw AppError.notFound(MESSAGES.USER_NOT_FOUND);
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = String(error.meta?.target || '');
        if (target.includes('email')) throw AppError.conflict(MESSAGES.EMAIL_ALREADY_EXISTS);
        if (target.includes('username')) throw AppError.conflict(MESSAGES.USERNAME_ALREADY_EXISTS);
        throw AppError.conflict('Email or username already exists');
      }
      throw error;
    }
    invalidateUserCache(id);

    logger.info({ userId: id }, 'User updated by admin');

    return toUserResponse(updatedUser);
  }

  async delete(id: number) {
    await userRepository.softDelete(id);
    invalidateUserCache(id);

    logger.info({ userId: id }, 'User deleted by admin');

    return { message: MESSAGES.USER_DELETED };
  }

  async updateStatus(userId: number, status: UserStatus) {
    const updatedUser = await userRepository.updateStatus(userId, status);
    invalidateUserCache(userId);

    logger.info({ userId, status }, 'User status updated');

    return toUserResponse(updatedUser);
  }

  async updateRole(userId: number, role: Role) {
    const user = await userRepository.findBasicById(userId);

    if (!user) {
      throw AppError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    const previousRole = user.role;
    const updatedUser = await userRepository.updateRole(userId, role);
    invalidateUserCache(userId);

    logger.info({ userId, role, previousRole }, 'User role updated');

    notificationService
      .create({
        type: NotificationType.ROLE_UPDATED,
        title: 'User Role Updated',
        message: `Role for ${updatedUser.name || updatedUser.username || updatedUser.email} was changed from ${previousRole} to ${role}.`,
        userId: updatedUser.id,
        data: {
          userId: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          previousRole,
          newRole: role,
        },
      })
      .catch((notifErr) => logger.error({ notifErr }, 'Failed to emit ROLE_UPDATED notification'));

    return toUserResponse(updatedUser);
  }

  async getStats() {
    const stats = await userRepository.getStats();

    return {
      totalUsers: stats.totalUsers,
      activeUsers: stats.activeUsers,
      pendingUsers: stats.pendingUsers,
      suspendedUsers: stats.suspendedUsers,
      inactiveUsers: stats.inactiveUsers,
      usersByRole: stats.usersByRole,
      recentUsers: toUserListResponse(stats.recentUsers),
    };
  }

  async getLoginHistory(options: {
    page: number;
    limit: number;
    search?: string;
    userId?: number;
    successful?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const [result, stats] = await Promise.all([
      userRepository.getLoginHistory(options),
      userRepository.getLoginStats(options.userId),
    ]);

    return {
      data: result.data,
      stats,
      meta: result.meta,
    };
  }

  async getUserLoginHistory(
    userId: number,
    options: {
      page: number;
      limit: number;
      search?: string;
      successful?: boolean;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const user = await userRepository.findBasicById(userId);
    if (!user) {
      throw AppError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    const [result, stats] = await Promise.all([
      userRepository.getLoginHistory({ ...options, userId }),
      userRepository.getLoginStats(userId),
    ]);

    return {
      data: result.data,
      stats,
      meta: result.meta,
    };
  }
}

export const userService = new UserService();
