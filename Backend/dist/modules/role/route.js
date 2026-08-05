"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', (0, auth_middleware_1.authorize)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER), controller_1.roleController.getAll);
exports.default = router;
//# sourceMappingURL=route.js.map