import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  FileCheck,
  DollarSign,
  ShieldCheck,
  Activity,
  BookOpen,
  Bell,
  LogOut,
  User,
  X,
  Menu,
  ChevronRight,
} from 'lucide-react';

const BOTTOM_NAV = [
  { label: 'Overview', path: '/committee', icon: Home },
  { label: 'Approvals', path: '/committee/approvals', icon: FileCheck },
  { label: 'Financials', path: '/committee/financials', icon: DollarSign },
  { label: 'Compliance', path: '/committee/compliance', icon: ShieldCheck },
  { label: 'Profile', path: '/committee/profile', icon: User },
];

const DRAWER_NAV = [
  { label: 'Executive Overview', path: '/committee', icon: Home },
  { label: 'Pending Approvals', path: '/committee/approvals', icon: FileCheck },
  { label: 'Financial Summary', path: '/committee/financials', icon: DollarSign },
  { label: 'Statutory Compliance', path: '/committee/compliance', icon: ShieldCheck },
  { label: 'Society Health Index', path: '/committee/health', icon: Activity },
  { label: 'Governance & Bye-Laws', path: '/committee/governance', icon: BookOpen },
  { label: 'Notifications', path: '/notifications', icon: Bell },
];

export const CommitteeLayout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/committee') return location.pathname === '/committee';
    return location.pathname.startsWith(path);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        width: '100%',
        backgroundColor: '#f7f4ee',
        color: '#1c1917',
        overflowX: 'hidden',
      }}
    >
      {/* Header */}
      <header className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1, minWidth: 0 }}>
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            style={{ padding: '0.375rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.1)', color: '#d6d3d1', display: 'flex', minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <Menu size={20} />
          </button>
          <div style={{ padding: '0.375rem', background: 'rgba(168,85,247,0.25)', borderRadius: '0.5rem', color: '#c4b5fd', display: 'flex' }}>
            <Activity size={16} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '0.75rem', color: '#fff', lineHeight: 1.2 }}>Committee Portal</div>
            <div style={{ fontSize: '0.625rem', color: '#a8a29e', lineHeight: 1.2 }}>{currentUser?.name || 'Member'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <Link to="/notifications" style={{ padding: '0.375rem', color: '#d6d3d1', borderRadius: '0.5rem', display: 'flex', minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={20} />
          </Link>
          <button onClick={logout} style={{ padding: '0.375rem', color: '#f87171', borderRadius: '0.5rem', display: 'flex', minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}>
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Drawer */}
      {drawerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,25,23,0.65)', backdropFilter: 'blur(2px)' }} onClick={() => setDrawerOpen(false)} />
          <div style={{ position: 'relative', width: '82vw', maxWidth: '320px', height: '100%', background: '#f7f4ee', borderRight: '1px solid #dcd4c7', display: 'flex', flexDirection: 'column', zIndex: 1, boxShadow: '4px 0 24px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '1rem', paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))', background: '#1c1917', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>Committee Member</div>
              <button onClick={() => setDrawerOpen(false)} style={{ padding: '0.375rem', color: '#78716c', background: 'rgba(255,255,255,0.08)', borderRadius: '0.5rem', display: 'flex', minHeight: 40, minWidth: 40, alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>
            <nav style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0.5rem' }}>
              {DRAWER_NAV.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link key={item.path} to={item.path} onClick={() => setDrawerOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.75rem', marginBottom: '0.125rem', fontWeight: 600, fontSize: '0.8125rem', textDecoration: 'none', minHeight: 48, background: active ? '#1c1917' : 'transparent', color: active ? '#fff' : '#44403c' }}>
                    <Icon size={17} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {active && <ChevronRight size={14} />}
                  </Link>
                );
              })}
            </nav>
            <div style={{ padding: '0.75rem', borderTop: '1px solid #dcd4c7', paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))', flexShrink: 0 }}>
              <button onClick={() => { setDrawerOpen(false); logout(); }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.75rem', background: '#fff1f2', color: '#be123c', fontWeight: 700, fontSize: '0.8125rem', border: '1px solid #fecdd3', minHeight: 48 }}>
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 'calc(3.75rem + env(safe-area-inset-bottom, 0px))' }}>
        <Outlet />
      </main>

      <nav className="bottom-nav">
        {BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link key={item.path} to={item.path} aria-label={item.label} className={`bottom-nav-item${active ? ' active' : ''}`}>
              <Icon className="bottom-nav-icon" strokeWidth={active ? 2.5 : 1.75} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
