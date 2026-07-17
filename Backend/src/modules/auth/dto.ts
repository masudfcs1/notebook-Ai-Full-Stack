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

export const toUserResponse = (user: User): UserResponseDTO => {
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
  };
};

export const toUserResponseWithoutSensitive = (user: User): UserResponseDTO => {
  return toUserResponse(user);
};

export interface LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDTO;
}

export const toLoginResponse = (
  accessToken: string,
  refreshToken: string,
  user: User
): LoginResponseDTO => {
  return {
    accessToken,
    refreshToken,
    user: toUserResponse(user),
  };
};
