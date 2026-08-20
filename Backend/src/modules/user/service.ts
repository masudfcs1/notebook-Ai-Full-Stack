import { userRepository } from './repository';
import { notificationService } from '../notification/service';
import { NotificationType } from '@prisma/client';
import { hashPassword } from '@/utils/password';

import { generateUUID } from '@/utils/generators';
import { MESSAGES } from '@/constants';
import { AppError } from '@/helpers/error.helper';
import { Role, UserStatus } from '@prisma/client';
import { toUserResponse, toUserListResponse } from './dto';
import { logger } from '@/logger';

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
    const existingUser = await userRepository.findByEmail(data.email);

    if (existingUser) {
      throw AppError.conflict(MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    if (data.username) {
      const existingUsername = await userRepository.findByUsername(data.username);
      if (existingUsername) {
        throw AppError.conflict(MESSAGES.USERNAME_ALREADY_EXISTS);
      }
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await userRepository.create({
      name: data.name,
      username: data.username || generateUUID().split('-')[0],
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      role: data.role,
      status: data.status,
    });

    logger.info({ userId: user.id, email: user.email }, 'User created by admin');

    try {
      await notificationService.create({
        type: NotificationType.USER_CREATED,
        title: 'User Created',
        message: `User ${user.name || user.username || user.email} was created with role ${user.role}.`,
        data: {
          userId: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (notifErr) {
      logger.error({ notifErr }, 'Failed to emit USER_CREATED notification in userService.create');
    }

    return toUserResponse(user);

  }

  async update(
    id: number,
    data: { name?: string; username?: string; email?: string; phone?: string }
  ) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw AppError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    if (data.username && data.username !== user.username) {
      const existingUsername = await userRepository.findByUsername(data.username);
      if (existingUsername) {
        throw AppError.conflict(MESSAGES.USERNAME_ALREADY_EXISTS);
      }
    }

    if (data.email && data.email !== user.email) {
      const existingEmail = await userRepository.findByEmail(data.email);
      if (existingEmail) {
        throw AppError.conflict(MESSAGES.EMAIL_ALREADY_EXISTS);
      }
    }

    const updatedUser = await userRepository.update(id, data);

    logger.info({ userId: id }, 'User updated by admin');

    return toUserResponse(updatedUser);
  }

  async delete(id: number) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw AppError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    await userRepository.softDelete(id);

    logger.info({ userId: id }, 'User deleted by admin');

    return { message: MESSAGES.USER_DELETED };
  }

  async updateStatus(userId: number, status: UserStatus) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw AppError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    const updatedUser = await userRepository.updateStatus(userId, status);

    logger.info({ userId, status }, 'User status updated');

    return toUserResponse(updatedUser);
  }

  async updateRole(userId: number, role: Role) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw AppError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    const previousRole = user.role;
    const updatedUser = await userRepository.updateRole(userId, role);

    logger.info({ userId, role, previousRole }, 'User role updated');

    try {
      await notificationService.create({
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
      });
    } catch (notifErr) {
      logger.error({ notifErr }, 'Failed to emit ROLE_UPDATED notification');
    }

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
}

export const userService = new UserService();
