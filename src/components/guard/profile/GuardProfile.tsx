import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Shield, Clock, MapPin, LogOut, ChevronRight, CheckCircle2 } from 'lucide-react';
import '../guard.css';

export const GuardProfile: React.FC = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div>
      {/* Officer Header Card */}
      <div className="onboarding-card" style={{ padding: '1.5rem', marginBottom: '1.25rem', background: '#0f172a', color: '#ffffff', borderColor: '#1e293b' }}>
        <img
          src={
            currentUser?.avatarUrl ||
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'
          }
          alt={currentUser?.name || 'Officer R. Singh'}
          style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #fbbf24', marginBottom: '0.875rem' }}
        />
        <h2 className="onboarding-title" style={{ fontSize: '1.25rem', color: '#ffffff', margin: '0 0 0.25rem 0' }}>
          {currentUser?.name || 'Officer R. Singh'}
        </h2>
        <p className="onboarding-desc" style={{ color: '#94a3b8', marginBottom: '0.75rem', fontSize: '0.84375rem' }}>
          Senior Security Officer Ã¢â‚¬Â¢ Gate #1 Main Entrance
        </p>

        <span className="banner-role-tag" style={{ background: '#78350f', color: '#fef3c7', border: '1px solid #d97706' }}>
          On Duty Ã¢â‚¬Â¢ Shift A (Morning)
        </span>
      </div>

      {/* Terminal Details */}
      <div className="section-heading-row">
        <h3 className="section-title">Terminal & Shift Info</h3>
      </div>

      <div className="onboarding-card" style={{ padding: '1.25rem', textAlign: 'left', marginBottom: '1.25rem' }}>
        <div className="onboarding-features-list">
          <div className="onboarding-feature-item">
            <Shield size={16} style={{ color: '#2563eb' }} />
            <span>Assigned Terminal: Gate #1 Main Entrance</span>
          </div>
          <div className="onboarding-feature-item">
            <Clock size={16} style={{ color: '#2563eb' }} />
            <span>Active Shift: Morning Roster (06:00 AM Ã¢â‚¬â€œ 02:00 PM)</span>
          </div>
          <div className="onboarding-feature-item">
            <MapPin size={16} style={{ color: '#2563eb' }} />
            <span>Location: North Perimeter Gate</span>
          </div>
          <div className="onboarding-feature-item">
            <CheckCircle2 size={16} style={{ color: '#16a34a' }} />
            <span>Terminal Connection: Online (Local Prototype Sync)</span>
          </div>
        </div>
      </div>

      {/* Exit */}
      <div className="section-heading-row">
        <h3 className="section-title">Session Management</h3>
      </div>

      <div className="onboarding-features-list" style={{ marginBottom: '1.5rem' }}>
        <button
          className="onboarding-feature-item"
          style={{ width: '100%', cursor: 'pointer', justifyContent: 'space-between', background: '#fff1f2', borderColor: '#fecaca' }}
          onClick={logout}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <LogOut size={16} style={{ color: '#e11d48' }} />
            <span style={{ fontWeight: 700, color: '#9f1239' }}>Log Out of Guard Terminal</span>
          </div>
          <ChevronRight size={16} style={{ color: '#e11d48' }} />
        </button>
      </div>
    </div>
  );
};



