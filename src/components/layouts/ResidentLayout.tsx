import { Outlet, Link, useNavigate } from 'react-router-dom';
import { MobileAppShell } from '../mobile/MobileAppShell';
import {
  Home,
  Grid,
  Users,
  User,
  ShieldAlert,
  CreditCard,
  Ticket,
  Bell,
  Car,
  UserCheck,
  Baby,
  Sparkles,
  Clock,
} from 'lucide-react';

const DRAWER_NAV = [
  { icon: Home, label: 'Home Dashboard', path: '/resident' },
  { icon: UserCheck, label: 'Visitor Passes', path: '/resident/visitors' },
  { icon: Car, label: 'Vehicle & Parking', path: '/resident/parking' },
  { icon: Baby, label: 'Child Safety Pass', path: '/resident/child-safety' },
  { icon: CreditCard, label: 'Maintenance Bills', path: '/resident/billing' },
  { icon: Ticket, label: 'Complaints & NOCs', path: '/resident/requests' },
  { icon: Sparkles, label: 'Amenity Bookings', path: '/resident/amenities' },
  { icon: Grid, label: 'Services & Help', path: '/resident/services' },
  { icon: Users, label: 'Community & Notices', path: '/resident/community' },
  { icon: Clock, label: 'Activity Logs', path: '/resident/activity' },
  { icon: ShieldAlert, label: 'Emergency SOS', path: '/resident/emergency' },
  { icon: User, label: 'Profile & Settings', path: '/resident/profile' },
];

const BOTTOM_NAV = [
  { icon: Home, label: 'Home', path: '/resident' },
  { icon: Grid, label: 'Services', path: '/resident/services' },
  { icon: Users, label: 'Community', path: '/resident/community' },
  { icon: User, label: 'Profile', path: '/resident/profile' },
];

export const ResidentLayout = () => {
  const navigate = useNavigate();
  return (
    <MobileAppShell
      roleTitle="Resident"
      societyName="Green Valley Society"
      drawerItems={DRAWER_NAV}
      bottomItems={BOTTOM_NAV}
      onFabClick={() => navigate('/resident/visitors')}
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
