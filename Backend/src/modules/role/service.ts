import { ROLES, RoleInfo } from './types';

export class RoleService {
  getAllRoles(): RoleInfo[] {
    return ROLES;
  }

  getRoleByName(name: string): RoleInfo | undefined {
    return ROLES.find((r) => r.name === name);
  }

  validateRole(role: string): boolean {
    return ROLES.some((r) => r.name === role);
  }
}

export const roleService = new RoleService();
