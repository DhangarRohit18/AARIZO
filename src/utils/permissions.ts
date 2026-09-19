import { RBAC_MATRIX } from '../types/rbac';
import type { Action, RBACUser } from '../types/rbac';

/**
 * Centralized Permission Utility for CommunityOS.
 * Checks if a given user is allowed to perform a specific action.
 * Also supports optional "resource ownership" checking.
 * 
 * @param user The current authenticated user object
 * @param action The specific action they want to perform
 * @param resourceOwnerId (Optional) The UID of the user who owns the resource being accessed
 * @returns boolean
 */
export function can(user: RBACUser | null | undefined, action: Action, resourceOwnerId?: string): boolean {
  if (!user || !user.role) return false;
  
  // Admins bypass all role checks
  if (user.role === 'admin') return true;

  // Check the strict RBAC Matrix
  const allowedActions = RBAC_MATRIX[user.role] || [];
  const hasAction = allowedActions.includes(action);

  if (!hasAction) return false;

  // Resource Ownership Verification
  // If the action explicitly implies operating on their *own* data, we MUST verify the resource belongs to them
  if (action.endsWith(':view_own') || action.endsWith(':cancel_own')) {
    // If a resourceOwnerId was provided, verify it matches the current user
    if (resourceOwnerId && resourceOwnerId !== user.id) {
      return false; 
    }
  }

  return true;
}

