import { User, Role, UserStatus, Provider } from '@prisma/client';
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
    workspaces?: any[];
    memberships?: any[];
}
export declare const toUserResponse: (user: any) => UserResponseDTO;
export declare const toUserListResponse: (users: User[]) => UserResponseDTO[];
//# sourceMappingURL=dto.d.ts.map