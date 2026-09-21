import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Building2, Phone, LogOut, ChevronRight,
  Bell, Shield, HelpCircle, Settings, Star,
} from 'lucide-react';

export const ResidentProfilePage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'My Flat Details', icon: Building2, path: '/resident/my-flat' },
    { label: 'Notification Preferences', icon: Bell, path: '/notifications' },
    { label: 'Child Safety Portal', icon: Shield, path: '/resident/child-safety' },
    { label: 'Help & Support', icon: HelpCircle, path: '/resident/requests' },
    { label: 'App Settings', icon: Settings, path: '/resident/profile/settings' },
  ];

  return (
    <div style={{ backgroundColor: 'var(--aarizo-page, #F7FBFE)', minHeight: '100%', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* ── Large White Profile Card (Screenshot match) ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
          padding: '1.5rem 1rem',
          boxShadow: '0 2px 10px rgba(8, 59, 86, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: '50%',
            background: 'var(--aarizo-light-blue, #EAF6FC)',
            border: '2px solid var(--aarizo-border, #DCE8EF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--aarizo-navy, #083B56)',
            fontWeight: 900,
            fontSize: '1.75rem',
          }}
        >
          {(currentUser?.name || 'R').charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', margin: 0 }}>
            {currentUser?.name || 'Resident User'}
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--aarizo-text-secondary, #657785)', margin: '0.25rem 0 0' }}>
            {currentUser?.flatDetails || 'Tower B · Flat 301'}
          </p>
          <div style={{ marginTop: '0.5rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: 'var(--aarizo-success, #3F8F58)',
                background: 'var(--aarizo-success-bg, #EDF8F0)',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                border: '1px solid #c3e6cb',
              }}
            >
              <Star size={12} /> Verified Resident
            </span>
          </div>
        </div>
      </div>

      {/* ── Contact Info Card ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
          padding: '0.875rem 1rem',
          boxShadow: '0 2px 10px rgba(8, 59, 86, 0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            background: 'var(--aarizo-light-blue, #EAF6FC)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--aarizo-blue, #176B91)',
          }}
        >
          <Phone size={18} />
        </div>
        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--aarizo-text-muted, #8B9AA5)', textTransform: 'uppercase', fontWeight: 600 }}>
            Registered Phone
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--aarizo-text, #203746)' }}>
            {currentUser?.phone || '+91 98765 43210'}
          </div>
        </div>
      </div>

      {/* ── Menu Items Card ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
          boxShadow: '0 2px 10px rgba(8, 59, 86, 0.05)',
          overflow: 'hidden',
        }}
      >
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                padding: '0.875rem 1rem',
                borderBottom: i < menuItems.length - 1 ? '1px solid var(--aarizo-border-soft, #E8F1F5)' : 'none',
                background: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                minHeight: 52,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: 'var(--aarizo-light-blue, #EAF6FC)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--aarizo-blue, #176B91)',
                  flexShrink: 0,
                }}
              >
                <Icon size={18} />
              </div>
              <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 700, color: 'var(--aarizo-text, #203746)' }}>
                {item.label}
              </span>
              <ChevronRight size={16} style={{ color: 'var(--aarizo-text-muted, #8B9AA5)' }} />
            </button>
          );
        })}
      </div>

      {/* ── Sign out Button ── */}
      <div>
        <button
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.875rem',
            borderRadius: '14px',
            background: 'var(--aarizo-danger-bg, #FFF0F1)',
            color: 'var(--aarizo-danger, #D9535B)',
            fontWeight: 700,
            fontSize: '0.9375rem',
            border: '1px solid #fbc5c8',
            minHeight: 50,
            cursor: 'pointer',
          }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ResidentProfilePage;
