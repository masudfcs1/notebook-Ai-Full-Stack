"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchAvailableUsersSchema = exports.DeleteTeamMemberSchema = exports.UpdateTeamMemberSchema = exports.AddTeamMembersBulkSchema = exports.AddTeamMemberSchema = exports.GetTeamMembersSchema = exports.DeleteTeamParamsSchema = exports.UpdateTeamSchema = exports.CreateTeamSchema = exports.GetTeamParamsSchema = exports.GetTeamsQuerySchema = void 0;
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
exports.GetTeamMembersSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Team ID is required'),
    }),
});
exports.AddTeamMemberSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Team ID is required'),
    }),
    body: zod_1.z.object({
        userId: zod_1.z.number().int().positive().optional(),
        name: zod_1.z.string().min(1, 'Name is required').max(100),
        email: zod_1.z.string().email('Invalid email address'),
        role: zod_1.z.enum(['OWNER', 'LEAD', 'MEMBER']).default('MEMBER'),
        avatar: zod_1.z.string().optional(),
    }),
});
exports.AddTeamMembersBulkSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Team ID is required'),
    }),
    body: zod_1.z.object({
        members: zod_1.z
            .array(zod_1.z.object({
            userId: zod_1.z.number().int().positive().optional(),
            name: zod_1.z.string().min(1, 'Name is required').max(100),
            email: zod_1.z.string().email('Invalid email address'),
            role: zod_1.z.enum(['OWNER', 'LEAD', 'MEMBER']).default('MEMBER'),
            avatar: zod_1.z.string().optional(),
        }))
            .min(1, 'At least one member is required'),
    }),
});
exports.UpdateTeamMemberSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Team ID is required'),
        memberId: zod_1.z.string().min(1, 'Member ID is required'),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100).optional(),
        email: zod_1.z.string().email().optional(),
        role: zod_1.z.enum(['OWNER', 'LEAD', 'MEMBER']).optional(),
        avatar: zod_1.z.string().optional(),
    }),
});
exports.DeleteTeamMemberSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Team ID is required'),
        memberId: zod_1.z.string().min(1, 'Member ID is required'),
    }),
});
exports.SearchAvailableUsersSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Team ID is required'),
    }),
    query: zod_1.z.object({
        search: zod_1.z.string().optional(),
    }),
});
//# sourceMappingURL=validation.js.map