import type { UserRole, Permission } from '../types/rbac';
import { ROLE_PERMISSIONS } from '../types/rbac';

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function hasAnyPermission(role: UserRole | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.some((perm) => hasPermission(role, perm));
}

export function hasAllPermissions(role: UserRole | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.every((perm) => hasPermission(role, perm));
}
