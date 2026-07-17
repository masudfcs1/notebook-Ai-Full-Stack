import 'dotenv/config';
import app from './app';
import { env } from './config';
import { prisma } from './database';
import { seedSuperAdmin } from './database/seed';
import { logger } from './logger';

const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    // Seed super admin
    await seedSuperAdmin();

    // Start server
    const server = app.listen(env.PORT, () => {
      logger.info(
        `Server is running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`
      );

      logger.info(`Health check: http://localhost:${env.PORT}/health`);
      logger.info(`API Base URL: http://localhost:${env.PORT}/api/v1`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`\n${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Database connection closed.');
        logger.info('Server closed.');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error(
          'Could not close connections in time, forcefully shutting down'
        );
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
