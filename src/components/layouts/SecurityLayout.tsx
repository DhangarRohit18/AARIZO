import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  QrCode,
  Users,
  Package,
  Car,
  ShieldAlert,
  Bell,
  LogOut,
  HardHat,
  ShieldCheck,
  BedDouble,
  X,
  Menu,
  ChevronRight,
} from 'lucide-react';

const BOTTOM_NAV = [
  { label: 'Gate', path: '/security', icon: QrCode },
  { label: 'Visitors', path: '/security/verify', icon: Users },
  { label: 'Parcels', path: '/security/delivery-intelligence', icon: Package },
  { label: 'Parking', path: '/security/parking', icon: Car },
  { label: 'Safety', path: '/security/emergency-command', icon: ShieldAlert },
];

const DRAWER_NAV = [
  { label: 'Gate Terminal', path: '/security', icon: QrCode },
  { label: 'Visitor Scanner', path: '/security/verify', icon: Users },
  { label: 'Parking Scanner', path: '/security/parking', icon: Car },
  { label: 'Staff Terminal', path: '/security/staff-scanner', icon: HardHat },
  { label: 'Child Gate', path: '/security/child-safety', icon: ShieldCheck },
  { label: 'Delivery / Parcels', path: '/security/delivery-intelligence', icon: Package },
  { label: 'Guest Stay', path: '/security/guest-stay', icon: BedDouble },
  { label: 'Emergency Command', path: '/security/emergency-command', icon: ShieldAlert },
  { label: 'Notifications', path: '/notifications', icon: Bell },
];

export const SecurityLayout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/security') return location.pathname === '/security';
    return location.pathname.startsWith(path);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        width: '100%',
        backgroundColor: '#0c0a09',
        color: '#fafaf9',
        overflowX: 'hidden',
      }}
    >
      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Top Header Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: '#0c0a09',
          height: '3.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 0.75rem',
          flexShrink: 0,
          borderBottom: '1px solid rgba(239,68,68,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0, flex: 1 }}>
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            style={{
              padding: '0.375rem',
              borderRadius: '0.5rem',
              background: 'rgba(239,68,68,0.1)',
              color: '#fca5a5',
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
              background: 'rgba(239,68,68,0.15)',
              borderRadius: '0.5rem',
              color: '#f87171',
              display: 'flex',
            }}
          >
            <ShieldAlert size={16} />
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '0.75rem', color: '#fff', lineHeight: 1.2 }}>
              Security Command
            </div>
            <div style={{ fontSize: '0.625rem', color: '#78716c', lineHeight: 1.2 }}>
              Green Valley Ã¢â‚¬Â¢ {currentUser?.name || 'Gate 1'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Link
            to="/notifications"
            aria-label="Notifications"
            style={{
              padding: '0.375rem',
              color: '#a8a29e',
              borderRadius: '0.5rem',
              display: 'flex',
              minHeight: 44,
              minWidth: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bell size={20} />
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

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Drawer Ã¢â€â‚¬Ã¢â€â‚¬ */}
      {drawerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(2px)' }}
            onClick={() => setDrawerOpen(false)}
          />
          <div
            style={{
              position: 'relative',
              width: '82vw',
              maxWidth: '320px',
              height: '100%',
              background: '#0c0a09',
              borderRight: '1px solid rgba(239,68,68,0.2)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1,
              boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
            }}
          >
            <div
              style={{
                padding: '1rem',
                paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))',
                background: 'rgba(239,68,68,0.08)',
                borderBottom: '1px solid rgba(239,68,68,0.2)',
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
                    background: 'rgba(239,68,68,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f87171',
                  }}
                >
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.8125rem' }}>
                    Security Guard
                  </div>
                  <div style={{ color: '#78716c', fontSize: '0.625rem' }}>
                    {currentUser?.name || 'Guard'} Ã¢â‚¬Â¢ Gate 1
                  </div>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                style={{
                  padding: '0.375rem',
                  color: '#78716c',
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

            <nav style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0.5rem' }}>
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
                      background: active ? 'rgba(239,68,68,0.2)' : 'transparent',
                      color: active ? '#f87171' : '#a8a29e',
                    }}
                  >
                    <Icon size={17} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {active && <ChevronRight size={14} />}
                  </Link>
                );
              })}
            </nav>

            <div
              style={{
                padding: '0.75rem',
                borderTop: '1px solid rgba(255,255,255,0.06)',
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
                  background: 'rgba(239,68,68,0.12)',
                  color: '#f87171',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  border: '1px solid rgba(239,68,68,0.2)',
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

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Main Content Ã¢â€â‚¬Ã¢â€â‚¬ */}
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

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Bottom Navigation Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(12,10,9,0.97)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(239,68,68,0.2)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-around',
          paddingTop: '0.5rem',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          zIndex: 100,
          height: 'calc(3.75rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-label={item.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                padding: '0.25rem 0.75rem',
                fontSize: '0.625rem',
                fontWeight: 600,
                textDecoration: 'none',
                borderRadius: '0.5rem',
                minWidth: 56,
                minHeight: 44,
                color: active ? '#f87171' : '#57534e',
                transition: 'color 0.15s',
              }}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.75} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};





