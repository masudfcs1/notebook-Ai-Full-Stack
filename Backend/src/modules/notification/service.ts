import { notificationRepository } from './repository';
import { CreateNotificationData, NotificationListQuery } from './types';
import { toNotificationResponse, toNotificationListResponse } from './dto';
import { emitNotification } from '@/socket';
import { logger } from '@/logger';
import { AppError } from '@/helpers/error.helper';

export class NotificationService {
  /**
   * Create notification in DB and instantly broadcast via Socket.io
   */
  async create(data: CreateNotificationData) {
    const notification = await notificationRepository.create(data);
    const response = toNotificationResponse(notification);

    // Emit live socket event
    emitNotification(response);

    logger.info(`[Notification] Created and emitted: ${notification.title} (${notification.type})`);
    return response;
  }

  async findAll(options: NotificationListQuery) {
    const result = await notificationRepository.findAll(options);
    return {
      data: toNotificationListResponse(result.data),
      meta: result.meta,
    };
  }

  async markAsRead(id: string) {
    const existing = await notificationRepository.findById(id);
    if (!existing) {
      throw AppError.notFound('Notification not found');
    }

    const updated = await notificationRepository.markAsRead(id);
    return toNotificationResponse(updated);
  }

  async markAllAsRead(userId?: number | null) {
    await notificationRepository.markAllAsRead(userId);
    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId?: number | null) {
    const count = await notificationRepository.getUnreadCount(userId);
    return { unreadCount: count };
  }

  async delete(id: string) {
    const existing = await notificationRepository.findById(id);
    if (!existing) {
      throw AppError.notFound('Notification not found');
    }

    await notificationRepository.delete(id);
    return { message: 'Notification deleted successfully' };
  }
}

export const notificationService = new NotificationService();
