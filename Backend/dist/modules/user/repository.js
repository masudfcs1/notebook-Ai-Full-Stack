"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const database_1 = require("../../database");
class UserRepository {
    async findAll(options) {
        const { page, limit, search, role, status, sortBy, sortOrder } = options;
        const safePage = Math.max(1, page);
        const safeLimit = Math.min(Math.max(1, limit), 100);
        const allowedSortFields = ['id', 'createdAt', 'name', 'email', 'role', 'status', 'lastLogin'];
        const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
        const orderBy = safeSortBy === 'id' ? { id: sortOrder } : [{ [safeSortBy]: sortOrder }, { id: sortOrder }];
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
        const [rawUsers, total] = await Promise.all([
            database_1.prisma.user.findMany({
                where,
                skip: (safePage - 1) * safeLimit,
                take: safeLimit,
                orderBy,
                include: {
                    workspaces: {
                        select: {
                            id: true,
                            teams: {
                                select: {
                                    id: true,
                                },
                            },
                        },
                    },
                    memberships: {
                        select: {
                            team: {
                                select: {
                                    id: true,
                                    workspaceId: true,
                                },
                            },
                        },
                    },
                },
            }),
            database_1.prisma.user.count({ where }),
        ]);
        const data = rawUsers.map((user) => {
            const workspaceMap = new Map();
            if (user.workspaces) {
                for (const ws of user.workspaces) {
                    if (!workspaceMap.has(ws.id)) {
                        workspaceMap.set(ws.id, new Set());
                    }
                    if (ws.teams) {
                        for (const team of ws.teams) {
                            workspaceMap.get(ws.id).add(team.id);
                        }
                    }
                }
            }
            if (user.memberships) {
                for (const mem of user.memberships) {
                    if (mem.team && mem.team.workspaceId) {
                        const wsId = mem.team.workspaceId;
                        if (!workspaceMap.has(wsId)) {
                            workspaceMap.set(wsId, new Set());
                        }
                        workspaceMap.get(wsId).add(mem.team.id);
                    }
                }
            }
            const workspaceCount = workspaceMap.size;
            const teamCount = Array.from(workspaceMap.values()).reduce((acc, teamSet) => acc + teamSet.size, 0);
            const { workspaces, memberships, ...userWithoutRelations } = user;
            return {
                ...userWithoutRelations,
                workspaceCount,
                teamCount,
            };
        });
        const totalPages = Math.ceil(total / safeLimit);
        return {
            data,
            meta: {
                page: safePage,
                limit: safeLimit,
                total,
                totalPages,
                hasNext: safePage < totalPages,
                hasPrev: safePage > 1,
            },
        };
    }
    async findById(id) {
        const user = await database_1.prisma.user.findUnique({
            where: { id, deletedAt: null },
            include: {
                workspaces: {
                    include: {
                        teams: {
                            include: {
                                members: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        avatar: true,
                                        role: true,
                                        userId: true,
                                        createdAt: true,
                                    },
                                },
                            },
                        },
                    },
                },
                memberships: {
                    include: {
                        team: {
                            include: {
                                workspace: true,
                                members: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        avatar: true,
                                        role: true,
                                        userId: true,
                                        createdAt: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!user)
            return null;
        const workspaceMap = new Map();
        // 1. Process owned workspaces
        for (const ws of user.workspaces) {
            workspaceMap.set(ws.id, {
                id: ws.id,
                name: ws.name,
                slug: ws.slug,
                icon: ws.icon,
                description: ws.description,
                userId: ws.userId,
                isOwner: true,
                createdAt: ws.createdAt,
                updatedAt: ws.updatedAt,
                teams: ws.teams.map((t) => ({
                    id: t.id,
                    workspaceId: t.workspaceId,
                    name: t.name,
                    key: t.key,
                    icon: t.icon,
                    createdAt: t.createdAt,
                    updatedAt: t.updatedAt,
                    members: t.members,
                })),
            });
        }
        // 2. Process workspaces from team memberships
        for (const mem of user.memberships) {
            if (mem.team && mem.team.workspace) {
                const ws = mem.team.workspace;
                if (!workspaceMap.has(ws.id)) {
                    workspaceMap.set(ws.id, {
                        id: ws.id,
                        name: ws.name,
                        slug: ws.slug,
                        icon: ws.icon,
                        description: ws.description,
                        userId: ws.userId,
                        isOwner: ws.userId === id,
                        createdAt: ws.createdAt,
                        updatedAt: ws.updatedAt,
                        teams: [
                            {
                                id: mem.team.id,
                                workspaceId: mem.team.workspaceId,
                                name: mem.team.name,
                                key: mem.team.key,
                                icon: mem.team.icon,
                                createdAt: mem.team.createdAt,
                                updatedAt: mem.team.updatedAt,
                                members: mem.team.members,
                            },
                        ],
                    });
                }
                else {
                    const existing = workspaceMap.get(ws.id);
                    const teamExists = existing.teams.some((t) => t.id === mem.team.id);
                    if (!teamExists) {
                        existing.teams.push({
                            id: mem.team.id,
                            workspaceId: mem.team.workspaceId,
                            name: mem.team.name,
                            key: mem.team.key,
                            icon: mem.team.icon,
                            createdAt: mem.team.createdAt,
                            updatedAt: mem.team.updatedAt,
                            members: mem.team.members,
                        });
                    }
                }
            }
        }
        const formattedWorkspaces = Array.from(workspaceMap.values());
        const workspaceCount = formattedWorkspaces.length;
        const teamCount = formattedWorkspaces.reduce((acc, ws) => acc + (ws.teams?.length || 0), 0);
        return {
            ...user,
            workspaces: formattedWorkspaces,
            workspaceCount,
            teamCount,
        };
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