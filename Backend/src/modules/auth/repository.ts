import { prisma } from '@/database';
import { Role, UserStatus, Provider, User, RefreshToken, LoginHistory } from '@prisma/client';

export class AuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  async findByUuid(uuid: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { uuid },
    });
  }

  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: {
    name?: string;
    username?: string;
    email: string;
    password: string;
    phone?: string;
    role?: Role;
    status?: UserStatus;
    provider?: Provider;
    isVerified?: boolean;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: data.role || 'USER',
        status: data.status || 'PENDING',
        provider: data.provider || 'LOCAL',
        isVerified: data.isVerified || false,
      },
    });
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: number): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        status: 'DELETED',
        deletedAt: new Date(),
      },
    });
  }

  async hardDelete(id: number): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  async updateLastLogin(id: number): Promise<User> {
    const user = await prisma.user.findUnique({ where: { id } });
    return prisma.user.update({
      where: { id },
      data: {
        lastLogin: new Date(),
        loginCount: (user?.loginCount || 0) + 1,
      },
    });
  }

  async createRefreshToken(data: {
    token: string;
    userId: number;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data,
    });
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({
      where: { token },
    });
  }

  async revokeRefreshToken(token: string): Promise<RefreshToken> {
    return prisma.refreshToken.update({
      where: { token },
      data: { revoked: true },
    });
  }

  async revokeAllUserTokens(userId: number): Promise<{ count: number }> {
    return prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }

  async createLoginHistory(data: {
    userId: number;
    ipAddress?: string;
    userAgent?: string;
    device?: string;
    browser?: string;
    os?: string;
    successful: boolean;
    message?: string;
  }): Promise<LoginHistory> {
    return prisma.loginHistory.create({
      data,
    });
  }

  async getLoginHistory(
    userId: number,
    options?: { take?: number; skip?: number }
  ): Promise<LoginHistory[]> {
    return prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: options?.take || 10,
      skip: options?.skip,
    });
  }

  async updatePassword(id: number, password: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { password },
    });
  }

  async verifyEmail(id: number): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { isVerified: true, status: 'ACTIVE' },
    });
  }

  async updateStatus(id: number, status: UserStatus): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { status },
    });
  }

  async updateRole(id: number, role: Role): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async updateProfile(
    id: number,
    data: { name?: string; username?: string; phone?: string; avatar?: string | null }
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}

export const authRepository = new AuthRepository();
