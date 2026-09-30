import { Outlet, Link } from 'react-router-dom';
import { MobileAppShell } from '../mobile/MobileAppShell';
import { HardHat, CheckSquare, Bell, User, QrCode } from 'lucide-react';

const DRAWER_NAV = [
  { label: 'Dashboard', path: '/service-provider', icon: HardHat },
  { label: 'Tasks', path: '/service-provider/tasks', icon: CheckSquare },
  { label: 'Gate QR Pass', path: '/service-provider', icon: QrCode },
  { label: 'Profile', path: '/service-provider', icon: User },
];

const BOTTOM_NAV = [
  { label: 'Home', path: '/service-provider', icon: HardHat },
  { label: 'Tasks', path: '/service-provider/tasks', icon: CheckSquare },
  { label: 'QR Pass', path: '/service-provider', icon: QrCode },
  { label: 'Profile', path: '/service-provider', icon: User },
];

export const ServiceProviderLayout = () => {
  return (
    <MobileAppShell
      roleTitle="Service Provider"
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
