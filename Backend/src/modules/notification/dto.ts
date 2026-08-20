import { Notification, NotificationType } from '@prisma/client';

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data: any;
  userId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export const toNotificationResponse = (notification: Notification): NotificationResponse => {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    read: notification.read,
    data: notification.data,
    userId: notification.userId,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
};

export const toNotificationListResponse = (
  notifications: Notification[]
): NotificationResponse[] => {
  return notifications.map(toNotificationResponse);
};
