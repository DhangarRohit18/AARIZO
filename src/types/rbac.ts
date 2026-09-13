export type UserRole =
  | 'SUPER_ADMIN'
  | 'SOCIETY_ADMIN'
  | 'COMMITTEE_MEMBER'
  | 'SECURITY_GUARD'
  | 'SECURITY' // alias for SECURITY_GUARD
  | 'FACILITY_MANAGER'
  | 'RESIDENT'
  | 'VENDOR'
  | 'SERVICE_PROVIDER'
  | 'DOMESTIC_WORKER';

export type Permission =
  | 'society:manage'
  | 'society:view'
  | 'residents:approve'
  | 'residents:view'
  | 'residents:manage'
  | 'visitors:create'
  | 'visitors:verify'
  | 'visitors:view'
  | 'billing:issue'
  | 'billing:pay'
  | 'billing:view'
  | 'tickets:create'
  | 'tickets:resolve'
  | 'tickets:view'
  | 'alerts:trigger'
  | 'alerts:manage'
  | 'alerts:view'
  | 'vendors:manage'
  | 'vendors:view'
  | 'parking:manage'
  | 'parking:view'
  | 'amenities:book'
  | 'amenities:manage'
  | 'deliveries:manage'
  | 'deliveries:view'
  | 'committee:approvals'
  | 'committee:financials'
  | 'committee:governance'
  | 'facility:maintenance'
  | 'facility:shifts'
  | 'facility:amc'
  | 'domestic:attendance'
  | 'domestic:households'
  | 'platform:subscriptions'
  | 'platform:settings';

export interface RBACUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  societyId?: string;
  societyName?: string;
  flatNumber?: string;
  buildingBlock?: string;
  avatarUrl?: string;
  permissions: Permission[];
}

const ALL_PERMISSIONS: Permission[] = [
  'society:manage', 'society:view', 'residents:approve', 'residents:view', 'residents:manage',
  'visitors:create', 'visitors:verify', 'visitors:view', 'billing:issue', 'billing:pay', 'billing:view',
  'tickets:create', 'tickets:resolve', 'tickets:view', 'alerts:trigger', 'alerts:manage', 'alerts:view',
  'vendors:manage', 'vendors:view', 'parking:manage', 'parking:view', 'amenities:book', 'amenities:manage',
  'deliveries:manage', 'deliveries:view', 'committee:approvals', 'committee:financials', 'committee:governance',
  'facility:maintenance', 'facility:shifts', 'facility:amc', 'domestic:attendance', 'domestic:households',
  'platform:subscriptions', 'platform:settings'
];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: ALL_PERMISSIONS,
  SOCIETY_ADMIN: [
    'society:view', 'residents:approve', 'residents:view', 'residents:manage', 'visitors:view',
    'billing:issue', 'billing:view', 'tickets:resolve', 'tickets:view', 'alerts:manage', 'alerts:view',
    'vendors:manage', 'vendors:view', 'parking:manage', 'parking:view', 'amenities:manage',
    'facility:maintenance', 'facility:shifts', 'committee:approvals'
  ],
  COMMITTEE_MEMBER: [
    'society:view', 'residents:view', 'billing:view', 'vendors:view', 'parking:view',
    'committee:approvals', 'committee:financials', 'committee:governance', 'alerts:view'
  ],
  SECURITY_GUARD: [
    'visitors:verify', 'visitors:view', 'visitors:create', 'alerts:trigger', 'alerts:view',
    'deliveries:manage', 'deliveries:view', 'parking:view'
  ],
  SECURITY: [
    'visitors:verify', 'visitors:view', 'visitors:create', 'alerts:trigger', 'alerts:view',
    'deliveries:manage', 'deliveries:view', 'parking:view'
  ],
  FACILITY_MANAGER: [
    'facility:maintenance', 'facility:shifts', 'facility:amc', 'tickets:resolve', 'tickets:view',
    'vendors:view', 'parking:manage', 'amenities:manage'
  ],
  RESIDENT: [
    'society:view', 'residents:view', 'visitors:create', 'visitors:view', 'billing:pay',
    'billing:view', 'tickets:create', 'tickets:view', 'alerts:trigger', 'alerts:view',
    'amenities:book', 'deliveries:view'
  ],
  VENDOR: [
    'vendors:view', 'deliveries:manage', 'deliveries:view', 'tickets:view'
  ],
  SERVICE_PROVIDER: [
    'tickets:resolve', 'tickets:view', 'visitors:view', 'facility:maintenance'
  ],
  DOMESTIC_WORKER: [
    'domestic:attendance', 'domestic:households', 'visitors:view'
  ]
};

