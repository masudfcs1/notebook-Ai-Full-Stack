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

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.user.count({ where }),
    ]);

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

  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id, deletedAt: null },
    });
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
}

export const userRepository = new UserRepository();
