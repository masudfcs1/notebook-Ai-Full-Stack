import { Role, UserStatus, Provider } from '@prisma/client';

export interface UserResponse {
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

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  status?: UserStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateUserData {
  name?: string;
  username?: string;
  email: string;
  password: string;
  phone?: string;
  role?: Role;
  status?: UserStatus;
}

export interface UpdateUserData {
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
}
