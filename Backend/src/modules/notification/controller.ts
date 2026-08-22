import { Request, Response, NextFunction } from 'express';
import { notificationService } from './service';
import { sendSuccess } from '@/utils/response';
import { NotificationType } from '@prisma/client';

export class NotificationController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const cursor = req.query.cursor as string | undefined;
      const search = req.query.search as string | undefined;
      const type = req.query.type as NotificationType | undefined;
      const read = req.query.read !== undefined ? req.query.read === 'true' : undefined;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

      const result = await notificationService.findAll({
        page,
        limit,
        cursor,
        search,
        type,
        read,
        sortBy,
        sortOrder,
      });

      sendSuccess(res, 'Notifications retrieved successfully', result.data, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await notificationService.markAsRead(id);
      sendSuccess(res, 'Notification marked as read', result);
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId =
        req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN' ? null : req.user?.id;
      const result = await notificationService.markAllAsRead(userId);
      sendSuccess(res, 'All notifications marked as read', result);
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId =
        req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN' ? null : req.user?.id;
      const result = await notificationService.getUnreadCount(userId);
      sendSuccess(res, 'Unread count retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await notificationService.delete(id);
      sendSuccess(res, 'Notification deleted successfully', result);
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
