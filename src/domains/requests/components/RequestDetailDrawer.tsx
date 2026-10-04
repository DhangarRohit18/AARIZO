import React from 'react';
import { X, Paperclip, History } from 'lucide-react';
import type { SocietyRequest, SocietyRequestCategory, SocietyRequestStatus } from '../types';

interface RequestDetailDrawerProps {
  selectedRequest: SocietyRequest | null;
  onClose: () => void;
  activeRole: string;
  formatCategoryName: (cat: SocietyRequestCategory) => string;
  getStatusBadgeConfig: (status: SocietyRequestStatus) => any;
  actionNotes: string;
  setActionNotes: (v: string) => void;
  assignedOfficer: string;
  setAssignedOfficer: (v: string) => void;
  approvalDocName: string;
  setApprovalDocName: (v: string) => void;
  handleStatusTransition: (status: SocietyRequestStatus) => void;
}

export const RequestDetailDrawer: React.FC<RequestDetailDrawerProps> = ({
  selectedRequest,
  onClose,
  activeRole,
  formatCategoryName,
  getStatusBadgeConfig,
  actionNotes,
  setActionNotes,
  assignedOfficer,
  setAssignedOfficer,
  approvalDocName,
  setApprovalDocName,
  handleStatusTransition,
}) => {
  if (!selectedRequest) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(8, 59, 86, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          width: '100%',
          maxWidth: '560px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-6px 0 28px rgba(8, 59, 86, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Drawer Header (Sticky) */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #E2E8F0',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 800, color: '#083B56', background: '#F1F5F9', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                {selectedRequest.id}
              </span>
              {(() => {
                const b = getStatusBadgeConfig(selectedRequest.status);
                const BIcon = b.icon;
                return (
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: b.color, background: b.bg, border: `1px solid ${b.border}`, padding: '0.2rem 0.6rem', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <BIcon size={12} /> {b.label}
                  </span>
                );
              })()}
            </div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#083B56', margin: 0, lineHeight: 1.35 }}>
              {selectedRequest.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Meta Grid */}
          <div style={{ background: '#F8FAFC', borderRadius: '14px', border: '1px solid #EDF2F7', padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', fontSize: '0.78125rem' }}>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>Resident</span>
              <strong style={{ color: '#083B56', fontSize: '0.85rem' }}>{selectedRequest.residentName}</strong>
              <div style={{ color: '#64748B', fontSize: '0.72rem' }}>{selectedRequest.flatCode}</div>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>Category</span>
              <span style={{ color: '#176B91', background: '#EAF6FC', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.72rem', display: 'inline-block', marginTop: '0.15rem' }}>
                {formatCategoryName(selectedRequest.category)}
              </span>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>Assigned Officer</span>
              <span style={{ color: '#083B56', fontWeight: 700 }}>{selectedRequest.assignedOfficerName || 'Not Assigned'}</span>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>Priority</span>
              <span style={{ fontWeight: 800, color: selectedRequest.priority === 'URGENT' ? '#DC2626' : '#D97706' }}>
                {selectedRequest.priority}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#083B56', margin: '0 0 0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Request Description
            </h4>
            <div style={{ background: '#F8FAFC', padding: '0.875rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', color: '#334155', fontSize: '0.8125rem', lineHeight: 1.5 }}>
              {selectedRequest.description}
            </div>
          </div>

          {/* Attached Documents */}
          <div>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#083B56', margin: '0 0 0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Paperclip size={14} /> Supporting Documents ({selectedRequest.documents.length})
            </h4>
            {selectedRequest.documents.length === 0 ? (
              <p style={{ color: '#8B9AA5', fontSize: '0.75rem', fontStyle: 'italic', margin: 0 }}>No documents attached to this application.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedRequest.documents.map((doc) => (
                  <div key={doc.id} style={{ padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78125rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Paperclip size={16} color="#176B91" />
                      <span style={{ fontWeight: 700, color: '#083B56' }}>{doc.fileName}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#64748B' }}>uploaded by {doc.uploadedBy}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Trail */}
          <div>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#083B56', margin: '0 0 0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <History size={14} /> Audit Trail ({selectedRequest.history.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
              {selectedRequest.history.map((h) => (
                <div key={h.id} style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.7rem', marginBottom: '0.2rem' }}>
                    <span><strong style={{ color: '#083B56' }}>{h.actorName}</strong> ({h.actorRole})</span>
                    <span>{h.timestamp}</span>
                  </div>
                  <div style={{ fontWeight: 700, color: '#083B56' }}>{h.action}</div>
                  {h.notes && <p style={{ color: '#475569', fontSize: '0.72rem', fontStyle: 'italic', margin: '0.25rem 0 0' }}>"{h.notes}"</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Admin & Committee Review Actions */}
          {(activeRole === 'secretary' || activeRole === 'committee' || activeRole === 'admin') && (
            <div style={{ marginTop: '0.5rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: '16px', border: '1px solid #DCE8EF', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#083B56', margin: 0 }}>
                Official Committee Decision &amp; Actions
              </h4>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#083B56', marginBottom: '0.25rem' }}>
                  Decision Notes / Correction Comments
                </label>
                <input
                  type="text"
                  placeholder="Add officer review notes or remarks..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', fontSize: '0.78125rem', border: '1px solid #CBD5E1', background: '#ffffff', color: '#083B56', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#083B56', marginBottom: '0.25rem' }}>
                  Assign Officer Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Secretary Mayuri / Chairman Mehta"
                  value={assignedOfficer}
                  onChange={(e) => setAssignedOfficer(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', fontSize: '0.78125rem', border: '1px solid #CBD5E1', background: '#ffffff', color: '#083B56', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#083B56', marginBottom: '0.25rem' }}>
                  Approval Certificate / NOC PDF Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Signed_NOC_Certificate.pdf"
                  value={approvalDocName}
                  onChange={(e) => setApprovalDocName(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', fontSize: '0.78125rem', border: '1px solid #CBD5E1', background: '#ffffff', color: '#083B56', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleStatusTransition('UNDER_REVIEW')}
                  style={{ flex: 1, padding: '0.6rem', background: '#D97706', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.78125rem', cursor: 'pointer' }}
                >
                  Mark Review
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusTransition('APPROVED')}
                  style={{ flex: 1.5, padding: '0.6rem', background: '#059669', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.78125rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)' }}
                >
                  Approve Request
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusTransition('REJECTED')}
                  style={{ flex: 1, padding: '0.6rem', background: '#DC2626', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.78125rem', cursor: 'pointer' }}
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
