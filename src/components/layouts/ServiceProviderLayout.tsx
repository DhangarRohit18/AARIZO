import { Outlet, Link } from 'react-router-dom';
import { MobileAppShell } from '../mobile/MobileAppShell';
import { HardHat, CheckSquare, Bell } from 'lucide-react';

const DRAWER_NAV = [
  { label: 'Dashboard', path: '/service-provider', icon: HardHat },
  { label: 'Tasks', path: '/service-provider/tasks', icon: CheckSquare },
];

const BOTTOM_NAV = [
  { label: 'Home', path: '/service-provider', icon: HardHat },
  { label: 'Tasks', path: '/service-provider/tasks', icon: CheckSquare },
];

export const ServiceProviderLayout = () => {
  return (
    <MobileAppShell
      roleTitle="Service Provider"
      accentColor="#14b8a6"
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
