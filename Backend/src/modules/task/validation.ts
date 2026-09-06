import { z } from 'zod';

const TaskPriorityEnum = z.enum(['urgent', 'high', 'medium', 'low']);
const TaskStatusEnum = z.enum(['backlog', 'todo', 'in_progress', 'done']);

export const CreateTaskSchema = z.object({
  body: z.object({
    teamId: z.string().min(1, 'Team ID is required'),
    title: z.string().min(1, 'Task title is required').max(255),
    description: z.string().max(5000).optional(),
    assignee: z.string().max(100).optional(),
    assigneeAvatar: z.string().url().or(z.string().max(255)).optional(),
    dueDate: z.string().optional(),
    priority: TaskPriorityEnum.default('medium'),
    status: TaskStatusEnum.default('todo'),
    noteId: z.string().optional(),
  }),
});

export const UpdateTaskSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Task ID is required'),
  }),
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(5000).optional().nullable(),
    assignee: z.string().max(100).optional().nullable(),
    assigneeAvatar: z.string().max(255).optional().nullable(),
    dueDate: z.string().optional().nullable(),
    priority: TaskPriorityEnum.optional(),
    status: TaskStatusEnum.optional(),
    teamId: z.string().min(1).optional(),
    noteId: z.string().optional().nullable(),
  }),
});

export const UpdateTaskStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Task ID is required'),
  }),
  body: z.object({
    status: TaskStatusEnum,
  }),
});

export const GetTasksQuerySchema = z.object({
  query: z.object({
    teamId: z.string().optional(),
    workspaceId: z.string().optional(),
    status: TaskStatusEnum.optional(),
    priority: TaskPriorityEnum.optional(),
    assignee: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export const GetTaskStatsQuerySchema = z.object({
  query: z.object({
    teamId: z.string().optional(),
    workspaceId: z.string().optional(),
  }),
});

export const GetTaskParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Task ID is required'),
  }),
});

export const DeleteTaskParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Task ID is required'),
  }),
});
