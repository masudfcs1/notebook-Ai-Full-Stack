import { prisma } from '@/database';
import { IPaginatedResult } from '@/interfaces';
import { CreateNotificationData, NotificationListQuery } from './types';
import {
  calculatePagination,
  calculateMeta,
  buildSortQuery,
  paginateWithCursor,
  encodeCursor,
} from '@/utils/pagination';

export class NotificationRepository {
  async create(data: CreateNotificationData) {
    return prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || undefined,
        userId: data.userId || null,
      },
    });
  }

  async findById(id: string) {
    return prisma.notification.findUnique({
      where: { id },
    });
  }

  async findAll(options: NotificationListQuery): Promise<IPaginatedResult<any>> {
    const {
      page,
      limit = 20,
      cursor,
      search,
      type,
      read,
      userId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const where: any = {};
    if (type) where.type = type;
    if (typeof read === 'boolean') where.read = read;
    if (userId !== undefined && userId !== null) where.userId = userId;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    // If cursor token is provided or explicit cursor pagination is requested
    if (cursor !== undefined) {
      return paginateWithCursor(prisma.notification as any, {
        cursor,
        limit,
        where,
        sortBy,
        sortOrder,
      });
    }

    const { skip } = calculatePagination({ page, limit });

    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: buildSortQuery({ sortBy, sortOrder }) || { [sortBy]: sortOrder },
      }),
      prisma.notification.count({ where }),
    ]);

    const meta = calculateMeta(page || 1, limit, total);
    const lastItem = data[data.length - 1];
    const hasMore = page ? page < (meta.totalPages || 1) : false;

    return {
      data,
      meta: {
        ...meta,
        hasMore,
        nextCursor: lastItem ? encodeCursor(lastItem.createdAt) : null,
      },
    };
  }

  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId?: number | null) {
    const where: any = {};
    if (userId !== undefined && userId !== null) {
      where.userId = userId;
    }

    return prisma.notification.updateMany({
      where,
      data: { read: true },
    });
  }

  async getUnreadCount(userId?: number | null) {
    const where: any = { read: false };
    if (userId !== undefined && userId !== null) {
      where.userId = userId;
    }

    return prisma.notification.count({ where });
  }

  async delete(id: string) {
    return prisma.notification.delete({
      where: { id },
    });
  }
}

export const notificationRepository = new NotificationRepository();
