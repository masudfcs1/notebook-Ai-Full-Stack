"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const env_1 = require("../config/env");
// Singleton Prisma Client with optimized settings
// - Development: only warn/error logs (query logging adds 5-30ms overhead per query)
// - Connection pool: managed via DATABASE_URL params (?connection_limit=20&pool_timeout=10)
const globalForPrisma = globalThis;
// Reuse one client (and therefore one connection pool) across development hot reloads.
const prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        log: env_1.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
        datasources: {
            db: {
                url: env_1.env.DATABASE_URL,
            },
        },
    });
exports.prisma = prisma;
if (env_1.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
exports.default = prisma;
//# sourceMappingURL=prisma.js.map