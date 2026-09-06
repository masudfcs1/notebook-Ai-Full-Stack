"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceRepository = exports.WorkspaceRepository = void 0;
const database_1 = require("../../database");
const pagination_1 = require("../../utils/pagination");
class WorkspaceRepository {
    async create(data) {
        let ownerName = 'Workspace Owner';
        let ownerEmail = '';
        let ownerAvatar = null;
        if (data.userId) {
            try {
                const user = await database_1.prisma.user.findUnique({
                    where: { id: data.userId },
                    select: { name: true, email: true, avatar: true },
                });
                if (user) {
                    ownerName = user.name || user.email.split('@')[0] || 'Workspace Owner';
                    ownerEmail = user.email;
                    ownerAvatar = user.avatar;
                }
            }
            catch { }
        }
        return database_1.prisma.workspace.create({
            data: {
                name: data.name,
                slug: data.slug ||
                    data.name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, ''),
                icon: data.icon || '⚡',
                description: data.description,
                userId: data.userId,
                teams: {
                    create: [
                        {
                            name: 'General',
                            key: 'GEN',
                            icon: '🌐',
                            members: {
                                create: [
                                    {
                                        userId: data.userId,
                                        name: ownerName,
                                        email: ownerEmail,
                                        avatar: ownerAvatar,
                                        role: 'OWNER',
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
            include: {
                teams: {
                    include: {
                        members: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        uuid: true,
                                        name: true,
                                        username: true,
                                        email: true,
                                        avatar: true,
                                        role: true,
                                        status: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }
    getTeamsInclude(userId, isAdmin, userEmail) {
        const teamWhere = !isAdmin && userId
            ? {
                OR: [
                    { workspace: { userId } },
                    {
                        members: {
                            some: {
                                OR: [
                                    { userId },
                                    ...(userEmail
                                        ? [{ email: { equals: userEmail, mode: 'insensitive' } }]
                                        : []),
                                ],
                            },
                        },
                    },
                ],
            }
            : undefined;
        return {
            where: teamWhere,
            orderBy: { createdAt: 'asc' },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                uuid: true,
                                name: true,
                                username: true,
                                email: true,
                                avatar: true,
                                role: true,
                                status: true,
                            },
                        },
                    },
                },
            },
        };
    }
    async findById(id, userId, isAdmin, userEmail) {
        return database_1.prisma.workspace.findUnique({
            where: { id },
            include: {
                teams: this.getTeamsInclude(userId, isAdmin, userEmail),
                notes: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }
    async findBySlug(slug, userId, isAdmin, userEmail) {
        return database_1.prisma.workspace.findUnique({
            where: { slug },
            include: {
                teams: this.getTeamsInclude(userId, isAdmin, userEmail),
                notes: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }
    async findAll(options) {
        const { page, limit, skip } = (0, pagination_1.calculatePagination)(options);
        const { search, sortBy = 'createdAt', sortOrder = 'desc', userId, userEmail, isAdmin, } = options;
        const searchQuery = search
            ? (0, pagination_1.buildSearchQuery)(search, ['name', 'slug', 'description'])
            : undefined;
        const accessFilter = !isAdmin && userId
            ? {
                OR: [
                    { userId },
                    {
                        teams: {
                            some: {
                                members: {
                                    some: {
                                        OR: [
                                            { userId },
                                            ...(userEmail
                                                ? [{ email: { equals: userEmail, mode: 'insensitive' } }]
                                                : []),
                                        ],
                                    },
                                },
                            },
                        },
                    },
                ],
            }
            : {};
        const where = {
            ...accessFilter,
            ...(searchQuery ? { AND: searchQuery } : {}),
        };
        const [data, total] = await Promise.all([
            database_1.prisma.workspace.findMany({
                where,
                skip,
                take: limit,
                orderBy: (0, pagination_1.buildSortQuery)({ sortBy, sortOrder }) || { [sortBy]: sortOrder },
                include: {
                    teams: this.getTeamsInclude(userId, isAdmin, userEmail),
                },
            }),
            database_1.prisma.workspace.count({ where }),
        ]);
        const meta = (0, pagination_1.calculateMeta)(page, limit, total);
        return {
            data,
            meta,
        };
    }
    async findAllUserWorkspaces(userId, isAdmin, userEmail) {
        const where = !isAdmin && userId
            ? {
                OR: [
                    { userId },
                    {
                        teams: {
                            some: {
                                members: {
                                    some: {
                                        OR: [
                                            { userId },
                                            ...(userEmail
                                                ? [{ email: { equals: userEmail, mode: 'insensitive' } }]
                                                : []),
                                        ],
                                    },
                                },
                            },
                        },
                    },
                ],
            }
            : {};
        return database_1.prisma.workspace.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                teams: this.getTeamsInclude(userId, isAdmin, userEmail),
            },
        });
    }
    async update(id, data) {
        return database_1.prisma.workspace.update({
            where: { id },
            data,
            include: {
                teams: {
                    include: {
                        members: true,
                    },
                },
            },
        });
    }
    async delete(id) {
        return database_1.prisma.workspace.delete({
            where: { id },
        });
    }
}
exports.WorkspaceRepository = WorkspaceRepository;
exports.workspaceRepository = new WorkspaceRepository();
//# sourceMappingURL=repository.js.map