import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Paperclip,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { societyRequestService } from '../services/societyRequestService';
import { SubmitRequestModal } from './SubmitRequestModal';
import { RequestDetailDrawer } from './RequestDetailDrawer';
import type { SocietyRequest, SocietyRequestCategory, SocietyRequestStatus, RequestDocument } from '../types';
import { useAuth } from '../../../context/AuthContext';
import { useRBAC } from '../../../hooks/useRBAC';

export interface UnifiedRequestCenterProps {
  hideHeaderBanner?: boolean;
}

export const UnifiedRequestCenter: React.FC<UnifiedRequestCenterProps> = ({ hideHeaderBanner = false }) => {
  const { currentUser } = useAuth();
  const { activeRole } = useRBAC();
  const [requests, setRequests] = useState<SocietyRequest[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Submit Modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<SocietyRequestCategory>('NOC');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [newFileName, setNewFileName] = useState('');

  // Selected Request Detail Drawer
  const [selectedRequest, setSelectedRequest] = useState<SocietyRequest | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [approvalDocName, setApprovalDocName] = useState('');

  const loadRequests = () => {
    const list = societyRequestService.getAllRequests('soc-gvs');
    setRequests(list);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const docs: RequestDocument[] = newFileName
      ? [{ id: `doc-${Date.now()}`, fileName: newFileName, fileUrl: `/docs/${newFileName}`, uploadedBy: currentUser?.name || 'resident', uploadedAt: new Date().toLocaleString() }]
      : [];

    const requiresCommittee = ['RENOVATION_PERMISSION', 'OWNERSHIP_CHANGE', 'EVENT_PERMISSION'].includes(newCategory);

    societyRequestService.createRequest(
      {
        societyId: 'soc-gvs',
        residentId: currentUser?.id || 'res-1',
        residentName: currentUser?.name || 'Vikram Joshi',
        flatCode: currentUser?.flatDetails || 'Tower B · B-1204',
        title: newTitle,
        category: newCategory,
        description: newDescription,
        priority: newPriority,
        requiresCommitteeApproval: requiresCommittee,
        slaHours: requiresCommittee ? 72 : 24,
        targetCompletionDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        documents: docs,
      },
      currentUser?.name || 'resident',
      activeRole
    );

    setShowSubmitModal(false);
    setNewTitle('');
    setNewDescription('');
    setNewFileName('');
    loadRequests();
  };

  const handleStatusTransition = (toStatus: SocietyRequestStatus) => {
    if (!selectedRequest) return;

    let appDoc: RequestDocument | undefined;
    if (approvalDocName) {
      appDoc = {
        id: `doc-${Date.now()}`,
        fileName: approvalDocName,
        fileUrl: `/docs/${approvalDocName}`,
        uploadedBy: currentUser?.name || 'Admin',
        uploadedAt: new Date().toLocaleString(),
        docType: 'APPROVAL_CERTIFICATE',
      };
    }

    const updated = societyRequestService.updateRequestStatus(
      selectedRequest.id,
      toStatus,
      currentUser?.id || 'admin-1',
      currentUser?.name || 'Authorized Officer',
      activeRole,
      actionNotes,
      assignedOfficer,
      appDoc
    );

    if (updated) {
      setSelectedRequest(updated);
      setActionNotes('');
      setApprovalDocName('');
      loadRequests();
    }
  };

  const filteredRequests = requests.filter((r) => {
    // If resident role, filter only resident's requests
    if (activeRole === 'resident') {
      const myIds = [currentUser?.id, currentUser?.uid, 'user-resident-01', 'res-1'].filter(Boolean);
      const isMine =
        myIds.includes(r.residentId) ||
        r.residentName.toLowerCase() === (currentUser?.name || '').toLowerCase() ||
        r.residentName === 'Rajesh Kumar' ||
        (currentUser?.flatNumber ? r.flatCode.includes(currentUser.flatNumber) : false);
      if (!isMine) {
        return false;
      }
    }

    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'ALL' || r.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate live request metrics for KPI counters
  const totalCount = requests.length;
  const underReviewCount = requests.filter((r) => r.status === 'UNDER_REVIEW' || r.status === 'SUBMITTED').length;
  const approvedCount = requests.filter((r) => r.status === 'APPROVED' || r.status === 'COMPLETED').length;
  const inProgressCount = requests.filter((r) => r.status === 'IN_PROGRESS').length;

  const requestStats = [
    { label: 'Total Requests', count: totalCount, statusFilter: 'ALL', color: '#176B91', bg: '#EBF5FA', icon: FileText },
    { label: 'Under Review', count: underReviewCount, statusFilter: 'UNDER_REVIEW', color: '#D97706', bg: '#FFFBEB', icon: Clock },
    { label: 'Approved / Done', count: approvedCount, statusFilter: 'APPROVED', color: '#059669', bg: '#ECFDF5', icon: CheckCircle2 },
    { label: 'In Progress', count: inProgressCount, statusFilter: 'IN_PROGRESS', color: '#176B91', bg: '#EAF6FC', icon: AlertCircle },
  ];

  const formatCategoryName = (cat: string) => {
    switch (cat) {
      case 'NOC': return 'NOC Certificate';
      case 'TENANT_REGISTRATION': return 'Tenant Onboarding';
      case 'OWNERSHIP_CHANGE': return 'Ownership Transfer';
      case 'RENOVATION_PERMISSION': return 'Renovation Permit';
      case 'EVENT_PERMISSION': return 'Event Permission';
      case 'PARKING_REQUEST': return 'Parking Allocation';
      case 'SOCIETY_CERTIFICATE': return 'Society Certificate';
      default: return cat.replace(/_/g, ' ');
    }
  };

  const getStatusBadgeConfig = (status: SocietyRequestStatus) => {
    switch (status) {
      case 'APPROVED':
      case 'COMPLETED':
        return { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0', icon: CheckCircle2, label: status };
      case 'UNDER_REVIEW':
      case 'SUBMITTED':
        return { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A', icon: Clock, label: status.replace('_', ' ') };
      case 'IN_PROGRESS':
        return { bg: '#EAF6FC', color: '#176B91', border: '#DCE8EF', icon: AlertCircle, label: 'IN PROGRESS' };
      case 'REJECTED':
        return { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', icon: AlertCircle, label: status };
      default:
        return { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0', icon: FileText, label: status };
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '0.75rem 1rem 6rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)', boxSizing: 'border-box' }}>
      {/* ── Optional Compact Navy Header Banner (#083B56) ── */}
      {!hideHeaderBanner && (
        <div
          style={{
            background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            color: '#FFFFFF',
            boxShadow: '0 4px 16px rgba(8, 59, 86, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h1 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.25rem', margin: 0, letterSpacing: '-0.01em' }}>
              Unified Society Request Centre
            </h1>
            <p style={{ color: 'var(--aarizo-sky, #83CBEA)', fontSize: '0.78rem', margin: '0.2rem 0 0', lineHeight: 1.3 }}>
              NOCs, Tenant Registrations, Permits &amp; Executive Approvals
            </p>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            style={{
              background: 'var(--aarizo-blue, #176B91)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '10px',
              padding: '0.6rem 1rem',
              fontWeight: 700,
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              flexShrink: 0,
            }}
          >
            <Plus size={16} /> New Request / NOC
          </button>
        </div>
      )}

      {/* ── 4-Card KPI Stat Counters Grid (Responsive 2 on mobile, 4 on desktop) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
        {requestStats.map((st) => {
          const Icon = st.icon;
          const isSelected = filterStatus === st.statusFilter;
          return (
            <button
              key={st.label}
              type="button"
              onClick={() => setFilterStatus(st.statusFilter)}
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: isSelected ? `2px solid ${st.color}` : '1px solid #DCE8EF',
                padding: '0.875rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                textAlign: 'left',
                cursor: 'pointer',
                boxShadow: isSelected ? '0 4px 14px rgba(8,59,86,0.12)' : '0 2px 8px rgba(8,59,86,0.03)',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  background: st.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={20} color={st.color} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#083B56', lineHeight: 1.1 }}>
                  {st.count}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#657785', fontWeight: 600, marginTop: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {st.label}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Category Pill Tabs Track ── */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          padding: '6px',
          background: '#EBF3F7',
          borderRadius: '16px',
          border: '1px solid #DCE8EF',
          scrollbarWidth: 'none',
        }}
      >
        {[
          { key: 'ALL', label: 'All Requests' },
          { key: 'NOC', label: 'NOC Certificate' },
          { key: 'TENANT_REGISTRATION', label: 'Tenant Onboarding' },
          { key: 'RENOVATION_PERMISSION', label: 'Renovation Permit' },
          { key: 'EVENT_PERMISSION', label: 'Event Permission' },
          { key: 'PARKING_REQUEST', label: 'Parking Allocation' },
          { key: 'SOCIETY_CERTIFICATE', label: 'Statutory Certificate' },
        ].map((cat) => {
          const isActive = filterCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setFilterCategory(cat.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.5rem 1rem',
                fontSize: '0.8125rem',
                fontWeight: isActive ? 700 : 600,
                background: isActive ? '#083B56' : '#ffffff',
                color: isActive ? '#ffffff' : '#475569',
                border: isActive ? '1px solid #083B56' : '1px solid #DCE8EF',
                borderRadius: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: isActive ? '0 3px 10px rgba(8, 59, 86, 0.25)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ── Filter & Search Bar (Responsive flex-row on tablet/desktop) ── */}
      <div
        style={{
          background: '#ffffff',
          padding: '1rem',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 10px rgba(8, 59, 86, 0.04)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#8B9AA5', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search request title, resident, or Request ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '2.5rem',
              paddingRight: '0.75rem',
              height: '42px',
              borderRadius: '10px',
              fontSize: '0.8125rem',
              border: '1px solid #E2E8F0',
              outline: 'none',
              background: '#F8FAFC',
              color: '#083B56',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flex: '1 1 280px', minWidth: '240px' }}>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              borderRadius: '10px',
              fontSize: '0.78125rem',
              border: '1px solid #E2E8F0',
              background: '#ffffff',
              color: '#083B56',
              height: '42px',
              fontWeight: 600,
              boxSizing: 'border-box',
            }}
          >
            <option value="ALL">All Categories</option>
            <option value="NOC">NOC Certificate</option>
            <option value="TENANT_REGISTRATION">Tenant Onboarding</option>
            <option value="RENOVATION_PERMISSION">Renovation Permit</option>
            <option value="EVENT_PERMISSION">Event Permission</option>
            <option value="PARKING_REQUEST">Parking Allocation</option>
            <option value="SOCIETY_CERTIFICATE">Statutory Certificate</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              borderRadius: '10px',
              fontSize: '0.78125rem',
              border: '1px solid #E2E8F0',
              background: '#ffffff',
              color: '#083B56',
              height: '42px',
              fontWeight: 600,
              boxSizing: 'border-box',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="UNDER_REVIEW">UNDER REVIEW</option>
            <option value="APPROVED">APPROVED</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {/* ── Requests Cards Grid (1 col on mobile, 2 col on tablet, 3 col on desktop) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {filteredRequests.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #E2E8F0', color: '#64748B' }}>
            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0 0 1rem' }}>No society requests match the filter criteria.</p>
            <button
              onClick={() => setShowSubmitModal(true)}
              style={{ background: '#176B91', color: '#FFFFFF', padding: '0.5rem 1.25rem', fontSize: '0.8125rem', fontWeight: 700, borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={15} /> Submit New Request / NOC
            </button>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const badge = getStatusBadgeConfig(req.status);
            const StatusIcon = badge.icon;
            return (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '1.25rem',
                  boxShadow: '0 2px 10px rgba(8, 59, 86, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  position: 'relative',
                }}
              >
                <div>
                  {/* Top Bar: ID + Status Pill Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 700, color: '#083B56', background: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                      {req.id}
                    </span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        color: badge.color,
                        background: badge.bg,
                        border: `1px solid ${badge.border}`,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                      }}
                    >
                      <StatusIcon size={12} /> {badge.label}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 style={{ color: '#083B56', fontWeight: 800, fontSize: '0.9375rem', margin: '0 0 0.35rem', lineHeight: 1.35 }}>
                    {req.title}
                  </h3>
                  <p style={{ color: '#64748B', fontSize: '0.8125rem', lineHeight: 1.45, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {req.description}
                  </p>
                </div>

                {/* Meta details card */}
                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '0.75rem', border: '1px solid #EDF2F7', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748B', fontWeight: 500 }}>Resident:</span>
                    <strong style={{ color: '#083B56', fontWeight: 700 }}>{req.residentName} ({req.flatCode})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748B', fontWeight: 500 }}>Category:</span>
                    <span style={{ color: '#176B91', background: '#EAF6FC', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.7rem' }}>
                      {formatCategoryName(req.category)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '0.7rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Paperclip size={12} /> Attached Docs:
                    </span>
                    <span style={{ fontWeight: 600 }}>{req.documents.length} files</span>
                  </div>
                </div>

                {/* Direct Action Footer */}
                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRequest(req);
                    }}
                    style={{
                      flex: 1,
                      background: '#F1F5F9',
                      color: '#083B56',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '0.45rem',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    View Details
                  </button>

                  {(activeRole === 'secretary' || activeRole === 'committee' || activeRole === 'admin') &&
                    (req.status === 'UNDER_REVIEW' || req.status === 'SUBMITTED') && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRequest(req);
                          handleStatusTransition('APPROVED');
                        }}
                        style={{
                          background: '#059669',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.45rem 0.75rem',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          boxShadow: '0 2px 6px rgba(5,150,105,0.2)',
                        }}
                      >
                        <CheckCircle2 size={13} /> Approve
                      </button>
                    )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Submit Modal */}
      {/* Submit Request Modal */}
      <SubmitRequestModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        handleCreateRequest={handleCreateRequest}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        newDescription={newDescription}
        setNewDescription={setNewDescription}
        newPriority={newPriority}
        setNewPriority={setNewPriority}
        newFileName={newFileName}
        setNewFileName={setNewFileName}
      />

      {/* Selected Request Detail Drawer */}
      <RequestDetailDrawer
        selectedRequest={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        activeRole={activeRole}
        formatCategoryName={formatCategoryName}
        getStatusBadgeConfig={getStatusBadgeConfig}
        actionNotes={actionNotes}
        setActionNotes={setActionNotes}
        assignedOfficer={assignedOfficer}
        setAssignedOfficer={setAssignedOfficer}
        approvalDocName={approvalDocName}
        setApprovalDocName={setApprovalDocName}
        handleStatusTransition={handleStatusTransition}
      />
    </div>
  );
};
