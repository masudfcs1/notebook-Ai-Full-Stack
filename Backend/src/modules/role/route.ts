import { Router } from 'express';
import { roleController } from './controller';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  roleController.getAll
);

export default router;
