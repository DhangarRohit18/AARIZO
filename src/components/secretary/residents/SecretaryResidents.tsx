import React, { useState } from 'react';
import type { SecretaryResidentRecord } from '../../../domains/secretary/types';
import { Search, Phone, UserCheck, Car, Users, Eye, X, CheckCircle2, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
import { ResidentApprovalModal } from './ResidentApprovalModal';
import '../secretary.css';

interface SecretaryResidentsProps {
  residentsList: SecretaryResidentRecord[];
  onApproveResident: (id: string, note?: string) => void;
  onRejectResident: (id: string, reason: string) => void;
  initialFilter?: 'ALL' | 'PENDING';
}

export const SecretaryResidents: React.FC<SecretaryResidentsProps> = ({
  residentsList,
  onApproveResident,
  onRejectResident,
  initialFilter = 'ALL',
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedWing, setSelectedWing] = useState<string>('ALL');
  const [statusTab, setStatusTab] = useState<'ALL' | 'ACTIVE' | 'PENDING'>(
    initialFilter === 'PENDING' ? 'PENDING' : 'ALL'
  );
  const [selectedResident, setSelectedResident] = useState<SecretaryResidentRecord | null>(null);
  const [approvalTarget, setApprovalTarget] = useState<SecretaryResidentRecord | null>(null);

  const pendingCount = residentsList.filter((r) => r.status === 'Pending Verification').length;
  const activeCount = residentsList.filter((r) => r.status === 'Active').length;

  const filteredResidents = residentsList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.canonicalDisplay.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.flatNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesWing = selectedWing === 'ALL' || item.blockWing === selectedWing;

    const matchesStatus =
      statusTab === 'ALL'
        ? true
        : statusTab === 'ACTIVE'
        ? item.status === 'Active'
        : item.status === 'Pending Verification';

    return matchesSearch && matchesWing && matchesStatus;
  });

  return (
    <div>
      {/* Header & Stats Banner */}
      <div className="section-heading-row">
        <div>
          <h3 className="section-title">Society Resident Directory</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
            Operational Directory & KYC Approval Center
          </p>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700 }}>
          {activeCount} Active • {pendingCount} Pending
        </span>
      </div>

      {/* Pending Approval Highlight Banner */}
      {pendingCount > 0 && statusTab !== 'PENDING' && (
        <div
          className="activity-card"
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            marginBottom: '1rem',
            cursor: 'pointer',
          }}
          onClick={() => setStatusTab('PENDING')}
        >
          <div className="activity-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={20} />
          </div>
          <div className="activity-content">
            <h4 className="activity-title" style={{ color: '#92400e' }}>
              {pendingCount} Resident Verification{pendingCount > 1 ? 's' : ''} Pending
            </h4>
            <p className="activity-subtext" style={{ color: '#b45309' }}>
              Action required: Click to review pending KYC documents & approve flat access.
            </p>
          </div>
        </div>
      )}

      {/* Search & Multi-Wing Filter Bar */}
      <div className="resident-search-bar" style={{ gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div className="search-input-wrapper" style={{ flex: 1 }}>
          <Search size={18} style={{ color: '#94a3b8' }} />
          <input
            type="text"
            className="search-input-field"
            placeholder="Search by name or unit (e.g. 1204)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="wing-filter-select"
          value={selectedWing}
          onChange={(e) => setSelectedWing(e.target.value)}
        >
          <option value="ALL">All Blocks</option>
          <option value="Block A">Block A</option>
          <option value="Block B">Block B</option>
          <option value="Block C">Block C</option>
        </select>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          className={`pill-btn ${statusTab === 'ALL' ? 'pill-active' : ''}`}
          onClick={() => setStatusTab('ALL')}
        >
          All ({residentsList.length})
        </button>
        <button
          className={`pill-btn ${statusTab === 'ACTIVE' ? 'pill-active' : ''}`}
          onClick={() => setStatusTab('ACTIVE')}
        >
          Active ({activeCount})
        </button>
        <button
          className={`pill-btn ${statusTab === 'PENDING' ? 'pill-active' : ''}`}
          style={{
            background: statusTab === 'PENDING' ? '#d97706' : '#fef3c7',
            color: statusTab === 'PENDING' ? '#ffffff' : '#b45309',
          }}
          onClick={() => setStatusTab('PENDING')}
        >
          Pending ({pendingCount})
        </button>
      </div>

      {/* Residents List Cards */}
      {filteredResidents.length === 0 ? (
        <div className="login-form-card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <AlertCircle size={32} style={{ color: '#94a3b8', marginBottom: '0.5rem' }} />
          <h4 style={{ margin: '0 0 0.25rem 0' }}>No Residents Found</h4>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
            Try altering your search keywords or block filter criteria.
          </p>
        </div>
      ) : (
        filteredResidents.map((res) => (
          <div key={res.id} className="resident-card" style={{ marginBottom: '0.75rem' }}>
            <div className="resident-card-left">
              <div className="resident-flat-badge">{res.canonicalDisplay}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h4 className="resident-name">{res.name}</h4>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '0.125rem 0.375rem',
                      borderRadius: '4px',
                      background: res.status === 'Active' ? '#f0fdf4' : '#fffbeb',
                      color: res.status === 'Active' ? '#16a34a' : '#d97706',
                    }}
                  >
                    {res.status}
                  </span>
                </div>
                <p className="resident-details">
                  {res.blockWing} • <strong>{res.type}</strong> • {res.phone}
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    marginTop: '0.25rem',
                    fontSize: '0.6875rem',
                    color: '#64748b',
                  }}
                >
                  <span>🚗 {res.vehiclesCount} Vehicles</span>
                  <span>👨‍👩‍👧 {res.familyCount} Members</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
              {res.status === 'Pending Verification' && (
                <button
                  className="btn-onboarding-primary"
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.75rem',
                    background: '#d97706',
                  }}
                  onClick={() => setApprovalTarget(res)}
                >
                  Review
                </button>
              )}
              <button
                className="btn-auth-text"
                style={{ color: '#2563eb', padding: '0.4rem 0.5rem' }}
                onClick={() => setSelectedResident(res)}
                title="View Full Resident Details"
              >
                <Eye size={18} />
              </button>
            </div>
          </div>
        ))
      )}

      {/* Resident Approval Modal */}
      {approvalTarget && (
        <ResidentApprovalModal
          resident={approvalTarget}
          onClose={() => setApprovalTarget(null)}
          onApprove={onApproveResident}
          onReject={onRejectResident}
        />
      )}

      {/* Resident Detail Modal */}
      {selectedResident && (
        <div className="auth-modal-overlay">
          <div className="auth-modal-card">
            <div
              style={{ display: 'flex', justifyContent: 'flex-end', cursor: 'pointer' }}
              onClick={() => setSelectedResident(null)}
            >
              <X size={18} style={{ color: '#94a3b8' }} />
            </div>

            <div className="otp-icon-header" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <UserCheck size={26} />
            </div>

            <h3 className="otp-title">{selectedResident.name}</h3>
            <p className="otp-desc">
              <strong>{selectedResident.canonicalDisplay}</strong> • {selectedResident.type}
            </p>

            <div className="onboarding-features-list" style={{ marginBottom: '1.25rem' }}>
              <div className="onboarding-feature-item">
                <Phone size={14} style={{ color: '#2563eb' }} />
                <span>Contact: {selectedResident.phone} ({selectedResident.email})</span>
              </div>
              <div className="onboarding-feature-item">
                <Car size={14} style={{ color: '#2563eb' }} />
                <span>Vehicles: {selectedResident.vehiclesCount} Registered Slots</span>
              </div>
              <div className="onboarding-feature-item">
                <Users size={14} style={{ color: '#2563eb' }} />
                <span>Family Members: {selectedResident.familyCount} Registered</span>
              </div>
              <div className="onboarding-feature-item">
                <ShieldCheck size={14} style={{ color: '#16a34a' }} />
                <span>Verification: {selectedResident.status}</span>
              </div>
              {selectedResident.kycDocType && (
                <div className="onboarding-feature-item">
                  <CheckCircle2 size={14} style={{ color: '#2563eb' }} />
                  <span>KYC Doc: {selectedResident.kycDocType}</span>
                </div>
              )}
            </div>

            <button className="btn-login-submit" onClick={() => setSelectedResident(null)}>
              Close Resident Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
