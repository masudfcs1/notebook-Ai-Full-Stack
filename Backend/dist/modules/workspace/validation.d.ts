import { z } from 'zod';
export declare const GetWorkspacesQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        search: z.ZodOptional<z.ZodString>;
        sortBy: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        sortBy: string;
        page: number;
        sortOrder: "asc" | "desc";
        search?: string | undefined;
    }, {
        limit?: number | undefined;
        sortBy?: string | undefined;
        page?: number | undefined;
        sortOrder?: "asc" | "desc" | undefined;
        search?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        limit: number;
        sortBy: string;
        page: number;
        sortOrder: "asc" | "desc";
        search?: string | undefined;
    };
}, {
    query: {
        limit?: number | undefined;
        sortBy?: string | undefined;
        page?: number | undefined;
        sortOrder?: "asc" | "desc" | undefined;
        search?: string | undefined;
    };
}>;
export declare const GetWorkspaceParamsSchema: z.ZodObject<{
    params: z.ZodObject<{
        idOrSlug: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        idOrSlug: string;
    }, {
        idOrSlug: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        idOrSlug: string;
    };
}, {
    params: {
        idOrSlug: string;
    };
}>;
export declare const CreateWorkspaceSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        slug: z.ZodOptional<z.ZodString>;
        icon: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        icon: string;
        slug?: string | undefined;
        description?: string | undefined;
    }, {
        name: string;
        slug?: string | undefined;
        icon?: string | undefined;
        description?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        icon: string;
        slug?: string | undefined;
        description?: string | undefined;
    };
}, {
    body: {
        name: string;
        slug?: string | undefined;
        icon?: string | undefined;
        description?: string | undefined;
    };
}>;
export declare const UpdateWorkspaceSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        slug: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        slug?: string | undefined;
        icon?: string | undefined;
        description?: string | undefined;
    }, {
        name?: string | undefined;
        slug?: string | undefined;
        icon?: string | undefined;
        description?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        name?: string | undefined;
        slug?: string | undefined;
        icon?: string | undefined;
        description?: string | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        name?: string | undefined;
        slug?: string | undefined;
        icon?: string | undefined;
        description?: string | undefined;
    };
}>;
export declare const DeleteWorkspaceParamsSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
}, {
    params: {
        id: string;
    };
}>;
export type GetWorkspacesQuery = z.infer<typeof GetWorkspacesQuerySchema>['query'];
export type CreateWorkspaceInput = z.infer<typeof CreateWorkspaceSchema>['body'];
export type UpdateWorkspaceInput = z.infer<typeof UpdateWorkspaceSchema>['body'];
//# sourceMappingURL=validation.d.ts.map