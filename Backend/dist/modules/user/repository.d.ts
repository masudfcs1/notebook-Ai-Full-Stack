import { Role, UserStatus, User } from '@prisma/client';
import { IPaginatedResult } from '../../interfaces';
interface FindAllOptions {
    page: number;
    limit: number;
    search?: string;
    role?: Role;
    status?: UserStatus;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}
export declare class UserRepository {
    findAll(options: FindAllOptions): Promise<IPaginatedResult<User>>;
    findById(id: number): Promise<any | null>;
    findByUuid(uuid: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    create(data: {
        name?: string;
        username?: string;
        email: string;
        password: string;
        phone?: string;
        role?: Role;
        status?: UserStatus;
    }): Promise<User>;
    update(id: number, data: Partial<User>): Promise<User>;
    softDelete(id: number): Promise<User>;
    hardDelete(id: number): Promise<User>;
    updateStatus(id: number, status: UserStatus): Promise<User>;
    updateRole(id: number, role: Role): Promise<User>;
    count(query?: {
        role?: Role;
        status?: UserStatus;
    }): Promise<number>;
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
        recentUsers: {
            status: import(".prisma/client").$Enums.UserStatus;
            password: string | null;
            id: number;
            uuid: string;
            name: string | null;
            username: string | null;
            email: string;
            phone: string | null;
            avatar: string | null;
            role: import(".prisma/client").$Enums.Role;
            provider: import(".prisma/client").$Enums.Provider;
            isVerified: boolean;
            lastLogin: Date | null;
            loginCount: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        }[];
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
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getLoginStats(userId?: number): Promise<{
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
    }>;
}
export declare const userRepository: UserRepository;
export {};
//# sourceMappingURL=repository.d.ts.map