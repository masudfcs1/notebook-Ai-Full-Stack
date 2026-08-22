"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceRepository = exports.WorkspaceRepository = void 0;
const database_1 = require("../../database");
const pagination_1 = require("../../utils/pagination");
class WorkspaceRepository {
    async create(data) {
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
                                        name: 'Workspace Owner',
                                        email: '',
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
                        members: true,
                    },
                },
            },
        });
    }
    async findById(id) {
        return database_1.prisma.workspace.findUnique({
            where: { id },
            include: {
                teams: {
                    include: {
                        members: true,
                    },
                },
                notes: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }
    async findBySlug(slug) {
        return database_1.prisma.workspace.findUnique({
            where: { slug },
            include: {
                teams: {
                    include: {
                        members: true,
                    },
                },
                notes: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }
    async findAll(options) {
        const { page, limit, skip } = (0, pagination_1.calculatePagination)(options);
        const { search, sortBy = 'createdAt', sortOrder = 'desc', userId, isAdmin } = options;
        const searchQuery = search
            ? (0, pagination_1.buildSearchQuery)(search, ['name', 'slug', 'description'])
            : undefined;
        const where = {
            ...(!isAdmin && userId ? { userId } : {}),
            ...(searchQuery ? { OR: searchQuery.OR } : {}),
        };
        const [data, total] = await Promise.all([
            database_1.prisma.workspace.findMany({
                where,
                skip,
                take: limit,
                orderBy: (0, pagination_1.buildSortQuery)({ sortBy, sortOrder }) || { [sortBy]: sortOrder },
                include: {
                    teams: {
                        include: {
                            members: true,
                        },
                    },
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
    async findAllUserWorkspaces(userId, isAdmin) {
        const where = {
            ...(!isAdmin && userId ? { userId } : {}),
        };
        return database_1.prisma.workspace.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                teams: {
                    include: {
                        members: true,
                    },
                },
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