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
}
export declare const userService: UserService;
//# sourceMappingURL=service.d.ts.map