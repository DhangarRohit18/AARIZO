import { Outlet, Link } from 'react-router-dom';
import { MobileAppShell } from '../mobile/MobileAppShell';
import { Home, Bell } from 'lucide-react';

const DRAWER_NAV = [
  { label: 'Home', path: '/domestic', icon: Home },
];

const BOTTOM_NAV = [
  { label: 'Home', path: '/domestic', icon: Home },
];

export const DomesticWorkerLayout = () => {
  return (
    <MobileAppShell
      roleTitle="Domestic Worker"
      accentColor="#0ea5e9"
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
