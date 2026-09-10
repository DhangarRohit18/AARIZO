import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, ArrowLeft, Lock, Sparkles, Building2, Home } from 'lucide-react';
import '../auth/auth.css';

export const GuardPlaceholder: React.FC = () => {
  const { currentUser, switchRole, logout } = useAuth();

  return (
    <div className="auth-container" style={{ background: '#0f172a', color: '#f8fafc' }}>
      {/* Top Header */}
      <header className="auth-header" style={{ background: '#1e293b', borderColor: '#334155' }}>
        <div className="auth-brand">
          <div className="auth-brand-logo" style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}>
            <Shield size={20} />
          </div>
          <div>
            <h1 className="auth-brand-title" style={{ color: '#ffffff' }}>Gate #1 Security Terminal</h1>
          </div>
          <span className="auth-brand-badge" style={{ background: '#78350f', color: '#fef3c7', borderColor: '#d97706' }}>
            Phase 3A Placeholder
          </span>
        </div>
        <button className="btn-auth-text" style={{ color: '#94a3b8' }} onClick={logout}>
          Return to Login
        </button>
      </header>

      {/* Main Content Card */}
      <main className="login-container" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <div className="onboarding-card" style={{ background: '#1e293b', borderColor: '#334155', color: '#ffffff' }}>
          <div
            className="otp-icon-header"
            style={{ background: '#334155', color: '#fbbf24', width: '64px', height: '64px' }}
          >
            <Shield size={32} />
          </div>

          <h2 className="onboarding-title" style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            Guard Workspace (Phase 3B)
          </h2>

          <p className="onboarding-desc" style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
            The Guard Application Terminal is deferred to Phase 3B as per roadmap scope. Officer{' '}
            <strong>{currentUser?.name || 'Officer R. Singh'}</strong> is registered and assigned to Gate #1 North Terminal.
          </p>

          <div
            className="onboarding-features-list"
            style={{ background: '#0f172a', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}
          >
            <div className="onboarding-feature-item" style={{ background: '#1e293b', borderColor: '#334155', color: '#cbd5e1' }}>
              <Lock size={14} style={{ color: '#fbbf24' }} />
              <span>Keypad OTP Verification Terminal (Phase 3B)</span>
            </div>
            <div className="onboarding-feature-item" style={{ background: '#1e293b', borderColor: '#334155', color: '#cbd5e1' }}>
              <Sparkles size={14} style={{ color: '#fbbf24' }} />
              <span>Visitor Entry Photo Log & Parking Slot Manager</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
            <button
              className="btn-onboarding-primary"
              style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}
              onClick={() => switchRole('resident')}
            >
              <Home size={18} />
              <span>Switch to Resident App (Sarvesh Kulkarni)</span>
            </button>

            <button
              className="btn-onboarding-primary"
              style={{ background: '#334155', color: '#f8fafc' }}
              onClick={() => switchRole('secretary')}
            >
              <Building2 size={18} />
              <span>Switch to Secretary Portal (Mayuri Udar)</span>
            </button>

            <button className="btn-onboarding-secondary" style={{ background: 'transparent', color: '#94a3b8', borderColor: '#475569' }} onClick={logout}>
              <ArrowLeft size={16} />
              <span>Back to Shared Login Screen</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
