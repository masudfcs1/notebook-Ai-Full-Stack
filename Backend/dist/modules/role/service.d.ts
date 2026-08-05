import { RoleInfo } from './types';
export declare class RoleService {
    getAllRoles(): RoleInfo[];
    getRoleByName(name: string): RoleInfo | undefined;
    validateRole(role: string): boolean;
}
export declare const roleService: RoleService;
//# sourceMappingURL=service.d.ts.map