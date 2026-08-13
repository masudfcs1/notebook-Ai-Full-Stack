"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamRepository = exports.TeamRepository = void 0;
const database_1 = require("../../database");
class TeamRepository {
    async create(data) {
        return database_1.prisma.team.create({
            data: {
                workspaceId: data.workspaceId,
                name: data.name,
                key: data.key,
                icon: data.icon || '💬',
                members: data.userId
                    ? {
                        create: [
                            {
                                userId: data.userId,
                                name: 'Team Owner',
                                email: '',
                                role: 'OWNER',
                            },
                        ],
                    }
                    : undefined,
            },
            include: {
                members: true,
            },
        });
    }
    async findById(id) {
        return database_1.prisma.team.findUnique({
            where: { id },
            include: {
                members: true,
                workspace: true,
            },
        });
    }
    async findByWorkspaceId(workspaceId) {
        return database_1.prisma.team.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'asc' },
            include: {
                members: true,
            },
        });
    }
    async findAll(userId, isAdmin) {
        const where = {};
        if (!isAdmin && userId) {
            where.workspace = { userId };
        }
        return database_1.prisma.team.findMany({
            where,
            orderBy: { createdAt: 'asc' },
            include: {
                members: true,
            },
        });
    }
    async update(id, data) {
        const updatePayload = {};
        if (data.name !== undefined)
            updatePayload.name = data.name;
        if (data.key !== undefined)
            updatePayload.key = data.key;
        if (data.icon !== undefined)
            updatePayload.icon = data.icon;
        return database_1.prisma.team.update({
            where: { id },
            data: updatePayload,
            include: {
                members: true,
            },
        });
    }
    async delete(id) {
        return database_1.prisma.team.delete({
            where: { id },
        });
    }
}
exports.TeamRepository = TeamRepository;
exports.teamRepository = new TeamRepository();
//# sourceMappingURL=repository.js.map