import { Outlet, Link } from 'react-router-dom';
import { MobileAppShell } from '../mobile/MobileAppShell';
import { LayoutDashboard, CheckSquare, BarChart3, FileText, Bell, CheckCircle, User } from 'lucide-react';

const DRAWER_NAV = [
  { label: 'Overview', path: '/committee', icon: LayoutDashboard },
  { label: 'Approvals', path: '/committee/approvals', icon: CheckSquare },
  { label: 'Financials', path: '/committee/financials', icon: BarChart3 },
  { label: 'Compliance', path: '/committee/compliance', icon: FileText },
  { label: 'Society Health', path: '/committee/health', icon: CheckCircle },
];

const BOTTOM_NAV = [
  { label: 'Home', path: '/committee', icon: LayoutDashboard },
  { label: 'Approvals', path: '/committee/approvals', icon: CheckSquare },
  { label: 'Reports', path: '/committee/financials', icon: BarChart3 },
  { label: 'Governance', path: '/committee/compliance', icon: FileText },
  { label: 'Profile', path: '/committee/profile', icon: User },
];

export const CommitteeLayout = () => {
  return (
    <MobileAppShell
      roleTitle="Committee Member"
      accentColor="#3b82f6"
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
