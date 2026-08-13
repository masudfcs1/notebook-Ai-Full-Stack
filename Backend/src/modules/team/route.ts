import { Router } from 'express';
import { teamController } from './controller';
import { validate } from '@/middlewares/validation.middleware';
import { authenticate } from '@/middlewares/auth.middleware';
import {
  CreateTeamSchema,
  UpdateTeamSchema,
  GetTeamParamsSchema,
  DeleteTeamParamsSchema,
  GetTeamsQuerySchema,
} from './validation';

const router = Router();

router.use(authenticate);

router.get('/', validate(GetTeamsQuerySchema), teamController.getByWorkspace);
router.get('/:id', validate(GetTeamParamsSchema), teamController.getById);
router.post('/', validate(CreateTeamSchema), teamController.create);
router.patch('/:id', validate(UpdateTeamSchema), teamController.update);
router.delete('/:id', validate(DeleteTeamParamsSchema), teamController.delete);

export default router;
