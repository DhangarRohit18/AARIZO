import type { UserRole } from '../domains/auth/types';
export type { UserRole };

export type Action =
  | 'complaint:create' | 'complaint:assign' | 'complaint:resolve' | 'complaint:approve' | 'complaint:delete' | 'complaint:view_own' | 'complaint:view_assigned' | 'complaint:view_all'
  | 'parcel:receive' | 'parcel:handover' | 'parcel:view_own' | 'parcel:view_all'
  | 'attendance:check_in' | 'attendance:check_out' | 'attendance:view_linked' | 'attendance:view_all' | 'attendance:toggle_consent'
  | 'move:request' | 'move:cancel_own' | 'move:approve' | 'move:start' | 'move:view_own'
  | 'renovation:request' | 'renovation:approve' | 'renovation:verify' | 'renovation:log_materials'
  | 'amc:create' | 'amc:renew' | 'amc:view' | 'amc:view_public_amc'
  | 'patrol:log_checkpoint'
  | 'staff:manage' | 'staff:manage_shifts'
  | 'data:view_all' | 'data:view_reports'
  | 'governance:approve_budgets'
  | 'invoice:upload'
  | 'admin:manage_users' | 'admin:configure_society';

export type Permission = Action;

export const RBAC_MATRIX: Record<string, Action[]> = {
  resident: [
    'complaint:create', 'complaint:view_own', 'complaint:resolve', // verify_resolution
    'parcel:view_own',
    'attendance:view_linked', 'attendance:toggle_consent',
    'move:request', 'move:cancel_own', 'move:view_own',
    'renovation:request',
    'amc:view_public_amc'
  ],
  guard: [
    'parcel:receive', 'parcel:handover',
    'attendance:check_in', 'attendance:check_out',
    'move:start',
    'renovation:verify', 'renovation:log_materials',
    'patrol:log_checkpoint',
    'complaint:view_assigned'
  ],
  secretary: [
    'data:view_all',
    'complaint:approve', 'complaint:assign', 'complaint:view_all',
    'parcel:view_all',
    'attendance:view_all',
    'move:approve',
    'renovation:approve',
    'amc:create', 'amc:renew', 'amc:view',
    'staff:manage'
  ],
  committee: [
    'data:view_all', 'data:view_reports',
    'governance:approve_budgets'
  ],
  facility_manager: [
    'data:view_all',
    'complaint:assign', 'complaint:resolve', 'complaint:view_all',
    'amc:view',
    'staff:manage_shifts'
  ],
  vendor: [
    'complaint:view_assigned', 'complaint:resolve',
    'invoice:upload'
  ],
  admin: [
    'admin:manage_users', 'admin:configure_society', 'data:view_all'
  ]
};

export interface RBACUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  societyId?: string;
  flatNumber?: string;
  flatDetails?: string;
}



