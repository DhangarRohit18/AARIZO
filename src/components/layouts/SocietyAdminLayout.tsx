import { Outlet, Link } from 'react-router-dom';
import { MobileAppShell } from '../mobile/MobileAppShell';
import {
  LayoutDashboard,
  Settings,
  CheckSquare,
  BarChart3,
  User,
  Building2,
  Users,
  DollarSign,
  Bell,
  CreditCard,
  Wrench,
  Car,
  Store,
  Sparkles,
  ShieldCheck,
  Lock,
  Radio,
  BedDouble,
  Layers,
  HardHat,
} from 'lucide-react';

const DRAWER_NAV = [
  { label: 'Admin Overview', path: '/admin', icon: LayoutDashboard },
  { label: 'Towers & Blocks', path: '/admin/towers', icon: Layers },
  { label: 'Flat Management', path: '/admin/flats', icon: Building2 },
  { label: 'Resident Approvals', path: '/admin/residents', icon: Users },
  { label: 'Parking Operations', path: '/admin/parking', icon: Car },
  { label: 'Maintenance Ops', path: '/admin/maintenance', icon: Wrench },
  { label: 'Staff Management', path: '/admin/staff', icon: HardHat },
  { label: 'Domestic Workers', path: '/admin/domestic-workers', icon: HardHat },
  { label: 'Vendor Management', path: '/admin/vendors', icon: Store },
  { label: 'Society Expenses', path: '/admin/expenses', icon: DollarSign },
  { label: 'Billing Engine', path: '/admin/billing', icon: CreditCard },
  { label: 'Service Hub', path: '/admin/service-hub', icon: Store },
  { label: 'Amenity Management', path: '/admin/amenities', icon: Sparkles },
  { label: 'Child Safety Board', path: '/admin/child-safety', icon: ShieldCheck },
  { label: 'Guest Stay', path: '/admin/guest-stay', icon: BedDouble },
  { label: 'Society Intelligence', path: '/admin/intelligence', icon: BarChart3 },
  { label: 'Security & Audit', path: '/admin/security-audit', icon: Lock },
  { label: 'Realtime Hub', path: '/admin/realtime', icon: Radio },
  { label: 'Notifications', path: '/notifications', icon: Bell },
];

const BOTTOM_NAV = [
  { label: 'Home', path: '/admin', icon: LayoutDashboard },
  { label: 'Operations', path: '/admin/operations', icon: Settings },
  { label: 'Approvals', path: '/admin/residents', icon: CheckSquare },
  { label: 'Insights', path: '/admin/intelligence', icon: BarChart3 },
  { label: 'Profile', path: '/admin/profile', icon: User },
];

export const SocietyAdminLayout = () => {
  return (
    <MobileAppShell
      roleTitle="Secretary"
      accentColor="#8b5cf6"
      drawerItems={DRAWER_NAV}
      bottomItems={BOTTOM_NAV}
      topRightActions={
        <Link
          to="/notifications"
          aria-label="Admin Notifications"
          style={{
            position: 'relative',
            color: '#a8a29e',
            display: 'flex',
            minHeight: 44,
            minWidth: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bell size={20} />
        </Link>
      }
    >
      <Outlet />
    </MobileAppShell>
  );
};
