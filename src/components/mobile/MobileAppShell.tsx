import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, LogOut, X, ChevronRight, Bell } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { App } from '@capacitor/app';

export interface NavItem {
  icon: LucideIcon | React.ElementType;
  label: string;
  path: string;
}

export interface MobileAppShellProps {
  children: React.ReactNode;
  roleTitle: string;
  accentColor: string;
  drawerItems: NavItem[];
  bottomItems: NavItem[];
  topRightActions?: React.ReactNode;
}

export const MobileAppShell: React.FC<MobileAppShellProps> = ({
  children,
  roleTitle,
  accentColor,
  drawerItems,
  bottomItems,
  topRightActions,
}) => {
  const { currentUser, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    if (location.pathname === path) return true;
    return location.pathname.startsWith(path + '/');
  };

  useEffect(() => {
    let listenerPromise: any = null;
    try {
      if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.()) {
        const handleBackButton = async () => {
          if (drawerOpen) {
            setDrawerOpen(false);
          } else if (window.history.length > 2 && location.pathname !== '/' && !location.pathname.endsWith('/dashboard') && !location.pathname.endsWith('/admin') && !location.pathname.endsWith('/resident') && !location.pathname.endsWith('/security')) {
            navigate(-1);
          } else {
            App.exitApp();
          }
        };
        listenerPromise = App.addListener('backButton', handleBackButton);
      }
    } catch (e) {
      // Ignored for non-native environments
    }
    
    return () => {
      if (listenerPromise) {
        listenerPromise.then((handle: any) => {
          if (handle && typeof handle.remove === 'function') {
            handle.remove();
          }
        }).catch(() => {});
      }
    };
  }, [drawerOpen, location.pathname, navigate]);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <header style={{
        padding: '0 1rem',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        height: 'calc(58px + env(safe-area-inset-top, 0px))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        zIndex: 10,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open Navigation Drawer"
            style={{ color: '#0f172a', minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.625rem', cursor: 'pointer' }}
          >
            <Menu size={20} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>AARIZO</span>
              <span style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem', borderRadius: '0.375rem', background: `${accentColor}15`, color: accentColor, fontWeight: 700, letterSpacing: '0.04em' }}>
                {roleTitle}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
          {topRightActions || (
            <button aria-label="Notifications" style={{ color: '#475569', minHeight: 40, minWidth: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
               <Bell size={18} />
            </button>
          )}
          <button onClick={logout} aria-label="Sign Out" title="Sign Out" style={{ color: '#64748b', minHeight: 40, minWidth: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer' }}>
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {drawerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <button aria-label="Close Drawer Overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(2px)', border: 'none', width: '100%', cursor: 'default' }} onClick={() => setDrawerOpen(false)} />
          <div className="animate-slide-right" style={{ position: 'relative', width: '82vw', maxWidth: '300px', height: '100%', background: '#ffffff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', zIndex: 1, boxShadow: '4px 0 20px rgba(0,0,0,0.12)' }}>
            {/* Drawer Header */}
            <div style={{ padding: '1.25rem 1rem', paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '0.625rem', background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.125rem' }}>
                  {(currentUser?.name || roleTitle).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.875rem' }}>{currentUser?.name || roleTitle}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{roleTitle}</div>
                </div>
              </div>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close Drawer" style={{ color: '#94a3b8', minHeight: 36, minWidth: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            {/* Nav Items */}
            <nav style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0.625rem' }}>
              {drawerItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link key={item.path} to={item.path} onClick={() => setDrawerOpen(false)} aria-label={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0.875rem', borderRadius: '0.75rem', marginBottom: '0.25rem', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', minHeight: 48, background: active ? `${accentColor}15` : 'transparent', color: active ? accentColor : '#374151', transition: 'background 0.15s' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: active ? `${accentColor}20` : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} style={{ color: active ? accentColor : '#6b7280' }} />
                    </div>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                    {active && <ChevronRight size={14} style={{ color: accentColor }} />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))', background: 'inherit' }}>
        {children}
      </main>

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'stretch', justifyContent: 'space-around', paddingTop: '0.375rem', paddingBottom: 'calc(0.375rem + env(safe-area-inset-bottom, 0px))', zIndex: 100, boxShadow: '0 -2px 10px rgba(0,0,0,0.03)' }}>
        {bottomItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link key={item.path} to={item.path} aria-label={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '0.375rem 0.5rem 0.5rem', fontSize: '0.6875rem', fontWeight: active ? 700 : 500, textDecoration: 'none', borderRadius: '0.75rem', minWidth: 56, flex: 1, color: active ? accentColor : '#64748b', position: 'relative' }}>
              {active && <span style={{ position: 'absolute', top: '-0.375rem', left: '50%', transform: 'translateX(-50%)', width: 24, height: 3, borderRadius: '0 0 3px 3px', background: accentColor }} />}
              <Icon size={20} strokeWidth={active ? 2.25 : 1.75} />
              <span style={{ textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
