import React from 'react';
import type { Permission } from '../../types/rbac';
import { useRBAC } from '../../hooks/useRBAC';

interface PermissionGuardProps {
  permission?: Permission;
  anyPermissions?: Permission[];
  allPermissions?: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  anyPermissions,
  allPermissions,
  children,
  fallback = null,
}) => {
  const { can, canAny, canAll } = useRBAC();

  if (permission && !can(permission)) {
    return <>{fallback}</>;
  }

  if (anyPermissions && !canAny(anyPermissions)) {
    return <>{fallback}</>;
  }

  if (allPermissions && !canAll(allPermissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
