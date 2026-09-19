import { useAuth } from '../context/AuthContext';
import type { UserRole, Action } from '../types/rbac';
import { can } from '../utils/permissions';

export function useRBAC() {
  const { currentUser, status } = useAuth();
  
  if (status !== 'AUTHENTICATED' || !currentUser) {
    return {
      activeRole: null as unknown as UserRole, // Safe fallback for unauthenticated
      can: () => false,
      canAny: () => false,
      canAll: () => false,
    };
  }

  const activeRole: UserRole = currentUser.role as UserRole;

  return {
    activeRole,
    can: (action: Action) => can(currentUser as any, action),
    canAny: (actions: Action[]) => actions.some(action => can(currentUser as any, action)),
    canAll: (actions: Action[]) => actions.every(action => can(currentUser as any, action)),
  };
}

