"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteUserParamsSchema = exports.UpdateUserRoleSchema = exports.UpdateUserStatusSchema = exports.UpdateUserSchema = exports.CreateUserSchema = exports.GetUserParamsSchema = exports.GetUsersQuerySchema = void 0;
const zod_1 = require("zod");
exports.GetUsersQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().positive().optional().default(1),
        limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(10),
        search: zod_1.z.string().trim().optional(),
        role: zod_1.z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'USER']).optional(),
        status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING', 'DELETED']).optional(),
        sortBy: zod_1.z.string().optional().default('createdAt'),
        sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    }),
});
exports.GetUserParamsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'ID is required'),
    }),
});
exports.CreateUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
        username: zod_1.z.string().min(3, 'Username must be at least 3 characters').max(50).optional(),
        email: zod_1.z.string().email('Invalid email address').min(1, 'Email is required'),
        password: zod_1.z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number'),
        phone: zod_1.z.string().optional(),
        role: zod_1.z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'USER']).optional().default('USER'),
        status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']).optional().default('PENDING'),
    }),
});
exports.UpdateUserSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'ID is required'),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
        username: zod_1.z.string().min(3, 'Username must be at least 3 characters').max(50).optional(),
        email: zod_1.z.string().email('Invalid email address').optional(),
        phone: zod_1.z.string().optional(),
    }),
});
exports.UpdateUserStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        userId: zod_1.z.number().int().positive(),
        status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']),
    }),
});
exports.UpdateUserRoleSchema = zod_1.z.object({
    body: zod_1.z.object({
        userId: zod_1.z.number().int().positive(),
        role: zod_1.z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'USER']),
    }),
});
exports.DeleteUserParamsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'ID is required'),
    }),
});
//# sourceMappingURL=validation.js.map