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
    return prisma.user.update({
      where: { id },
      data: {
        lastLogin: new Date(),
        loginCount: { increment: 1 },
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

  async getActiveSessions(userId: number) {
    return prisma.refreshToken.findMany({
      where: {
        userId,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeOtherSessions(userId: number, currentToken?: string) {
    return prisma.refreshToken.updateMany({
      where: {
        userId,
        revoked: false,
        ...(currentToken ? { token: { not: currentToken } } : {}),
      },
      data: { revoked: true },
    });
  }

  async getUsageStats(userId: number) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const daysRemaining = Math.max(0, endOfMonth.getDate() - now.getDate());

    const [notesCount, summariesCount, tasksCount, storageAgg, totalNotes] = await Promise.all([
      prisma.meetingNote.count({
        where: { userId, createdAt: { gte: startOfMonth } },
      }),
      prisma.summary.count({
        where: { note: { userId }, createdAt: { gte: startOfMonth } },
      }),
      prisma.actionItem.count({
        where: {
          OR: [
            { note: { userId } },
            { team: { workspace: { userId } } },
          ],
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.meetingNote.aggregate({
        where: { userId },
        _sum: { fileSize: true },
      }),
      prisma.meetingNote.count({
        where: { userId },
      }),
    ]);

    const usedBytes = storageAgg._sum.fileSize || 0;
    const limitBytes = 10 * 1024 * 1024 * 1024; // 10 GB limit for standard tier

    return {
      period: {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString(),
        daysRemaining,
      },
      summaries: {
        used: summariesCount,
        limit: 250,
      },
      transcriptionMinutes: {
        used: Math.min(600, notesCount * 15), // estimated minutes based on notes
        limit: 600,
      },
      tasks: {
        used: tasksCount,
        limit: 500,
      },
      storageBytes: {
        used: usedBytes,
        limitBytes,
      },
      notes: {
        total: totalNotes,
        thisMonth: notesCount,
      },
    };
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
