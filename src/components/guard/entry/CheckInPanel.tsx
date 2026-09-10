import React from 'react';
import type { GuardVisitor } from '../../../domains/guard/types';
import { LogIn, UserCheck, ShieldCheck, ArrowRight, X } from 'lucide-react';
import '../guard.css';

interface CheckInPanelProps {
  visitor: GuardVisitor;
  onConfirmCheckIn: (visitor: GuardVisitor) => void;
  onCancel: () => void;
}

export const CheckInPanel: React.FC<CheckInPanelProps> = ({
  visitor,
  onConfirmCheckIn,
  onCancel,
}) => {
  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-card">
        <div style={{ display: 'flex', justifyContent: 'flex-end', cursor: 'pointer' }} onClick={onCancel}>
          <X size={18} style={{ color: '#94a3b8' }} />
        </div>

        <div className="otp-icon-header" style={{ background: '#ecfdf5', color: '#059669' }}>
          <LogIn size={28} />
        </div>

        <h3 className="otp-title">Ready for Gate Check-In</h3>
        <p className="otp-desc">
          Entry authorized for <strong>{visitor.name}</strong> visiting{' '}
          <strong>{visitor.residentName}</strong> ({visitor.flatCode}).
        </p>

        <div className="onboarding-features-list" style={{ marginBottom: '1.25rem' }}>
          <div className="onboarding-feature-item">
            <ShieldCheck size={16} style={{ color: '#16a34a' }} />
            <span>Passcode: {visitor.passcode} • Status: Approved</span>
          </div>
          <div className="onboarding-feature-item">
            <UserCheck size={16} style={{ color: '#16a34a' }} />
            <span>Gate: {visitor.gateName} (Officer R. Singh)</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-onboarding-secondary" style={{ flex: 1 }} onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn-onboarding-primary"
            style={{ flex: 1, background: '#16a34a' }}
            onClick={() => onConfirmCheckIn(visitor)}
          >
            <span>Confirm Check-In</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
