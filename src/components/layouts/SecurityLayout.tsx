import { Outlet, Link } from 'react-router-dom';
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
  { label: 'Activity', path: '/security/activity', icon: Activity },
  { label: 'Emergency', path: '/security/emergency-command', icon: ShieldAlert },
  { label: 'Profile', path: '/security/profile', icon: User },
];

export const SecurityLayout = () => {
  return (
    <MobileAppShell
      roleTitle="Security Guard"
      accentColor="#ef4444"
      drawerItems={DRAWER_NAV}
      bottomItems={BOTTOM_NAV}
      topRightActions={
        <Link
          to="/security/emergency-command"
          aria-label="Emergency Alerts"
          style={{
            position: 'relative',
            color: '#ef4444',
            display: 'flex',
            minHeight: 44,
            minWidth: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bell size={20} />
        </Link>
      }
    >
      <Outlet />
    </MobileAppShell>
  );
};
