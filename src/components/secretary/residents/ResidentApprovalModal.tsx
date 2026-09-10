import React, { useState } from 'react';
import type { SecretaryResidentRecord } from '../../../domains/secretary/types';
import { UserCheck, UserX, X, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import '../secretary.css';

interface ResidentApprovalModalProps {
  resident: SecretaryResidentRecord;
  onClose: () => void;
  onApprove: (id: string, note?: string) => void;
  onReject: (id: string, reason: string) => void;
}

export const ResidentApprovalModal: React.FC<ResidentApprovalModalProps> = ({
  resident,
  onClose,
  onApprove,
  onReject,
}) => {
  const [mode, setMode] = useState<'review' | 'reject'>('review');
  const [approvalNote, setApprovalNote] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('Invalid Ownership Document');
  const [customReason, setCustomReason] = useState<string>('');

  const handleApproveSubmit = () => {
    onApprove(resident.id, approvalNote.trim() || 'Ownership documents verified by Secretary.');
    onClose();
  };

  const handleRejectSubmit = () => {
    const finalReason =
      rejectionReason === 'Other' ? customReason.trim() || 'KYC requirements not met.' : rejectionReason;
    onReject(resident.id, finalReason);
    onClose();
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-card" style={{ maxWidth: '440px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="otp-icon-header" style={{ width: '36px', height: '36px', background: '#eff6ff', color: '#2563eb', margin: 0 }}>
              <UserCheck size={20} />
            </div>
            <h3 className="otp-title" style={{ fontSize: '1.125rem', margin: 0 }}>
              Resident Approval Audit
            </h3>
          </div>
          <button className="btn-auth-text" onClick={onClose} style={{ color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        <div className="resident-card" style={{ background: '#f8fafc', padding: '0.875rem', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span className="resident-flat-badge">{resident.canonicalDisplay}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: resident.type === 'Owner' ? '#2563eb' : '#d97706' }}>
                {resident.type}
              </span>
            </div>
            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 700 }}>{resident.name}</h4>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
              Submitted: {resident.submittedAt} • Phone: {resident.phone}
            </p>
          </div>
        </div>

        <div style={{ background: '#f1f5f9', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.8125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
            <FileText size={15} style={{ color: '#2563eb' }} />
            <span>Attached Document Checklist</span>
          </div>
          <div style={{ color: '#475569' }}>
            📄 {resident.kycDocType || 'National ID & Rent Agreement'}
          </div>
        </div>

        {mode === 'review' ? (
          <div>
            <label className="form-group-label" style={{ fontSize: '0.8125rem' }}>
              Secretary Approval Note (Optional)
            </label>
            <textarea
              className="search-input-field"
              rows={2}
              style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', fontSize: '0.8125rem' }}
              placeholder="e.g. Verified flat sale deed with registrar records..."
              value={approvalNote}
              onChange={(e) => setApprovalNote(e.target.value)}
            />

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn-onboarding-primary"
                style={{ flex: 1, background: '#16a34a' }}
                onClick={handleApproveSubmit}
              >
                <CheckCircle2 size={16} />
                <span>Approve Resident</span>
              </button>
              <button
                className="btn-onboarding-primary"
                style={{ flex: 1, background: '#dc2626' }}
                onClick={() => setMode('reject')}
              >
                <UserX size={16} />
                <span>Reject Application</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#dc2626', fontWeight: 700, marginBottom: '0.75rem' }}>
              <ShieldAlert size={18} />
              <span>Select Application Rejection Reason</span>
            </div>

            <select
              className="wing-filter-select"
              style={{ width: '100%', marginBottom: '0.75rem', padding: '0.5rem' }}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            >
              <option value="Invalid Ownership Document">Invalid Ownership Document</option>
              <option value="Unmatched Flat / Unit Records">Unmatched Flat / Unit Records</option>
              <option value="Expired Rent Agreement">Expired Rent Agreement</option>
              <option value="Incomplete KYC Identification">Incomplete KYC Identification</option>
              <option value="Other">Other Custom Reason</option>
            </select>

            {rejectionReason === 'Other' && (
              <input
                type="text"
                className="search-input-field"
                placeholder="Type specific rejection reason..."
                style={{ width: '100%', marginBottom: '0.75rem', padding: '0.5rem' }}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                className="btn-onboarding-primary"
                style={{ flex: 1, background: '#64748b' }}
                onClick={() => setMode('review')}
              >
                Back
              </button>
              <button
                className="btn-onboarding-primary"
                style={{ flex: 1, background: '#dc2626' }}
                onClick={handleRejectSubmit}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
