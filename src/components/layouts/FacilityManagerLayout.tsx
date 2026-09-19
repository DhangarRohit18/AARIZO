import { Outlet, Link } from 'react-router-dom';
import { MobileAppShell } from '../mobile/MobileAppShell';
import { LayoutDashboard, Settings, Hammer, ClipboardList, Users, Bell, Wrench, Search, CheckSquare } from 'lucide-react';

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
  { label: 'Inspections', path: '/facility/cleaning', icon: Search },
  { label: 'Staff', path: '/facility/shifts', icon: Users },
];

export const FacilityManagerLayout = () => {
  return (
    <MobileAppShell
      roleTitle="Facility Manager"
      accentColor="#f59e0b"
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
