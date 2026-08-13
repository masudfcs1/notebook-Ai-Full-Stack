import { z } from 'zod';

export const GetWorkspacesQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    search: z.string().trim().optional(),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const GetWorkspaceParamsSchema = z.object({
  params: z.object({
    idOrSlug: z.string().min(1, 'Workspace ID or slug is required'),
  }),
});

export const CreateWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Workspace name must be at least 2 characters').max(100),
    slug: z.string().trim().min(2).max(100).optional(),
    icon: z.string().optional().default('⚡'),
    description: z.string().max(500).optional(),
  }),
});

export const UpdateWorkspaceSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Workspace ID is required'),
  }),
  body: z.object({
    name: z.string().min(2, 'Workspace name must be at least 2 characters').max(100).optional(),
    slug: z.string().trim().min(2).max(100).optional(),
    icon: z.string().optional(),
    description: z.string().max(500).optional(),
  }),
});

export const DeleteWorkspaceParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Workspace ID is required'),
  }),
});

export type GetWorkspacesQuery = z.infer<typeof GetWorkspacesQuerySchema>['query'];
export type CreateWorkspaceInput = z.infer<typeof CreateWorkspaceSchema>['body'];
export type UpdateWorkspaceInput = z.infer<typeof UpdateWorkspaceSchema>['body'];
