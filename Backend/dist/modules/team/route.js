"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validation_1 = require("./validation");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', (0, validation_middleware_1.validate)(validation_1.GetTeamsQuerySchema), controller_1.teamController.getByWorkspace);
router.get('/:id', (0, validation_middleware_1.validate)(validation_1.GetTeamParamsSchema), controller_1.teamController.getById);
router.post('/', (0, validation_middleware_1.validate)(validation_1.CreateTeamSchema), controller_1.teamController.create);
router.patch('/:id', (0, validation_middleware_1.validate)(validation_1.UpdateTeamSchema), controller_1.teamController.update);
router.delete('/:id', (0, validation_middleware_1.validate)(validation_1.DeleteTeamParamsSchema), controller_1.teamController.delete);
exports.default = router;
//# sourceMappingURL=route.js.map