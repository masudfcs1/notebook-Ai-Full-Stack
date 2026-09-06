import { taskRepository } from './repository';
import { teamRepository } from '../team/repository';
import { notificationService } from '../notification/service';
import { NotificationType } from '@prisma/client';
import { AppError } from '@/helpers/error.helper';
import { toTaskResponse, toTaskListResponse } from './dto';
import { CreateTaskData, UpdateTaskData, TaskFilterQuery, TaskStatsResponse } from './types';
import { logger } from '@/logger';

export class TaskService {
  private async checkTeamAccess(teamId: string, userId?: number, isAdmin?: boolean, userEmail?: string) {
    if (isAdmin) return;

    if (!userId) {
      throw AppError.unauthorized('Authentication required to access team tasks');
    }

    const team = await teamRepository.findById(teamId);
    if (!team) {
      throw AppError.notFound('Team not found');
    }

    // Check if user is workspace owner
    const isWorkspaceOwner = team.workspace?.userId === userId;
    if (isWorkspaceOwner) return;

    // Check if user is a member of the team
    const isMember = team.members?.some(
      (m) =>
        m.userId === userId ||
        (userEmail && m.email?.toLowerCase() === userEmail.toLowerCase())
    );

    if (!isMember) {
      throw AppError.forbidden('You do not have access to this team');
    }
  }

  async create(data: CreateTaskData, userId?: number, isAdmin?: boolean, userEmail?: string) {
    await this.checkTeamAccess(data.teamId, userId, isAdmin, userEmail);

    const task = await taskRepository.create(data);

    logger.info(`Task created: "${task.title}" in team ${data.teamId} by user ${userId}`);

    // If assignee was assigned, create notification
    if (data.assignee) {
      try {
        await notificationService.create({
          type: NotificationType.SYSTEM,
          title: 'New Task Assigned',
          message: `Task "${task.title}" has been assigned to ${data.assignee}.`,
          data: {
            taskId: task.id,
            teamId: task.teamId,
            title: task.title,
            priority: task.priority,
          },
        });
      } catch (notifErr) {
        logger.error({ notifErr }, 'Failed to create task notification');
      }
    }

    return toTaskResponse(task);
  }

  async update(id: string, data: UpdateTaskData, userId?: number, isAdmin?: boolean, userEmail?: string) {
    const existing = await taskRepository.findById(id);
    if (!existing) {
      throw AppError.notFound('Task not found');
    }

    if (existing.teamId) {
      await this.checkTeamAccess(existing.teamId, userId, isAdmin, userEmail);
    }

    if (data.teamId && data.teamId !== existing.teamId) {
      await this.checkTeamAccess(data.teamId, userId, isAdmin, userEmail);
    }

    const updated = await taskRepository.update(id, data);

    logger.info(`Task updated: "${updated.title}" (${id})`);

    // If status changed to 'done', emit completion notification
    if (data.status === 'done' && existing.status !== 'done') {
      try {
        await notificationService.create({
          type: NotificationType.SYSTEM,
          title: 'Task Completed',
          message: `Task "${updated.title}" was marked as completed.`,
          data: {
            taskId: updated.id,
            teamId: updated.teamId,
            title: updated.title,
          },
        });
      } catch (notifErr) {
        logger.error({ notifErr }, 'Failed to emit task completion notification');
      }
    }

    return toTaskResponse(updated);
  }

  async updateStatus(id: string, status: string, userId?: number, isAdmin?: boolean, userEmail?: string) {
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

  async findByTeamId(teamId: string, filters: TaskFilterQuery = {}, userId?: number, isAdmin?: boolean, userEmail?: string) {
    await this.checkTeamAccess(teamId, userId, isAdmin, userEmail);

    const tasks = await taskRepository.findByTeamId(teamId, filters);
    return toTaskListResponse(tasks);
  }

  async findByWorkspaceId(workspaceId: string, filters: TaskFilterQuery = {}, userId?: number, isAdmin?: boolean, userEmail?: string) {
    // If not admin, get user's accessible team IDs in this workspace
    let accessibleTeamIds: string[] | undefined;

    if (!isAdmin && userId) {
      const userTeams = await teamRepository.findByWorkspaceId(workspaceId, userId, isAdmin, userEmail);
      accessibleTeamIds = userTeams.map((t) => t.id);
      if (accessibleTeamIds.length === 0) {
        return [];
      }
    }

    const tasks = await taskRepository.findByWorkspaceId(workspaceId, accessibleTeamIds, filters);
    return toTaskListResponse(tasks);
  }

  async getStats(teamId?: string, workspaceId?: string, userId?: number, isAdmin?: boolean, userEmail?: string): Promise<TaskStatsResponse> {
    let accessibleTeamIds: string[] | undefined;

    if (teamId) {
      await this.checkTeamAccess(teamId, userId, isAdmin, userEmail);
    } else if (workspaceId && !isAdmin && userId) {
      const userTeams = await teamRepository.findByWorkspaceId(workspaceId, userId, isAdmin, userEmail);
      accessibleTeamIds = userTeams.map((t) => t.id);
    }

    return taskRepository.getStats(teamId, workspaceId, accessibleTeamIds);
  }
}

export const taskService = new TaskService();
