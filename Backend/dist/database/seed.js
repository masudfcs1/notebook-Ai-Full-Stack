"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSeeders = exports.seedSuperAdmin = void 0;
const prisma_1 = require("./prisma");
const env_1 = require("../config/env");
const password_1 = require("../utils/password");
const constants_1 = require("../constants");
const logger_1 = require("../logger");
const seedSuperAdmin = async () => {
    try {
        const existingSuperAdmin = await prisma_1.prisma.user.findFirst({
            where: { role: constants_1.USER_ROLES.SUPER_ADMIN },
        });
        if (existingSuperAdmin) {
            logger_1.logger.info('Super admin already exists, skipping seed');
            return;
        }
        const hashedPassword = await (0, password_1.hashPassword)(env_1.env.SUPER_ADMIN_PASSWORD);
        const superAdmin = await prisma_1.prisma.user.create({
            data: {
                name: env_1.env.SUPER_ADMIN_NAME,
                email: env_1.env.SUPER_ADMIN_EMAIL,
                password: hashedPassword,
                username: 'superadmin',
                role: constants_1.USER_ROLES.SUPER_ADMIN,
                status: constants_1.USER_STATUS.ACTIVE,
                isVerified: true,
            },
        });
        logger_1.logger.info({ email: superAdmin.email }, 'Super admin created successfully');
    }
    catch (error) {
        logger_1.logger.error({ error }, 'Failed to seed super admin');
        throw error;
    }
};
exports.seedSuperAdmin = seedSuperAdmin;
const runSeeders = async () => {
    await (0, exports.seedSuperAdmin)();
};
exports.runSeeders = runSeeders;
if (require.main === module) {
    (0, exports.runSeeders)()
        .catch((error) => {
        logger_1.logger.error({ error }, 'Seeding failed');
        process.exit(1);
    })
        .finally(async () => {
        await prisma_1.prisma.$disconnect();
    });
}
//# sourceMappingURL=seed.js.map