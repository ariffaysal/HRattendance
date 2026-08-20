import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// Role hierarchy: admin > hr > employee
export const UserRole = {
  ADMIN: 'admin',
  HR: 'hr',
  EMPLOYEE: 'employee',
} as const;

export type UserRoleValue = typeof UserRole[keyof typeof UserRole];

export const Roles = (...roles: UserRoleValue[]) => SetMetadata(ROLES_KEY, roles);
