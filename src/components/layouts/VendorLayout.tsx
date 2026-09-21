import { Outlet, Link } from 'react-router-dom';
import { MobileAppShell } from '../mobile/MobileAppShell';
import { Store, ShoppingBag, Users, Bell, User } from 'lucide-react';

const DRAWER_NAV = [
  { label: 'Vendor Hub', path: '/vendor', icon: Store },
  { label: 'Portal', path: '/vendor/portal', icon: ShoppingBag },
];

const BOTTOM_NAV = [
  { label: 'Home', path: '/vendor', icon: Store },
  { label: 'Jobs', path: '/vendor/portal', icon: ShoppingBag },
  { label: 'Workers', path: '/vendor/workers', icon: Users },
  { label: 'Profile', path: '/vendor/profile', icon: User },
];

export const VendorLayout = () => {
  return (
    <MobileAppShell
      roleTitle="Vendor"
      societyName="Green Valley Society"
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
