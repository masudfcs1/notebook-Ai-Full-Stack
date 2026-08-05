"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env'), override: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const database_1 = require("./database");
const seed_1 = require("./database/seed");
const logger_1 = require("./logger");
const startServer = async () => {
    try {
        // Test database connection
        await database_1.prisma.$connect();
        logger_1.logger.info('Database connected successfully');
        // Seed super admin
        await (0, seed_1.seedSuperAdmin)();
        // Start server
        const server = app_1.default.listen(config_1.env.PORT, () => {
            logger_1.logger.info(`Server is running on http://localhost:${config_1.env.PORT} in ${config_1.env.NODE_ENV} mode`);
            logger_1.logger.info(`Health check: http://localhost:${config_1.env.PORT}/health`);
            logger_1.logger.info(`API Base URL: http://localhost:${config_1.env.PORT}/api/v1`);
        });
        // Graceful shutdown
        const shutdown = async (signal) => {
            logger_1.logger.info(`\n${signal} received. Shutting down gracefully...`);
            server.close(async () => {
                await database_1.prisma.$disconnect();
                logger_1.logger.info('Database connection closed.');
                logger_1.logger.info('Server closed.');
                process.exit(0);
            });
            // Force close after 10 seconds
            setTimeout(() => {
                logger_1.logger.error('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 10000);
        };
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
    }
    catch (error) {
        logger_1.logger.error({ error }, 'Failed to start server');
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map