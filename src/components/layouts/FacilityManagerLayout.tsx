import { Outlet, Link, useNavigate } from 'react-router-dom';
import { MobileAppShell } from '../mobile/MobileAppShell';
import { LayoutDashboard, Settings, Hammer, ClipboardList, Users, Bell, Wrench, CheckSquare } from 'lucide-react';

const DRAWER_NAV = [
  { label: 'Overview', path: '/facility', icon: LayoutDashboard },
  { label: 'Maintenance', path: '/facility/maintenance', icon: Wrench },
  { label: 'Staff Shifts', path: '/facility/shifts', icon: Users },
  { label: 'AMC Contracts', path: '/facility/amc', icon: ClipboardList },
  { label: 'Cleaning Ops', path: '/facility/cleaning', icon: Hammer },
  { label: 'Utilities', path: '/facility/utilities', icon: Settings },
];

const BOTTOM_NAV = [
  { label: 'Home', path: '/facility', icon: LayoutDashboard },
  { label: 'Tasks', path: '/facility/tasks', icon: CheckSquare },
  { label: 'Maintenance', path: '/facility/maintenance', icon: Wrench },
  { label: 'Profile', path: '/facility/profile', icon: Users },
];

export const FacilityManagerLayout = () => {
  const navigate = useNavigate();
  return (
    <MobileAppShell
      roleTitle="Facility Manager"
      societyName="Green Valley Society"
      accentColor="#176B91"
      drawerItems={DRAWER_NAV}
      bottomItems={BOTTOM_NAV}
      onFabClick={() => navigate('/facility/maintenance')}
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
