"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleController = exports.RoleController = void 0;
const service_1 = require("./service");
const async_1 = require("../../utils/async");
const response_1 = require("../../utils/response");
class RoleController {
    getAll = (0, async_1.catchAsync)(async (_req, res, _next) => {
        const roles = service_1.roleService.getAllRoles();
        return (0, response_1.sendSuccess)(res, 'Roles retrieved successfully', roles);
    });
}
exports.RoleController = RoleController;
exports.roleController = new RoleController();
//# sourceMappingURL=controller.js.map