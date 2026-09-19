import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRBAC } from '../hooks/useRBAC';
import type { UserRole, Action } from '../types/rbac';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  requiredPermission?: Action;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  requiredPermission,
}) => {
  const { isAuthenticated, step } = useAuth();
  const { activeRole, can } = useRBAC();

  if (!isAuthenticated || step === 'login' || step === 'onboarding') {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());
    if (!normalizedAllowed.includes(activeRole.toLowerCase())) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  if (requiredPermission && !can(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};


