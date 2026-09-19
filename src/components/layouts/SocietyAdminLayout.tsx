import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Settings,
  CheckSquare,
  BarChart3,
  User,
  Building2,
  Users,
  DollarSign,
  Bell,
  LogOut,
  CreditCard,
  Wrench,
  Car,
  Store,
  Sparkles,
  ShieldCheck,
  Lock,
  Radio,
  BedDouble,
  Layers,
  HardHat,
  X,
  Menu,
  ChevronRight,
} from 'lucide-react';

const BOTTOM_NAV = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard },
  { label: 'Operations', path: '/admin/operations', icon: Settings },
  { label: 'Approvals', path: '/admin/residents', icon: CheckSquare },
  { label: 'Reports', path: '/admin/intelligence', icon: BarChart3 },
  { label: 'Profile', path: '/admin/profile', icon: User },
];

const DRAWER_NAV = [
  { label: 'Admin Overview', path: '/admin', icon: LayoutDashboard },
  { label: 'Towers & Blocks', path: '/admin/towers', icon: Layers },
  { label: 'Flat Management', path: '/admin/flats', icon: Building2 },
  { label: 'Resident Approvals', path: '/admin/residents', icon: Users },
  { label: 'Parking Operations', path: '/admin/parking', icon: Car },
  { label: 'Maintenance Ops', path: '/admin/maintenance', icon: Wrench },
  { label: 'Staff Management', path: '/admin/staff', icon: HardHat },
  { label: 'Domestic Workers', path: '/admin/domestic-workers', icon: HardHat },
  { label: 'Vendor Management', path: '/admin/vendors', icon: Store },
  { label: 'Society Expenses', path: '/admin/expenses', icon: DollarSign },
  { label: 'Billing Engine', path: '/admin/billing', icon: CreditCard },
  { label: 'Service Hub', path: '/admin/service-hub', icon: Store },
  { label: 'Amenity Management', path: '/admin/amenities', icon: Sparkles },
  { label: 'Child Safety Board', path: '/admin/child-safety', icon: ShieldCheck },
  { label: 'Guest Stay', path: '/admin/guest-stay', icon: BedDouble },
  { label: 'Society Intelligence', path: '/admin/intelligence', icon: BarChart3 },
  { label: 'Security & Audit', path: '/admin/security-audit', icon: Lock },
  { label: 'Realtime Hub', path: '/admin/realtime', icon: Radio },
  { label: 'Notifications', path: '/notifications', icon: Bell },
];

export const SocietyAdminLayout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
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
      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Top Header Ã¢â€â‚¬Ã¢â€â‚¬ */}
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
              background: 'rgba(99,102,241,0.25)',
              borderRadius: '0.5rem',
              color: '#a5b4fc',
              display: 'flex',
            }}
          >
            <Building2 size={16} />
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '0.75rem', color: '#fff', lineHeight: 1.2 }}>
              Green Valley Admin
            </div>
            <div style={{ fontSize: '0.625rem', color: '#a8a29e', lineHeight: 1.2 }}>
              {currentUser?.name || 'Admin'} Ã¢â‚¬Â¢ Society Admin
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
                background: '#f59e0b',
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

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Drawer Ã¢â€â‚¬Ã¢â€â‚¬ */}
      {drawerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(28,25,23,0.65)', backdropFilter: 'blur(2px)' }}
            onClick={() => setDrawerOpen(false)}
          />
          <div
            style={{
              position: 'relative',
              width: '82vw',
              maxWidth: '320px',
              height: '100%',
              background: '#f7f4ee',
              borderRight: '1px solid #dcd4c7',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1,
              boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
            }}
          >
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
                    background: 'rgba(99,102,241,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#a5b4fc',
                    fontWeight: 800,
                    fontSize: '1rem',
                  }}
                >
                  {(currentUser?.name || 'A').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.8125rem' }}>
                    {currentUser?.name || 'Admin'}
                  </div>
                  <div style={{ color: '#a8a29e', fontSize: '0.625rem' }}>
                    Society Administrator
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
                  background: 'rgba(255,255,255,0.08)',
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
                      background: active ? '#1c1917' : 'transparent',
                      color: active ? '#fff' : '#44403c',
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
      <nav className="bottom-nav">
        {BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-label={item.label}
              className={`bottom-nav-item${active ? ' active' : ''}`}
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





