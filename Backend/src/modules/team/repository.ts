import { prisma } from '@/database';
import { CreateTeamData, UpdateTeamData } from './types';

export class TeamRepository {
  async create(data: CreateTeamData) {
    return prisma.team.create({
      data: {
        workspaceId: data.workspaceId,
        name: data.name,
        key: data.key,
        icon: data.icon || '💬',
        members: data.userId
          ? {
              create: [
                {
                  userId: data.userId,
                  name: 'Team Owner',
                  email: '',
                  role: 'OWNER',
                },
              ],
            }
          : undefined,
      },
      include: {
        members: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.team.findUnique({
      where: { id },
      include: {
        members: true,
        workspace: true,
      },
    });
  }

  async findByWorkspaceId(workspaceId: string) {
    return prisma.team.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
      include: {
        members: true,
      },
    });
  }

  async findAll(userId?: number, isAdmin?: boolean) {
    const where: any = {};
    if (!isAdmin && userId) {
      where.workspace = { userId };
    }
    return prisma.team.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        members: true,
      },
    });
  }

  async update(id: string, data: UpdateTeamData) {
    return prisma.team.update({
      where: { id },
      data,
      include: {
        members: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.team.delete({
      where: { id },
    });
  }
}

export const teamRepository = new TeamRepository();
