"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamService = exports.TeamService = void 0;
const repository_1 = require("./repository");
const repository_2 = require("../workspace/repository");
const service_1 = require("../notification/service");
const client_1 = require("@prisma/client");
const error_helper_1 = require("../../helpers/error.helper");
const dto_1 = require("./dto");
const database_1 = require("../../database");
const logger_1 = require("../../logger");
class TeamService {
    async create(data) {
        const workspace = await repository_2.workspaceRepository.findSummaryById(data.workspaceId);
        if (!workspace) {
            throw error_helper_1.AppError.notFound('Workspace not found');
        }
        const key = data.key.toUpperCase();
        const team = await repository_1.teamRepository.create({
            ...data,
            key,
        });
        logger_1.logger.info(`Team created: ${team.name} (${team.id}) in workspace ${data.workspaceId}`);
        // Fire-and-forget: don't block response
        service_1.notificationService.create({
            type: client_1.NotificationType.TEAM_CREATED,
            title: 'New Team Created',
            message: `Team "${team.name}" (${team.key}) was created in workspace "${workspace.name}".`,
            data: {
                teamId: team.id,
                name: team.name,
                key: team.key,
                workspaceId: workspace.id,
                workspaceName: workspace.name,
            },
        }).catch((err) => logger_1.logger.error({ err }, 'Failed to emit TEAM_CREATED notification'));
        return (0, dto_1.toTeamResponse)(team);
    }
    async findByWorkspaceId(workspaceId, userId, isAdmin, userEmail) {
        const teams = await repository_1.teamRepository.findByWorkspaceId(workspaceId, userId, isAdmin, userEmail);
        return (0, dto_1.toTeamListResponse)(teams);
    }
    async findAll(userId, isAdmin, userEmail) {
        const teams = await repository_1.teamRepository.findAll(userId, isAdmin, userEmail);
        return (0, dto_1.toTeamListResponse)(teams);
    }
    async findById(id, userId, isAdmin, userEmail) {
        const team = await repository_1.teamRepository.findById(id);
        if (!team) {
            throw error_helper_1.AppError.notFound('Team not found');
        }
        if (!isAdmin && userId) {
            const isWorkspaceOwner = team.workspace?.userId === userId;
            const isMember = team.members?.some((m) => (m.userId && m.userId === userId) ||
                (userEmail && m.email && m.email.toLowerCase() === userEmail.toLowerCase()));
            if (!isWorkspaceOwner && !isMember) {
                throw error_helper_1.AppError.forbidden('You do not have access to this team');
            }
        }
        return (0, dto_1.toTeamResponse)(team);
    }
    async update(id, data) {
        const updated = await repository_1.teamRepository.update(id, {
            ...data,
            ...(data.key && { key: data.key.toUpperCase() }),
        });
        logger_1.logger.info(`Team updated: ${updated.id}`);
        return (0, dto_1.toTeamResponse)(updated);
    }
    async delete(id) {
        await repository_1.teamRepository.delete(id);
        logger_1.logger.info(`Team deleted: ${id}`);
        return { message: 'Team deleted successfully' };
    }
    /* ---------- Team Member Methods ---------- */
    async getMembers(teamId, userId, isAdmin, userEmail) {
        const team = await repository_1.teamRepository.findById(teamId);
        if (!team) {
            throw error_helper_1.AppError.notFound('Team not found');
        }
        if (!isAdmin && userId) {
            const isWorkspaceOwner = team.workspace?.userId === userId;
            const isMember = team.members?.some((m) => (m.userId && m.userId === userId) ||
                (userEmail && m.email && m.email.toLowerCase() === userEmail.toLowerCase()));
            if (!isWorkspaceOwner && !isMember) {
                throw error_helper_1.AppError.forbidden('You do not have access to this team');
            }
        }
        return (0, dto_1.toTeamMemberListResponse)(team.members);
    }
    async addMember(teamId, data, requestedByUserId) {
        const team = await repository_1.teamRepository.findById(teamId);
        if (!team) {
            throw error_helper_1.AppError.notFound('Team not found');
        }
        let resolvedUserId = data.userId;
        let resolvedName = data.name;
        let resolvedEmail = data.email.trim().toLowerCase();
        let resolvedAvatar = data.avatar;
        // Look up registered user if userId given or if email matches a platform user
        if (resolvedUserId) {
            const user = await database_1.prisma.user.findUnique({ where: { id: resolvedUserId } });
            if (user) {
                resolvedName = user.name || resolvedName;
                resolvedEmail = user.email.toLowerCase();
                resolvedAvatar = user.avatar || resolvedAvatar;
            }
        }
        else {
            const user = await database_1.prisma.user.findUnique({ where: { email: resolvedEmail } });
            if (user) {
                resolvedUserId = user.id;
                resolvedName = user.name || resolvedName;
                resolvedAvatar = user.avatar || resolvedAvatar;
            }
        }
        // Check duplicate
        const existing = await repository_1.teamRepository.findMemberByTeamAndEmailOrUserId(teamId, resolvedEmail, resolvedUserId);
        if (existing) {
            throw error_helper_1.AppError.conflict(`User "${resolvedEmail}" is already a member of this team`);
        }
        const member = await repository_1.teamRepository.addMember(teamId, {
            userId: resolvedUserId,
            name: resolvedName,
            email: resolvedEmail,
            avatar: resolvedAvatar,
            role: data.role || 'MEMBER',
        });
        logger_1.logger.info(`Member ${member.name} (${member.email}) added to team ${team.name} (${teamId})`);
        // Fire-and-forget notification
        if (resolvedUserId && resolvedUserId !== requestedByUserId) {
            service_1.notificationService.create({
                userId: resolvedUserId,
                type: client_1.NotificationType.SYSTEM,
                title: 'Added to Team',
                message: `You were added to team "${team.name}" as ${member.role}.`,
                data: { teamId: team.id, role: member.role },
            }).catch((err) => logger_1.logger.error({ err }, 'Failed to create add member notification'));
        }
        return (0, dto_1.toTeamMemberResponse)(member);
    }
    async addMembersBulk(teamId, membersData, requestedByUserId) {
        const team = await repository_1.teamRepository.findById(teamId);
        if (!team) {
            throw error_helper_1.AppError.notFound('Team not found');
        }
        const existingMembers = await repository_1.teamRepository.getMembers(teamId);
        const existingEmails = new Set(existingMembers.map((m) => m.email.toLowerCase()));
        const existingUserIds = new Set(existingMembers.map((m) => m.userId).filter((id) => typeof id === 'number'));
        // ─── Batch user lookups instead of sequential queries ───
        const userIdsToLookup = membersData
            .filter((m) => m.userId)
            .map((m) => m.userId);
        const emailsToLookup = membersData
            .filter((m) => !m.userId && m.email)
            .map((m) => m.email.trim().toLowerCase());
        const usersByIdMap = new Map();
        const usersByEmailMap = new Map();
        // Single batch query for userId lookups
        if (userIdsToLookup.length > 0) {
            const usersById = await database_1.prisma.user.findMany({
                where: { id: { in: userIdsToLookup } },
                select: { id: true, name: true, email: true, avatar: true },
            });
            usersById.forEach((u) => usersByIdMap.set(u.id, u));
        }
        // Single batch query for email lookups
        if (emailsToLookup.length > 0) {
            const usersByEmail = await database_1.prisma.user.findMany({
                where: { email: { in: emailsToLookup } },
                select: { id: true, name: true, email: true, avatar: true },
            });
            usersByEmail.forEach((u) => usersByEmailMap.set(u.email.toLowerCase(), u));
        }
        const resolvedList = [];
        const seenBatchEmails = new Set();
        for (const mem of membersData) {
            let resolvedUserId = mem.userId;
            let resolvedName = mem.name;
            let resolvedEmail = mem.email.trim().toLowerCase();
            let resolvedAvatar = mem.avatar;
            if (resolvedUserId) {
                const user = usersByIdMap.get(resolvedUserId);
                if (user) {
                    resolvedName = user.name || resolvedName;
                    resolvedEmail = user.email.toLowerCase();
                    resolvedAvatar = user.avatar || resolvedAvatar;
                }
            }
            else {
                const user = usersByEmailMap.get(resolvedEmail);
                if (user) {
                    resolvedUserId = user.id;
                    resolvedName = user.name || resolvedName;
                    resolvedAvatar = user.avatar || resolvedAvatar;
                }
            }
            // Check if already in team or already in this batch
            if (existingEmails.has(resolvedEmail) ||
                (resolvedUserId && existingUserIds.has(resolvedUserId)) ||
                seenBatchEmails.has(resolvedEmail)) {
                continue;
            }
            seenBatchEmails.add(resolvedEmail);
            resolvedList.push({
                userId: resolvedUserId,
                name: resolvedName,
                email: resolvedEmail,
                avatar: resolvedAvatar,
                role: mem.role || 'MEMBER',
            });
        }
        if (resolvedList.length === 0) {
            throw error_helper_1.AppError.badRequest('All specified users are already members of this team');
        }
        const created = await repository_1.teamRepository.addMembersBulk(teamId, resolvedList);
        logger_1.logger.info(`Added ${created.length} members in bulk to team ${team.name} (${teamId})`);
        // Fire-and-forget: batch notifications
        for (const mem of created) {
            if (mem.userId && mem.userId !== requestedByUserId) {
                service_1.notificationService.create({
                    userId: mem.userId,
                    type: client_1.NotificationType.SYSTEM,
                    title: 'Added to Team',
                    message: `You were added to team "${team.name}" as ${mem.role}.`,
                    data: { teamId: team.id, role: mem.role },
                }).catch((err) => logger_1.logger.error({ err }, 'Failed to emit notification for bulk add member'));
            }
        }
        return {
            addedCount: created.length,
            members: (0, dto_1.toTeamMemberListResponse)(created),
        };
    }
    async updateMember(teamId, memberId, data) {
        const member = await repository_1.teamRepository.findMemberById(memberId);
        if (!member || member.teamId !== teamId) {
            throw error_helper_1.AppError.notFound('Team member not found');
        }
        const updated = await repository_1.teamRepository.updateMember(memberId, data);
        logger_1.logger.info(`Team member updated: ${memberId} in team ${teamId}`);
        return (0, dto_1.toTeamMemberResponse)(updated);
    }
    async deleteMember(teamId, memberId) {
        const member = await repository_1.teamRepository.findMemberById(memberId);
        if (!member || member.teamId !== teamId) {
            throw error_helper_1.AppError.notFound('Team member not found');
        }
        await repository_1.teamRepository.deleteMember(memberId);
        logger_1.logger.info(`Team member removed: ${memberId} from team ${teamId}`);
        return { message: 'Team member removed successfully' };
    }
    async searchAvailableUsers(teamId, search) {
        const team = await repository_1.teamRepository.findById(teamId);
        if (!team) {
            throw error_helper_1.AppError.notFound('Team not found');
        }
        const users = await repository_1.teamRepository.searchAvailableUsers(teamId, search);
        return users;
    }
}
exports.TeamService = TeamService;
exports.teamService = new TeamService();
//# sourceMappingURL=service.js.map