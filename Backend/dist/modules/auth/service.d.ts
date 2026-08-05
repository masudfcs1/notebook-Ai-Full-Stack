import { IDeviceInfo } from '../../interfaces';
import { toUserResponse } from './dto';
export declare class AuthService {
    register(data: {
        name?: string;
        username?: string;
        email: string;
        password: string;
        phone?: string;
    }): Promise<{
        user: ReturnType<typeof toUserResponse>;
        message: string;
    }>;
    login(data: {
        email: string;
        password: string;
        rememberMe?: boolean;
    }, deviceInfo?: IDeviceInfo): Promise<{
        accessToken: string;
        refreshToken: string;
        user: ReturnType<typeof toUserResponse>;
    }>;
    refreshToken(token: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: number, token?: string): Promise<void>;
    changePassword(userId: number, data: {
        currentPassword: string;
        newPassword: string;
    }): Promise<void>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, password: string): Promise<{
        message: string;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    resendVerification(email: string): Promise<{
        message: string;
    }>;
    sendOTP(email: string): Promise<{
        message: string;
        otp?: string;
    }>;
    verifyOTP(email: string, otp: string): Promise<{
        message: string;
    }>;
    getProfile(userId: number): Promise<ReturnType<typeof toUserResponse>>;
    updateProfile(userId: number, data: {
        name?: string;
        username?: string;
        phone?: string;
    }): Promise<ReturnType<typeof toUserResponse>>;
    updateProfileImage(userId: number, avatarUrl: string): Promise<ReturnType<typeof toUserResponse>>;
    deleteProfileImage(userId: number): Promise<void>;
    deleteAccount(userId: number, password: string): Promise<void>;
    getLoginHistory(userId: number, options?: {
        take?: number;
        skip?: number;
    }): Promise<{
        data: unknown[];
    }>;
}
export declare const authService: AuthService;
//# sourceMappingURL=service.d.ts.map