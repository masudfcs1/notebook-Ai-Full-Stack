"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validation_1 = require("./validation");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Team CRUD
router.get('/', (0, validation_middleware_1.validate)(validation_1.GetTeamsQuerySchema), controller_1.teamController.getByWorkspace);
router.get('/:id', (0, validation_middleware_1.validate)(validation_1.GetTeamParamsSchema), controller_1.teamController.getById);
router.post('/', (0, validation_middleware_1.validate)(validation_1.CreateTeamSchema), controller_1.teamController.create);
router.patch('/:id', (0, validation_middleware_1.validate)(validation_1.UpdateTeamSchema), controller_1.teamController.update);
router.delete('/:id', (0, validation_middleware_1.validate)(validation_1.DeleteTeamParamsSchema), controller_1.teamController.delete);
// Team Members & Directory Endpoints
router.get('/:id/members', (0, validation_middleware_1.validate)(validation_1.GetTeamMembersSchema), controller_1.teamController.getMembers);
router.post('/:id/members', (0, validation_middleware_1.validate)(validation_1.AddTeamMemberSchema), controller_1.teamController.addMember);
router.post('/:id/members/bulk', (0, validation_middleware_1.validate)(validation_1.AddTeamMembersBulkSchema), controller_1.teamController.addMembersBulk);
router.get('/:id/available-users', (0, validation_middleware_1.validate)(validation_1.SearchAvailableUsersSchema), controller_1.teamController.getAvailableUsers);
router.patch('/:id/members/:memberId', (0, validation_middleware_1.validate)(validation_1.UpdateTeamMemberSchema), controller_1.teamController.updateMember);
router.delete('/:id/members/:memberId', (0, validation_middleware_1.validate)(validation_1.DeleteTeamMemberSchema), controller_1.teamController.deleteMember);
exports.default = router;
//# sourceMappingURL=route.js.map