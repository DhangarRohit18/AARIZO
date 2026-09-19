import type { UserRole, Action } from '../types/rbac';

export interface RouteItem {
  path: string;
  name: string;
  allowedRoles: UserRole[];
  requiredAction?: Action;
}

export const ROUTES = {
  LOGIN: '/login',
  ONBOARDING: '/onboarding',
  UNAUTHORIZED: '/unauthorized',
  RESIDENT_DASHBOARD: '/resident',
  RESIDENT_VISITORS: '/resident/visitors',
  RESIDENT_COMMUNITY: '/resident/community',
  RESIDENT_PAYMENTS: '/resident/payments',
  RESIDENT_HELP: '/resident/help',
  SECRETARY_DASHBOARD: '/admin',
  SECRETARY_RESIDENTS: '/admin/residents',
  SECRETARY_NOTICES: '/admin/notices',
  SECRETARY_FINANCES: '/admin/finances',
  SECURITY_DASHBOARD: '/security',
  SECURITY_VERIFY: '/security/verify',
  SECURITY_VISITORS: '/security/visitors',
  SECURITY_HISTORY: '/security/history',
  SECURITY_ALERTS: '/security/alerts',
  SUPER_ADMIN_DASHBOARD: '/super-admin',
  VENDOR_DASHBOARD: '/vendor',
  SERVICE_PROVIDER_DASHBOARD: '/service-provider',
};


