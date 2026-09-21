import { Outlet, Link } from 'react-router-dom';
import { MobileAppShell } from '../mobile/MobileAppShell';
import { Building2, Users, Shield, Bell, User } from 'lucide-react';

const DRAWER_NAV = [
  { label: 'Super Admin', path: '/super-admin', icon: Shield },
  { label: 'Societies', path: '/super-admin/societies', icon: Building2 },
];

const BOTTOM_NAV = [
  { label: 'Home', path: '/super-admin', icon: Shield },
  { label: 'Societies', path: '/super-admin/societies', icon: Building2 },
  { label: 'Users', path: '/super-admin/users', icon: Users },
  { label: 'Profile', path: '/super-admin/profile', icon: User },
];

export const SuperAdminLayout = () => {
  return (
    <MobileAppShell
      roleTitle="System Admin"
      societyName="AARIZO Platform"
      accentColor="#176B91"
      drawerItems={DRAWER_NAV}
      bottomItems={BOTTOM_NAV}
      topRightActions={
        <Link
          to="/notifications"
          aria-label="Notifications"
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
