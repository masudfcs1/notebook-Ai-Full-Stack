import { z } from 'zod';
export declare const GetTeamsQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        workspaceId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        workspaceId?: string | undefined;
    }, {
        workspaceId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        workspaceId?: string | undefined;
    };
}, {
    query: {
        workspaceId?: string | undefined;
    };
}>;
export declare const GetTeamParamsSchema: z.ZodObject<{
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
export declare const CreateTeamSchema: z.ZodObject<{
    body: z.ZodObject<{
        workspaceId: z.ZodString;
        name: z.ZodString;
        key: z.ZodString;
        icon: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        slug: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        key: string;
        icon: string;
        workspaceId: string;
        slug?: string | undefined;
    }, {
        name: string;
        key: string;
        workspaceId: string;
        slug?: string | undefined;
        icon?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        key: string;
        icon: string;
        workspaceId: string;
        slug?: string | undefined;
    };
}, {
    body: {
        name: string;
        key: string;
        workspaceId: string;
        slug?: string | undefined;
        icon?: string | undefined;
    };
}>;
export declare const UpdateTeamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        key: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
        slug: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        key?: string | undefined;
        slug?: string | undefined;
        icon?: string | undefined;
    }, {
        name?: string | undefined;
        key?: string | undefined;
        slug?: string | undefined;
        icon?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        name?: string | undefined;
        key?: string | undefined;
        slug?: string | undefined;
        icon?: string | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        name?: string | undefined;
        key?: string | undefined;
        slug?: string | undefined;
        icon?: string | undefined;
    };
}>;
export declare const DeleteTeamParamsSchema: z.ZodObject<{
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
//# sourceMappingURL=validation.d.ts.map