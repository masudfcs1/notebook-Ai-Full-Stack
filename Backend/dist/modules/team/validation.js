"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteTeamParamsSchema = exports.UpdateTeamSchema = exports.CreateTeamSchema = exports.GetTeamParamsSchema = exports.GetTeamsQuerySchema = void 0;
const zod_1 = require("zod");
exports.GetTeamsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        workspaceId: zod_1.z.string().optional(),
    }),
});
exports.GetTeamParamsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Team ID is required'),
    }),
});
exports.CreateTeamSchema = zod_1.z.object({
    body: zod_1.z.object({
        workspaceId: zod_1.z.string().min(1, 'Workspace ID is required'),
        name: zod_1.z.string().min(2, 'Team name must be at least 2 characters').max(100),
        key: zod_1.z.string().min(2, 'Team key must be at least 2 characters').max(10).toUpperCase(),
        icon: zod_1.z.string().optional().default('💬'),
        slug: zod_1.z.string().optional(),
    }),
});
exports.UpdateTeamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Team ID is required'),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(100).optional(),
        key: zod_1.z.string().min(2).max(10).toUpperCase().optional(),
        icon: zod_1.z.string().optional(),
        slug: zod_1.z.string().optional(),
    }),
});
exports.DeleteTeamParamsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Team ID is required'),
    }),
});
//# sourceMappingURL=validation.js.map