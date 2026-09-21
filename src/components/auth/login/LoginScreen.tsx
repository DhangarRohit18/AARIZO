import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowRight, AlertCircle, Shield, Home, Building2 } from 'lucide-react';
import { MOCK_USERS } from '../../../mockData/auth/mockUsers';
import '../auth.css';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    phoneNumber,
    setPhoneNumber,
    verifyOtp,
    loginAsRole,
    error,
    setError,
  } = useAuth();

  const [otpInput, setOtpInput] = useState<string>('');
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<'resident' | 'secretary' | 'guard'>('resident');

  const executeLogin = (role: 'resident' | 'secretary' | 'guard') => {
    loginAsRole(role);
    if (role === 'secretary') navigate('/admin');
    else if (role === 'guard') navigate('/security');
    else navigate('/resident');
  };

  const handleRoleSelect = (role: 'resident' | 'secretary' | 'guard') => {
    setActiveRole(role);
    setPhoneNumber(MOCK_USERS[role]?.phone || '9876543210');
    setError(null);
  };

  const handleRoleCardClick = (role: 'resident' | 'secretary' | 'guard') => {
    if (activeRole === role) {
      // If already active, execute login immediately
      executeLogin(role);
    } else {
      handleRoleSelect(role);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (otpInput === '4092' || otpInput === '1234' || otpInput.length >= 4) {
        setShowOtpModal(false);
        executeLogin(activeRole);
        return;
      }
      await verifyOtp(otpInput);
      executeLogin(activeRole);
    } catch {
      setShowOtpModal(false);
      executeLogin(activeRole);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div id="recaptcha-container" />

      <div className="login-container">
        {/* Header Branding */}
        <div className="login-hero">
          <h1 className="login-hero-title">LOGIN</h1>
          <p className="login-hero-desc">Enter your mobile number to access your society portal</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{ background: 'var(--aarizo-danger-bg, #FFF0F1)', border: '1px solid #fbc5c8', color: 'var(--aarizo-danger, #D9535B)', padding: '0.75rem', borderRadius: '12px', fontSize: '0.8125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Role Selector Grid */}
        <div className="role-selector-grid">
          <div
            className={`role-card ${activeRole === 'resident' ? 'selected' : ''}`}
            onClick={() => handleRoleCardClick('resident')}
            title="Click to select or enter as Resident"
            style={{ cursor: 'pointer' }}
          >
            <div className="role-icon-box">
              <Home size={20} />
            </div>
            <span className="role-name">Resident</span>
          </div>

          <div
            className={`role-card ${activeRole === 'secretary' ? 'selected' : ''}`}
            onClick={() => handleRoleCardClick('secretary')}
            title="Click to select or enter as Secretary"
            style={{ cursor: 'pointer' }}
          >
            <div className="role-icon-box">
              <Building2 size={20} />
            </div>
            <span className="role-name">Secretary</span>
          </div>

          <div
            className={`role-card ${activeRole === 'guard' ? 'selected' : ''}`}
            onClick={() => handleRoleCardClick('guard')}
            title="Click to select or enter as Security Guard"
            style={{ cursor: 'pointer' }}
          >
            <div className="role-icon-box">
              <Shield size={20} />
            </div>
            <span className="role-name">Security</span>
          </div>
        </div>

        {/* Phone Input Card */}
        <div style={{ background: '#ffffff', border: '1px solid var(--aarizo-border-soft, #E8F1F5)', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 2px 10px rgba(8, 59, 86, 0.05)' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--aarizo-text, #203746)', marginBottom: '0.5rem', display: 'block' }}>
            Phone Number
          </label>
          <div className="phone-input-row">
            <div className="country-code-box">+91</div>
            <input
              type="tel"
              className="phone-input"
              placeholder="Enter mobile number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              maxLength={10}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              onClick={() => executeLogin(activeRole)}
              disabled={loading}
              className="btn-login-submit"
            >
              <span>Continue as {activeRole === 'secretary' ? 'Secretary' : activeRole === 'guard' ? 'Security' : 'Resident'}</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => setShowOtpModal(true)}
              style={{
                width: '100%',
                padding: '0.625rem',
                borderRadius: '12px',
                border: '1px solid var(--aarizo-border, #DCE8EF)',
                background: 'var(--aarizo-card-blue, #F4FAFE)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--aarizo-blue, #176B91)',
                cursor: 'pointer',
              }}
            >
              Demo OTP Verification (code: 4092)
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--aarizo-text-secondary, #657785)' }}>
            Need access to your flat?{' '}
            <span style={{ color: 'var(--aarizo-blue, #176B91)', fontWeight: 700, cursor: 'pointer' }} onClick={() => executeLogin('secretary')}>
              Contact Secretary
            </span>
          </p>
        </div>
      </div>

      {/* Simulated OTP Modal */}
      {showOtpModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8, 59, 86, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.75rem', maxWidth: '360px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(8, 59, 86, 0.2)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', margin: 0 }}>
              Verify OTP
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--aarizo-text-secondary, #657785)', margin: '0.5rem 0 1.25rem' }}>
              Enter the 4-digit verification code sent to your phone
            </p>
            <input
              type="text"
              maxLength={6}
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              placeholder="••••"
              style={{ width: '100%', textAlign: 'center', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '0.3em', padding: '0.75rem', border: '1px solid var(--aarizo-border, #DCE8EF)', borderRadius: '12px', outline: 'none', marginBottom: '1.25rem' }}
            />
            <button onClick={handleOtpVerify} className="btn-login-submit" style={{ marginTop: 0 }}>
              Verify & Proceed
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;
