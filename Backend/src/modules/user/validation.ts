import { z } from 'zod';

export const GetUsersQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    search: z.string().trim().optional(),
    role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'USER']).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING', 'DELETED']).optional(),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const GetUserParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
});

export const CreateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    username: z.string().min(3, 'Username must be at least 3 characters').max(50).optional(),
    email: z.string().email('Invalid email address').min(1, 'Email is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    phone: z.string().optional(),
    role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'USER']).optional().default('USER'),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']).optional().default('PENDING'),
  }),
});

export const UpdateUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    username: z.string().min(3, 'Username must be at least 3 characters').max(50).optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().optional(),
  }),
});

export const UpdateUserStatusSchema = z.object({
  body: z.object({
    userId: z.number().int().positive(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']),
  }),
});

export const UpdateUserRoleSchema = z.object({
  body: z.object({
    userId: z.number().int().positive(),
    role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'USER']),
  }),
});

export const DeleteUserParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
});

export type GetUsersQuery = z.infer<typeof GetUsersQuerySchema>['query'];
export type CreateUserInput = z.infer<typeof CreateUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>['body'];
