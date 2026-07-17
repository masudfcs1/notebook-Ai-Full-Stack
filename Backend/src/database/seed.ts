import { prisma } from './prisma';
import { env } from '@/config/env';
import { hashPassword } from '@/utils/password';
import { USER_ROLES, USER_STATUS } from '@/constants';
import { logger } from '@/logger';

export const seedSuperAdmin = async (): Promise<void> => {
  try {
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: USER_ROLES.SUPER_ADMIN },
    });

    if (existingSuperAdmin) {
      logger.info('Super admin already exists, skipping seed');
      return;
    }

    const hashedPassword = await hashPassword(env.SUPER_ADMIN_PASSWORD);

    const superAdmin = await prisma.user.create({
      data: {
        name: env.SUPER_ADMIN_NAME,
        email: env.SUPER_ADMIN_EMAIL,
        password: hashedPassword,
        username: 'superadmin',
        role: USER_ROLES.SUPER_ADMIN,
        status: USER_STATUS.ACTIVE,
        isVerified: true,
      },
    });

    logger.info({ email: superAdmin.email }, 'Super admin created successfully');
  } catch (error) {
    logger.error({ error }, 'Failed to seed super admin');
    throw error;
  }
};

export const runSeeders = async (): Promise<void> => {
  await seedSuperAdmin();
};

if (require.main === module) {
  runSeeders()
    .catch((error) => {
      logger.error({ error }, 'Seeding failed');
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
