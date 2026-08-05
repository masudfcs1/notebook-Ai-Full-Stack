"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleService = exports.RoleService = void 0;
const types_1 = require("./types");
class RoleService {
    getAllRoles() {
        return types_1.ROLES;
    }
    getRoleByName(name) {
        return types_1.ROLES.find((r) => r.name === name);
    }
    validateRole(role) {
        return types_1.ROLES.some((r) => r.name === role);
    }
}
exports.RoleService = RoleService;
exports.roleService = new RoleService();
//# sourceMappingURL=service.js.map