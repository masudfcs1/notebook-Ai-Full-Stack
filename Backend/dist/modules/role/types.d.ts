export type RoleType = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'USER';
export interface RoleInfo {
    name: RoleType;
    label: string;
    description: string;
    level: number;
}
export declare const ROLES: RoleInfo[];
export declare const getRoleLevel: (role: RoleType) => number;
//# sourceMappingURL=types.d.ts.map