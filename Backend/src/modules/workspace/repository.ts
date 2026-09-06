import { prisma } from '@/database';
import { IPaginatedResult } from '@/interfaces';
import { CreateWorkspaceData, UpdateWorkspaceData, WorkspaceListQuery } from './types';
import {
  calculatePagination,
  calculateMeta,
  buildSearchQuery,
  buildSortQuery,
} from '@/utils/pagination';

export interface FindWorkspacesOptions extends WorkspaceListQuery {
  userId?: number;
  userEmail?: string;
  isAdmin?: boolean;
}

export class WorkspaceRepository {
  async create(data: CreateWorkspaceData) {
    return prisma.workspace.create({
      data: {
        name: data.name,
        slug:
          data.slug ||
          data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, ''),
        icon: data.icon || '⚡',
        description: data.description,
        userId: data.userId,
        teams: {
          create: [
            {
              name: 'General',
              key: 'GEN',
              icon: '🌐',
              members: {
                create: [
                  {
                    userId: data.userId,
                    name: 'Workspace Owner',
                    email: '',
                    role: 'OWNER',
                  },
                ],
              },
            },
          ],
        },
      },
      include: {
        teams: {
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
        },
      },
    });
  }

  private getTeamsInclude() {
    return {
      orderBy: { createdAt: 'asc' as const },
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
    };
  }

  async findById(id: string, _userId?: number, _isAdmin?: boolean, _userEmail?: string) {
    return (prisma.workspace as any).findUnique({
      where: { id },
      include: {
        teams: this.getTeamsInclude(),
        notes: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findBySlug(slug: string, _userId?: number, _isAdmin?: boolean, _userEmail?: string) {
    return (prisma.workspace as any).findUnique({
      where: { slug },
      include: {
        teams: this.getTeamsInclude(),
        notes: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findAll(options: FindWorkspacesOptions): Promise<IPaginatedResult<any>> {
    const { page, limit, skip } = calculatePagination(options);
    const { search, sortBy = 'createdAt', sortOrder = 'desc', userId, userEmail, isAdmin } = options;

    const searchQuery = search
      ? buildSearchQuery(search, ['name', 'slug', 'description'])
      : undefined;

    const accessFilter =
      !isAdmin && userId
        ? {
            OR: [
              { userId },
              {
                teams: {
                  some: {
                    members: {
                      some: {
                        OR: [
                          { userId },
                          ...(userEmail
                            ? [{ email: { equals: userEmail, mode: 'insensitive' } }]
                            : []),
                        ],
                      },
                    },
                  },
                },
              },
            ],
          }
        : {};

    const where: any = {
      ...accessFilter,
      ...(searchQuery ? { AND: searchQuery } : {}),
    };

    const [data, total] = await Promise.all([
      (prisma.workspace as any).findMany({
        where,
        skip,
        take: limit,
        orderBy: buildSortQuery({ sortBy, sortOrder }) || { [sortBy]: sortOrder },
        include: {
          teams: this.getTeamsInclude(),
        },
      }),
      (prisma.workspace as any).count({ where }),
    ]);

    const meta = calculateMeta(page, limit, total);

    return {
      data,
      meta,
    };
  }

  async findAllUserWorkspaces(userId?: number, isAdmin?: boolean, userEmail?: string) {
    const where: any =
      !isAdmin && userId
        ? {
            OR: [
              { userId },
              {
                teams: {
                  some: {
                    members: {
                      some: {
                        OR: [
                          { userId },
                          ...(userEmail
                            ? [{ email: { equals: userEmail, mode: 'insensitive' } }]
                            : []),
                        ],
                      },
                    },
                  },
                },
              },
            ],
          }
        : {};

    return (prisma.workspace as any).findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        teams: this.getTeamsInclude(),
      },
    });
  }

  async update(id: string, data: UpdateWorkspaceData) {
    return (prisma.workspace as any).update({
      where: { id },
      data,
      include: {
        teams: {
          include: {
            members: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return (prisma.workspace as any).delete({
      where: { id },
    });
  }
}

export const workspaceRepository = new WorkspaceRepository();
