import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import type { UserRole } from '../../../domains/auth/types';
import { MOCK_USERS } from '../../../mockData/auth/mockUsers';
import {
  Home,
  Building2,
  Shield,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Lock,
  RefreshCw,
  X,
  KeyRound,
} from 'lucide-react';
import '../auth.css';

export const LoginScreen: React.FC = () => {
  const {
    selectedRole,
    selectRole,
    phoneNumber,
    setPhoneNumber,
    submitLogin,
    verifyOtp,
    isLoading,
    error,
    step,
    resetOnboarding,
  } = useAuth();

  const [otpInput, setOtpInput] = useState<string>('');
  const [showOtpModal, setShowOtpModal] = useState<boolean>(step === 'verify');

  const currentMockUser = MOCK_USERS[selectedRole];

  const handleRoleSelect = (role: UserRole) => {
    selectRole(role);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) {
      setPhoneNumber(val);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitLogin();
    if (success) {
      setShowOtpModal(true);
      setOtpInput('');
    }
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const isVerified = verifyOtp(otpInput || '4092');
    if (isVerified) {
      setShowOtpModal(false);
    }
  };

  const handleQuickAutoFill = () => {
    setOtpInput('4092');
    verifyOtp('4092');
  };

  return (
    <div className="auth-container">
      {/* Top Bar */}
      <header className="auth-header">
        <div className="auth-brand">
          <div className="auth-brand-logo">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="auth-brand-title">CommunityOS</h1>
          </div>
          <span className="auth-brand-badge">Simulated Auth</span>
        </div>
        <button className="btn-auth-text" onClick={resetOnboarding}>
          View Onboarding
        </button>
      </header>

      {/* Main Login Form Container */}
      <main className="login-container">
        <div className="login-hero">
          <div className="login-hero-icon">
            <Lock size={26} />
          </div>
          <h2 className="login-hero-title">Welcome to CommunityOS</h2>
          <p className="login-hero-desc">Select your portal role and enter mobile number to log in</p>
        </div>

        {/* Role Selector Grid */}
        <div className="role-section-label">
          <span>1. Select Portal Role</span>
          <span style={{ color: '#2563eb', fontWeight: 600 }}>Local Mock Identity</span>
        </div>

        <div className="role-selector-grid">
          {/* Resident Role */}
          <div
            className={`role-card ${selectedRole === 'resident' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('resident')}
          >
            {selectedRole === 'resident' && (
              <div className="role-check-badge">
                <CheckCircle2 size={12} />
              </div>
            )}
            <div className="role-icon-box">
              <Home size={20} />
            </div>
            <div className="role-name">Resident</div>
            <div className="role-subtext">Flat Owner / Tenant</div>
          </div>

          {/* Secretary Role */}
          <div
            className={`role-card ${selectedRole === 'secretary' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('secretary')}
          >
            {selectedRole === 'secretary' && (
              <div className="role-check-badge">
                <CheckCircle2 size={12} />
              </div>
            )}
            <div className="role-icon-box">
              <Building2 size={20} />
            </div>
            <div className="role-name">Secretary</div>
            <div className="role-subtext">Society Admin</div>
          </div>

          {/* Guard Role */}
          <div
            className={`role-card ${selectedRole === 'guard' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('guard')}
          >
            {selectedRole === 'guard' && (
              <div className="role-check-badge">
                <CheckCircle2 size={12} />
              </div>
            )}
            <div className="role-icon-box">
              <Shield size={20} />
            </div>
            <div className="role-name">Security</div>
            <div className="role-subtext">Gate Officer</div>
          </div>
        </div>

        {/* User Identity Preview Card */}
        <div className="mock-user-preview">
          <img src={currentMockUser.avatarUrl} alt={currentMockUser.name} className="user-avatar" />
          <div className="user-info-text">
            <h4 className="user-name-title">{currentMockUser.name}</h4>
            <p className="user-property-subtitle">
              {currentMockUser.roleLabel} • {currentMockUser.societyName}
              {currentMockUser.flatDetails ? ` (${currentMockUser.flatDetails})` : ''}
            </p>
          </div>
        </div>

        {/* Login Input Form Card */}
        <form className="login-form-card" onSubmit={handleFormSubmit}>
          <label className="form-group-label">2. Mobile Number Verification</label>
          <div className="phone-input-row">
            <div className="country-code-box">
              <span>🇮🇳</span>
              <span>+91</span>
            </div>
            <input
              type="tel"
              className="phone-input"
              placeholder="Enter 10-digit number"
              value={phoneNumber}
              onChange={handlePhoneChange}
              maxLength={10}
            />
          </div>

          {error && (
            <div className="error-banner">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn-login-submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw size={18} className="spin-icon" />
                <span>Simulating Verification...</span>
              </>
            ) : (
              <>
                <span>Continue to {selectedRole.toUpperCase()} Portal</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </main>

      {/* Simulated OTP Verification Modal */}
      {(showOtpModal || step === 'verify') && (
        <div className="auth-modal-overlay">
          <div className="auth-modal-card">
            <div
              style={{ display: 'flex', justifyContent: 'flex-end', cursor: 'pointer' }}
              onClick={() => setShowOtpModal(false)}
            >
              <X size={18} style={{ color: '#94a3b8' }} />
            </div>

            <div className="otp-icon-header">
              <KeyRound size={24} />
            </div>

            <h3 className="otp-title">Simulated OTP Verification</h3>
            <p className="otp-desc">
              Enter 4-digit code sent to <strong>+91 {phoneNumber}</strong> for <strong>{currentMockUser.name}</strong>
            </p>

            <div className="otp-code-display">Test OTP Code: 4092</div>

            <form onSubmit={handleOtpVerify}>
              <input
                type="text"
                className="otp-input-field"
                placeholder="4092"
                maxLength={4}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />

              {error && (
                <div className="error-banner" style={{ marginBottom: '1rem' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="btn-login-submit" style={{ marginTop: 0 }}>
                <span>Verify & Enter Portal</span>
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                className="btn-auth-text"
                style={{ width: '100%', marginTop: '0.75rem', color: '#2563eb' }}
                onClick={handleQuickAutoFill}
              >
                Auto-fill 4092 & Continue
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
