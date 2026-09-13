import { useAuth } from '../context/AuthContext';
import type { UserRole, Permission } from '../types/rbac';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../utils/permissions';

export function useRBAC() {
  const { currentUser, selectedRole } = useAuth();
  const activeRole: UserRole = (currentUser?.role?.toUpperCase() as UserRole) || (selectedRole.toUpperCase() as UserRole) || 'RESIDENT';

  return {
    activeRole,
    can: (permission: Permission) => hasPermission(activeRole, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(activeRole, permissions),
    canAll: (permissions: Permission[]) => hasAllPermissions(activeRole, permissions),
  };
}
