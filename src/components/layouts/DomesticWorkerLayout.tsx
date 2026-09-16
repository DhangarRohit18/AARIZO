import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, LogOut, Home, Clock, User, Bell } from 'lucide-react';

const BOTTOM_NAV = [
  { label: 'Home', path: '/domestic', icon: Home },
  { label: 'Attendance', path: '/domestic/attendance', icon: Clock },
  { label: 'Profile', path: '/domestic/profile', icon: User },
];

export const DomesticWorkerLayout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/domestic') return location.pathname === '/domestic';
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', width: '100%', backgroundColor: '#f7f4ee', color: '#1c1917', overflowX: 'hidden' }}>
      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#1c1917', height: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.75rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1, minWidth: 0 }}>
          <div style={{ padding: '0.375rem', background: 'rgba(16,185,129,0.2)', borderRadius: '0.5rem', color: '#34d399', display: 'flex' }}>
            <UserCheck size={16} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '0.75rem', color: '#fff', lineHeight: 1.2 }}>Domestic Staff</div>
            <div style={{ fontSize: '0.625rem', color: '#a8a29e', lineHeight: 1.2 }}>{currentUser?.name || 'Staff Member'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <Link to="/notifications" style={{ padding: '0.375rem', color: '#d6d3d1', borderRadius: '0.5rem', display: 'flex', minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}><Bell size={20} /></Link>
          <button onClick={logout} aria-label="Sign Out" style={{ padding: '0.375rem', color: '#f87171', borderRadius: '0.5rem', display: 'flex', minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}><LogOut size={20} /></button>
        </div>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 'calc(3.75rem + env(safe-area-inset-bottom, 0px))' }}>
        <Outlet />
      </main>

      <nav className="bottom-nav">
        {BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link key={item.path} to={item.path} aria-label={item.label} className={`bottom-nav-item${active ? ' active-accent' : ''}`}>
              <Icon className="bottom-nav-icon" strokeWidth={active ? 2.5 : 1.75} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
