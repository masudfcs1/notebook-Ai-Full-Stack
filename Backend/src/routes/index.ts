import { Router } from 'express';
import authRoutes from '@/modules/auth/route';
import userRoutes from '@/modules/user/route';
import roleRoutes from '@/modules/role/route';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);

export default router;
