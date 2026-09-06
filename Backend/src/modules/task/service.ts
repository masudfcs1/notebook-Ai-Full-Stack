import { taskRepository } from './repository';
import { notificationService } from '../notification/service';
import { NotificationType } from '@prisma/client';
import { AppError } from '@/helpers/error.helper';
import { toTaskResponse, toTaskListResponse } from './dto';
import { CreateTaskData, UpdateTaskData, TaskFilterQuery, TaskStatsResponse } from './types';
import { logger } from '@/logger';
import { prisma } from '@/database';

export class TaskService {
  /**
   * Lightweight team access check — uses targeted existence queries instead of
   * loading the full team with all members (saves ~30-50ms per call).
   */
  private async checkTeamAccess(
    teamId: string,
    userId?: number,
    isAdmin?: boolean,
    userEmail?: string
  ) {
    if (isAdmin) return;

    if (!userId) {
      throw AppError.unauthorized('Authentication required to access team tasks');
    }

    const membershipConditions: any[] = [{ userId }];
    if (userEmail) {
      membershipConditions.push({ email: { equals: userEmail, mode: 'insensitive' as const } });
    }

    // One targeted query returns both owner and membership access information.
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        workspace: { select: { userId: true } },
        members: {
          where: { OR: membershipConditions },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!team) {
      throw AppError.notFound('Team not found');
    }

    if (team.workspace?.userId !== userId && team.members.length === 0) {
      throw AppError.forbidden('You do not have access to this team');
    }
  }

  async create(data: CreateTaskData, userId?: number, isAdmin?: boolean, userEmail?: string) {
    await this.checkTeamAccess(data.teamId, userId, isAdmin, userEmail);

    const task = await taskRepository.create(data);

    logger.info(`Task created: "${task.title}" in team ${data.teamId} by user ${userId}`);

    // Fire-and-forget: don't block response for notification
    if (data.assignee) {
      notificationService
        .create({
          type: NotificationType.SYSTEM,
          title: 'New Task Assigned',
          message: `Task "${task.title}" has been assigned to ${data.assignee}.`,
          data: {
            taskId: task.id,
            teamId: task.teamId,
            title: task.title,
            priority: task.priority,
          },
        })
        .catch((err) => logger.error({ err }, 'Failed to create task notification'));
    }

    return toTaskResponse(task);
  }

  async update(
    id: string,
    data: UpdateTaskData,
    userId?: number,
    isAdmin?: boolean,
    userEmail?: string
  ) {
    const existing = await taskRepository.findById(id);
    if (!existing) {
      throw AppError.notFound('Task not found');
    }

    // Only check access once — for the relevant team
    const targetTeamId =
      data.teamId && data.teamId !== existing.teamId ? data.teamId : existing.teamId;
    if (targetTeamId) {
      await this.checkTeamAccess(targetTeamId, userId, isAdmin, userEmail);
    }

    const updated = await taskRepository.update(id, data);

    logger.info(`Task updated: "${updated.title}" (${id})`);

    // Fire-and-forget: completion notification
    if (data.status === 'done' && existing.status !== 'done') {
      notificationService
        .create({
          type: NotificationType.SYSTEM,
          title: 'Task Completed',
          message: `Task "${updated.title}" was marked as completed.`,
          data: {
            taskId: updated.id,
            teamId: updated.teamId,
            title: updated.title,
          },
        })
        .catch((err) => logger.error({ err }, 'Failed to emit task completion notification'));
    }

    return toTaskResponse(updated);
  }

  async updateStatus(
    id: string,
    status: string,
    userId?: number,
    isAdmin?: boolean,
    userEmail?: string
  ) {
    const existing = await taskRepository.findById(id);
    if (!existing) {
      throw AppError.notFound('Task not found');
    }

    if (existing.teamId) {
      await this.checkTeamAccess(existing.teamId, userId, isAdmin, userEmail);
    }

    const updated = await taskRepository.updateStatus(id, status);

    return toTaskResponse(updated);
  }

  async delete(id: string, userId?: number, isAdmin?: boolean, userEmail?: string) {
    const existing = await taskRepository.findById(id);
    if (!existing) {
      throw AppError.notFound('Task not found');
    }

    if (existing.teamId) {
      await this.checkTeamAccess(existing.teamId, userId, isAdmin, userEmail);
    }

    await taskRepository.delete(id);

    logger.info(`Task deleted: ${id}`);
    return { success: true, message: 'Task deleted successfully' };
  }

  async findById(id: string, userId?: number, isAdmin?: boolean, userEmail?: string) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw AppError.notFound('Task not found');
    }

    if (task.teamId) {
      await this.checkTeamAccess(task.teamId, userId, isAdmin, userEmail);
    }

    return toTaskResponse(task);
  }

  async findByTeamId(
    teamId: string,
    filters: TaskFilterQuery = {},
    userId?: number,
    isAdmin?: boolean,
    userEmail?: string
  ) {
    await this.checkTeamAccess(teamId, userId, isAdmin, userEmail);

    const tasks = await taskRepository.findByTeamId(teamId, filters);
    return toTaskListResponse(tasks);
  }

  async findByWorkspaceId(
    workspaceId: string,
    filters: TaskFilterQuery = {},
    userId?: number,
    isAdmin?: boolean,
    userEmail?: string
  ) {
    // If not admin, get user's accessible team IDs in this workspace
    let accessibleTeamIds: string[] | undefined;

    if (!isAdmin && userId) {
      // Lightweight query: only fetch team IDs, not full team objects
      const [memberTeams, ownedWorkspace] = await Promise.all([
        prisma.teamMember.findMany({
          where: {
            team: { workspaceId },
            OR: [
              { userId },
              ...(userEmail
                ? [{ email: { equals: userEmail, mode: 'insensitive' as const } }]
                : []),
            ],
          },
          select: { teamId: true },
        }),
        prisma.workspace.findFirst({
          where: { id: workspaceId, userId },
          select: { id: true },
        }),
      ]);

      if (ownedWorkspace) {
        // Owner sees all tasks — no team filter needed
        accessibleTeamIds = undefined;
      } else {
        accessibleTeamIds = [...new Set(memberTeams.map((m) => m.teamId))];
        if (accessibleTeamIds.length === 0) {
          return [];
        }
      }
    }

    const tasks = await taskRepository.findByWorkspaceId(workspaceId, accessibleTeamIds, filters);
    return toTaskListResponse(tasks);
  }

  async getStats(
    teamId?: string,
    workspaceId?: string,
    userId?: number,
    isAdmin?: boolean,
    userEmail?: string
  ): Promise<TaskStatsResponse> {
    let accessibleTeamIds: string[] | undefined;

    if (teamId) {
      await this.checkTeamAccess(teamId, userId, isAdmin, userEmail);
    } else if (workspaceId && !isAdmin && userId) {
      const [memberTeams, ownedWorkspace] = await Promise.all([
        prisma.teamMember.findMany({
          where: {
            team: { workspaceId },
            OR: [
              { userId },
              ...(userEmail
                ? [{ email: { equals: userEmail, mode: 'insensitive' as const } }]
                : []),
            ],
          },
          select: { teamId: true },
        }),
        prisma.workspace.findFirst({
          where: { id: workspaceId, userId },
          select: { id: true },
        }),
      ]);
      accessibleTeamIds = ownedWorkspace
        ? undefined
        : [...new Set(memberTeams.map((m) => m.teamId))];
    }

    return taskRepository.getStats(teamId, workspaceId, accessibleTeamIds);
  }
}

export const taskService = new TaskService();
