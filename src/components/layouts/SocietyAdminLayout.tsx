import { Outlet, Link, useNavigate } from 'react-router-dom';
import { MobileAppShell } from '../mobile/MobileAppShell';
import {
  LayoutDashboard,
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
  Lock,
  Radio,
  Layers,
  HardHat,
} from 'lucide-react';

const DRAWER_NAV = [
  { label: 'Admin Overview', path: '/admin', icon: LayoutDashboard },
  { label: 'Residents Directory', path: '/admin/residents', icon: Users },
  { label: 'Complaints', path: '/admin/requests', icon: CheckSquare },
  { label: 'Maintenance Ops', path: '/admin/maintenance', icon: Wrench },
  { label: 'Amenities', path: '/admin/amenities', icon: Sparkles },
  { label: 'Staff Management', path: '/admin/staff', icon: HardHat },
  { label: 'Towers & Blocks', path: '/admin/towers', icon: Layers },
  { label: 'Flat Management', path: '/admin/flats', icon: Building2 },
  { label: 'Parking Operations', path: '/admin/parking', icon: Car },
  { label: 'Domestic Workers', path: '/admin/domestic-workers', icon: HardHat },
  { label: 'Vendor Management', path: '/admin/vendors', icon: Store },
  { label: 'Society Expenses', path: '/admin/expenses', icon: DollarSign },
  { label: 'Billing Engine', path: '/admin/billing', icon: CreditCard },
  { label: 'Society Intelligence', path: '/admin/intelligence', icon: BarChart3 },
  { label: 'Security & Audit', path: '/admin/security-audit', icon: Lock },
  { label: 'Realtime Hub', path: '/admin/realtime', icon: Radio },
  { label: 'Notifications', path: '/notifications', icon: Bell },
];

const BOTTOM_NAV = [
  { label: 'Home', path: '/admin', icon: LayoutDashboard },
  { label: 'Residents', path: '/admin/residents', icon: Users },
  { label: 'Notices', path: '/admin/community', icon: Bell },
  { label: 'Profile', path: '/admin/profile', icon: User },
];

export const SocietyAdminLayout = () => {
  const navigate = useNavigate();
  return (
    <MobileAppShell
      roleTitle="Secretary"
      societyName="Green Valley Society"
      drawerItems={DRAWER_NAV}
      bottomItems={BOTTOM_NAV}
      onFabClick={() => navigate('/admin/requests')}
      topRightActions={
        <Link
          to="/notifications"
          aria-label="Admin Notifications"
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.12)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
          }}
        >
          <Bell size={18} />
        </Link>
      }
    >
      <Outlet />
    </MobileAppShell>
  );
};
