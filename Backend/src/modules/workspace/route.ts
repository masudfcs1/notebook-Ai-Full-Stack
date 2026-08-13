import { Router } from 'express';
import { workspaceController } from './controller';
import { validate } from '@/middlewares/validation.middleware';
import { authenticate } from '@/middlewares/auth.middleware';
import {
  GetWorkspacesQuerySchema,
  GetWorkspaceParamsSchema,
  CreateWorkspaceSchema,
  UpdateWorkspaceSchema,
  DeleteWorkspaceParamsSchema,
} from './validation';

const router = Router();

router.use(authenticate);

router.get('/', validate(GetWorkspacesQuerySchema), workspaceController.getAll);
router.get('/all', workspaceController.getAllUserWorkspaces);
router.get('/:idOrSlug', validate(GetWorkspaceParamsSchema), workspaceController.getByIdOrSlug);
router.post('/', validate(CreateWorkspaceSchema), workspaceController.create);
router.patch('/:id', validate(UpdateWorkspaceSchema), workspaceController.update);
router.delete('/:id', validate(DeleteWorkspaceParamsSchema), workspaceController.delete);

export default router;
