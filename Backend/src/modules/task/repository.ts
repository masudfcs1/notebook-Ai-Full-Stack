import { prisma } from '@/database';
import { CreateTaskData, UpdateTaskData, TaskFilterQuery, TaskStatsResponse } from './types';

export class TaskRepository {
  async create(data: CreateTaskData) {
    return prisma.actionItem.create({
      data: {
        teamId: data.teamId,
        title: data.title,
        description: data.description,
        assignee: data.assignee,
        dueDate: data.dueDate,
        priority: data.priority || 'medium',
        status: data.status || 'todo',
        noteId: data.noteId,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            key: true,
            icon: true,
            workspaceId: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateTaskData) {
    return prisma.actionItem.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.assignee !== undefined && { assignee: data.assignee }),
        ...(data.dueDate !== undefined && { dueDate: data.dueDate }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.teamId !== undefined && { teamId: data.teamId }),
        ...(data.noteId !== undefined && { noteId: data.noteId }),
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            key: true,
            icon: true,
            workspaceId: true,
          },
        },
      },
    });
  }

  async updateStatus(id: string, status: string) {
    return prisma.actionItem.update({
      where: { id },
      data: { status },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            key: true,
            icon: true,
            workspaceId: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.actionItem.delete({
      where: { id },
    });
  }

  async findById(id: string) {
    return prisma.actionItem.findUnique({
      where: { id },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            key: true,
            icon: true,
            workspaceId: true,
          },
        },
      },
    });
  }

  async findByTeamId(teamId: string, filters: TaskFilterQuery = {}) {
    const where: any = { teamId };

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.priority) {
      where.priority = filters.priority;
    }
    if (filters.assignee) {
      where.assignee = { contains: filters.assignee, mode: 'insensitive' as const };
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' as const } },
        { description: { contains: filters.search, mode: 'insensitive' as const } },
        { assignee: { contains: filters.search, mode: 'insensitive' as const } },
      ];
    }

    const orderBy: any = {};
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';
    orderBy[sortBy] = sortOrder;

    return prisma.actionItem.findMany({
      where,
      orderBy,
      include: {
        team: {
          select: {
            id: true,
            name: true,
            key: true,
            icon: true,
            workspaceId: true,
          },
        },
      },
    });
  }

  async findByWorkspaceId(workspaceId: string, accessibleTeamIds?: string[], filters: TaskFilterQuery = {}) {
    const where: any = {
      team: {
        workspaceId,
        ...(accessibleTeamIds !== undefined
          ? { id: { in: accessibleTeamIds } }
          : {}),
      },
    };

    if (filters.teamId) {
      where.teamId = filters.teamId;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.priority) {
      where.priority = filters.priority;
    }
    if (filters.assignee) {
      where.assignee = { contains: filters.assignee, mode: 'insensitive' as const };
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' as const } },
        { description: { contains: filters.search, mode: 'insensitive' as const } },
        { assignee: { contains: filters.search, mode: 'insensitive' as const } },
      ];
    }

    const orderBy: any = {};
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';
    orderBy[sortBy] = sortOrder;

    return prisma.actionItem.findMany({
      where,
      orderBy,
      include: {
        team: {
          select: {
            id: true,
            name: true,
            key: true,
            icon: true,
            workspaceId: true,
          },
        },
      },
    });
  }

  async getStats(teamId?: string, workspaceId?: string, accessibleTeamIds?: string[]): Promise<TaskStatsResponse> {
    const where: any = {};

    if (teamId) {
      where.teamId = teamId;
    } else if (workspaceId) {
      where.team = {
        workspaceId,
        ...(accessibleTeamIds !== undefined
          ? { id: { in: accessibleTeamIds } }
          : {}),
      };
    } else if (accessibleTeamIds !== undefined) {
      where.teamId = { in: accessibleTeamIds };
    }

    const tasks = await prisma.actionItem.findMany({
      where,
      select: {
        id: true,
        status: true,
        priority: true,
        dueDate: true,
      },
    });

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    let backlog = 0;
    let todo = 0;
    let inProgress = 0;
    let done = 0;
    let overdue = 0;

    const byPriority = {
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    for (const t of tasks) {
      const status = t.status?.toLowerCase() || 'todo';
      if (status === 'backlog') backlog++;
      else if (status === 'todo') todo++;
      else if (status === 'in_progress') inProgress++;
      else if (status === 'done' || status === 'completed') done++;

      const p = (t.priority?.toLowerCase() || 'medium') as keyof typeof byPriority;
      if (byPriority[p] !== undefined) {
        byPriority[p]++;
      }

      // Check overdue: dueDate is before today and not done
      if (t.dueDate && status !== 'done' && status !== 'completed') {
        if (t.dueDate < todayStr) {
          overdue++;
        }
      }
    }

    const total = tasks.length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      total,
      backlog,
      todo,
      inProgress,
      done,
      overdue,
      completionRate,
      byPriority,
    };
  }
}

export const taskRepository = new TaskRepository();
