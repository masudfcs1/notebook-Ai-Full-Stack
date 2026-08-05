"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoleLevel = exports.ROLES = void 0;
exports.ROLES = [
    {
        name: 'SUPER_ADMIN',
        label: 'Super Admin',
        description: 'Full system access with all permissions',
        level: 100,
    },
    {
        name: 'ADMIN',
        label: 'Administrator',
        description: 'Administrative access with most permissions',
        level: 80,
    },
    {
        name: 'MANAGER',
        label: 'Manager',
        description: 'Team management and reporting access',
        level: 60,
    },
    {
        name: 'EMPLOYEE',
        label: 'Employee',
        description: 'Standard employee access',
        level: 40,
    },
    {
        name: 'USER',
        label: 'User',
        description: 'Basic user access',
        level: 20,
    },
];
const getRoleLevel = (role) => {
    const roleInfo = exports.ROLES.find((r) => r.name === role);
    return roleInfo?.level || 0;
};
exports.getRoleLevel = getRoleLevel;
//# sourceMappingURL=types.js.map