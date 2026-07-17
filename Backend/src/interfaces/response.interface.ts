export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: IMeta;
}

export interface IMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface IPaginatedResult<T> {
  data: T[];
  meta: IMeta;
}

export interface ITokenPayload {
  userId: number;
  uuid: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface ILoginResult {
  accessToken: string;
  refreshToken: string;
  user: Omit<IUserResponse, 'password'>;
}

export interface IUserResponse {
  id: number;
  uuid: string;
  name: string | null;
  username: string | null;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  status: string;
  provider: string;
  isVerified: boolean;
  lastLogin: Date | null;
  loginCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFilterOptions {
  search?: string;
  role?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ISortOptions {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IPaginationOptions {
  page?: number;
  limit?: number;
}

export interface IJWTPayload {
  userId: number;
  uuid: string;
  email: string;
  role: string;
}

export interface IDeviceInfo {
  userAgent?: string;
  ipAddress?: string;
  device?: string;
  browser?: string;
  os?: string;
}
