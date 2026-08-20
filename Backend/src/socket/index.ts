import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { corsConfig } from '@/config/cors';
import { logger } from '@/logger';

let io: SocketIOServer | null = null;

export const initSocket = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: corsConfig.origin,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`[Socket.io] Client connected: ${socket.id}`);

    // Join admin room if requested
    socket.on('join-admin', () => {
      socket.join('admin-room');
      logger.info(`[Socket.io] Socket ${socket.id} joined admin-room`);
    });

    // Join user-specific room
    socket.on('join-user', (userId: number | string) => {
      const room = `user-${userId}`;
      socket.join(room);
      logger.info(`[Socket.io] Socket ${socket.id} joined ${room}`);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`[Socket.io] Client disconnected: ${socket.id} (reason: ${reason})`);
    });
  });

  logger.info('[Socket.io] Initialized successfully');
  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet!');
  }
  return io;
};

export interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data?: any;
  userId?: number | null;
  createdAt: string | Date;
}

/**
 * Emit real-time notification to admin room, broadcast, and specific user room if applicable
 */
export const emitNotification = (notification: NotificationPayload): void => {
  if (!io) {
    logger.warn('[Socket.io] Attempted to emit notification before socket initialization');
    return;
  }

  try {
    // 1. Emit to admin-room specifically (for all admins/super-admins)
    io.to('admin-room').emit('notification', notification);

    // 2. Also emit global general notification event
    io.emit('new_notification', notification);

    // 3. If targeted at a specific user, emit to user's room
    if (notification.userId) {
      io.to(`user-${notification.userId}`).emit('notification', notification);
    }

    logger.info(`[Socket.io] Notification emitted: ${notification.title} (${notification.type})`);
  } catch (error) {
    logger.error({ error }, '[Socket.io] Failed to emit notification');
  }
};
