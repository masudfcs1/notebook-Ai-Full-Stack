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
export declare const GetTeamMembersSchema: z.ZodObject<{
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
export declare const AddTeamMemberSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        userId: z.ZodOptional<z.ZodNumber>;
        name: z.ZodString;
        email: z.ZodString;
        role: z.ZodDefault<z.ZodEnum<["OWNER", "LEAD", "MEMBER"]>>;
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        email: string;
        role: "OWNER" | "LEAD" | "MEMBER";
        avatar?: string | undefined;
        userId?: number | undefined;
    }, {
        name: string;
        email: string;
        avatar?: string | undefined;
        role?: "OWNER" | "LEAD" | "MEMBER" | undefined;
        userId?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        name: string;
        email: string;
        role: "OWNER" | "LEAD" | "MEMBER";
        avatar?: string | undefined;
        userId?: number | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        name: string;
        email: string;
        avatar?: string | undefined;
        role?: "OWNER" | "LEAD" | "MEMBER" | undefined;
        userId?: number | undefined;
    };
}>;
export declare const AddTeamMembersBulkSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        members: z.ZodArray<z.ZodObject<{
            userId: z.ZodOptional<z.ZodNumber>;
            name: z.ZodString;
            email: z.ZodString;
            role: z.ZodDefault<z.ZodEnum<["OWNER", "LEAD", "MEMBER"]>>;
            avatar: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            email: string;
            role: "OWNER" | "LEAD" | "MEMBER";
            avatar?: string | undefined;
            userId?: number | undefined;
        }, {
            name: string;
            email: string;
            avatar?: string | undefined;
            role?: "OWNER" | "LEAD" | "MEMBER" | undefined;
            userId?: number | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        members: {
            name: string;
            email: string;
            role: "OWNER" | "LEAD" | "MEMBER";
            avatar?: string | undefined;
            userId?: number | undefined;
        }[];
    }, {
        members: {
            name: string;
            email: string;
            avatar?: string | undefined;
            role?: "OWNER" | "LEAD" | "MEMBER" | undefined;
            userId?: number | undefined;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        members: {
            name: string;
            email: string;
            role: "OWNER" | "LEAD" | "MEMBER";
            avatar?: string | undefined;
            userId?: number | undefined;
        }[];
    };
}, {
    params: {
        id: string;
    };
    body: {
        members: {
            name: string;
            email: string;
            avatar?: string | undefined;
            role?: "OWNER" | "LEAD" | "MEMBER" | undefined;
            userId?: number | undefined;
        }[];
    };
}>;
export declare const UpdateTeamMemberSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
        memberId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        memberId: string;
    }, {
        id: string;
        memberId: string;
    }>;
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodEnum<["OWNER", "LEAD", "MEMBER"]>>;
        avatar: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        email?: string | undefined;
        avatar?: string | undefined;
        role?: "OWNER" | "LEAD" | "MEMBER" | undefined;
    }, {
        name?: string | undefined;
        email?: string | undefined;
        avatar?: string | undefined;
        role?: "OWNER" | "LEAD" | "MEMBER" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
        memberId: string;
    };
    body: {
        name?: string | undefined;
        email?: string | undefined;
        avatar?: string | undefined;
        role?: "OWNER" | "LEAD" | "MEMBER" | undefined;
    };
}, {
    params: {
        id: string;
        memberId: string;
    };
    body: {
        name?: string | undefined;
        email?: string | undefined;
        avatar?: string | undefined;
        role?: "OWNER" | "LEAD" | "MEMBER" | undefined;
    };
}>;
export declare const DeleteTeamMemberSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
        memberId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        memberId: string;
    }, {
        id: string;
        memberId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
        memberId: string;
    };
}, {
    params: {
        id: string;
        memberId: string;
    };
}>;
export declare const SearchAvailableUsersSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    query: z.ZodObject<{
        search: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        search?: string | undefined;
    }, {
        search?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    query: {
        search?: string | undefined;
    };
}, {
    params: {
        id: string;
    };
    query: {
        search?: string | undefined;
    };
}>;
//# sourceMappingURL=validation.d.ts.map