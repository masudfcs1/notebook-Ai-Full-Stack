import { teamRepository } from './repository';
import { workspaceRepository } from '../workspace/repository';
import { notificationService } from '../notification/service';
import { NotificationType } from '@prisma/client';
import { AppError } from '@/helpers/error.helper';
import {
  toTeamResponse,
  toTeamListResponse,
  toTeamMemberResponse,
  toTeamMemberListResponse,
} from './dto';
import { CreateTeamData, UpdateTeamData, AddTeamMemberData, UpdateTeamMemberData } from './types';
import { prisma } from '@/database';
import { logger } from '@/logger';

export class TeamService {
  async create(data: CreateTeamData) {
    const workspace = await workspaceRepository.findById(data.workspaceId);
    if (!workspace) {
      throw AppError.notFound('Workspace not found');
    }

    const key = data.key.toUpperCase();

    const team = await teamRepository.create({
      ...data,
      key,
    });

    logger.info(`Team created: ${team.name} (${team.id}) in workspace ${data.workspaceId}`);

    // Fire-and-forget: don't block response
    notificationService.create({
      type: NotificationType.TEAM_CREATED,
      title: 'New Team Created',
      message: `Team "${team.name}" (${team.key}) was created in workspace "${workspace.name}".`,
      data: {
        teamId: team.id,
        name: team.name,
        key: team.key,
        workspaceId: workspace.id,
        workspaceName: workspace.name,
      },
    }).catch((err) => logger.error({ err }, 'Failed to emit TEAM_CREATED notification'));

    return toTeamResponse(team);
  }

  async findByWorkspaceId(
    workspaceId: string,
    userId?: number,
    isAdmin?: boolean,
    userEmail?: string
  ) {
    const teams = await teamRepository.findByWorkspaceId(workspaceId, userId, isAdmin, userEmail);
    return toTeamListResponse(teams);
  }

  async findAll(userId?: number, isAdmin?: boolean, userEmail?: string) {
    const teams = await teamRepository.findAll(userId, isAdmin, userEmail);
    return toTeamListResponse(teams);
  }

  async findById(id: string, userId?: number, isAdmin?: boolean, userEmail?: string) {
    const team = await teamRepository.findById(id);
    if (!team) {
      throw AppError.notFound('Team not found');
    }

    if (!isAdmin && userId) {
      const isWorkspaceOwner = (team as any).workspace?.userId === userId;
      const isMember = team.members?.some(
        (m: any) =>
          (m.userId && m.userId === userId) ||
          (userEmail && m.email && m.email.toLowerCase() === userEmail.toLowerCase())
      );

      if (!isWorkspaceOwner && !isMember) {
        throw AppError.forbidden('You do not have access to this team');
      }
    }

    return toTeamResponse(team);
  }

  async update(id: string, data: UpdateTeamData) {
    const existing = await teamRepository.findById(id);
    if (!existing) {
      throw AppError.notFound('Team not found');
    }

    const updated = await teamRepository.update(id, {
      ...data,
      ...(data.key && { key: data.key.toUpperCase() }),
    });

    logger.info(`Team updated: ${updated.id}`);
    return toTeamResponse(updated);
  }

  async delete(id: string) {
    const existing = await teamRepository.findById(id);
    if (!existing) {
      throw AppError.notFound('Team not found');
    }

    await teamRepository.delete(id);
    logger.info(`Team deleted: ${id}`);

    return { message: 'Team deleted successfully' };
  }

  /* ---------- Team Member Methods ---------- */

  async getMembers(teamId: string, userId?: number, isAdmin?: boolean, userEmail?: string) {
    const team = await teamRepository.findById(teamId);
    if (!team) {
      throw AppError.notFound('Team not found');
    }

    if (!isAdmin && userId) {
      const isWorkspaceOwner = (team as any).workspace?.userId === userId;
      const isMember = team.members?.some(
        (m: any) =>
          (m.userId && m.userId === userId) ||
          (userEmail && m.email && m.email.toLowerCase() === userEmail.toLowerCase())
      );

      if (!isWorkspaceOwner && !isMember) {
        throw AppError.forbidden('You do not have access to this team');
      }
    }

    const members = await teamRepository.getMembers(teamId);
    return toTeamMemberListResponse(members);
  }

