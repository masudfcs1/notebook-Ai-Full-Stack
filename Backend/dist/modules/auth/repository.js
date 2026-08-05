"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRepository = exports.AuthRepository = void 0;
const database_1 = require("../../database");
class AuthRepository {
    async findByEmail(email) {
        return database_1.prisma.user.findUnique({
            where: { email },
        });
    }
    async findByUsername(username) {
        return database_1.prisma.user.findUnique({
            where: { username },
        });
    }
    async findByUuid(uuid) {
        return database_1.prisma.user.findUnique({
            where: { uuid },
        });
    }
    async findById(id) {
        return database_1.prisma.user.findUnique({
            where: { id },
        });
    }
    async create(data) {
        return database_1.prisma.user.create({
            data: {
                name: data.name,
                username: data.username,
                email: data.email,
                password: data.password,
                phone: data.phone,
                role: data.role || 'USER',
                status: data.status || 'PENDING',
                provider: data.provider || 'LOCAL',
                isVerified: data.isVerified || false,
            },
        });
    }
    async update(id, data) {
        return database_1.prisma.user.update({
            where: { id },
            data,
        });
    }
    async softDelete(id) {
        return database_1.prisma.user.update({
            where: { id },
            data: {
                status: 'DELETED',
                deletedAt: new Date(),
            },
        });
    }
    async hardDelete(id) {
        return database_1.prisma.user.delete({
            where: { id },
        });
    }
    async updateLastLogin(id) {
        const user = await database_1.prisma.user.findUnique({ where: { id } });
        return database_1.prisma.user.update({
            where: { id },
            data: {
                lastLogin: new Date(),
                loginCount: (user?.loginCount || 0) + 1,
            },
        });
    }
    async createRefreshToken(data) {
        return database_1.prisma.refreshToken.create({
            data,
        });
    }
    async findRefreshToken(token) {
        return database_1.prisma.refreshToken.findUnique({
            where: { token },
        });
    }
    async revokeRefreshToken(token) {
        return database_1.prisma.refreshToken.update({
            where: { token },
            data: { revoked: true },
        });
    }
    async revokeAllUserTokens(userId) {
        return database_1.prisma.refreshToken.updateMany({
            where: { userId, revoked: false },
            data: { revoked: true },
        });
    }
    async createLoginHistory(data) {
        return database_1.prisma.loginHistory.create({
            data,
        });
    }
    async getLoginHistory(userId, options) {
        return database_1.prisma.loginHistory.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: options?.take || 10,
            skip: options?.skip,
        });
    }
    async updatePassword(id, password) {
        return database_1.prisma.user.update({
            where: { id },
            data: { password },
        });
    }
    async verifyEmail(id) {
        return database_1.prisma.user.update({
            where: { id },
            data: { isVerified: true, status: 'ACTIVE' },
        });
    }
    async updateStatus(id, status) {
        return database_1.prisma.user.update({
            where: { id },
            data: { status },
        });
    }
    async updateRole(id, role) {
        return database_1.prisma.user.update({
            where: { id },
            data: { role },
        });
    }
    async updateProfile(id, data) {
        return database_1.prisma.user.update({
            where: { id },
            data,
        });
    }
}
exports.AuthRepository = AuthRepository;
exports.authRepository = new AuthRepository();
//# sourceMappingURL=repository.js.map