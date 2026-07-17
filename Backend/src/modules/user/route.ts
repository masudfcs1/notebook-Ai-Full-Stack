import { Router } from 'express';
import { userController } from './controller';
import { validate } from '@/middlewares/validation.middleware';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import {
  GetUsersQuerySchema,
  GetUserParamsSchema,
  CreateUserSchema,
  UpdateUserSchema,
  UpdateUserStatusSchema,
  UpdateUserRoleSchema,
  DeleteUserParamsSchema,
} from './validation';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  validate(GetUsersQuerySchema),
  userController.getAll
);

router.get(
  '/:id',
  authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  validate(GetUserParamsSchema),
  userController.getById
);

router.post(
  '/',
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  validate(CreateUserSchema),
  userController.create
);

router.patch(
  '/:id',
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  validate(UpdateUserSchema),
  userController.update
);

router.delete(
  '/:id',
  authorize(Role.SUPER_ADMIN),
  validate(DeleteUserParamsSchema),
  userController.delete
);

router.patch(
  '/status',
  authorize(Role.SUPER_ADMIN, Role.ADMIN),
  validate(UpdateUserStatusSchema),
  userController.updateStatus
);

router.patch(
  '/role',
  authorize(Role.SUPER_ADMIN),
  validate(UpdateUserRoleSchema),
  userController.updateRole
);

export default router;
