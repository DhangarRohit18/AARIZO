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
    const handleBackButton = async () => {
      if (drawerOpen) {
        setDrawerOpen(false);
      } else if (window.history.length > 2 && location.pathname !== '/' && !location.pathname.endsWith('/dashboard') && !location.pathname.endsWith('/admin') && !location.pathname.endsWith('/resident') && !location.pathname.endsWith('/security')) {
        navigate(-1);
      } else {
        App.exitApp();
      }
    };
    
    let listener: any = null;
    try {
       App.addListener('backButton', handleBackButton).then(l => listener = l);
    } catch (e) {
      // Ignored for web
    }
    
    return () => {
      if (listener) listener.remove();
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
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#0c0a09' }}>
      <header style={{
        padding: '0.75rem 1rem',
        paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#1c1917',
        borderBottom: `1px solid ${accentColor}40`,
        zIndex: 10,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open Navigation Drawer"
            style={{ color: '#fff', minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none' }}
          >
            <Menu size={24} />
          </button>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: accentColor }}>•</span> AARIZO
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          {topRightActions || (
            <button aria-label="Notifications" style={{ color: '#a8a29e', minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none' }}>
               <Bell size={20} />
            </button>
          )}
          <button onClick={logout} aria-label="Sign Out" title="Sign Out" style={{ color: '#f87171', minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none' }}>
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {drawerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <button aria-label="Close Drawer Overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(2px)', border: 'none', width: '100%', cursor: 'default' }} onClick={() => setDrawerOpen(false)} />
          <div className="animate-slide-right" style={{ position: 'relative', width: '82vw', maxWidth: '320px', height: '100%', background: '#0c0a09', borderRight: `1px solid ${accentColor}40`, display: 'flex', flexDirection: 'column', zIndex: 1 }}>
            <div style={{ padding: '1rem', paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))', background: `${accentColor}15`, borderBottom: `1px solid ${accentColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${accentColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor, fontWeight: 'bold' }}>
                  {(currentUser?.name || roleTitle).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.8125rem' }}>{roleTitle}</div>
                  <div style={{ color: '#78716c', fontSize: '0.625rem' }}>{currentUser?.name || 'User'}</div>
                </div>
              </div>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close Drawer" style={{ color: '#78716c', minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none' }}>
                <X size={24} />
              </button>
            </div>
            <nav style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0.5rem' }}>
              {drawerItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link key={item.path} to={item.path} onClick={() => setDrawerOpen(false)} aria-label={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.75rem', marginBottom: '0.125rem', fontWeight: 600, fontSize: '0.8125rem', textDecoration: 'none', minHeight: 48, background: active ? `${accentColor}20` : 'transparent', color: active ? accentColor : '#a8a29e' }}>
                    <Icon size={18} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                    {active && <ChevronRight size={16} />}
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

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(12,10,9,0.97)', backdropFilter: 'blur(12px)', borderTop: `1px solid ${accentColor}40`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-around', paddingTop: '0.5rem', paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))', zIndex: 100, height: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}>
        {bottomItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link key={item.path} to={item.path} aria-label={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '0.25rem 0.5rem', fontSize: '0.625rem', fontWeight: 600, textDecoration: 'none', borderRadius: '0.5rem', minWidth: 56, minHeight: 44, color: active ? accentColor : '#78716c' }}>
              <Icon size={22} strokeWidth={active ? 2.5 : 1.75} />
              <span style={{ textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
