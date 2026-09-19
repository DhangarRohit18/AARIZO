import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  User, Building2, Phone, LogOut, ChevronRight,
  Bell, Shield, HelpCircle, Settings, Star,
} from 'lucide-react';

export const ResidentProfilePage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'My Flat Details', icon: Building2, path: '/resident/my-flat', color: '#3b82f6' },
    { label: 'Notification Preferences', icon: Bell, path: '/notifications', color: '#f59e0b' },
    { label: 'Child Safety Portal', icon: Shield, path: '/resident/child-safety', color: '#10b981' },
    { label: 'Help & Support', icon: HelpCircle, path: '/resident/requests', color: '#8b5cf6' },
    { label: 'App Settings', icon: Settings, path: '/resident/profile/settings', color: '#78716c' },
  ];

  return (
    <div style={{ backgroundColor: '#f7f4ee', minHeight: '100%' }}>
      {/* Profile card */}
      <div style={{ background: 'linear-gradient(135deg, #1c1917, #292524)', padding: '2rem 1rem 1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(16,185,129,0.3)' }}>
            <span style={{ color: '#34d399', fontWeight: 800, fontSize: '1.75rem' }}>
              {(currentUser?.name || 'R').charAt(0).toUpperCase()}
            </span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.125rem' }}>{currentUser?.name || 'resident'}</div>
            <div style={{ color: '#a8a29e', fontSize: '0.8125rem', marginTop: '0.125rem' }}>
              {currentUser?.flatDetails || 'Tower B Â· Flat 301'}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', background: 'rgba(16,185,129,0.15)', borderRadius: '2rem', padding: '0.25rem 0.75rem' }}>
              <Star size={12} style={{ color: '#34d399' }} />
              <span style={{ color: '#34d399', fontSize: '0.6875rem', fontWeight: 700 }}>Verified Resident</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact info */}
      <div style={{ margin: '0.75rem', background: '#fff', borderRadius: '1rem', border: '1px solid #e8e2d8', overflow: 'hidden' }}>
        {currentUser?.phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem', borderBottom: '1px solid #f5f5f4' }}>
            <Phone size={16} style={{ color: '#78716c' }} />
            <span style={{ fontSize: '0.875rem', color: '#292524' }}>{currentUser.phone}</span>
          </div>
        )}
        {!currentUser?.phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem' }}>
            <User size={16} style={{ color: '#78716c' }} />
            <span style={{ fontSize: '0.875rem', color: '#292524' }}>Green Valley Society</span>
          </div>
        )}
      </div>

      {/* Menu items */}
      <div style={{ margin: '0 0.75rem 0.75rem', background: '#fff', borderRadius: '1rem', border: '1px solid #e8e2d8', overflow: 'hidden' }}>
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem', borderBottom: i < menuItems.length - 1 ? '1px solid #f5f5f4' : 'none', background: 'none', cursor: 'pointer', textAlign: 'left', minHeight: 52 }}
            >
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={17} style={{ color: item.color }} />
              </div>
              <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600, color: '#292524' }}>{item.label}</span>
              <ChevronRight size={16} style={{ color: '#d6d3d1' }} />
            </button>
          );
        })}
      </div>

      {/* Sign out */}
      <div style={{ margin: '0 0.75rem 1.5rem' }}>
        <button
          onClick={logout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem', borderRadius: '0.875rem', background: '#fff1f2', color: '#be123c', fontWeight: 700, fontSize: '0.875rem', border: '1px solid #fecdd3', minHeight: 52 }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

