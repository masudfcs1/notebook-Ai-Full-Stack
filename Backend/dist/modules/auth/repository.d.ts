import { Role, UserStatus, Provider, User, RefreshToken, LoginHistory } from '@prisma/client';
export declare class AuthRepository {
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    findByUuid(uuid: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    create(data: {
        name?: string;
        username?: string;
        email: string;
        password: string;
        phone?: string;
        role?: Role;
        status?: UserStatus;
        provider?: Provider;
        isVerified?: boolean;
    }): Promise<User>;
    update(id: number, data: Partial<User>): Promise<User>;
    softDelete(id: number): Promise<User>;
    hardDelete(id: number): Promise<User>;
    updateLastLogin(id: number): Promise<User>;
    createRefreshToken(data: {
        token: string;
        userId: number;
        expiresAt: Date;
        userAgent?: string;
        ipAddress?: string;
    }): Promise<RefreshToken>;
    findRefreshToken(token: string): Promise<RefreshToken | null>;
    revokeRefreshToken(token: string): Promise<RefreshToken>;
    revokeAllUserTokens(userId: number): Promise<{
        count: number;
    }>;
    createLoginHistory(data: {
        userId: number;
        ipAddress?: string;
        userAgent?: string;
        device?: string;
        browser?: string;
        os?: string;
        successful: boolean;
        message?: string;
    }): Promise<LoginHistory>;
    getLoginHistory(userId: number, options?: {
        take?: number;
        skip?: number;
    }): Promise<LoginHistory[]>;
    updatePassword(id: number, password: string): Promise<User>;
    verifyEmail(id: number): Promise<User>;
    updateStatus(id: number, status: UserStatus): Promise<User>;
    updateRole(id: number, role: Role): Promise<User>;
    updateProfile(id: number, data: {
        name?: string;
        username?: string;
        phone?: string;
        avatar?: string | null;
    }): Promise<User>;
}
export declare const authRepository: AuthRepository;
//# sourceMappingURL=repository.d.ts.map