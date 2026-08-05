import { Role, UserStatus, Provider } from '@prisma/client';
import { User } from '@prisma/client';
export interface UserResponseDTO {
    id: number;
    uuid: string;
    name: string | null;
    username: string | null;
    email: string;
    phone: string | null;
    avatar: string | null;
    role: Role;
    status: UserStatus;
    provider: Provider;
    isVerified: boolean;
    lastLogin: Date | null;
    loginCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const toUserResponse: (user: User) => UserResponseDTO;
export declare const toUserResponseWithoutSensitive: (user: User) => UserResponseDTO;
export interface LoginResponseDTO {
    accessToken: string;
    refreshToken: string;
    user: UserResponseDTO;
}
export declare const toLoginResponse: (accessToken: string, refreshToken: string, user: User) => LoginResponseDTO;
//# sourceMappingURL=dto.d.ts.map