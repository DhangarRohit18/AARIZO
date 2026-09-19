import { useAuth } from '../context/AuthContext';
import type { UserRole, Action } from '../types/rbac';
import { can } from '../utils/permissions';

export function useRBAC() {
  const { currentUser, selectedRole } = useAuth();
  const activeRole: UserRole = (currentUser?.role?.toLowerCase() as UserRole) || (selectedRole.toLowerCase() as UserRole) || 'resident';

  const simulatedUser = currentUser || { id: 'test', name: 'test', phone: '0', role: activeRole };

  return {
    activeRole,
    can: (action: Action) => can(simulatedUser as any, action),
    canAny: (actions: Action[]) => actions.some(action => can(simulatedUser as any, action)),
    canAll: (actions: Action[]) => actions.every(action => can(simulatedUser as any, action)),
  };
}
