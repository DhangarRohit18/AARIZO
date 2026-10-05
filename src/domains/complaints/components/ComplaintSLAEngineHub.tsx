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
  const [location, setLocation] = useState('Tower B Â· Flat B-1204');
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
      flatCode: currentUser?.flatDetails || 'Tower B Â· B-1204',
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
    <div className="p-3 md:p-6 pb-28 space-y-5 max-w-7xl mx-auto">

      {/* â”€â”€ Hero Banner â”€â”€ */}
      <div
        className="rounded-2xl p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        style={{
          background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #062F45 60%, #0E5578 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 8px 24px -4px rgba(8,59,86,0.30)',
        }}
      >
        {/* Left */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="p-2.5 rounded-xl shrink-0" style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <Wrench className="w-5 h-5" style={{ color: '#83CBEA' }} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: '#83CBEA' }}>
              Operations Â· Maintenance Dispatch
            </p>
            <h1 className="text-lg md:text-xl font-black tracking-tight text-white leading-tight">
              Helpdesk &amp; SLA Engine
            </h1>
            <p className="text-xs font-medium mt-1 leading-relaxed max-w-lg" style={{ color: '#CBE7F5' }}>
              Multi-tier SLA monitoring with auto-escalation: Staff â†’ FM â†’ Admin â†’ Committee, with resident verification.
            </p>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">
          <div className="px-2.5 py-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <RealtimeSyncBadge state="live" label="Realtime SLA Sync" />
          </div>
          {(activeRole === 'secretary' || activeRole === 'facility_manager' || activeRole === 'admin') && (
            <button
              onClick={() => setShowPolicyModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', color: '#FFFFFF' }}
            >
              <Sliders size={14} style={{ color: '#83CBEA' }} />
              Configure SLA
            </button>
          )}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #176B91 0%, #104C68 100%)',
              border: '1px solid rgba(131,203,234,0.35)',
              color: '#FFFFFF'
            }}
          >
            <Plus size={15} />
            File Complaint
          </button>
        </div>
      </div>

      {/* â”€â”€ Analytics Metric Cards â”€â”€ */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {/* SLA Compliance */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 leading-tight">SLA Compliance</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1.5 leading-none">{analytics.slaComplianceRate}%</h3>
            <div className="flex items-center justify-between mt-2">
              <p className="text-[10px] text-slate-400">Target â‰¥ 90%</p>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <ShieldCheck size={16} className="text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Breached */}
          <div className="bg-white rounded-2xl border border-rose-200/80 shadow-xs hover:shadow-md transition p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 leading-tight">SLA Breached</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1.5 leading-none">{analytics.breachedCount}</h3>
            <div className="flex items-center justify-between mt-2">
              <p className="text-[10px] text-rose-500 font-semibold">FM action needed</p>
              <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100">
                <AlertTriangle size={16} className="text-rose-600" />
              </div>
            </div>
          </div>

          {/* Avg Resolution */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 leading-tight">Avg Resolution</p>
            <h3 className="text-2xl font-black mt-1.5 leading-none" style={{ color: 'var(--aarizo-navy, #083B56)' }}>
              {analytics.avgResolutionTimeHours} <span className="text-sm font-bold">hrs</span>
            </h3>
            <div className="flex items-center justify-between mt-2">
              <p className="text-[10px] text-slate-400">All categories</p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center border" style={{ background: '#EAF6FC', borderColor: '#DCE8EF' }}>
                <Clock size={16} style={{ color: '#176B91' }} />
              </div>
            </div>
          </div>

          {/* Total Tickets */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 leading-tight">Total Tickets</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1.5 leading-none">{analytics.totalComplaints}</h3>
            <div className="flex items-center justify-between mt-2">
              <p className="text-[10px] text-slate-400">Active pool</p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center border" style={{ background: '#EAF6FC', borderColor: '#DCE8EF' }}>
                <Wrench size={16} style={{ color: '#176B91' }} />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* â”€â”€ Filter & Search Bar â”€â”€ */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3 flex flex-col sm:flex-row gap-2.5 items-center">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by ID, title, resident or unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-[#176B91] focus:ring-2 focus:ring-[#176B91]/15 rounded-xl text-xs text-slate-800 transition outline-none"
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 shrink-0 w-full sm:w-auto">
          <Filter size={14} className="text-[#176B91] shrink-0" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
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

      {/* â”€â”€ Tickets List â”€â”€ */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-3 shadow-xs">
            <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center" style={{ background: '#EAF6FC', color: '#176B91' }}>
              <Sparkles size={26} />
            </div>
            <h4 className="font-bold text-slate-800 text-base">No Tickets Found</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Everything is operating within SLA standards. File a ticket if you notice any issue.
            </p>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-5 py-2.5 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 shadow-md hover:opacity-95 transition"
              style={{ background: 'var(--aarizo-blue, #176B91)' }}
            >
              <Plus size={15} /> File New Complaint
            </button>
          </div>
        ) : (
          filtered.map((c) => {
            const isBreached = c.isBreached;
            const isWarning = c.isWarningState && !isBreached;

            return (
              <div
                key={c.id}
                className={`bg-white rounded-2xl border transition-all duration-150 hover:shadow-md overflow-hidden ${
                  isBreached
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : isWarning
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : 'border-slate-200 shadow-xs'
                }`}
              >
                <div className="p-4 md:p-5 flex flex-col lg:flex-row gap-4">

                  {/* â”€â”€ Left: Ticket Info â”€â”€ */}
                  <div className="flex-1 min-w-0 space-y-2.5">

                    {/* ID Â· Title Â· Category */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                        {c.id}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm md:text-base leading-snug tracking-tight">
                        {c.title}
                      </h3>
                      <span className="px-2.5 py-0.5 font-extrabold text-[10px] rounded-full uppercase tracking-wider shrink-0" style={{ background: '#EAF6FC', color: '#083B56', border: '1px solid #DCE8EF' }}>
                        {c.category}
                      </span>
                      {c.reopenCount > 0 && (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-extrabold text-[10px] rounded-full flex items-center gap-1 border border-rose-200 shrink-0">
                          <RotateCcw size={10} /> Ã—{c.reopenCount}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{c.description}</p>

                    {/* Meta pills */}
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-lg">
                        <MapPin size={12} className="text-[#176B91] shrink-0" />
                        {c.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-lg">
                        <User size={12} className="text-[#176B91] shrink-0" />
                        {c.assignedToName || 'Unassigned'}
                      </span>
                      <span className={`inline-flex items-center text-[11px] font-black uppercase tracking-wide px-2.5 py-1 rounded-lg border ${
                        c.urgency === 'CRITICAL' || c.urgency === 'HIGH'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : c.urgency === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {c.urgency}
                      </span>
                    </div>
                  </div>

                  {/* â”€â”€ Right: Escalation + Actions â”€â”€ */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0 lg:w-44">

                    {/* Escalation Badge */}
                    <div className={`rounded-xl px-3 py-2 text-center w-full lg:w-auto ${
                      isBreached ? 'bg-rose-50 border border-rose-200' : 'bg-slate-50 border border-slate-200'
                    }`}>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Escalation Matrix</p>
                      <p className="text-[11px] font-extrabold text-slate-800 leading-tight truncate">
                        {c.escalationLevel}
                      </p>
                      {isBreached ? (
                        <span className="mt-1 inline-flex items-center gap-1 text-rose-700 font-black text-[10px]">
                          <AlertTriangle size={11} className="shrink-0" /> SLA BREACHED
                        </span>
                      ) : (
                        <span className="mt-1 inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px]">
                          <Timer size={11} className="shrink-0" /> SLA: {c.slaMinutes}m
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 w-full lg:w-auto">
                      {c.status === 'VERIFICATION_REQUIRED' && activeRole === 'resident' && (
                        <button
                          onClick={() => setVerifyComplaint(c)}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition whitespace-nowrap w-full cursor-pointer"
                        >
                          <CheckSquare size={13} /> Confirm Resolution
                        </button>
                      )}
                      {c.status !== 'CLOSED' && c.status !== 'VERIFICATION_REQUIRED' && (
                        <button
                          onClick={() => handleResolveTicket(c.id)}
                          className="px-3 py-2 bg-slate-900 hover:bg-slate-700 active:scale-95 text-white rounded-xl font-bold text-[11px] shadow-sm transition whitespace-nowrap w-full cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* â”€â”€ SLA Policy Modal â”€â”€ */}
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

      {/* â”€â”€ Resident Verification Modal â”€â”€ */}
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

      {/* â”€â”€ File New Complaint Modal â”€â”€ */}
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
                <option value="CRITICAL">Critical â€“ Emergency</option>
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
              placeholder="e.g. Tower B Â· Flat B-1204 or Basement 1"
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

