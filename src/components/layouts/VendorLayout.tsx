import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  ShoppingBag,
  Calendar,
  FileText,
  User,
  Store,
  Bell,
  LogOut,
  X,
  Menu,
  ChevronRight,
} from 'lucide-react';

const BOTTOM_NAV = [
  { label: 'Home', path: '/vendor', icon: Home },
  { label: 'Jobs', path: '/vendor/portal', icon: ShoppingBag },
  { label: 'Schedule', path: '/vendor/schedule', icon: Calendar },
  { label: 'Invoices', path: '/vendor/invoices', icon: FileText },
  { label: 'Profile', path: '/vendor/profile', icon: User },
];

const DRAWER_NAV = [
  { label: 'Vendor Dashboard', path: '/vendor', icon: Home },
  { label: 'Orders & Service Portal', path: '/vendor/portal', icon: ShoppingBag },
  { label: 'Schedule', path: '/vendor/schedule', icon: Calendar },
  { label: 'Invoices', path: '/vendor/invoices', icon: FileText },
  { label: 'Notifications', path: '/notifications', icon: Bell },
];

export const VendorLayout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/vendor') return location.pathname === '/vendor';
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', width: '100%', backgroundColor: '#f7f4ee', color: '#1c1917', overflowX: 'hidden' }}>
      <header className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1, minWidth: 0 }}>
          <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" style={{ padding: '0.375rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.1)', color: '#d6d3d1', display: 'flex', minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}><Menu size={20} /></button>
          <div style={{ padding: '0.375rem', background: 'rgba(245,158,11,0.25)', borderRadius: '0.5rem', color: '#fbbf24', display: 'flex' }}><Store size={16} /></div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '0.75rem', color: '#fff', lineHeight: 1.2 }}>Vendor Hub</div>
            <div style={{ fontSize: '0.625rem', color: '#a8a29e', lineHeight: 1.2 }}>{currentUser?.name || 'Partner'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <Link to="/notifications" style={{ padding: '0.375rem', color: '#d6d3d1', borderRadius: '0.5rem', display: 'flex', minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}><Bell size={20} /></Link>
          <button onClick={logout} style={{ padding: '0.375rem', color: '#f87171', borderRadius: '0.5rem', display: 'flex', minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}><LogOut size={20} /></button>
        </div>
      </header>

      {drawerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,25,23,0.65)', backdropFilter: 'blur(2px)' }} onClick={() => setDrawerOpen(false)} />
          <div style={{ position: 'relative', width: '82vw', maxWidth: '320px', height: '100%', background: '#f7f4ee', borderRight: '1px solid #dcd4c7', display: 'flex', flexDirection: 'column', zIndex: 1, boxShadow: '4px 0 24px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '1rem', paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))', background: '#1c1917', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>Vendor Hub</div>
              <button onClick={() => setDrawerOpen(false)} style={{ padding: '0.375rem', color: '#78716c', background: 'rgba(255,255,255,0.08)', borderRadius: '0.5rem', display: 'flex', minHeight: 40, minWidth: 40, alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
            </div>
            <nav style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0.5rem' }}>
              {DRAWER_NAV.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link key={item.path} to={item.path} onClick={() => setDrawerOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.75rem', marginBottom: '0.125rem', fontWeight: 600, fontSize: '0.8125rem', textDecoration: 'none', minHeight: 48, background: active ? '#1c1917' : 'transparent', color: active ? '#fff' : '#44403c' }}>
                    <Icon size={17} style={{ flexShrink: 0 }} /><span style={{ flex: 1 }}>{item.label}</span>{active && <ChevronRight size={14} />}
                  </Link>
                );
              })}
            </nav>
            <div style={{ padding: '0.75rem', borderTop: '1px solid #dcd4c7', paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))', flexShrink: 0 }}>
              <button onClick={() => { setDrawerOpen(false); logout(); }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.75rem', background: '#fff1f2', color: '#be123c', fontWeight: 700, fontSize: '0.8125rem', border: '1px solid #fecdd3', minHeight: 48 }}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 'calc(3.75rem + env(safe-area-inset-bottom, 0px))' }}><Outlet /></main>

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
