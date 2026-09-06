import { Router } from 'express';
import { taskController } from './controller';
import { validate } from '@/middlewares/validation.middleware';
import { authenticate } from '@/middlewares/auth.middleware';
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  UpdateTaskStatusSchema,
  GetTasksQuerySchema,
  GetTaskStatsQuerySchema,
  GetTaskParamsSchema,
  DeleteTaskParamsSchema,
} from './validation';

const router = Router();

router.use(authenticate);

// Task Stats & Listing
router.get('/stats', validate(GetTaskStatsQuerySchema), taskController.getStats);
router.get('/', validate(GetTasksQuerySchema), taskController.getByWorkspace);
router.get('/team/:teamId', taskController.getByTeam);
router.get('/:id', validate(GetTaskParamsSchema), taskController.getById);

// Task CRUD
router.post('/', validate(CreateTaskSchema), taskController.create);
router.patch('/:id', validate(UpdateTaskSchema), taskController.update);
router.patch('/:id/status', validate(UpdateTaskStatusSchema), taskController.updateStatus);
router.delete('/:id', validate(DeleteTaskParamsSchema), taskController.delete);

export default router;
