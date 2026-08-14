import { prisma } from '@/database';
import { Role, UserStatus, User } from '@prisma/client';
import { IPaginatedResult } from '@/interfaces';

interface FindAllOptions {
  page: number;
  limit: number;
  search?: string;
  role?: Role;
  status?: UserStatus;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export class UserRepository {
  async findAll(options: FindAllOptions): Promise<IPaginatedResult<User>> {
    const { page, limit, search, role, status, sortBy, sortOrder } = options;

    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { username: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(role && { role }),
      ...(status && { status }),
    };

    const [rawUsers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          workspaces: {
            select: {
              id: true,
              teams: {
                select: {
                  id: true,
                },
              },
            },
          },
          memberships: {
            select: {
              team: {
                select: {
                  id: true,
                  workspaceId: true,
                },
              },
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const data = rawUsers.map((user: any) => {
      const workspaceMap = new Map<string, Set<string>>();

      if (user.workspaces) {
        for (const ws of user.workspaces) {
          if (!workspaceMap.has(ws.id)) {
            workspaceMap.set(ws.id, new Set());
          }
          if (ws.teams) {
            for (const team of ws.teams) {
              workspaceMap.get(ws.id)!.add(team.id);
            }
          }
        }
      }

      if (user.memberships) {
        for (const mem of user.memberships) {
          if (mem.team && mem.team.workspaceId) {
            const wsId = mem.team.workspaceId;
            if (!workspaceMap.has(wsId)) {
              workspaceMap.set(wsId, new Set());
            }
            workspaceMap.get(wsId)!.add(mem.team.id);
          }
        }
      }

      const workspaceCount = workspaceMap.size;
      const teamCount = Array.from(workspaceMap.values()).reduce(
        (acc, teamSet) => acc + teamSet.size,
        0
      );

      const { workspaces, memberships, ...userWithoutRelations } = user;

      return {
        ...userWithoutRelations,
        workspaceCount,
        teamCount,
      };
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findById(id: number): Promise<any | null> {
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: {
        workspaces: {
          include: {
            teams: {
              include: {
                members: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    role: true,
                    userId: true,
                    createdAt: true,
                  },
                },
              },
            },
          },
        },
        memberships: {
          include: {
            team: {
              include: {
                workspace: true,
                members: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    role: true,
                    userId: true,
                    createdAt: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return null;

    const workspaceMap = new Map<string, any>();

    // 1. Process owned workspaces
    for (const ws of user.workspaces) {
      workspaceMap.set(ws.id, {
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        icon: ws.icon,
        description: ws.description,
        userId: ws.userId,
        isOwner: true,
        createdAt: ws.createdAt,
        updatedAt: ws.updatedAt,
        teams: ws.teams.map((t) => ({
          id: t.id,
          workspaceId: t.workspaceId,
          name: t.name,
          key: t.key,
          icon: t.icon,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          members: t.members,
        })),
      });
    }

    // 2. Process workspaces from team memberships
    for (const mem of user.memberships) {
      if (mem.team && mem.team.workspace) {
        const ws = mem.team.workspace;
        if (!workspaceMap.has(ws.id)) {
          workspaceMap.set(ws.id, {
            id: ws.id,
            name: ws.name,
            slug: ws.slug,
            icon: ws.icon,
            description: ws.description,
            userId: ws.userId,
            isOwner: ws.userId === id,
            createdAt: ws.createdAt,
            updatedAt: ws.updatedAt,
            teams: [
              {
                id: mem.team.id,
                workspaceId: mem.team.workspaceId,
                name: mem.team.name,
                key: mem.team.key,
                icon: mem.team.icon,
                createdAt: mem.team.createdAt,
                updatedAt: mem.team.updatedAt,
                members: mem.team.members,
              },
            ],
          });
        } else {
          const existing = workspaceMap.get(ws.id);
          const teamExists = existing.teams.some((t: any) => t.id === mem.team.id);
          if (!teamExists) {
            existing.teams.push({
              id: mem.team.id,
              workspaceId: mem.team.workspaceId,
              name: mem.team.name,
              key: mem.team.key,
              icon: mem.team.icon,
              createdAt: mem.team.createdAt,
              updatedAt: mem.team.updatedAt,
              members: mem.team.members,
            });
          }
        }
      }
    }

    const formattedWorkspaces = Array.from(workspaceMap.values());
    const workspaceCount = formattedWorkspaces.length;
    const teamCount = formattedWorkspaces.reduce(
      (acc: number, ws: any) => acc + (ws.teams?.length || 0),
      0
    );

    return {
      ...user,
      workspaces: formattedWorkspaces,
      workspaceCount,
      teamCount,
    };
  }

  async findByUuid(uuid: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { uuid, deletedAt: null },
    });
  }

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

  async create(data: {
    name?: string;
    username?: string;
    email: string;
    password: string;
    phone?: string;
    role?: Role;
    status?: UserStatus;
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

  async count(query?: { role?: Role; status?: UserStatus }): Promise<number> {
    return prisma.user.count({
      where: query,
    });
  }

  async getStats() {
    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      inactiveUsers,
      superAdminCount,
      adminCount,
      managerCount,
      employeeCount,
      userCount,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      prisma.user.count({ where: { status: 'PENDING', deletedAt: null } }),
      prisma.user.count({ where: { status: 'SUSPENDED', deletedAt: null } }),
      prisma.user.count({ where: { status: 'INACTIVE', deletedAt: null } }),
      prisma.user.count({ where: { role: 'SUPER_ADMIN', deletedAt: null } }),
      prisma.user.count({ where: { role: 'ADMIN', deletedAt: null } }),
      prisma.user.count({ where: { role: 'MANAGER', deletedAt: null } }),
      prisma.user.count({ where: { role: 'EMPLOYEE', deletedAt: null } }),
      prisma.user.count({ where: { role: 'USER', deletedAt: null } }),
      prisma.user.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      inactiveUsers,
      usersByRole: {
        SUPER_ADMIN: superAdminCount,
        ADMIN: adminCount,
        MANAGER: managerCount,
        EMPLOYEE: employeeCount,
        USER: userCount,
      },
      recentUsers,
    };
  }
}

export const userRepository = new UserRepository();
