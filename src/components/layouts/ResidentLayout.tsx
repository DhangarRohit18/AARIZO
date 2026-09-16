import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Users,
  Grid3x3,
  Activity,
  User,
  Bell,
  LogOut,
  UserCheck,
  CreditCard,
  Wrench,
  Store,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  BedDouble,
  Car,
  HardHat,
  Building2,
  ChevronRight,
  X,
  Menu,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const BOTTOM_NAV: NavItem[] = [
  { label: 'Home', path: '/resident', icon: Home },
  { label: 'Community', path: '/resident/community', icon: Users },
  { label: 'Services', path: '/resident/services', icon: Grid3x3 },
  { label: 'Activity', path: '/resident/activity', icon: Activity },
  { label: 'Profile', path: '/resident/profile', icon: User },
];

const DRAWER_NAV: NavItem[] = [
  { label: 'Home', path: '/resident', icon: Home },
  { label: 'My Flat Info', path: '/resident/my-flat', icon: Building2 },
  { label: 'Visitors', path: '/resident/visitors', icon: UserCheck },
  { label: 'Parking', path: '/resident/parking', icon: Car },
  { label: 'Domestic Help', path: '/resident/domestic-help', icon: HardHat },
  { label: 'Maintenance', path: '/resident/maintenance', icon: Wrench },
  { label: 'Billing & Payments', path: '/resident/billing', icon: CreditCard },
  { label: 'Marketplace', path: '/resident/marketplace', icon: Store },
  { label: 'Amenity Booking', path: '/resident/amenities', icon: Sparkles },
  { label: 'Community Hub', path: '/resident/community', icon: Users },
  { label: 'Child Safety', path: '/resident/child-safety', icon: ShieldCheck },
  { label: 'Emergency SOS', path: '/resident/emergency', icon: ShieldAlert },
  { label: 'Garbage Schedule', path: '/resident/garbage', icon: Trash2 },
  { label: 'Guest Stay', path: '/resident/guest-stay', icon: BedDouble },
  { label: 'Notifications', path: '/notifications', icon: Bell },
];

export const ResidentLayout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/resident') return location.pathname === '/resident';
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
      {/* ── Sticky Top Header ── */}
      <header className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0, flex: 1 }}>
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            style={{
              padding: '0.375rem',
              borderRadius: '0.5rem',
              background: 'rgba(255,255,255,0.1)',
              color: '#d6d3d1',
              display: 'flex',
              alignItems: 'center',
              minHeight: 44,
              minWidth: 44,
              justifyContent: 'center',
            }}
          >
            <Menu size={20} />
          </button>

          <div
            style={{
              padding: '0.375rem',
              background: 'rgba(16,185,129,0.2)',
              borderRadius: '0.5rem',
              color: '#34d399',
              display: 'flex',
            }}
          >
            <Home size={16} />
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: '0.75rem',
                color: '#fff',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentUser?.name || 'Resident'}
            </div>
            <div style={{ fontSize: '0.625rem', color: '#a8a29e', lineHeight: 1.2 }}>
              {currentUser?.flatDetails || 'Tower B • Flat 301'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Link
            to="/notifications"
            aria-label="Notifications"
            style={{
              position: 'relative',
              padding: '0.375rem',
              color: '#d6d3d1',
              borderRadius: '0.5rem',
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

          <button
            onClick={logout}
            aria-label="Sign Out"
            style={{
              padding: '0.375rem',
              color: '#f87171',
              borderRadius: '0.5rem',
              display: 'flex',
              minHeight: 44,
              minWidth: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* ── Full Drawer ── */}
      {drawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
          }}
        >
          {/* Backdrop */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(28,25,23,0.65)',
              backdropFilter: 'blur(2px)',
            }}
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer panel */}
          <div
            className="animate-slide-up"
            style={{
              position: 'relative',
              width: '82vw',
              maxWidth: '320px',
              height: '100%',
              background: '#f7f4ee',
              borderRight: '1px solid #dcd4c7',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 1,
              boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
            }}
          >
            {/* Drawer header */}
            <div
              style={{
                padding: '1rem',
                paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))',
                background: '#1c1917',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'rgba(16,185,129,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#34d399',
                    fontWeight: 800,
                    fontSize: '1rem',
                  }}
                >
                  {(currentUser?.name || 'R').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.8125rem' }}>
                    {currentUser?.name || 'Resident'}
                  </div>
                  <div style={{ color: '#a8a29e', fontSize: '0.625rem' }}>
                    {currentUser?.flatDetails || 'Tower B • Flat 301'} • Green Valley
                  </div>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                style={{
                  padding: '0.375rem',
                  color: '#78716c',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  minHeight: 40,
                  minWidth: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav items */}
            <nav
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0.75rem 0.5rem',
              }}
            >
              {DRAWER_NAV.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      borderRadius: '0.75rem',
                      marginBottom: '0.125rem',
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      textDecoration: 'none',
                      minHeight: 48,
                      background: active ? '#1c1917' : 'transparent',
                      color: active ? '#fff' : '#44403c',
                      transition: 'background 0.15s',
                    }}
                  >
                    <Icon size={17} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.label}
                    </span>
                    {active && <ChevronRight size={14} style={{ color: '#78716c' }} />}
                  </Link>
                );
              })}
            </nav>

            {/* Sign out */}
            <div
              style={{
                padding: '0.75rem',
                borderTop: '1px solid #dcd4c7',
                paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => { setDrawerOpen(false); logout(); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: '0.75rem',
                  background: '#fff1f2',
                  color: '#be123c',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  border: '1px solid #fecdd3',
                  minHeight: 48,
                }}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Page Area ── */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: 'calc(3.75rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <Outlet />
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="bottom-nav">
        {BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-label={item.label}
              className={`bottom-nav-item${active ? ' active-accent' : ''}`}
            >
              <Icon className="bottom-nav-icon" strokeWidth={active ? 2.5 : 1.75} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
