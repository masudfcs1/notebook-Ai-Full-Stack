"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const repository_1 = require("./repository");
const service_1 = require("../notification/service");
const client_1 = require("@prisma/client");
const password_1 = require("../../utils/password");
const generators_1 = require("../../utils/generators");
const constants_1 = require("../../constants");
const error_helper_1 = require("../../helpers/error.helper");
const dto_1 = require("./dto");
const logger_1 = require("../../logger");
class UserService {
    async findAll(options) {
        const result = await repository_1.userRepository.findAll(options);
        return {
            data: (0, dto_1.toUserListResponse)(result.data),
            meta: result.meta,
        };
    }
    async findById(id) {
        const user = await repository_1.userRepository.findById(id);
        if (!user) {
            throw error_helper_1.AppError.notFound(constants_1.MESSAGES.USER_NOT_FOUND);
        }
        return (0, dto_1.toUserResponse)(user);
    }
    async findByUuid(uuid) {
        const user = await repository_1.userRepository.findByUuid(uuid);
        if (!user) {
            throw error_helper_1.AppError.notFound(constants_1.MESSAGES.USER_NOT_FOUND);
        }
        return (0, dto_1.toUserResponse)(user);
    }
    async create(data) {
        const existingUser = await repository_1.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw error_helper_1.AppError.conflict(constants_1.MESSAGES.EMAIL_ALREADY_EXISTS);
        }
        if (data.username) {
            const existingUsername = await repository_1.userRepository.findByUsername(data.username);
            if (existingUsername) {
                throw error_helper_1.AppError.conflict(constants_1.MESSAGES.USERNAME_ALREADY_EXISTS);
            }
        }
        const hashedPassword = await (0, password_1.hashPassword)(data.password);
        const user = await repository_1.userRepository.create({
            name: data.name,
            username: data.username || (0, generators_1.generateUUID)().split('-')[0],
            email: data.email,
            password: hashedPassword,
            phone: data.phone,
            role: data.role,
            status: data.status,
        });
        logger_1.logger.info({ userId: user.id, email: user.email }, 'User created by admin');
        try {
            await service_1.notificationService.create({
                type: client_1.NotificationType.USER_CREATED,
                title: 'User Created',
                message: `User ${user.name || user.username || user.email} was created with role ${user.role}.`,
                data: {
                    userId: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        }
        catch (notifErr) {
            logger_1.logger.error({ notifErr }, 'Failed to emit USER_CREATED notification in userService.create');
        }
        return (0, dto_1.toUserResponse)(user);
    }
    async update(id, data) {
        const user = await repository_1.userRepository.findById(id);
        if (!user) {
            throw error_helper_1.AppError.notFound(constants_1.MESSAGES.USER_NOT_FOUND);
        }
        if (data.username && data.username !== user.username) {
            const existingUsername = await repository_1.userRepository.findByUsername(data.username);
            if (existingUsername) {
                throw error_helper_1.AppError.conflict(constants_1.MESSAGES.USERNAME_ALREADY_EXISTS);
            }
        }
        if (data.email && data.email !== user.email) {
            const existingEmail = await repository_1.userRepository.findByEmail(data.email);
            if (existingEmail) {
                throw error_helper_1.AppError.conflict(constants_1.MESSAGES.EMAIL_ALREADY_EXISTS);
            }
        }
        const updatedUser = await repository_1.userRepository.update(id, data);
        logger_1.logger.info({ userId: id }, 'User updated by admin');
        return (0, dto_1.toUserResponse)(updatedUser);
    }
    async delete(id) {
        const user = await repository_1.userRepository.findById(id);
        if (!user) {
            throw error_helper_1.AppError.notFound(constants_1.MESSAGES.USER_NOT_FOUND);
        }
        await repository_1.userRepository.softDelete(id);
        logger_1.logger.info({ userId: id }, 'User deleted by admin');
        return { message: constants_1.MESSAGES.USER_DELETED };
    }
    async updateStatus(userId, status) {
        const user = await repository_1.userRepository.findById(userId);
        if (!user) {
            throw error_helper_1.AppError.notFound(constants_1.MESSAGES.USER_NOT_FOUND);
        }
        const updatedUser = await repository_1.userRepository.updateStatus(userId, status);
        logger_1.logger.info({ userId, status }, 'User status updated');
        return (0, dto_1.toUserResponse)(updatedUser);
    }
    async updateRole(userId, role) {
        const user = await repository_1.userRepository.findById(userId);
        if (!user) {
            throw error_helper_1.AppError.notFound(constants_1.MESSAGES.USER_NOT_FOUND);
        }
        const previousRole = user.role;
        const updatedUser = await repository_1.userRepository.updateRole(userId, role);
        logger_1.logger.info({ userId, role, previousRole }, 'User role updated');
        try {
            await service_1.notificationService.create({
                type: client_1.NotificationType.ROLE_UPDATED,
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
        }
        catch (notifErr) {
            logger_1.logger.error({ notifErr }, 'Failed to emit ROLE_UPDATED notification');
        }
        return (0, dto_1.toUserResponse)(updatedUser);
    }
    async getStats() {
        const stats = await repository_1.userRepository.getStats();
        return {
            totalUsers: stats.totalUsers,
            activeUsers: stats.activeUsers,
            pendingUsers: stats.pendingUsers,
            suspendedUsers: stats.suspendedUsers,
            inactiveUsers: stats.inactiveUsers,
            usersByRole: stats.usersByRole,
            recentUsers: (0, dto_1.toUserListResponse)(stats.recentUsers),
        };
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
//# sourceMappingURL=service.js.map