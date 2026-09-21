import { Outlet, Link, useNavigate } from 'react-router-dom';
import { MobileAppShell } from '../mobile/MobileAppShell';
import {
  QrCode,
  Scan,
  Activity,
  ShieldAlert,
  User,
  Package,
  Car,
  Bell,
  HardHat,
  ShieldCheck,
  BedDouble,
} from 'lucide-react';

const DRAWER_NAV = [
  { label: 'Gate Terminal', path: '/security', icon: QrCode },
  { label: 'Visitor Scanner', path: '/security/verify', icon: Scan },
  { label: 'Activity Log', path: '/security/activity', icon: Activity },
  { label: 'Parcel Intelligence', path: '/security/delivery-intelligence', icon: Package },
  { label: 'Parking Console', path: '/security/parking', icon: Car },
  { label: 'Staff Hub', path: '/security/staff-scanner', icon: HardHat },
  { label: 'Emergency Command', path: '/security/emergency-command', icon: ShieldAlert },
  { label: 'Privacy Hub', path: '/security/privacy-hub', icon: ShieldCheck },
  { label: 'Guest Stays', path: '/security/guest-stay', icon: BedDouble },
];

const BOTTOM_NAV = [
  { label: 'Gate', path: '/security', icon: QrCode },
  { label: 'Scan', path: '/security/verify', icon: Scan },
  { label: 'Emergency', path: '/security/emergency-command', icon: ShieldAlert },
  { label: 'Profile', path: '/security/profile', icon: User },
];

export const SecurityLayout = () => {
  const navigate = useNavigate();
  return (
    <MobileAppShell
      roleTitle="Security Guard"
      societyName="Green Valley Society"
      drawerItems={DRAWER_NAV}
      bottomItems={BOTTOM_NAV}
      onFabClick={() => navigate('/security/verify')}
      topRightActions={
        <Link
          to="/security/emergency-command"
          aria-label="Emergency Alerts"
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
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
