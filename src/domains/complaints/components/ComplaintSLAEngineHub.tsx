import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Sliders,
  RotateCcw,
  CheckSquare,
  Sparkles,
  MapPin,
  User,
  Timer
} from 'lucide-react';
import { complaintSLAService } from '../services/complaintSLAService';
import type { Complaint, ComplaintCategory, SLAPolicy, SLAAnalytics } from '../types';
import { useAuth } from '../../../context/AuthContext';
import { useRBAC } from '../../../hooks/useRBAC';
import { subscribeToComplaints, createComplaintToDb, updateComplaintInDb } from '../../../repositories/complaintRepository';
import { RealtimeSyncBadge } from '../../../components/common';
import { Modal } from '../../../components/ui/Modal';
import { FileUpload } from '../../../components/ui/FileUpload';

export const ComplaintSLAEngineHub: React.FC = () => {
  const { currentUser } = useAuth();
  const { activeRole } = useRBAC();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [_slaPolicies, setSlaPolicies] = useState<SLAPolicy[]>([]);
  const [analytics, setAnalytics] = useState<SLAAnalytics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Submit Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('PLUMBING');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Tower B · Flat B-1204');
  const [urgency, setUrgency] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [photoUrl, setPhotoUrl] = useState('');

  // Policy Config Modal
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [selectedPolicyCat, setSelectedPolicyCat] = useState<ComplaintCategory>('PLUMBING');
  const [newSlaMinutes, setNewSlaMinutes] = useState<number>(240);

  // Resident Verification Modal
  const [verifyComplaint, setVerifyComplaint] = useState<Complaint | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState('');

  const loadData = () => {
    setSlaPolicies(complaintSLAService.getSLAPolicies('soc-gvs'));
    setAnalytics(complaintSLAService.getSLAAnalytics('soc-gvs'));
    const initialList = complaintSLAService.getAllComplaints('soc-gvs');
    setComplaints((prev) => (prev && prev.length > 0 ? prev : initialList));
  };

  useEffect(() => {
    loadData();

    try {
      const unsubscribe = subscribeToComplaints('soc-gvs', (list) => {
        if (list && list.length > 0) {
          setComplaints(list);
        } else {
          setComplaints(complaintSLAService.getAllComplaints('soc-gvs'));
        }
      });
      return () => unsubscribe();
    } catch {
      setComplaints(complaintSLAService.getAllComplaints('soc-gvs'));
    }
  }, []);

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    await createComplaintToDb({
      societyId: 'soc-gvs',
      residentId: currentUser?.id || 'res-1',
      residentName: currentUser?.name || 'Vikram Joshi',
      flatCode: currentUser?.flatDetails || 'Tower B · B-1204',
      category,
      title,
      description,
      location,
      urgency,
      photoUrl,
      status: 'OPEN',
      escalationLevel: 'STAFF'
    }, currentUser?.id || 'res-1', activeRole);
    setShowSubmitModal(false);
    setTitle('');
    setDescription('');
    setPhotoUrl('');
  };

  const handleUpdatePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    complaintSLAService.updateSLAPolicy('soc-gvs', selectedPolicyCat, newSlaMinutes, currentUser?.name || 'Admin');
    setShowPolicyModal(false);
  };

  const handleResolveTicket = async (id: string) => {
    await updateComplaintInDb('soc-gvs', id, { status: 'RESOLVED' }, currentUser?.id || 'tech-1', activeRole, 'COMPLAINT_RESOLVED');
  };

  const handleResidentVerify = async (isResolved: boolean) => {
    if (!verifyComplaint) return;
    const newStatus = isResolved ? 'CLOSED' : 'REOPENED';
    await updateComplaintInDb('soc-gvs', verifyComplaint.id, { status: newStatus }, currentUser?.id || 'res-1', activeRole, 'COMPLAINT_VERIFIED');
    setVerifyComplaint(null);
    setFeedbackNotes('');
  };

  const filtered = complaints.filter((c) => {
    if (activeRole === 'resident' && c.residentId !== (currentUser?.id || 'res-1')) {
      return false;
    }
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || c.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 1rem 6rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* ── 1. Top Executive Banner (Matching Admin Layout standard) ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          color: '#ffffff',
          boxShadow: '0 4px 14px rgba(8, 59, 86, 0.08)',
          border: '1px solid rgba(131, 203, 234, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'rgba(131, 203, 234, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#83CBEA',
                flexShrink: 0,
              }}
            >
              <Wrench size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#83CBEA', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Operations · Maintenance Dispatch
              </div>
              <h1 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#ffffff', margin: '0.125rem 0 0' }}>
                Helpdesk &amp; SLA Engine
              </h1>
            </div>
          </div>

          {/* Right Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <RealtimeSyncBadge state="live" label="Realtime SLA Sync" />
            {(activeRole === 'secretary' || activeRole === 'facility_manager' || activeRole === 'admin') && (
              <button
                type="button"
                onClick={() => setShowPolicyModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.875rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Sliders size={14} color="#83CBEA" />
                <span>Configure SLA</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 1rem',
                borderRadius: '10px',
                background: 'var(--aarizo-blue, #176B91)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.15s ease',
              }}
            >
              <Plus size={15} />
              <span>File New Complaint</span>
            </button>
          </div>
        </div>

        <p style={{ fontSize: '0.75rem', color: '#CBE7F5', margin: 0, lineHeight: 1.5 }}>
          Multi-tier SLA monitoring with automatic escalation (Staff → FM → Admin → Committee) and mandatory resident verification.
        </p>
      </div>

      {/* ── 2. Standard 4-Grid Metric Cards ── */}
      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {/* Card 1: SLA Compliance */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
              borderRadius: '16px',
              padding: '1rem 1.25rem',
              boxShadow: '0 2px 8px rgba(8, 59, 86, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--aarizo-text-secondary, #657785)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                SLA Compliance
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', margin: '0.25rem 0 0.125rem' }}>
                {analytics.slaComplianceRate}%
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--aarizo-text-muted, #8B9AA5)' }}>
                Target ≥ 90%
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
              }}
            >
              <ShieldCheck size={20} />
            </div>
          </div>

          {/* Card 2: SLA Breached */}
          <div
            style={{
              background: '#ffffff',
              border: analytics.breachedCount > 0 ? '1px solid #FECDD3' : '1px solid var(--aarizo-border-soft, #E8F1F5)',
              borderRadius: '16px',
              padding: '1rem 1.25rem',
              boxShadow: '0 2px 8px rgba(8, 59, 86, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--aarizo-text-secondary, #657785)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                SLA Breached
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#E11D48', margin: '0.25rem 0 0.125rem' }}>
                {analytics.breachedCount}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#E11D48', fontWeight: 600 }}>
                Requires FM Action
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: '#FFF1F2',
                border: '1px solid #FECDD3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E11D48',
              }}
            >
              <AlertTriangle size={20} />
            </div>
          </div>

          {/* Card 3: Avg Resolution */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
              borderRadius: '16px',
              padding: '1rem 1.25rem',
              boxShadow: '0 2px 8px rgba(8, 59, 86, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--aarizo-text-secondary, #657785)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Avg Resolution
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', margin: '0.25rem 0 0.125rem' }}>
                {analytics.avgResolutionTimeHours} <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>hrs</span>
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--aarizo-text-muted, #8B9AA5)' }}>
                Across all categories
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'var(--aarizo-light-blue, #EAF6FC)',
                border: '1px solid var(--aarizo-border, #DCE8EF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--aarizo-blue, #176B91)',
              }}
            >
              <Clock size={20} />
            </div>
          </div>

          {/* Card 4: Total Tickets */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
              borderRadius: '16px',
              padding: '1rem 1.25rem',
              boxShadow: '0 2px 8px rgba(8, 59, 86, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--aarizo-text-secondary, #657785)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Tickets
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--aarizo-text, #203746)', margin: '0.25rem 0 0.125rem' }}>
                {analytics.totalComplaints}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--aarizo-text-muted, #8B9AA5)' }}>
                Active society pool
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'var(--aarizo-light-blue, #EAF6FC)',
                border: '1px solid var(--aarizo-border, #DCE8EF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--aarizo-blue, #176B91)',
              }}
            >
              <Wrench size={20} />
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Search & Filter Bar (Clean standard pill/box design) ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
          padding: '0.75rem 1rem',
          boxShadow: '0 2px 8px rgba(8, 59, 86, 0.03)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--aarizo-text-secondary, #657785)' }} />
          <input
            type="text"
            placeholder="Search tickets by ID, title, resident, or unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem 0.625rem 2.5rem',
              borderRadius: '12px',
              border: '1px solid var(--aarizo-border, #DCE8EF)',
              background: 'var(--aarizo-pale-blue, #F4FAFE)',
              fontSize: '0.8125rem',
              color: 'var(--aarizo-text, #203746)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0.875rem',
            borderRadius: '12px',
            border: '1px solid var(--aarizo-border, #DCE8EF)',
            background: 'var(--aarizo-pale-blue, #F4FAFE)',
          }}
        >
          <Filter size={15} color="var(--aarizo-blue, #176B91)" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--aarizo-text, #203746)',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Categories</option>
            <option value="SECURITY">Security (15m SLA)</option>
            <option value="LIFT">Elevator / Lift (30m)</option>
            <option value="PLUMBING">Plumbing (4h SLA)</option>
            <option value="ELECTRICAL">Electrical (2h SLA)</option>
            <option value="HOUSEKEEPING">Housekeeping (3h)</option>
            <option value="PARKING">Parking (1h SLA)</option>
          </select>
        </div>
      </div>

      {/* ── 4. Tickets Section Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0.25rem 0' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', margin: 0 }}>
          Active Tickets ({filtered.length})
        </h2>
      </div>

      {/* ── 5. Standard Clean Ticket Cards (Fully Aligned, No Outlines, Matched Design System) ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.length === 0 ? (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px dashed var(--aarizo-border, #DCE8EF)',
              padding: '3rem 1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '16px',
                background: 'var(--aarizo-light-blue, #EAF6FC)',
                color: 'var(--aarizo-blue, #176B91)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={26} />
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)' }}>
              No Tickets Found
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--aarizo-text-secondary, #657785)', margin: 0, maxWidth: '340px' }}>
              Everything is operating within SLA standard. File a ticket if you notice any maintenance malfunction.
            </p>
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              style={{
                marginTop: '0.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                background: 'var(--aarizo-navy, #083B56)',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Plus size={15} /> File New Complaint
            </button>
          </div>
        ) : (
          filtered.map((c) => {
            const isBreached = c.isBreached;

            return (
              <div
                key={c.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: isBreached ? '1px solid #FECDD3' : '1px solid var(--aarizo-border-soft, #E8F1F5)',
                  padding: '1rem 1.25rem',
                  boxShadow: '0 2px 10px rgba(8, 59, 86, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Top Row: Ticket ID, Title, Badges, and Escalation Matrix Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ flex: 1, minWidth: '260px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.6875rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          background: 'var(--aarizo-pale-blue, #F4FAFE)',
                          border: '1px solid var(--aarizo-border, #DCE8EF)',
                          color: 'var(--aarizo-navy, #083B56)',
                        }}
                      >
                        {c.id}
                      </span>
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--aarizo-text, #203746)', margin: 0 }}>
                        {c.title}
                      </h3>
                      <span
                        style={{
                          fontSize: '0.625rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          background: 'var(--aarizo-light-blue, #EAF6FC)',
                          color: 'var(--aarizo-blue, #176B91)',
                          border: '1px solid var(--aarizo-border, #DCE8EF)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {c.category}
                      </span>
                      {c.reopenCount > 0 && (
                        <span
                          style={{
                            fontSize: '0.625rem',
                            fontWeight: 800,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            background: '#FFF1F2',
                            color: '#E11D48',
                            border: '1px solid #FECDD3',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <RotateCcw size={10} /> ×{c.reopenCount}
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.8125rem', color: 'var(--aarizo-text-secondary, #657785)', margin: '0 0 0.5rem 0', lineHeight: 1.4 }}>
                      {c.description}
                    </p>
                  </div>

                  {/* Right Escalation Badge Container */}
                  <div
                    style={{
                      background: isBreached ? '#FFF1F2' : 'var(--aarizo-pale-blue, #F4FAFE)',
                      border: isBreached ? '1px solid #FECDD3' : '1px solid var(--aarizo-border, #DCE8EF)',
                      borderRadius: '12px',
                      padding: '0.5rem 0.875rem',
                      textAlign: 'right',
                      minWidth: '150px',
                    }}
                  >
                    <div style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--aarizo-text-secondary, #657785)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Escalation Matrix
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--aarizo-text, #203746)', marginTop: '0.125rem' }}>
                      {c.escalationLevel}
                    </div>
                    {isBreached ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#E11D48', fontSize: '0.6875rem', fontWeight: 800, marginTop: '0.25rem' }}>
                        <AlertTriangle size={12} />
                        <span>SLA BREACHED</span>
                      </div>
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#059669', fontSize: '0.6875rem', fontWeight: 700, marginTop: '0.25rem' }}>
                        <Timer size={12} />
                        <span>SLA: {c.slaMinutes}m</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Metadata Pills + Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.625rem',
                    paddingTop: '0.625rem',
                    borderTop: '1px solid var(--aarizo-border-soft, #E8F1F5)',
                  }}
                >
                  {/* Pills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        color: 'var(--aarizo-text, #203746)',
                        background: 'var(--aarizo-pale-blue, #F4FAFE)',
                        border: '1px solid var(--aarizo-border, #DCE8EF)',
                        borderRadius: '8px',
                        padding: '0.3rem 0.625rem',
                      }}
                    >
                      <MapPin size={13} color="var(--aarizo-blue, #176B91)" />
                      <span>{c.location}</span>
                    </div>

                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        color: 'var(--aarizo-text, #203746)',
                        background: 'var(--aarizo-pale-blue, #F4FAFE)',
                        border: '1px solid var(--aarizo-border, #DCE8EF)',
                        borderRadius: '8px',
                        padding: '0.3rem 0.625rem',
                      }}
                    >
                      <User size={13} color="var(--aarizo-blue, #176B91)" />
                      <span>{c.assignedToName || 'Unassigned'}</span>
                    </div>

                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        borderRadius: '8px',
                        padding: '0.3rem 0.625rem',
                        background:
                          c.urgency === 'CRITICAL' || c.urgency === 'HIGH'
                            ? '#FFF1F2'
                            : c.urgency === 'MEDIUM'
                            ? '#FFFBEB'
                            : '#ECFDF5',
                        color:
                          c.urgency === 'CRITICAL' || c.urgency === 'HIGH'
                            ? '#E11D48'
                            : c.urgency === 'MEDIUM'
                            ? '#D97706'
                            : '#059669',
                        border:
                          c.urgency === 'CRITICAL' || c.urgency === 'HIGH'
                            ? '1px solid #FECDD3'
                            : c.urgency === 'MEDIUM'
                            ? '1px solid #FDE68A'
                            : '1px solid #A7F3D0',
                      }}
                    >
                      {c.urgency}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {c.status === 'VERIFICATION_REQUIRED' && activeRole === 'resident' && (
                      <button
                        type="button"
                        onClick={() => setVerifyComplaint(c)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.4rem 0.875rem',
                          borderRadius: '8px',
                          background: '#059669',
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                        }}
                      >
                        <CheckSquare size={13} /> Confirm Resolution
                      </button>
                    )}

                    {c.status !== 'CLOSED' && c.status !== 'VERIFICATION_REQUIRED' && (
                      <button
                        type="button"
                        onClick={() => handleResolveTicket(c.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.4rem 0.875rem',
                          borderRadius: '8px',
                          background: 'var(--aarizo-navy, #083B56)',
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(8, 59, 86, 0.2)',
                        }}
                      >
                        <CheckCircle size={13} /> Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── SLA Policy Modal ── */}
      <Modal
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
        title="Configure SLA Policy"
        subtitle="Set resolution thresholds and escalation limits per category"
        maxWidth="480px"
      >
        <form onSubmit={handleUpdatePolicy} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Service Category</label>
            <select
              value={selectedPolicyCat}
              onChange={(e) => setSelectedPolicyCat(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B91]/20 focus:border-[#176B91]"
            >
              <option value="SECURITY">Security (Current: 15m)</option>
              <option value="LIFT">Elevator / Lift (Current: 30m)</option>
              <option value="PLUMBING">Plumbing (Current: 4h)</option>
              <option value="ELECTRICAL">Electrical (Current: 2h)</option>
              <option value="HOUSEKEEPING">Housekeeping (Current: 3h)</option>
              <option value="PARKING">Parking (Current: 1h)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Resolution SLA (Minutes)</label>
            <input
              type="number"
              value={newSlaMinutes}
              onChange={(e) => setNewSlaMinutes(Number(e.target.value))}
              min={5}
              max={10080}
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#176B91]/20 focus:border-[#176B91]"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Tickets unresolved beyond this window auto-escalate up the committee chain.
            </p>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setShowPolicyModal(false)} className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-xs transition">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 text-white font-bold rounded-xl text-xs shadow-sm transition" style={{ background: 'var(--aarizo-blue, #176B91)' }}>
              Save Policy
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Resident Verification Modal ── */}
      <Modal
        isOpen={Boolean(verifyComplaint)}
        onClose={() => setVerifyComplaint(null)}
        title="Resident Verification"
        subtitle="Confirm ticket resolution before it is archived"
        maxWidth="440px"
      >
        {verifyComplaint && (
          <div className="space-y-4 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">Ticket</span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{verifyComplaint.title}</p>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{verifyComplaint.description}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Feedback / Notes (Optional)</label>
              <textarea
                placeholder="Share comments on work quality or any pending items..."
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B91]/20 focus:border-[#176B91] resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleResidentVerify(false)}
                className="py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
              >
                <XCircle size={14} /> Not Resolved
              </button>
              <button
                type="button"
                onClick={() => handleResidentVerify(true)}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <CheckCircle size={14} /> Confirm &amp; Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── File New Complaint Modal ── */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Log Maintenance Complaint"
        subtitle="Open an urgent work order with real-time SLA countdown"
        maxWidth="520px"
      >
        <form onSubmit={handleCreateComplaint} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Complaint Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Main Kitchen Pipeline Pressure Leakage"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#176B91]/20 focus:border-[#176B91] transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B91]/20 focus:border-[#176B91]"
              >
                <option value="PLUMBING">Plumbing (4h SLA)</option>
                <option value="ELECTRICAL">Electrical (2h SLA)</option>
                <option value="LIFT">Lift / Elevator (30m)</option>
                <option value="SECURITY">Security (15m SLA)</option>
                <option value="HOUSEKEEPING">Housekeeping (3h)</option>
                <option value="PARKING">Parking (1h SLA)</option>
                <option value="OTHER">Other (24h SLA)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Urgency *</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High (Fast-track FM)</option>
                <option value="CRITICAL">Critical – Emergency</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Location / Flat *</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Tower B · Flat B-1204 or Basement 1"
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#176B91]/20 focus:border-[#176B91] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Description *</label>
            <textarea
              required
              rows={3}
              placeholder="Provide specific details about the malfunction or problem..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#176B91]/20 focus:border-[#176B91] transition resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Attach Photo / Proof (Optional)</label>
            <FileUpload
              label=""
              category="tickets"
              accept="image/*,application/pdf"
              maxSizeMB={5}
              currentUrl={photoUrl}
              onUploadSuccess={(url) => setPhotoUrl(url)}
              onRemove={() => setPhotoUrl('')}
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowSubmitModal(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-white font-bold rounded-xl text-xs shadow-sm transition"
              style={{ background: 'var(--aarizo-blue, #176B91)' }}
            >
              Submit &amp; Start SLA Timer
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
