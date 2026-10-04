import React from 'react';
import { X } from 'lucide-react';
import type { SocietyRequestCategory } from '../types';

interface SubmitRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleCreateRequest: (e: React.FormEvent) => void;
  newTitle: string;
  setNewTitle: (v: string) => void;
  newCategory: SocietyRequestCategory;
  setNewCategory: (v: any) => void;
  newDescription: string;
  setNewDescription: (v: string) => void;
  newPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  setNewPriority: (v: any) => void;
  newFileName: string;
  setNewFileName: (v: string) => void;
}

export const SubmitRequestModal: React.FC<SubmitRequestModalProps> = ({
  isOpen,
  onClose,
  handleCreateRequest,
  newTitle,
  setNewTitle,
  newCategory,
  setNewCategory,
  newDescription,
  setNewDescription,
  newPriority,
  setNewPriority,
  newFileName,
  setNewFileName,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(8, 59, 86, 0.6)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 1000,
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(8,59,86,0.25)',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          margin: 'auto',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #E2E8F0',
            background: '#F8FAFC',
            flexShrink: 0,
          }}
        >
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#083B56', margin: 0 }}>
            Submit New Request / NOC
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleCreateRequest} id="societyRequestForm" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8125rem', overflowY: 'auto', flex: 1 }}>
          <div>
            <label style={{ display: 'block', fontWeight: 700, color: '#083B56', marginBottom: '0.35rem' }}>Request Title</label>
            <input
              type="text"
              placeholder="e.g. Balcony Grill Expansion Permission"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.8125rem', color: '#083B56', outline: 'none', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#083B56', marginBottom: '0.35rem' }}>Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#ffffff', fontSize: '0.78125rem', color: '#083B56', fontWeight: 600, boxSizing: 'border-box' }}
              >
                <option value="NOC">No Objection Certificate (NOC)</option>
                <option value="TENANT_REGISTRATION">Tenant Registration</option>
                <option value="OWNERSHIP_CHANGE">Ownership Transfer</option>
                <option value="RENOVATION_PERMISSION">Renovation Permit</option>
                <option value="EVENT_PERMISSION">Lawn / Hall Event</option>
                <option value="PARKING_REQUEST">Parking Allocation</option>
                <option value="SOCIETY_CERTIFICATE">Society Certificate</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#083B56', marginBottom: '0.35rem' }}>Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#ffffff', fontSize: '0.78125rem', color: '#083B56', fontWeight: 600, boxSizing: 'border-box' }}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, color: '#083B56', marginBottom: '0.35rem' }}>Description &amp; Details</label>
            <textarea
              rows={3}
              placeholder="Provide complete explanation for committee review..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.8125rem', color: '#083B56', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, color: '#083B56', marginBottom: '0.35rem' }}>Upload Supporting Document / Agreement</label>
            <input
              type="text"
              placeholder="e.g. Registered_Agreement.pdf or Architectural_Plan.pdf"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.75rem', fontFamily: 'monospace', color: '#083B56', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.5rem', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', flexShrink: 0 }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '0.55rem 1rem', fontSize: '0.78125rem', fontWeight: 700, borderRadius: '10px', border: '1px solid #E2E8F0', background: '#ffffff', color: '#475569', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="societyRequestForm"
            style={{ padding: '0.55rem 1.25rem', fontSize: '0.78125rem', fontWeight: 700, borderRadius: '10px', border: 'none', background: '#176B91', color: '#ffffff', cursor: 'pointer', boxShadow: '0 2px 6px rgba(23,107,145,0.25)' }}
          >
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
};
