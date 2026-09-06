import { PrismaClient } from '@prisma/client';
import { env } from '@/config/env';

// Singleton Prisma Client with optimized settings
// - Development: only warn/error logs (query logging adds 5-30ms overhead per query)
// - Connection pool: managed via DATABASE_URL params (?connection_limit=20&pool_timeout=10)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// Reuse one client (and therefore one connection pool) across development hot reloads.
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
export { prisma };
