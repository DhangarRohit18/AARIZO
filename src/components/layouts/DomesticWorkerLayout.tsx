import { Outlet, Link } from 'react-router-dom';
import { MobileAppShell } from '../mobile/MobileAppShell';
import { Home, CalendarDays, QrCode, User, Bell } from 'lucide-react';

const DRAWER_NAV = [
  { label: 'Home Dashboard', path: '/domestic', icon: Home },
  { label: 'Today\'s Schedule', path: '/domestic', icon: CalendarDays },
  { label: 'Gate QR Pass', path: '/domestic', icon: QrCode },
  { label: 'Profile', path: '/domestic', icon: User },
];

const BOTTOM_NAV = [
  { label: 'Home', path: '/domestic', icon: Home },
  { label: 'Schedule', path: '/domestic', icon: CalendarDays },
  { label: 'QR Pass', path: '/domestic', icon: QrCode },
  { label: 'Profile', path: '/domestic', icon: User },
];

export const DomesticWorkerLayout = () => {
  return (
    <MobileAppShell
      roleTitle="Domestic Worker"
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
