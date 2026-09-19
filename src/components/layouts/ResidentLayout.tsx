import { Outlet, Link } from 'react-router-dom';
import { MobileAppShell } from '../mobile/MobileAppShell';
import { Home, Grid, Activity, Users, User, ShieldAlert, CreditCard, Ticket, Bell } from 'lucide-react';

const DRAWER_NAV = [
  { icon: Home, label: 'Dashboard', path: '/resident' },
  { icon: Grid, label: 'Services', path: '/resident/services' },
  { icon: Activity, label: 'Activity', path: '/resident/activity' },
  { icon: Users, label: 'Community', path: '/resident/community' },
  { icon: CreditCard, label: 'Payments', path: '/resident/billing' },
  { icon: Ticket, label: 'Complaints', path: '/resident/requests' },
  { icon: ShieldAlert, label: 'Emergency', path: '/resident/emergency' },
  { icon: User, label: 'Profile', path: '/resident/profile' },
];

const BOTTOM_NAV = [
  { icon: Home, label: 'Home', path: '/resident' },
  { icon: Grid, label: 'Services', path: '/resident/services' },
  { icon: Activity, label: 'Activity', path: '/resident/activity' },
  { icon: Users, label: 'Community', path: '/resident/community' },
  { icon: User, label: 'Profile', path: '/resident/profile' },
];

export const ResidentLayout = () => {
  return (
    <MobileAppShell
      roleTitle="Resident"
      accentColor="#10b981"
      drawerItems={DRAWER_NAV}
      bottomItems={BOTTOM_NAV}
      topRightActions={
        <Link
          to="/resident/notifications"
          aria-label="Notifications"
          style={{
            position: 'relative',
            color: '#a8a29e',
            display: 'flex',
            minHeight: 44,
            minWidth: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bell size={20} />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              background: '#10b981',
              borderRadius: '50%',
              border: '1.5px solid #1c1917',
            }}
          />
        </Link>
      }
    >
      <Outlet />
    </MobileAppShell>
  );
};
