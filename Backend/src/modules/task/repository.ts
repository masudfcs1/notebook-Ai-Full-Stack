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

  async findByWorkspaceId(
    workspaceId: string,
    accessibleTeamIds?: string[],
    filters: TaskFilterQuery = {}
  ) {
    const where: any = {
      team: {
        workspaceId,
        ...(accessibleTeamIds !== undefined ? { id: { in: accessibleTeamIds } } : {}),
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

  async getStats(
    teamId?: string,
    workspaceId?: string,
    accessibleTeamIds?: string[]
  ): Promise<TaskStatsResponse> {
    const where: any = {};

    if (teamId) {
      where.teamId = teamId;
    } else if (workspaceId) {
      where.team = {
        workspaceId,
        ...(accessibleTeamIds !== undefined ? { id: { in: accessibleTeamIds } } : {}),
      };
    } else if (accessibleTeamIds !== undefined) {
      where.teamId = { in: accessibleTeamIds };
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const [statusGroups, priorityGroups, overdue] = await Promise.all([
      prisma.actionItem.groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
      }),
      prisma.actionItem.groupBy({
        by: ['priority'],
        where,
        _count: { _all: true },
      }),
      prisma.actionItem.count({
        where: {
          ...where,
          dueDate: { lt: todayStr },
          status: { notIn: ['done', 'completed'] },
        },
      }),
    ]);

    const statusCounts = new Map(
      statusGroups.map((row) => [row.status.toLowerCase(), row._count._all])
    );

    const backlog = statusCounts.get('backlog') || 0;
    const todo = statusCounts.get('todo') || 0;
    const inProgress = statusCounts.get('in_progress') || 0;
    const done = (statusCounts.get('done') || 0) + (statusCounts.get('completed') || 0);

    const byPriority = {
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    for (const row of priorityGroups) {
      const priority = row.priority.toLowerCase() as keyof typeof byPriority;
      if (byPriority[priority] !== undefined) {
        byPriority[priority] = row._count._all;
      }
    }

    const total = statusGroups.reduce((sum, row) => sum + row._count._all, 0);
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
