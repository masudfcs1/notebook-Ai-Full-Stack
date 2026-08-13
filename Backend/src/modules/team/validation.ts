import { z } from 'zod';

export const GetTeamsQuerySchema = z.object({
  query: z.object({
    workspaceId: z.string().optional(),
  }),
});

export const GetTeamParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Team ID is required'),
  }),
});

export const CreateTeamSchema = z.object({
  body: z.object({
    workspaceId: z.string().min(1, 'Workspace ID is required'),
    name: z.string().min(2, 'Team name must be at least 2 characters').max(100),
    key: z.string().min(2, 'Team key must be at least 2 characters').max(10).toUpperCase(),
    icon: z.string().optional().default('💬'),
    slug: z.string().optional(),
  }),
});

export const UpdateTeamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Team ID is required'),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    key: z.string().min(2).max(10).toUpperCase().optional(),
    icon: z.string().optional(),
    slug: z.string().optional(),
  }),
});

export const DeleteTeamParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Team ID is required'),
  }),
});
