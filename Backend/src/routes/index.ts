import { Router } from 'express';
import authRoutes from '@/modules/auth/route';
import userRoutes from '@/modules/user/route';
import roleRoutes from '@/modules/role/route';
import workspaceRoutes from '@/modules/workspace/route';
import teamRoutes from '@/modules/team/route';
import notificationRoutes from '@/modules/notification/route';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/teams', teamRoutes);
router.use('/notifications', notificationRoutes);

export default router;

