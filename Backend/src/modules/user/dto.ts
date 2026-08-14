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
  workspaceCount?: number;
  teamCount?: number;
  workspaces?: any[];
  memberships?: any[];
}

export const toUserResponse = (user: any): UserResponseDTO => {
  return {
    id: user.id,
    uuid: user.uuid,
    name: user.name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
    status: user.status,
    provider: user.provider,
    isVerified: user.isVerified,
    lastLogin: user.lastLogin,
    loginCount: user.loginCount,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    ...(user.workspaceCount !== undefined && { workspaceCount: user.workspaceCount }),
    ...(user.teamCount !== undefined && { teamCount: user.teamCount }),
    ...(user.workspaces && { workspaces: user.workspaces }),
    ...(user.memberships && { memberships: user.memberships }),
  };
};

export const toUserListResponse = (users: User[]): UserResponseDTO[] => {
  return users.map(toUserResponse);
};
