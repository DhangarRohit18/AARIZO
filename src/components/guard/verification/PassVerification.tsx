import React, { useState } from 'react';
import type { GuardVisitor, GatePassVerification } from '../../../domains/guard/types';
import { QrCode, KeyRound, CheckCircle2, AlertCircle, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import '../guard.css';

interface PassVerificationProps {
  visitors: GuardVisitor[];
  onSelectVisitor: (visitor: GuardVisitor) => void;
}

export const PassVerification: React.FC<PassVerificationProps> = ({ visitors, onSelectVisitor }) => {
  const [passcodeInput, setPasscodeInput] = useState<string>('8492');
  const [verificationResult, setVerificationResult] = useState<GatePassVerification | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'passcode' | 'qr'>('passcode');

  const handleVerifyPasscode = (codeToVerify?: string) => {
    const code = codeToVerify || passcodeInput.trim();
    if (!code) return;

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      const matched = visitors.find((v) => v.passcode === code);

      if (matched) {
        let status = matched.verificationStatus || 'valid';
        let msg = 'Gate pass verified successfully!';
        if (matched.status === 'expired') {
          status = 'expired';
          msg = 'Gate pass has expired.';
        } else if (matched.status === 'cancelled') {
          status = 'cancelled';
          msg = 'Gate pass was cancelled by resident.';
        } else if (matched.status === 'approval_required') {
          status = 'approval_required';
          msg = 'Resident approval required before entry.';
        }

        setVerificationResult({
          passcode: code,
          verificationStatus: status,
          visitor: matched,
          message: msg,
        });

        if (status === 'valid' || status === 'approval_required') {
          onSelectVisitor(matched);
        }
      } else {
        setVerificationResult({
          passcode: code,
          verificationStatus: 'invalid',
          message: `Passcode ${code} not recognised in system.`,
        });
      }
    }, 300);
  };

  return (
    <div>
      <div className="section-heading-row">
        <h3 className="section-title">Gate Pass Verification Terminal</h3>
        <div className="control-pill-toggle" style={{ background: '#e2e8f0' }}>
          <button
            className={`pill-btn ${activeTab === 'passcode' ? 'pill-active' : ''}`}
            onClick={() => setActiveTab('passcode')}
          >
            <KeyRound size={13} />
            <span>Passcode</span>
          </button>
          <button
            className={`pill-btn ${activeTab === 'qr' ? 'pill-active' : ''}`}
            onClick={() => setActiveTab('qr')}
          >
            <QrCode size={13} />
            <span>QR Scanner</span>
          </button>
        </div>
      </div>

      {activeTab === 'qr' ? (
        <div className="scanner-viewport-card">
          <div className="scanner-frame">
            <div className="scanner-line" />
            <QrCode size={54} style={{ color: '#60a5fa', opacity: 0.6 }} />
          </div>
          <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 800 }}>Simulated Scanner Active</h4>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0 0 1rem 0' }}>
            Hold visitor's digital QR pass in front of camera
          </p>
          <button
            className="btn-onboarding-primary"
            style={{ width: 'auto', margin: '0 auto' }}
            onClick={() => {
              setActiveTab('passcode');
              setPasscodeInput('8492');
              handleVerifyPasscode('8492');
            }}
          >
            <Sparkles size={16} />
            <span>Simulate Scan (Passcode 8492)</span>
          </button>
        </div>
      ) : (
        <div className="login-form-card" style={{ marginBottom: '1.25rem' }}>
          <label className="form-group-label" style={{ fontSize: '0.875rem' }}>
            Enter 4-Digit Visitor Gate Passcode
          </label>

          <div className="passcode-keypad-row">
            <input
              type="text"
              className="keypad-input"
              placeholder="e.g. 8492"
              maxLength={6}
              value={passcodeInput}
              onChange={(e) => setPasscodeInput(e.target.value.replace(/\D/g, ''))}
              autoFocus
            />
            <button
              className="btn-onboarding-primary"
              style={{ flex: 'none', padding: '0 1.25rem' }}
              onClick={() => handleVerifyPasscode()}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <RefreshCw size={18} className="spin-icon" />
              ) : (
                <>
                  <span>Verify</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Quick Test Passcodes:</span>
            <button
              className="btn-auth-text"
              style={{ fontSize: '0.75rem', color: '#2563eb', padding: '0 0.3rem' }}
              onClick={() => {
                setPasscodeInput('8492');
                handleVerifyPasscode('8492');
              }}
            >
              8492 (Rahul)
            </button>
            <button
              className="btn-auth-text"
              style={{ fontSize: '0.75rem', color: '#d97706', padding: '0 0.3rem' }}
              onClick={() => {
                setPasscodeInput('9102');
                handleVerifyPasscode('9102');
              }}
            >
              9102 (Zomato)
            </button>
          </div>
        </div>
      )}

      {/* Verification Result Feedback Banner */}
      {verificationResult && (
        <div
          className="activity-card"
          style={{
            background:
              verificationResult.verificationStatus === 'valid'
                ? '#ecfdf5'
                : verificationResult.verificationStatus === 'approval_required'
                ? '#fffbe6'
                : '#fef2f2',
            borderColor:
              verificationResult.verificationStatus === 'valid'
                ? '#6ee7b7'
                : verificationResult.verificationStatus === 'approval_required'
                ? '#fde68a'
                : '#fecaca',
            marginBottom: '1.25rem',
          }}
        >
          <div
            className="activity-icon-box"
            style={{
              background:
                verificationResult.verificationStatus === 'valid'
                  ? '#059669'
                  : verificationResult.verificationStatus === 'approval_required'
                  ? '#d97706'
                  : '#dc2626',
              color: '#ffffff',
            }}
          >
            {verificationResult.verificationStatus === 'valid' ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
          </div>
          <div className="activity-content">
            <h4
              className="activity-title"
              style={{
                color:
                  verificationResult.verificationStatus === 'valid'
                    ? '#065f46'
                    : verificationResult.verificationStatus === 'approval_required'
                    ? '#92400e'
                    : '#991b1b',
              }}
            >
              {verificationResult.verificationStatus.toUpperCase()}: {verificationResult.message}
            </h4>
            {verificationResult.visitor && (
              <p className="activity-subtext">
                Visitor: <strong>{verificationResult.visitor.name}</strong> • Resident:{' '}
                {verificationResult.visitor.residentName} ({verificationResult.visitor.flatCode})
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
