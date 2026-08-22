import { z } from 'zod';
export declare const GetUsersQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        search: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodEnum<["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE", "USER"]>>;
        status: z.ZodOptional<z.ZodEnum<["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING", "DELETED"]>>;
        sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["id", "createdAt", "name", "email", "role", "status", "lastLogin"]>>>;
        sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        sortBy: "status" | "id" | "name" | "email" | "role" | "lastLogin" | "createdAt";
        page: number;
        sortOrder: "asc" | "desc";
        status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING" | "DELETED" | undefined;
        role?: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE" | "USER" | undefined;
        search?: string | undefined;
    }, {
        status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING" | "DELETED" | undefined;
        role?: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE" | "USER" | undefined;
        limit?: number | undefined;
        sortBy?: "status" | "id" | "name" | "email" | "role" | "lastLogin" | "createdAt" | undefined;
        page?: number | undefined;
        sortOrder?: "asc" | "desc" | undefined;
        search?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        limit: number;
        sortBy: "status" | "id" | "name" | "email" | "role" | "lastLogin" | "createdAt";
        page: number;
        sortOrder: "asc" | "desc";
        status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING" | "DELETED" | undefined;
        role?: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE" | "USER" | undefined;
        search?: string | undefined;
    };
}, {
    query: {
        status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING" | "DELETED" | undefined;
        role?: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE" | "USER" | undefined;
        limit?: number | undefined;
        sortBy?: "status" | "id" | "name" | "email" | "role" | "lastLogin" | "createdAt" | undefined;
        page?: number | undefined;
        sortOrder?: "asc" | "desc" | undefined;
        search?: string | undefined;
    };
}>;
export declare const GetUserParamsSchema: z.ZodObject<{
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
export declare const CreateUserSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        username: z.ZodOptional<z.ZodString>;
        email: z.ZodString;
        password: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        role: z.ZodDefault<z.ZodOptional<z.ZodEnum<["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE", "USER"]>>>;
        status: z.ZodDefault<z.ZodOptional<z.ZodEnum<["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"]>>>;
    }, "strip", z.ZodTypeAny, {
        status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
        password: string;
        email: string;
        role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE" | "USER";
        name?: string | undefined;
        username?: string | undefined;
        phone?: string | undefined;
    }, {
        password: string;
        email: string;
        status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING" | undefined;
        name?: string | undefined;
        username?: string | undefined;
        phone?: string | undefined;
        role?: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE" | "USER" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
        password: string;
        email: string;
        role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE" | "USER";
        name?: string | undefined;
        username?: string | undefined;
        phone?: string | undefined;
    };
}, {
    body: {
        password: string;
        email: string;
        status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING" | undefined;
        name?: string | undefined;
        username?: string | undefined;
        phone?: string | undefined;
        role?: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE" | "USER" | undefined;
    };
}>;
export declare const UpdateUserSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        username: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        username?: string | undefined;
        email?: string | undefined;
        phone?: string | undefined;
    }, {
        name?: string | undefined;
        username?: string | undefined;
        email?: string | undefined;
        phone?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        name?: string | undefined;
        username?: string | undefined;
        email?: string | undefined;
        phone?: string | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        name?: string | undefined;
        username?: string | undefined;
        email?: string | undefined;
        phone?: string | undefined;
    };
}>;
export declare const UpdateUserStatusSchema: z.ZodObject<{
    body: z.ZodObject<{
        userId: z.ZodNumber;
        status: z.ZodEnum<["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"]>;
    }, "strip", z.ZodTypeAny, {
        status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
        userId: number;
    }, {
        status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
        userId: number;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
        userId: number;
    };
}, {
    body: {
        status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
        userId: number;
    };
}>;
export declare const UpdateUserRoleSchema: z.ZodObject<{
    body: z.ZodObject<{
        userId: z.ZodNumber;
        role: z.ZodEnum<["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE", "USER"]>;
    }, "strip", z.ZodTypeAny, {
        role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE" | "USER";
        userId: number;
    }, {
        role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE" | "USER";
        userId: number;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE" | "USER";
        userId: number;
    };
}, {
    body: {
        role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE" | "USER";
        userId: number;
    };
}>;
export declare const DeleteUserParamsSchema: z.ZodObject<{
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
export declare const GetLoginHistoryQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        search: z.ZodOptional<z.ZodString>;
        userId: z.ZodOptional<z.ZodNumber>;
        successful: z.ZodEffects<z.ZodOptional<z.ZodString>, boolean | undefined, string | undefined>;
        sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["id", "createdAt", "ipAddress", "device", "browser", "os"]>>>;
        sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        sortBy: "id" | "createdAt" | "ipAddress" | "device" | "browser" | "os";
        page: number;
        sortOrder: "asc" | "desc";
        userId?: number | undefined;
        successful?: boolean | undefined;
        search?: string | undefined;
    }, {
        limit?: number | undefined;
        userId?: number | undefined;
        successful?: string | undefined;
        sortBy?: "id" | "createdAt" | "ipAddress" | "device" | "browser" | "os" | undefined;
        page?: number | undefined;
        sortOrder?: "asc" | "desc" | undefined;
        search?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        limit: number;
        sortBy: "id" | "createdAt" | "ipAddress" | "device" | "browser" | "os";
        page: number;
        sortOrder: "asc" | "desc";
        userId?: number | undefined;
        successful?: boolean | undefined;
        search?: string | undefined;
    };
}, {
    query: {
        limit?: number | undefined;
        userId?: number | undefined;
        successful?: string | undefined;
        sortBy?: "id" | "createdAt" | "ipAddress" | "device" | "browser" | "os" | undefined;
        page?: number | undefined;
        sortOrder?: "asc" | "desc" | undefined;
        search?: string | undefined;
    };
}>;
export declare const GetUserLoginHistoryParamsSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        search: z.ZodOptional<z.ZodString>;
        successful: z.ZodEffects<z.ZodOptional<z.ZodString>, boolean | undefined, string | undefined>;
        sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["id", "createdAt", "ipAddress", "device", "browser", "os"]>>>;
        sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        sortBy: "id" | "createdAt" | "ipAddress" | "device" | "browser" | "os";
        page: number;
        sortOrder: "asc" | "desc";
        successful?: boolean | undefined;
        search?: string | undefined;
    }, {
        limit?: number | undefined;
        successful?: string | undefined;
        sortBy?: "id" | "createdAt" | "ipAddress" | "device" | "browser" | "os" | undefined;
        page?: number | undefined;
        sortOrder?: "asc" | "desc" | undefined;
        search?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    query: {
        limit: number;
        sortBy: "id" | "createdAt" | "ipAddress" | "device" | "browser" | "os";
        page: number;
        sortOrder: "asc" | "desc";
        successful?: boolean | undefined;
        search?: string | undefined;
    };
}, {
    params: {
        id: string;
    };
    query: {
        limit?: number | undefined;
        successful?: string | undefined;
        sortBy?: "id" | "createdAt" | "ipAddress" | "device" | "browser" | "os" | undefined;
        page?: number | undefined;
        sortOrder?: "asc" | "desc" | undefined;
        search?: string | undefined;
    };
}>;
export type GetUsersQuery = z.infer<typeof GetUsersQuerySchema>['query'];
export type CreateUserInput = z.infer<typeof CreateUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>['body'];
export type GetLoginHistoryQuery = z.infer<typeof GetLoginHistoryQuerySchema>['query'];
//# sourceMappingURL=validation.d.ts.map