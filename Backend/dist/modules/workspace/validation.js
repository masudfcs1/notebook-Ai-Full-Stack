"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteWorkspaceParamsSchema = exports.UpdateWorkspaceSchema = exports.CreateWorkspaceSchema = exports.GetWorkspaceParamsSchema = exports.GetWorkspacesQuerySchema = void 0;
const zod_1 = require("zod");
exports.GetWorkspacesQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().positive().optional().default(1),
        limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(10),
        search: zod_1.z.string().trim().optional(),
        sortBy: zod_1.z.string().optional().default('createdAt'),
        sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    }),
});
exports.GetWorkspaceParamsSchema = zod_1.z.object({
    params: zod_1.z.object({
        idOrSlug: zod_1.z.string().min(1, 'Workspace ID or slug is required'),
    }),
});
exports.CreateWorkspaceSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Workspace name must be at least 2 characters').max(100),
        slug: zod_1.z.string().trim().min(2).max(100).optional(),
        icon: zod_1.z.string().optional().default('⚡'),
        description: zod_1.z.string().max(500).optional(),
    }),
});
exports.UpdateWorkspaceSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Workspace ID is required'),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Workspace name must be at least 2 characters').max(100).optional(),
        slug: zod_1.z.string().trim().min(2).max(100).optional(),
        icon: zod_1.z.string().optional(),
        description: zod_1.z.string().max(500).optional(),
    }),
});
exports.DeleteWorkspaceParamsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Workspace ID is required'),
    }),
});
//# sourceMappingURL=validation.js.map