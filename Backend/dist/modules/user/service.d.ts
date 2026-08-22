import { Role, UserStatus } from '@prisma/client';
export declare class UserService {
    findAll(options: {
        page: number;
        limit: number;
        search?: string;
        role?: Role;
        status?: UserStatus;
        sortBy: string;
        sortOrder: 'asc' | 'desc';
    }): Promise<{
        data: import("./dto").UserResponseDTO[];
        meta: import("../../interfaces").IMeta;
    }>;
    findById(id: number): Promise<import("./dto").UserResponseDTO>;
    findByUuid(uuid: string): Promise<import("./dto").UserResponseDTO>;
    create(data: {
        name?: string;
        username?: string;
        email: string;
        password: string;
        phone?: string;
        role?: Role;
        status?: UserStatus;
    }): Promise<import("./dto").UserResponseDTO>;
    update(id: number, data: {
        name?: string;
        username?: string;
        email?: string;
        phone?: string;
    }): Promise<import("./dto").UserResponseDTO>;
    delete(id: number): Promise<{
        message: "User deleted successfully";
    }>;
    updateStatus(userId: number, status: UserStatus): Promise<import("./dto").UserResponseDTO>;
    updateRole(userId: number, role: Role): Promise<import("./dto").UserResponseDTO>;
    getStats(): Promise<{
        totalUsers: number;
        activeUsers: number;
        pendingUsers: number;
        suspendedUsers: number;
        inactiveUsers: number;
        usersByRole: {
            SUPER_ADMIN: number;
            ADMIN: number;
            MANAGER: number;
            EMPLOYEE: number;
            USER: number;
        };
        recentUsers: import("./dto").UserResponseDTO[];
    }>;
    getLoginHistory(options: {
        page: number;
        limit: number;
        search?: string;
        userId?: number;
        successful?: boolean;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        data: ({
            user: {
                status: import(".prisma/client").$Enums.UserStatus;
                id: number;
                uuid: string;
                name: string | null;
                username: string | null;
                email: string;
                avatar: string | null;
                role: import(".prisma/client").$Enums.Role;
            };
        } & {
            message: string | null;
            id: number;
            createdAt: Date;
            userAgent: string | null;
            userId: number;
            ipAddress: string | null;
            device: string | null;
            browser: string | null;
            os: string | null;
            successful: boolean;
        })[];
        stats: {
            totalLogins: number;
            successfulLogins: number;
            failedLogins: number;
            successRate: number;
            uniqueIps: number;
            uniqueDevices: number;
            lastLogin: string | null;
            browsers: {
                name: string;
                count: number;
            }[];
            operatingSystems: {
                name: string;
                count: number;
            }[];
            devices: {
                name: string;
                count: number;
            }[];
        };
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getUserLoginHistory(userId: number, options: {
        page: number;
        limit: number;
        search?: string;
        successful?: boolean;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        data: ({
            user: {
                status: import(".prisma/client").$Enums.UserStatus;
                id: number;
                uuid: string;
                name: string | null;
                username: string | null;
                email: string;
                avatar: string | null;
                role: import(".prisma/client").$Enums.Role;
            };
        } & {
            message: string | null;
            id: number;
            createdAt: Date;
            userAgent: string | null;
            userId: number;
            ipAddress: string | null;
            device: string | null;
            browser: string | null;
            os: string | null;
            successful: boolean;
        })[];
        stats: {
            totalLogins: number;
            successfulLogins: number;
            failedLogins: number;
            successRate: number;
            uniqueIps: number;
            uniqueDevices: number;
            lastLogin: string | null;
            browsers: {
                name: string;
                count: number;
            }[];
            operatingSystems: {
                name: string;
                count: number;
            }[];
            devices: {
                name: string;
                count: number;
            }[];
        };
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
}
export declare const userService: UserService;
//# sourceMappingURL=service.d.ts.map