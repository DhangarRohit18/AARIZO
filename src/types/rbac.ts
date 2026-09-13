export type UserRole =
  | 'SUPER_ADMIN'
  | 'SOCIETY_ADMIN'
  | 'SECURITY'
  | 'RESIDENT'
  | 'VENDOR'
  | 'SERVICE_PROVIDER';

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
  | 'deliveries:view';

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

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'society:manage',
    'society:view',
    'residents:approve',
    'residents:view',
    'residents:manage',
    'visitors:create',
    'visitors:verify',
    'visitors:view',
    'billing:issue',
    'billing:pay',
    'billing:view',
    'tickets:create',
    'tickets:resolve',
    'tickets:view',
    'alerts:trigger',
    'alerts:manage',
    'alerts:view',
    'vendors:manage',
    'vendors:view',
    'parking:manage',
    'parking:view',
    'amenities:book',
    'amenities:manage',
    'deliveries:manage',
    'deliveries:view',
  ],
  SOCIETY_ADMIN: [
    'society:view',
    'residents:approve',
    'residents:view',
    'residents:manage',
    'visitors:view',
    'billing:issue',
    'billing:view',
    'tickets:resolve',
    'tickets:view',
    'alerts:manage',
    'alerts:view',
    'vendors:manage',
    'vendors:view',
    'parking:manage',
    'parking:view',
    'amenities:manage',
  ],
  SECURITY: [
    'visitors:verify',
    'visitors:view',
    'alerts:trigger',
    'alerts:view',
    'deliveries:manage',
    'deliveries:view',
    'parking:view',
  ],
  RESIDENT: [
    'society:view',
    'residents:view',
    'visitors:create',
    'visitors:view',
    'billing:pay',
    'billing:view',
    'tickets:create',
    'tickets:view',
    'alerts:trigger',
    'alerts:view',
    'amenities:book',
    'deliveries:view',
  ],
  VENDOR: [
    'vendors:view',
    'deliveries:manage',
    'deliveries:view',
  ],
  SERVICE_PROVIDER: [
    'tickets:resolve',
    'tickets:view',
    'visitors:view',
  ],
};
