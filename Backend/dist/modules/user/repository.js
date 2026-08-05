"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const database_1 = require("../../database");
class UserRepository {
    async findAll(options) {
        const { page, limit, search, role, status, sortBy, sortOrder } = options;
        const where = {
            deletedAt: null,
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { username: { contains: search, mode: 'insensitive' } },
                ],
            }),
            ...(role && { role }),
            ...(status && { status }),
        };
        const [data, total] = await Promise.all([
            database_1.prisma.user.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            }),
            database_1.prisma.user.count({ where }),
        ]);
        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1,
            },
        };
    }
    async findById(id) {
        return database_1.prisma.user.findUnique({
            where: { id, deletedAt: null },
        });
    }
    async findByUuid(uuid) {
        return database_1.prisma.user.findUnique({
            where: { uuid, deletedAt: null },
        });
    }
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
    async count(query) {
        return database_1.prisma.user.count({
            where: query,
        });
    }
    async getStats() {
        const [totalUsers, activeUsers, pendingUsers, suspendedUsers, inactiveUsers, superAdminCount, adminCount, managerCount, employeeCount, userCount, recentUsers,] = await Promise.all([
            database_1.prisma.user.count({ where: { deletedAt: null } }),
            database_1.prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null } }),
            database_1.prisma.user.count({ where: { status: 'PENDING', deletedAt: null } }),
            database_1.prisma.user.count({ where: { status: 'SUSPENDED', deletedAt: null } }),
            database_1.prisma.user.count({ where: { status: 'INACTIVE', deletedAt: null } }),
            database_1.prisma.user.count({ where: { role: 'SUPER_ADMIN', deletedAt: null } }),
            database_1.prisma.user.count({ where: { role: 'ADMIN', deletedAt: null } }),
            database_1.prisma.user.count({ where: { role: 'MANAGER', deletedAt: null } }),
            database_1.prisma.user.count({ where: { role: 'EMPLOYEE', deletedAt: null } }),
            database_1.prisma.user.count({ where: { role: 'USER', deletedAt: null } }),
            database_1.prisma.user.findMany({
                where: { deletedAt: null },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),
        ]);
        return {
            totalUsers,
            activeUsers,
            pendingUsers,
            suspendedUsers,
            inactiveUsers,
            usersByRole: {
                SUPER_ADMIN: superAdminCount,
                ADMIN: adminCount,
                MANAGER: managerCount,
                EMPLOYEE: employeeCount,
                USER: userCount,
            },
            recentUsers,
        };
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
//# sourceMappingURL=repository.js.map