import React, { useState } from 'react';
import type { GuardVisitor } from '../../../domains/guard/types';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import '../guard.css';

interface GateDecisionModalProps {
  mode: 'approve' | 'reject';
  visitor: GuardVisitor;
  onConfirmApprove: (visitor: GuardVisitor) => void;
  onConfirmReject: (visitor: GuardVisitor, reason: string) => void;
  onClose: () => void;
}

const REJECTION_REASONS = [
  'Invalid identification document',
  'Resident unavailable / did not answer intercom',
  'Pass expired or time slot elapsed',
  'Visitor not recognised by flat resident',
  'Security policy violation',
];

export const GateDecisionModal: React.FC<GateDecisionModalProps> = ({
  mode,
  visitor,
  onConfirmApprove,
  onConfirmReject,
  onClose,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(REJECTION_REASONS[0]);

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-card">
        <div style={{ display: 'flex', justifyContent: 'flex-end', cursor: 'pointer' }} onClick={onClose}>
          <X size={18} style={{ color: '#94a3b8' }} />
        </div>

        {mode === 'approve' ? (
          <>
            <div className="otp-icon-header" style={{ background: '#ecfdf5', color: '#059669' }}>
              <CheckCircle2 size={28} />
            </div>

            <h3 className="otp-title">Approve Visitor Entry?</h3>
            <p className="otp-desc">
              Grant entry authorization for <strong>{visitor.name}</strong> visiting{' '}
              <strong>{visitor.residentName}</strong> ({visitor.flatCode}).
            </p>

            <div className="onboarding-features-list" style={{ marginBottom: '1.25rem' }}>
              <div className="onboarding-feature-item">
                <span>Gate: {visitor.gateName}</span>
              </div>
              <div className="onboarding-feature-item">
                <span>Passcode: {visitor.passcode}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-onboarding-secondary" style={{ flex: 1 }} onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn-onboarding-primary"
                style={{ flex: 1, background: '#16a34a' }}
                onClick={() => onConfirmApprove(visitor)}
              >
                Confirm Approval
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="otp-icon-header" style={{ background: '#fef2f2', color: '#dc2626' }}>
              <XCircle size={28} />
            </div>

            <h3 className="otp-title">Reject Visitor Entry</h3>
            <p className="otp-desc">
              Select rejection reason for <strong>{visitor.name}</strong> at Gate #1
            </p>

            <div style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
              <label className="form-group-label">Reason for Rejection:</label>
              <select
                className="phone-input"
                style={{ fontSize: '0.875rem', width: '100%', marginBottom: '0.5rem' }}
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
              >
                {REJECTION_REASONS.map((r, idx) => (
                  <option key={idx} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-onboarding-secondary" style={{ flex: 1 }} onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn-onboarding-primary"
                style={{ flex: 1, background: '#dc2626' }}
                onClick={() => onConfirmReject(visitor, selectedReason)}
              >
                Confirm Rejection
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
