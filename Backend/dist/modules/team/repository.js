"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamRepository = exports.TeamRepository = void 0;
const database_1 = require("../../database");
class TeamRepository {
    async create(data) {
        let ownerName = 'Team Owner';
        let ownerEmail = '';
        let ownerAvatar = undefined;
        if (data.userId) {
            const user = await database_1.prisma.user.findUnique({
                where: { id: data.userId },
                select: { name: true, email: true, avatar: true },
            });
            if (user) {
                ownerName = user.name || user.email.split('@')[0] || 'Team Owner';
                ownerEmail = user.email;
                ownerAvatar = user.avatar || undefined;
            }
        }
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
                                name: ownerName,
                                email: ownerEmail,
                                avatar: ownerAvatar,
                                role: 'OWNER',
                            },
                        ],
                    }
                    : undefined,
            },
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
        });
    }
    async findById(id) {
        return database_1.prisma.team.findUnique({
            where: { id },
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
                workspace: true,
            },
        });
    }
    async findByWorkspaceId(workspaceId) {
        return database_1.prisma.team.findMany({
            where: { workspaceId },
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
        });
    }
    async delete(id) {
        return database_1.prisma.team.delete({
            where: { id },
        });
    }
    /* ---------- Team Member Methods ---------- */
    async getMembers(teamId) {
        return database_1.prisma.teamMember.findMany({
            where: { teamId },
            orderBy: [{ createdAt: 'asc' }],
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
        });
    }
    async findMemberById(memberId) {
        return database_1.prisma.teamMember.findUnique({
            where: { id: memberId },
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
                team: true,
            },
        });
    }
    async findMemberByTeamAndEmailOrUserId(teamId, email, userId) {
        const conditions = [{ email: { equals: email, mode: 'insensitive' } }];
        if (userId) {
            conditions.push({ userId });
        }
        return database_1.prisma.teamMember.findFirst({
            where: {
                teamId,
                OR: conditions,
            },
            include: {
                user: true,
            },
        });
    }
    async addMember(teamId, data) {
        return database_1.prisma.teamMember.create({
            data: {
                teamId,
                userId: data.userId,
                name: data.name,
                email: data.email,
                avatar: data.avatar,
                role: data.role || 'MEMBER',
            },
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
        });
    }
    async addMembersBulk(teamId, membersData) {
        const created = await database_1.prisma.$transaction(membersData.map((data) => database_1.prisma.teamMember.create({
            data: {
                teamId,
                userId: data.userId,
                name: data.name,
                email: data.email,
                avatar: data.avatar,
                role: data.role || 'MEMBER',
            },
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
        })));
        return created;
    }
    async updateMember(memberId, data) {
        const updatePayload = {};
        if (data.name !== undefined)
            updatePayload.name = data.name;
        if (data.email !== undefined)
            updatePayload.email = data.email;
        if (data.role !== undefined)
            updatePayload.role = data.role;
        if (data.avatar !== undefined)
            updatePayload.avatar = data.avatar;
        return database_1.prisma.teamMember.update({
            where: { id: memberId },
            data: updatePayload,
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
        });
    }
    async deleteMember(memberId) {
        return database_1.prisma.teamMember.delete({
            where: { id: memberId },
        });
    }
    async searchAvailableUsers(teamId, search) {
        const existingMembers = await database_1.prisma.teamMember.findMany({
            where: { teamId },
            select: { userId: true, email: true },
        });
        const existingUserIds = existingMembers
            .map((m) => m.userId)
            .filter((id) => typeof id === 'number');
        const existingEmails = existingMembers.map((m) => m.email.toLowerCase()).filter(Boolean);
        const where = {
            status: { not: 'DELETED' },
        };
        if (existingUserIds.length > 0) {
            where.id = { notIn: existingUserIds };
        }
        if (existingEmails.length > 0) {
            where.email = { notIn: existingEmails };
        }
        if (search && search.trim()) {
            const q = search.trim();
            where.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
                { username: { contains: q, mode: 'insensitive' } },
            ];
        }
        return database_1.prisma.user.findMany({
            where,
            take: 20,
            orderBy: { createdAt: 'desc' },
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
        });
    }
}
exports.TeamRepository = TeamRepository;
exports.teamRepository = new TeamRepository();
//# sourceMappingURL=repository.js.map