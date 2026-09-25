import { Router } from 'express';
import { preferencesController } from './controller';
import { validate } from '@/middlewares/validation.middleware';
import { authenticate } from '@/middlewares/auth.middleware';
import { UpdatePreferencesSchema } from './validation';

const router = Router();

router.use(authenticate);

router.get('/', preferencesController.get);
router.put('/', validate(UpdatePreferencesSchema), preferencesController.update);
router.patch('/', validate(UpdatePreferencesSchema), preferencesController.update);

export default router;
