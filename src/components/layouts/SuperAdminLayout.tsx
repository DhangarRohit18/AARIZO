import { Outlet, Link } from 'react-router-dom';
import { MobileAppShell } from '../mobile/MobileAppShell';
import { Settings, Building2, Users, Shield, Bell, User } from 'lucide-react';

const DRAWER_NAV = [
  { label: 'Super Admin', path: '/super-admin', icon: Shield },
  { label: 'Societies', path: '/super-admin/societies', icon: Building2 },
];

const BOTTOM_NAV = [
  { label: 'Home', path: '/super-admin', icon: Shield },
  { label: 'Societies', path: '/super-admin/societies', icon: Building2 },
  { label: 'Users', path: '/super-admin/users', icon: Users },
  { label: 'Monitoring', path: '/super-admin/monitoring', icon: Settings },
  { label: 'Profile', path: '/super-admin/profile', icon: User },
];

export const SuperAdminLayout = () => {
  return (
    <MobileAppShell
      roleTitle="System Admin"
      accentColor="#1d4ed8"
      drawerItems={DRAWER_NAV}
      bottomItems={BOTTOM_NAV}
      topRightActions={
        <Link to="/notifications" aria-label="Notifications" style={{ color: '#a8a29e', minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bell size={20} />
        </Link>
      }
    >
      <Outlet />
    </MobileAppShell>
  );
};
