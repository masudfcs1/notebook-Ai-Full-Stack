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
  GetTeamMembersSchema,
  AddTeamMemberSchema,
  AddTeamMembersBulkSchema,
  UpdateTeamMemberSchema,
  DeleteTeamMemberSchema,
  SearchAvailableUsersSchema,
} from './validation';

const router = Router();

router.use(authenticate);

// Team CRUD
router.get('/', validate(GetTeamsQuerySchema), teamController.getByWorkspace);
router.get('/:id', validate(GetTeamParamsSchema), teamController.getById);
router.post('/', validate(CreateTeamSchema), teamController.create);
router.patch('/:id', validate(UpdateTeamSchema), teamController.update);
router.delete('/:id', validate(DeleteTeamParamsSchema), teamController.delete);

// Team Members & Directory Endpoints
router.get('/:id/members', validate(GetTeamMembersSchema), teamController.getMembers);
router.post('/:id/members', validate(AddTeamMemberSchema), teamController.addMember);
router.post('/:id/members/bulk', validate(AddTeamMembersBulkSchema), teamController.addMembersBulk);
router.get('/:id/available-users', validate(SearchAvailableUsersSchema), teamController.getAvailableUsers);
router.patch('/:id/members/:memberId', validate(UpdateTeamMemberSchema), teamController.updateMember);
router.delete('/:id/members/:memberId', validate(DeleteTeamMemberSchema), teamController.deleteMember);

export default router;

