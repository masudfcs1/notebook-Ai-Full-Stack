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
    findById(id: number): Promise<User | null>;
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
}
export declare const userRepository: UserRepository;
export {};
//# sourceMappingURL=repository.d.ts.map