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
const auth_middleware_1 = require("../../middlewares/auth.middleware");
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
        const hashedPassword = await (0, password_1.hashPassword)(data.password);
        let user;
        try {
            user = await repository_1.userRepository.create({
                name: data.name,
                username: data.username || (0, generators_1.generateUUID)().split('-')[0],
                email: data.email,
                password: hashedPassword,
                phone: data.phone,
                role: data.role,
                status: data.status,
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                const target = String(error.meta?.target || '');
                if (target.includes('email'))
                    throw error_helper_1.AppError.conflict(constants_1.MESSAGES.EMAIL_ALREADY_EXISTS);
                if (target.includes('username'))
                    throw error_helper_1.AppError.conflict(constants_1.MESSAGES.USERNAME_ALREADY_EXISTS);
                throw error_helper_1.AppError.conflict('Email or username already exists');
            }
            throw error;
        }
        logger_1.logger.info({ userId: user.id, email: user.email }, 'User created by admin');
        service_1.notificationService
            .create({
            type: client_1.NotificationType.USER_CREATED,
            title: 'User Created',
            message: `User ${user.name || user.username || user.email} was created with role ${user.role}.`,
            data: {
                userId: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        })
            .catch((notifErr) => logger_1.logger.error({ notifErr }, 'Failed to emit USER_CREATED notification in userService.create'));
        return (0, dto_1.toUserResponse)(user);
    }
    async update(id, data) {
        let updatedUser;
        try {
            updatedUser = await repository_1.userRepository.update(id, data);
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw error_helper_1.AppError.notFound(constants_1.MESSAGES.USER_NOT_FOUND);
            }
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                const target = String(error.meta?.target || '');
                if (target.includes('email'))
                    throw error_helper_1.AppError.conflict(constants_1.MESSAGES.EMAIL_ALREADY_EXISTS);
                if (target.includes('username'))
                    throw error_helper_1.AppError.conflict(constants_1.MESSAGES.USERNAME_ALREADY_EXISTS);
                throw error_helper_1.AppError.conflict('Email or username already exists');
            }
            throw error;
        }
        (0, auth_middleware_1.invalidateUserCache)(id);
        logger_1.logger.info({ userId: id }, 'User updated by admin');
        return (0, dto_1.toUserResponse)(updatedUser);
    }
    async delete(id) {
        await repository_1.userRepository.softDelete(id);
        (0, auth_middleware_1.invalidateUserCache)(id);
        logger_1.logger.info({ userId: id }, 'User deleted by admin');
        return { message: constants_1.MESSAGES.USER_DELETED };
    }
    async updateStatus(userId, status) {
        const updatedUser = await repository_1.userRepository.updateStatus(userId, status);
        (0, auth_middleware_1.invalidateUserCache)(userId);
        logger_1.logger.info({ userId, status }, 'User status updated');
        return (0, dto_1.toUserResponse)(updatedUser);
    }
    async updateRole(userId, role) {
        const user = await repository_1.userRepository.findBasicById(userId);
        if (!user) {
            throw error_helper_1.AppError.notFound(constants_1.MESSAGES.USER_NOT_FOUND);
        }
        const previousRole = user.role;
        const updatedUser = await repository_1.userRepository.updateRole(userId, role);
        (0, auth_middleware_1.invalidateUserCache)(userId);
        logger_1.logger.info({ userId, role, previousRole }, 'User role updated');
        service_1.notificationService
            .create({
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
        })
            .catch((notifErr) => logger_1.logger.error({ notifErr }, 'Failed to emit ROLE_UPDATED notification'));
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
    async getLoginHistory(options) {
        const [result, stats] = await Promise.all([
            repository_1.userRepository.getLoginHistory(options),
            repository_1.userRepository.getLoginStats(options.userId),
        ]);
        return {
            data: result.data,
            stats,
            meta: result.meta,
        };
    }
    async getUserLoginHistory(userId, options) {
        const user = await repository_1.userRepository.findBasicById(userId);
        if (!user) {
            throw error_helper_1.AppError.notFound(constants_1.MESSAGES.USER_NOT_FOUND);
        }
        const [result, stats] = await Promise.all([
            repository_1.userRepository.getLoginHistory({ ...options, userId }),
            repository_1.userRepository.getLoginStats(userId),
        ]);
        return {
            data: result.data,
            stats,
            meta: result.meta,
        };
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
//# sourceMappingURL=service.js.map