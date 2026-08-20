import { NotificationType } from '@prisma/client';

export interface CreateNotificationData {
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  userId?: number | null;
}

export interface NotificationListQuery {
  page?: number;
  limit?: number;
  cursor?: string;
  search?: string;
  type?: NotificationType;
  read?: boolean;
  userId?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

