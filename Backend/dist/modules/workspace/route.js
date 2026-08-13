"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validation_1 = require("./validation");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', (0, validation_middleware_1.validate)(validation_1.GetWorkspacesQuerySchema), controller_1.workspaceController.getAll);
router.get('/all', controller_1.workspaceController.getAllUserWorkspaces);
router.get('/:idOrSlug', (0, validation_middleware_1.validate)(validation_1.GetWorkspaceParamsSchema), controller_1.workspaceController.getByIdOrSlug);
router.post('/', (0, validation_middleware_1.validate)(validation_1.CreateWorkspaceSchema), controller_1.workspaceController.create);
router.patch('/:id', (0, validation_middleware_1.validate)(validation_1.UpdateWorkspaceSchema), controller_1.workspaceController.update);
router.delete('/:id', (0, validation_middleware_1.validate)(validation_1.DeleteWorkspaceParamsSchema), controller_1.workspaceController.delete);
exports.default = router;
//# sourceMappingURL=route.js.map