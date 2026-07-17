import { Role, UserStatus, Provider } from '@prisma/client';
import { IDeviceInfo } from '@/interfaces';

export interface AuthUserResponse {
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

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: AuthUserResponse;
}

export interface RegisterUserInput {
  name?: string;
  username?: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceInfo?: IDeviceInfo;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileInput {
  name?: string;
  username?: string;
  phone?: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface VerifyEmailInput {
  token: string;
}

export interface SendOTPInput {
  email: string;
}

export interface VerifyOTPInput {
  email: string;
  otp: string;
}
