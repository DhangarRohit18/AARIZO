import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, LogOut, X, ChevronRight, Bell, ChevronDown, Plus } from 'lucide-react';
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
  societyName?: string;
  accentColor?: string;
  drawerItems: NavItem[];
  bottomItems: NavItem[];
  topRightActions?: React.ReactNode;
  onFabClick?: () => void;
  showFab?: boolean;
}

export const MobileAppShell: React.FC<MobileAppShellProps> = ({
  children,
  roleTitle,
  societyName = 'Green Valley Society',
  drawerItems,
  bottomItems,
  topRightActions,
  onFabClick,
  showFab = true,
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
          } else if (
            window.history.length > 2 &&
            location.pathname !== '/' &&
            !location.pathname.endsWith('/dashboard') &&
            !location.pathname.endsWith('/admin') &&
            !location.pathname.endsWith('/resident') &&
            !location.pathname.endsWith('/security')
          ) {
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
        listenerPromise
          .then((handle: any) => {
            if (handle && typeof handle.remove === 'function') {
              handle.remove();
            }
          })
          .catch(() => {});
      }
    };
  }, [drawerOpen, location.pathname, navigate]);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  // Primary navigation items (first 4 items surrounding center FAB)
  const navLeft = bottomItems.slice(0, 2);
  const navRight = bottomItems.slice(2, 4);

  return (
    <div
      className="mobile-app-shell"
      style={{
        minHeight: '100dvh',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--aarizo-page, #F7FBFE)',
        maxWidth: '480px',
        margin: '0 auto',
        position: 'relative',
        boxShadow: '0 0 36px rgba(8, 59, 86, 0.08)',
        borderLeft: '1px solid var(--aarizo-border-soft, #E8F1F5)',
        borderRight: '1px solid var(--aarizo-border-soft, #E8F1F5)',
      }}
    >
      {/* ── Screenshot-Matched Deep Navy Header (#083B56) ── */}
      <header
        style={{
          padding: '0 1rem',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          height: 'calc(60px + env(safe-area-inset-top, 0px))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--aarizo-navy, #083B56)',
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Avatar button that triggers drawer */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open Navigation Drawer"
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Menu size={20} />
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#ffffff' }}>
              <span style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                {currentUser?.societyName || societyName}
              </span>
              <ChevronDown size={14} style={{ opacity: 0.8 }} />
            </div>
            <p style={{ fontSize: '0.6875rem', color: 'rgba(255, 255, 255, 0.72)', margin: 0, fontWeight: 500 }}>
              {roleTitle}
            </p>
          </div>
        </div>

        {/* Top Right Actions: Notification + Logout */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {topRightActions || (
            <button
              onClick={() => navigate('/notifications')}
              aria-label="Notifications"
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Bell size={18} />
            </button>
          )}
          <button
            onClick={logout}
            aria-label="Sign Out"
            title="Sign Out"
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.12)',
              color: 'rgba(255, 255, 255, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ── Slide-out Drawer ── */}
      {drawerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <button
            aria-label="Close Drawer Overlay"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(8, 59, 86, 0.5)',
              backdropFilter: 'blur(2px)',
              border: 'none',
              width: '100%',
              cursor: 'default',
            }}
            onClick={() => setDrawerOpen(false)}
          />
          <div
            className="animate-slide-right"
            style={{
              position: 'relative',
              width: '82vw',
              maxWidth: '300px',
              height: '100%',
              background: '#ffffff',
              borderRight: '1px solid var(--aarizo-border-soft, #E8F1F5)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1,
              boxShadow: '4px 0 24px rgba(8, 59, 86, 0.12)',
            }}
          >
            {/* Drawer Header (#083B56) */}
            <div
              style={{
                padding: '1.25rem 1rem',
                paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))',
                background: 'var(--aarizo-navy, #083B56)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: 'var(--aarizo-blue, #176B91)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '1.125rem',
                  }}
                >
                  {(currentUser?.name || roleTitle).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9375rem' }}>
                    {currentUser?.name || roleTitle}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.6875rem', fontWeight: 500 }}>
                    {roleTitle}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close Drawer"
                style={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  minHeight: 36,
                  minWidth: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav Items */}
            <nav style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0.625rem' }}>
              {drawerItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setDrawerOpen(false)}
                    aria-label={item.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 0.875rem',
                      borderRadius: '0.75rem',
                      marginBottom: '0.25rem',
                      fontWeight: active ? 700 : 500,
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                      minHeight: 46,
                      background: active ? 'var(--aarizo-light-blue, #EAF6FC)' : 'transparent',
                      color: active ? 'var(--aarizo-blue, #176B91)' : 'var(--aarizo-text, #203746)',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: active ? 'rgba(23, 107, 145, 0.15)' : 'var(--aarizo-pale-blue, #F4FAFE)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} style={{ color: active ? 'var(--aarizo-blue, #176B91)' : 'var(--aarizo-text-muted, #8B9AA5)' }} />
                    </div>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.label}
                    </span>
                    {active && <ChevronRight size={14} style={{ color: 'var(--aarizo-blue, #176B91)' }} />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* ── Main Content Area ── */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: 'calc(4.75rem + env(safe-area-inset-bottom, 0px))',
          background: 'var(--aarizo-page, #F7FBFE)',
        }}
      >
        {children}
      </main>

      {/* ── Screenshot-Matched Bottom Navigation with Center FAB ── */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '480px',
          background: '#ffffff',
          borderTop: '1px solid var(--aarizo-border-soft, #E8F1F5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          paddingTop: '0.25rem',
          paddingBottom: 'calc(0.25rem + env(safe-area-inset-bottom, 0px))',
          zIndex: 100,
          boxShadow: '0 -4px 16px rgba(8, 59, 86, 0.05)',
          height: 'calc(62px + env(safe-area-inset-bottom, 0px))',
          boxSizing: 'border-box',
        }}
      >
        {/* First 2 items on left */}
        {navLeft.map((item) => {
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
                padding: '0.25rem 0.5rem',
                fontSize: '0.6875rem',
                fontWeight: active ? 700 : 500,
                textDecoration: 'none',
                minWidth: 54,
                flex: 1,
                color: active ? 'var(--aarizo-blue, #176B91)' : 'var(--aarizo-text-muted, #8B9AA5)',
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.25 : 1.75} />
              <span style={{ textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Center Floating Action Button (FAB) */}
        {showFab && (
          <div style={{ position: 'relative', width: 56, display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => {
                if (onFabClick) {
                  onFabClick();
                } else if (location.pathname.startsWith('/security')) {
                  navigate('/security/verify');
                } else if (location.pathname.startsWith('/admin')) {
                  navigate('/admin/requests');
                } else if (location.pathname.startsWith('/committee')) {
                  navigate('/committee/approvals');
                } else if (location.pathname.startsWith('/facility')) {
                  navigate('/facility/maintenance');
                } else if (location.pathname.startsWith('/vendor')) {
                  navigate('/vendor/portal');
                } else if (location.pathname.startsWith('/super-admin')) {
                  navigate('/super-admin/societies');
                } else {
                  navigate('/resident/visitors');
                }
              }}
              aria-label="Create New Action"
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--aarizo-navy, #083B56)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(8, 59, 86, 0.28)',
                border: '3px solid #ffffff',
                cursor: 'pointer',
                transform: 'translateY(-14px)',
              }}
            >
              <Plus size={22} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* Next 2 items on right */}
        {navRight.map((item) => {
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
                padding: '0.25rem 0.5rem',
                fontSize: '0.6875rem',
                fontWeight: active ? 700 : 500,
                textDecoration: 'none',
                minWidth: 54,
                flex: 1,
                color: active ? 'var(--aarizo-blue, #176B91)' : 'var(--aarizo-text-muted, #8B9AA5)',
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.25 : 1.75} />
              <span style={{ textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
