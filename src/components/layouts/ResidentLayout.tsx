import { Outlet, Link } from 'react-router-dom';
import { MobileAppShell } from '../mobile/MobileAppShell';
import { Home, Grid, Users, User, ShieldAlert, CreditCard, Ticket, Bell } from 'lucide-react';

const DRAWER_NAV = [
  { icon: Home, label: 'Dashboard', path: '/resident' },
  { icon: Grid, label: 'Services', path: '/resident/services' },
  { icon: Users, label: 'Community', path: '/resident/community' },
  { icon: CreditCard, label: 'Payments', path: '/resident/billing' },
  { icon: Ticket, label: 'Complaints', path: '/resident/requests' },
  { icon: ShieldAlert, label: 'Emergency', path: '/resident/emergency' },
  { icon: User, label: 'Profile', path: '/resident/profile' },
];

const BOTTOM_NAV = [
  { icon: Home, label: 'Home', path: '/resident' },
  { icon: Grid, label: 'Services', path: '/resident/services' },
  { icon: Users, label: 'Community', path: '/resident/community' },
  { icon: User, label: 'Profile', path: '/resident/profile' },
];

export const ResidentLayout = () => {
  return (
    <MobileAppShell
      roleTitle="Resident"
      societyName="Green Valley Society"
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
