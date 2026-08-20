import { Router } from 'express';
import { notificationController } from './controller';
import { authenticate, authorize } from '@/middlewares';
import { Role } from '@prisma/client';

const router = Router();

// Apply authentication to all notification routes
router.use(authenticate);

// List all notifications (accessible by ADMIN, SUPER_ADMIN, MANAGER, USER)
router.get('/', notificationController.getAll);

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark all notifications as read
router.patch('/read-all', notificationController.markAllAsRead);

// Mark specific notification as read
router.patch('/:id/read', notificationController.markAsRead);

// Delete notification (Admin only)
router.delete('/:id', authorize(Role.SUPER_ADMIN, Role.ADMIN), notificationController.delete);

export default router;