  async addMember(teamId: string, data: AddTeamMemberData, requestedByUserId?: number) {
    const team = await teamRepository.findById(teamId);
    if (!team) {
      throw AppError.notFound('Team not found');
    }

    let resolvedUserId = data.userId;
    let resolvedName = data.name;
    let resolvedEmail = data.email.trim().toLowerCase();
    let resolvedAvatar = data.avatar;

    // Look up registered user if userId given or if email matches a platform user
    if (resolvedUserId) {
      const user = await prisma.user.findUnique({ where: { id: resolvedUserId } });
      if (user) {
        resolvedName = user.name || resolvedName;
        resolvedEmail = user.email.toLowerCase();
        resolvedAvatar = user.avatar || resolvedAvatar;
      }
    } else {
      const user = await prisma.user.findUnique({ where: { email: resolvedEmail } });
      if (user) {
        resolvedUserId = user.id;
        resolvedName = user.name || resolvedName;
        resolvedAvatar = user.avatar || resolvedAvatar;
      }
    }

    // Check duplicate
    const existing = await teamRepository.findMemberByTeamAndEmailOrUserId(
      teamId,
      resolvedEmail,
      resolvedUserId
    );
    if (existing) {
      throw AppError.conflict(`User "${resolvedEmail}" is already a member of this team`);
    }

    const member = await teamRepository.addMember(teamId, {
      userId: resolvedUserId,
      name: resolvedName,
      email: resolvedEmail,
      avatar: resolvedAvatar,
      role: data.role || 'MEMBER',
    });

    logger.info(`Member ${member.name} (${member.email}) added to team ${team.name} (${teamId})`);

    // Fire-and-forget notification
    if (resolvedUserId && resolvedUserId !== requestedByUserId) {
      notificationService.create({
        userId: resolvedUserId,
        type: NotificationType.SYSTEM,
        title: 'Added to Team',
        message: `You were added to team "${team.name}" as ${member.role}.`,
        data: { teamId: team.id, role: member.role },
      }).catch((err) => logger.error({ err }, 'Failed to create add member notification'));
    }

    return toTeamMemberResponse(member);
  }

  async addMembersBulk(
    teamId: string,
    membersData: AddTeamMemberData[],
    requestedByUserId?: number
  ) {
    const team = await teamRepository.findById(teamId);
    if (!team) {
      throw AppError.notFound('Team not found');
    }

    const existingMembers = await teamRepository.getMembers(teamId);
    const existingEmails = new Set(existingMembers.map((m) => m.email.toLowerCase()));
    const existingUserIds = new Set(
      existingMembers.map((m) => m.userId).filter((id): id is number => typeof id === 'number')
    );

    // ─── Batch user lookups instead of sequential queries ───
    const userIdsToLookup = membersData
      .filter((m) => m.userId)
      .map((m) => m.userId as number);
    const emailsToLookup = membersData
      .filter((m) => !m.userId && m.email)
      .map((m) => m.email.trim().toLowerCase());

    const usersByIdMap = new Map<number, any>();
    const usersByEmailMap = new Map<string, any>();

    // Single batch query for userId lookups
    if (userIdsToLookup.length > 0) {
      const usersById = await prisma.user.findMany({
        where: { id: { in: userIdsToLookup } },
        select: { id: true, name: true, email: true, avatar: true },
      });
      usersById.forEach((u) => usersByIdMap.set(u.id, u));
    }

    // Single batch query for email lookups
    if (emailsToLookup.length > 0) {
      const usersByEmail = await prisma.user.findMany({
        where: { email: { in: emailsToLookup } },
        select: { id: true, name: true, email: true, avatar: true },
      });
      usersByEmail.forEach((u) => usersByEmailMap.set(u.email.toLowerCase(), u));
    }

    const resolvedList: AddTeamMemberData[] = [];
    const seenBatchEmails = new Set<string>();

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
      } else {
        const user = usersByEmailMap.get(resolvedEmail);
        if (user) {
          resolvedUserId = user.id;
          resolvedName = user.name || resolvedName;
          resolvedAvatar = user.avatar || resolvedAvatar;
        }
      }

      // Check if already in team or already in this batch
      if (
        existingEmails.has(resolvedEmail) ||
        (resolvedUserId && existingUserIds.has(resolvedUserId)) ||
        seenBatchEmails.has(resolvedEmail)
      ) {
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
      throw AppError.badRequest('All specified users are already members of this team');
    }

    const created = await teamRepository.addMembersBulk(teamId, resolvedList);

    logger.info(`Added ${created.length} members in bulk to team ${team.name} (${teamId})`);

    // Fire-and-forget: batch notifications
    for (const mem of created) {
      if (mem.userId && mem.userId !== requestedByUserId) {
        notificationService.create({
          userId: mem.userId,
          type: NotificationType.SYSTEM,
          title: 'Added to Team',
          message: `You were added to team "${team.name}" as ${mem.role}.`,
          data: { teamId: team.id, role: mem.role },
        }).catch((err) => logger.error({ err }, 'Failed to emit notification for bulk add member'));
      }
    }

    return {
      addedCount: created.length,
      members: toTeamMemberListResponse(created),
    };
  }

  async updateMember(teamId: string, memberId: string, data: UpdateTeamMemberData) {
    const member = await teamRepository.findMemberById(memberId);
    if (!member || member.teamId !== teamId) {
      throw AppError.notFound('Team member not found');
    }

    const updated = await teamRepository.updateMember(memberId, data);
    logger.info(`Team member updated: ${memberId} in team ${teamId}`);

    return toTeamMemberResponse(updated);
  }

  async deleteMember(teamId: string, memberId: string) {
    const member = await teamRepository.findMemberById(memberId);
    if (!member || member.teamId !== teamId) {
      throw AppError.notFound('Team member not found');
    }

    await teamRepository.deleteMember(memberId);
    logger.info(`Team member removed: ${memberId} from team ${teamId}`);

    return { message: 'Team member removed successfully' };
  }

  async searchAvailableUsers(teamId: string, search?: string) {
    const team = await teamRepository.findById(teamId);
    if (!team) {
      throw AppError.notFound('Team not found');
    }

    const users = await teamRepository.searchAvailableUsers(teamId, search);
    return users;
  }
}

export const teamService = new TeamService();
