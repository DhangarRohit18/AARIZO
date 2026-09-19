import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../../../services/firebase/config';
import { Building2, Shield, ArrowRight, KeyRound, AlertCircle } from 'lucide-react';
import '../auth.css';

export const LoginScreen: React.FC = () => {
  const {
    phoneNumber,
    setPhoneNumber,
    submitLogin,
    verifyOtp,
    error,
    setError
  } = useAuth();

  const [otpInput, setOtpInput] = useState<string>('');
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [verifier, setVerifier] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    // Clear captcha on unmount
    return () => {
      if (verifier) {
        verifier.clear();
      }
    };
  }, [verifier]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }
    setLoading(true);
    try {
      let appVerifier = verifier;
      if (!appVerifier) {
        appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible'
        });
        setVerifier(appVerifier);
      }
      await submitLogin(appVerifier);
      setShowOtpModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtp(otpInput);
      // Let AuthContext onAuthStateChanged handle redirect
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div id="recaptcha-container"></div>
      
      <header className="auth-header">
        <div className="auth-logo">
          <Building2 size={24} style={{ color: '#0f172a' }} />
          <h1>CommunityOS</h1>
        </div>
      </header>

      <main className="auth-content">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Sign In</h2>
            <p>Access your society dashboard</p>
          </div>
          
          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="auth-form">
            <div className="form-group">
              <label>Phone Number</label>
              <div className="phone-input-group">
                <span className="country-code">+91</span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit number"
                  disabled={loading || showOtpModal}
                  required
                />
              </div>
            </div>

            {!showOtpModal && (
              <button 
                type="submit" 
                className="auth-btn-primary"
                disabled={loading || phoneNumber.length < 10}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
                <ArrowRight size={18} />
              </button>
            )}
          </form>
        </div>
      </main>

      {showOtpModal && (
        <div className="auth-modal-overlay">
          <div className="auth-modal-card">
            <div className="otp-icon-header">
              <KeyRound size={24} />
            </div>

            <h3 className="otp-title">Enter Verification Code</h3>
            <p className="otp-desc">
              We sent a 6-digit code to <strong>+91 {phoneNumber}</strong>
            </p>

            <form onSubmit={handleOtpVerify}>
              <input
                type="text"
                className="otp-input-field"
                placeholder="123456"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                autoFocus
                disabled={loading}
              />

              <button 
                type="submit" 
                className="auth-btn-primary" 
                style={{ width: '100%', marginTop: '16px' }}
                disabled={loading || otpInput.length < 6}
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
                <Shield size={18} />
              </button>
              
              <button
                type="button"
                className="auth-btn-secondary"
                style={{ width: '100%', marginTop: '12px' }}
                onClick={() => {
                  setShowOtpModal(false);
                  setOtpInput('');
                }}
                disabled={loading}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



