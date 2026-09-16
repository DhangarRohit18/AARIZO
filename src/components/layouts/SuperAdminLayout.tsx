import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Settings,
  User,
  Globe,
  Bell,
  LogOut,
  Lock,
  Radio,
  X,
  Menu,
  ChevronRight,
} from 'lucide-react';

const BOTTOM_NAV = [
  { label: 'Dashboard', path: '/super-admin', icon: LayoutDashboard },
  { label: 'Societies', path: '/super-admin/societies', icon: Building2 },
  { label: 'Analytics', path: '/admin/intelligence', icon: BarChart3 },
  { label: 'Settings', path: '/admin/security-audit', icon: Settings },
  { label: 'Profile', path: '/super-admin/profile', icon: User },
];

const DRAWER_NAV = [
  { label: 'Super Admin Overview', path: '/super-admin', icon: LayoutDashboard },
  { label: 'Multi-Society Directory', path: '/super-admin/societies', icon: Building2 },
  { label: 'Society Intelligence', path: '/admin/intelligence', icon: BarChart3 },
  { label: 'Security & Audit Logs', path: '/admin/security-audit', icon: Lock },
  { label: 'Realtime Operations', path: '/admin/realtime', icon: Radio },
  { label: 'Notifications', path: '/notifications', icon: Bell },
];

export const SuperAdminLayout: React.FC = () => {
  const { logout, selectedRole, switchRole } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/super-admin') return location.pathname === '/super-admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', width: '100%', backgroundColor: '#020617', color: '#f1f5f9', overflowX: 'hidden' }}>
      {/* Dark Super Admin Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#0f172a', height: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.75rem', flexShrink: 0, borderBottom: '1px solid rgba(139,92,246,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1, minWidth: 0 }}>
          <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" style={{ padding: '0.375rem', borderRadius: '0.5rem', background: 'rgba(139,92,246,0.15)', color: '#c4b5fd', display: 'flex', minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}><Menu size={20} /></button>
          <div style={{ padding: '0.375rem', background: 'rgba(139,92,246,0.2)', borderRadius: '0.5rem', color: '#c4b5fd', display: 'flex' }}><Globe size={16} /></div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '0.75rem', color: '#fff', lineHeight: 1.2 }}>AARIZO Platform</div>
            <div style={{ fontSize: '0.625rem', color: '#64748b', lineHeight: 1.2 }}>Super Admin Console</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <Link to="/notifications" style={{ padding: '0.375rem', color: '#94a3b8', borderRadius: '0.5rem', display: 'flex', minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}><Bell size={20} /></Link>
          <button onClick={logout} style={{ padding: '0.375rem', color: '#f87171', borderRadius: '0.5rem', display: 'flex', minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}><LogOut size={20} /></button>
        </div>
      </header>

      {drawerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(2px)' }} onClick={() => setDrawerOpen(false)} />
          <div style={{ position: 'relative', width: '82vw', maxWidth: '320px', height: '100%', background: '#0f172a', borderRight: '1px solid rgba(139,92,246,0.2)', display: 'flex', flexDirection: 'column', zIndex: 1, boxShadow: '4px 0 24px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '1rem', paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))', background: '#1e1b4b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: '1px solid rgba(139,92,246,0.2)' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>AARIZO Platform</div>
                <div style={{ color: '#a78bfa', fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase' }}>Super Admin</div>
              </div>
              <button onClick={() => setDrawerOpen(false)} style={{ padding: '0.375rem', color: '#64748b', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', display: 'flex', minHeight: 40, minWidth: 40, alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
            </div>

            {/* Role switcher */}
            <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
              <label style={{ display: 'block', fontSize: '0.5625rem', color: '#475569', fontWeight: 700, marginBottom: '0.25rem', textTransform: 'uppercase' }}>Switch Role</label>
              <select value={selectedRole} onChange={(e) => switchRole(e.target.value as never)} style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', color: '#f1f5f9', fontSize: '0.75rem', padding: '0.375rem 0.5rem', minHeight: 36 }}>
                <option value="SUPER_ADMIN">SUPER ADMIN</option>
                <option value="SOCIETY_ADMIN">SOCIETY ADMIN</option>
                <option value="RESIDENT">RESIDENT</option>
                <option value="SECURITY">SECURITY GUARD</option>
              </select>
            </div>

            <nav style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0.5rem' }}>
              {DRAWER_NAV.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link key={item.path} to={item.path} onClick={() => setDrawerOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.75rem', marginBottom: '0.125rem', fontWeight: 600, fontSize: '0.8125rem', textDecoration: 'none', minHeight: 48, background: active ? 'rgba(139,92,246,0.25)' : 'transparent', color: active ? '#c4b5fd' : '#94a3b8' }}>
                    <Icon size={17} style={{ flexShrink: 0 }} /><span style={{ flex: 1 }}>{item.label}</span>{active && <ChevronRight size={14} />}
                  </Link>
                );
              })}
            </nav>
            <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))', flexShrink: 0 }}>
              <button onClick={() => { setDrawerOpen(false); logout(); }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(239,68,68,0.12)', color: '#f87171', fontWeight: 700, fontSize: '0.8125rem', border: '1px solid rgba(239,68,68,0.2)', minHeight: 48 }}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 'calc(3.75rem + env(safe-area-inset-bottom, 0px))' }}><Outlet /></main>

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(15,23,42,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-around', paddingTop: '0.5rem', paddingBottom: 'env(safe-area-inset-bottom, 0px)', zIndex: 100, height: 'calc(3.75rem + env(safe-area-inset-bottom, 0px))' }}>
        {BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link key={item.path} to={item.path} aria-label={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '0.25rem 0.5rem', fontSize: '0.625rem', fontWeight: 600, textDecoration: 'none', borderRadius: '0.5rem', minWidth: 52, minHeight: 44, color: active ? '#a78bfa' : '#475569', transition: 'color 0.15s' }}>
              <Icon size={22} strokeWidth={active ? 2.5 : 1.75} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
