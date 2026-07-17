export type RoleType = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'USER';

export interface RoleInfo {
  name: RoleType;
  label: string;
  description: string;
  level: number;
}

export const ROLES: RoleInfo[] = [
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

export const getRoleLevel = (role: RoleType): number => {
  const roleInfo = ROLES.find((r) => r.name === role);
  return roleInfo?.level || 0;
};
