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
            members: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return (prisma.workspace as any).findUnique({
      where: { id },
      include: {
        teams: {
          include: {
            members: true,
          },
        },
        notes: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return (prisma.workspace as any).findUnique({
      where: { slug },
      include: {
        teams: {
          include: {
            members: true,
          },
        },
        notes: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findAll(options: FindWorkspacesOptions): Promise<IPaginatedResult<any>> {
    const { page, limit, skip } = calculatePagination(options);
    const { search, sortBy = 'createdAt', sortOrder = 'desc', userId, isAdmin } = options;

    const searchQuery = search
      ? buildSearchQuery(search, ['name', 'slug', 'description'])
      : undefined;

    const where: any = {
      ...(!isAdmin && userId ? { userId } : {}),
      ...(searchQuery ? { OR: searchQuery.OR } : {}),
    };

    const [data, total] = await Promise.all([
      (prisma.workspace as any).findMany({
        where,
        skip,
        take: limit,
        orderBy: buildSortQuery({ sortBy, sortOrder }) || { [sortBy]: sortOrder },
        include: {
          teams: {
            include: {
              members: true,
            },
          },
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

  async findAllUserWorkspaces(userId?: number, isAdmin?: boolean) {
    const where: any = {
      ...(!isAdmin && userId ? { userId } : {}),
    };

    return (prisma.workspace as any).findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        teams: {
          include: {
            members: true,
          },
        },
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
