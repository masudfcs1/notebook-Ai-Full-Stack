import { prisma } from '@/database';
import { CreateTeamData, UpdateTeamData, AddTeamMemberData, UpdateTeamMemberData } from './types';

// ─── Reusable Select/Include Fragments ───────────────────────────────────
// Single source of truth for user fields returned in team queries.
const USER_SELECT = {
  id: true,
  uuid: true,
  name: true,
  username: true,
  email: true,
  avatar: true,
  role: true,
  status: true,
} as const;

export const TEAM_MEMBER_INCLUDE = {
  include: {
    user: { select: USER_SELECT },
  },
} as const;

export class TeamRepository {
  async create(data: CreateTeamData) {
    let ownerName = 'Team Owner';
    let ownerEmail = '';
    let ownerAvatar: string | undefined = undefined;

    if (data.ownerEmail) {
      ownerName = data.ownerName || data.ownerEmail.split('@')[0] || ownerName;
      ownerEmail = data.ownerEmail;
      ownerAvatar = data.ownerAvatar || undefined;
    } else if (data.userId) {
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { name: true, email: true, avatar: true },
      });
      if (user) {
        ownerName = user.name || user.email.split('@')[0] || 'Team Owner';
        ownerEmail = user.email;
        ownerAvatar = user.avatar || undefined;
      }
    }

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
                  name: ownerName,
                  email: ownerEmail,
                  avatar: ownerAvatar,
                  role: 'OWNER',
                },
              ],
            }
          : undefined,
      },
      include: {
        workspace: { select: { id: true, name: true } },
        members: {
          include: {
            user: {
              select: {
                id: true,
                uuid: true,
                name: true,
                username: true,
                email: true,
                avatar: true,
                role: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                uuid: true,
                name: true,
                username: true,
                email: true,
                avatar: true,
                role: true,
                status: true,
              },
            },
          },
        },
        workspace: true,
      },
    });
  }

  async findByWorkspaceId(
    workspaceId: string,
    userId?: number,
    isAdmin?: boolean,
    userEmail?: string
  ) {
    const where: any = { workspaceId };
    if (!isAdmin && userId) {
      where.OR = [
        { workspace: { userId } }, // Workspace owner sees all teams in this workspace
        {
          members: {
            some: {
              OR: [
                { userId },
                ...(userEmail
                  ? [{ email: { equals: userEmail, mode: 'insensitive' as const } }]
                  : []),
              ],
            },
          },
        },
      ];
    }

    return prisma.team.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                uuid: true,
                name: true,
                username: true,
                email: true,
                avatar: true,
                role: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(userId?: number, isAdmin?: boolean, userEmail?: string) {
    const where: any = {};
    if (!isAdmin && userId) {
      where.OR = [
        { workspace: { userId } },
        {
          members: {
            some: {
              OR: [
                { userId },
                ...(userEmail ? [{ email: { equals: userEmail, mode: 'insensitive' } }] : []),
              ],
            },
          },
        },
      ];
    }
    return prisma.team.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                uuid: true,
                name: true,
                username: true,
                email: true,
                avatar: true,
                role: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateTeamData) {
    const updatePayload: any = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.key !== undefined) updatePayload.key = data.key;
    if (data.icon !== undefined) updatePayload.icon = data.icon;

    return prisma.team.update({
      where: { id },
      data: updatePayload,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                uuid: true,
                name: true,
                username: true,
                email: true,
                avatar: true,
                role: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.team.delete({
      where: { id },
    });
  }

  /* ---------- Team Member Methods ---------- */

  async getMembers(teamId: string) {
    return prisma.teamMember.findMany({
      where: { teamId },
      orderBy: [{ createdAt: 'asc' }],
      include: {
        user: {
          select: {
            id: true,
            uuid: true,
            name: true,
            username: true,
            email: true,
            avatar: true,
            role: true,
            status: true,
          },
        },
      },
    });
  }

  async findMemberById(memberId: string) {
    return prisma.teamMember.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: {
            id: true,
            uuid: true,
            name: true,
            username: true,
            email: true,
            avatar: true,
            role: true,
            status: true,
          },
        },
        team: true,
      },
    });
  }

  async findMemberByTeamAndEmailOrUserId(teamId: string, email: string, userId?: number) {
    const conditions: any[] = [{ email: { equals: email, mode: 'insensitive' } }];
    if (userId) {
      conditions.push({ userId });
    }

    return prisma.teamMember.findFirst({
      where: {
        teamId,
        OR: conditions,
      },
      include: {
        user: true,
      },
    });
  }

  async addMember(teamId: string, data: AddTeamMemberData) {
    return prisma.teamMember.create({
      data: {
        teamId,
        userId: data.userId,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        role: data.role || 'MEMBER',
      },
      include: {
        user: {
          select: {
            id: true,
            uuid: true,
            name: true,
            username: true,
            email: true,
            avatar: true,
            role: true,
            status: true,
          },
        },
      },
    });
  }

  async addMembersBulk(teamId: string, membersData: AddTeamMemberData[]) {
    const created = await prisma.$transaction(
      membersData.map((data) =>
        prisma.teamMember.create({
          data: {
            teamId,
            userId: data.userId,
            name: data.name,
            email: data.email,
            avatar: data.avatar,
            role: data.role || 'MEMBER',
          },
          include: {
            user: {
              select: {
                id: true,
                uuid: true,
                name: true,
                username: true,
                email: true,
                avatar: true,
                role: true,
                status: true,
              },
            },
          },
        })
      )
    );
    return created;
  }

  async updateMember(memberId: string, data: UpdateTeamMemberData) {
    const updatePayload: any = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.email !== undefined) updatePayload.email = data.email;
    if (data.role !== undefined) updatePayload.role = data.role;
    if (data.avatar !== undefined) updatePayload.avatar = data.avatar;

    return prisma.teamMember.update({
      where: { id: memberId },
      data: updatePayload,
      include: {
        user: {
          select: {
            id: true,
            uuid: true,
            name: true,
            username: true,
            email: true,
            avatar: true,
            role: true,
            status: true,
          },
        },
      },
    });
  }

  async deleteMember(memberId: string) {
    return prisma.teamMember.delete({
      where: { id: memberId },
    });
  }

  async searchAvailableUsers(teamId: string, search?: string) {
    const targetTeam = await prisma.team.findUnique({
      where: { id: teamId },
      select: { workspaceId: true },
    });

    const existingMembers = await prisma.teamMember.findMany({
      where: { teamId },
      select: { userId: true, email: true },
    });

    const existingUserIds = existingMembers
      .map((m) => m.userId)
      .filter((id): id is number => typeof id === 'number');

    const existingEmails = existingMembers.map((m) => m.email.toLowerCase()).filter(Boolean);

    const where: any = {
      status: { not: 'DELETED' },
    };

    if (existingUserIds.length > 0) {
      where.id = { notIn: existingUserIds };
    }

    if (existingEmails.length > 0) {
      where.email = { notIn: existingEmails };
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { username: { contains: q, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      take: 30,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        uuid: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        role: true,
        status: true,
        memberships: targetTeam
          ? {
              where: {
                team: {
                  workspaceId: targetTeam.workspaceId,
                },
              },
              include: {
                team: {
                  select: {
                    id: true,
                    name: true,
                    key: true,
                    icon: true,
                  },
                },
              },
            }
          : false,
      },
    });

    return users.map((u: any) => ({
      id: u.id,
      uuid: u.uuid,
      name: u.name,
      username: u.username,
      email: u.email,
      avatar: u.avatar,
      role: u.role,
      status: u.status,
      memberships: (u.memberships || []).map((m: any) => ({
        teamId: m.team?.id,
        teamName: m.team?.name,
        teamKey: m.team?.key,
        teamIcon: m.team?.icon,
        role: m.role,
      })),
    }));
  }
}

export const teamRepository = new TeamRepository();
