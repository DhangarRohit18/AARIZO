import React, { useState } from 'react';
import type { GuardVisitor } from '../../../domains/guard/types';
import {
  Building,
  Clock,
  Car,
  Phone,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ShieldCheck,
  Info,
} from 'lucide-react';
import '../guard.css';

interface VisitorVerificationDetailProps {
  visitor: GuardVisitor;
  onBack: () => void;
  onApprove: (visitor: GuardVisitor) => void;
  onReject: (visitor: GuardVisitor, reason: string) => void;
}

export const VisitorVerificationDetail: React.FC<VisitorVerificationDetailProps> = ({
  visitor,
  onBack,
  onApprove,
  onReject,
}) => {
  const [callFeedback, setCallFeedback] = useState<string | null>(null);

  const handleContactResident = () => {
    setCallFeedback(`Calling resident ${visitor.residentName} (${visitor.flatCode})...`);
    setTimeout(() => {
      setCallFeedback(`Connected with ${visitor.residentName}. Resident verbally approved entry.`);
    }, 1200);
  };

  return (
    <div>
      <button
        className="btn-auth-text"
        style={{ marginBottom: '1rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
        onClick={onBack}
      >
        <ArrowLeft size={16} />
        Back to Verification
      </button>

      {/* Visitor Profile Overview Card */}
      <div className="onboarding-card" style={{ padding: '1.5rem', marginBottom: '1.25rem', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <span
              className="banner-role-tag"
              style={{
                background: visitor.visitorType === 'guest' ? '#eff6ff' : '#fffbe6',
                color: visitor.visitorType === 'guest' ? '#2563eb' : '#d97706',
              }}
            >
              {visitor.visitorTypeLabel.toUpperCase()}
            </span>
            <h2 className="onboarding-title" style={{ fontSize: '1.375rem', margin: '0.25rem 0 0 0' }}>
              {visitor.name}
            </h2>
          </div>

          <div
            style={{
              fontSize: '0.8125rem',
              fontWeight: 800,
              padding: '0.375rem 0.75rem',
              borderRadius: '8px',
              background: visitor.status === 'approved' || visitor.status === 'checked_in' ? '#ecfdf5' : '#fffbe6',
              color: visitor.status === 'approved' || visitor.status === 'checked_in' ? '#059669' : '#d97706',
              border: '1px solid #bfdbfe',
            }}
          >
            {visitor.status.toUpperCase()}
          </div>
        </div>

        {/* Info Grid */}
        <div className="onboarding-features-list">
          <div className="onboarding-feature-item">
            <Building size={16} style={{ color: '#2563eb' }} />
            <span>
              Resident: <strong>{visitor.residentName}</strong> ({visitor.tower} • {visitor.flatCode})
            </span>
          </div>

          {visitor.vehicleNumber && (
            <div className="onboarding-feature-item">
              <Car size={16} style={{ color: '#2563eb' }} />
              <span>Vehicle Tag: <strong>{visitor.vehicleNumber}</strong></span>
            </div>
          )}

          <div className="onboarding-feature-item">
            <Clock size={16} style={{ color: '#2563eb' }} />
            <span>Expected Time: {visitor.expectedTimeSlot} ({visitor.expectedDate})</span>
          </div>

          <div className="onboarding-feature-item">
            <ShieldCheck size={16} style={{ color: '#2563eb' }} />
            <span>Passcode: <strong>{visitor.passcode}</strong> • Gate: {visitor.gateName}</span>
          </div>
        </div>
      </div>

      {callFeedback && (
        <div className="error-banner" style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#1e3a8a', marginBottom: '1.25rem' }}>
          <Info size={16} />
          <span>{callFeedback}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="guard-action-btns-row">
        <button className="btn-guard-action-primary" onClick={() => onApprove(visitor)}>
          <CheckCircle size={18} />
          <span>Approve Entry</span>
        </button>

        <button className="btn-guard-action-danger" onClick={() => onReject(visitor, 'Pass Expired / Invalid ID')}>
          <XCircle size={18} />
          <span>Reject Entry</span>
        </button>

        <button className="btn-guard-action-outline" onClick={handleContactResident}>
          <Phone size={16} />
          <span>Call Resident</span>
        </button>
      </div>
    </div>
  );
};
