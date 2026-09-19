import { Outlet, Link } from 'react-router-dom';
import { MobileAppShell } from '../mobile/MobileAppShell';
import { Store, ShoppingBag, Users, FileText, Bell, User } from 'lucide-react';

const DRAWER_NAV = [
  { label: 'Vendor Hub', path: '/vendor', icon: Store },
  { label: 'Portal', path: '/vendor/portal', icon: ShoppingBag },
];

const BOTTOM_NAV = [
  { label: 'Home', path: '/vendor', icon: Store },
  { label: 'Jobs', path: '/vendor/portal', icon: ShoppingBag },
  { label: 'Workers', path: '/vendor/workers', icon: Users },
  { label: 'Records', path: '/vendor/records', icon: FileText },
  { label: 'Profile', path: '/vendor/profile', icon: User },
];

export const VendorLayout = () => {
  return (
    <MobileAppShell
      roleTitle="Vendor"
      accentColor="#8b5cf6"
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
