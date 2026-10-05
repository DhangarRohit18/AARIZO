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
    <div className="p-4 md:p-8 pb-28 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner - Single unified high contrast bar */}
      <div
        className="aarizo-hero-banner p-6 md:p-7 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-5 text-white"
        style={{
          background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, var(--aarizo-navy-dark, #062F45) 50%, var(--aarizo-blue-deep, #0E5578) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
          color: '#FFFFFF'
        }}
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-[#83CBEA] shrink-0">
              <Wrench className="w-6 h-6 text-[#83CBEA]" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#83CBEA]" style={{ color: '#83CBEA' }}>
                Operations &bull; Maintenance Dispatch
              </p>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight" style={{ color: '#FFFFFF' }}>
                Helpdesk &amp; SLA Engine
              </h1>
            </div>
          </div>
          <p className="text-xs md:text-sm pl-1 max-w-2xl font-normal leading-relaxed text-slate-200" style={{ color: '#CBE7F5' }}>
            Multi-tier SLA monitoring with automatic escalation matrix (Staff &rarr; FM &rarr; Admin &rarr; Committee) &amp; resident verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15">
            <RealtimeSyncBadge state="live" label="Realtime SLA Sync" />
          </div>
          {(activeRole === 'secretary' || activeRole === 'facility_manager' || activeRole === 'admin') && (
            <button
              onClick={() => setShowPolicyModal(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-white/25 transition shadow-sm"
              style={{ color: '#FFFFFF' }}
            >
              <Sliders size={15} className="text-[#83CBEA]" /> Configure SLA Targets
            </button>
          )}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-5 py-2.5 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition"
            style={{
              background: 'linear-gradient(135deg, #176B91 0%, #104C68 100%)',
              border: '1px solid rgba(131, 203, 234, 0.4)',
              color: '#FFFFFF'
            }}
          >
            <Plus size={16} /> File New Complaint
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 md:gap-5">
          <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">SLA Compliance Rate</p>
              <h3 className="text-2xl md:text-3xl font-extrabold text-emerald-600 mt-1">{analytics.slaComplianceRate}%</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Target &ge; 90%</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 border border-emerald-100">
              <ShieldCheck size={26} />
            </div>
          </div>

          <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">SLA Breached Tickets</p>
              <h3 className="text-2xl md:text-3xl font-extrabold text-rose-600 mt-1">{analytics.breachedCount}</h3>
              <p className="text-[10px] text-rose-500 mt-0.5 font-medium">Requires immediate FM action</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-2xl text-rose-600 border border-rose-100">
              <AlertTriangle size={26} />
            </div>
          </div>

          <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Avg Resolution Speed</p>
              <h3 className="text-2xl md:text-3xl font-extrabold text-[#083B56] mt-1">{analytics.avgResolutionTimeHours} hrs</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Across all categories</p>
            </div>
            <div className="p-3 bg-[#EAF6FC] rounded-2xl text-[#176B91] border border-[#DCE8EF]">
              <Clock size={26} />
            </div>
          </div>

          <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Total Helpdesk Tickets</p>
              <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-1">{analytics.totalComplaints}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Society active pool</p>
            </div>
            <div className="p-3 bg-[#EAF6FC] rounded-2xl text-[#176B91] border border-[#DCE8EF]">
              <Wrench size={26} />
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 md:p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets by ID, title, resident, or unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-[#176B91] focus:ring-2 focus:ring-[#176B91]/15 rounded-xl text-xs text-slate-800 transition outline-none"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-xs w-full md:w-auto">
            <Filter size={15} className="text-[#176B91]" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer w-full"
            >
              <option value="ALL">All Categories</option>
              <option value="SECURITY">Security (15m SLA)</option>
              <option value="LIFT">Elevator / Lift (30m SLA)</option>
              <option value="PLUMBING">Plumbing (4h SLA)</option>
              <option value="ELECTRICAL">Electrical (2h SLA)</option>
              <option value="HOUSEKEEPING">Housekeeping (3h SLA)</option>
              <option value="PARKING">Parking (1h SLA)</option>
            </select>
          </div>
        </div>
      </div>
      {/* Tickets List */}
      <div className="space-y-3.5">
        {filtered.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-3 shadow-sm">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EAF6FC] flex items-center justify-center text-[#176B91]">
              <Sparkles size={28} />
            </div>
            <h4 className="font-bold text-slate-800 text-base">No Tickets Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Everything in your community is currently operating within SLA standards. If you notice any issue, click below to open a ticket.
            </p>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-5 py-2.5 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 shadow-md hover:opacity-95 transition"
              style={{ background: 'var(--aarizo-blue, #176B91)' }}
            >
              <Plus size={16} /> File New Complaint
            </button>
          </div>
        ) : (
          filtered.map((c) => {
            const isBreached = c.isBreached;
            const isWarning = c.isWarningState && !isBreached;

            return (
              <div
                key={c.id}
                className={`p-5 md:p-6 rounded-2xl border transition-all duration-150 hover:shadow-lg ${
                  isBreached
                    ? 'border-rose-300 bg-white ring-1 ring-rose-200'
                    : isWarning
                    ? 'border-amber-300 bg-white ring-1 ring-amber-200'
                    : 'border-slate-200 bg-white shadow-xs'
                }`}
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
                  {/* Left Column: Title, tags & details */}
                  <div className="space-y-2.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {c.id}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base md:text-lg leading-snug tracking-tight">
                        {c.title}
                      </h3>
                      <span className="px-3 py-0.5 bg-[#EAF6FC] text-[#083B56] font-extrabold text-[11px] rounded-full border border-[#DCE8EF] uppercase tracking-wider">
                        {c.category}
                      </span>
                      {c.reopenCount > 0 && (
                        <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 font-extrabold text-[11px] rounded-full flex items-center gap-1 border border-rose-200">
                          <RotateCcw size={11} /> Reopened x{c.reopenCount}
                        </span>
                      )}
                    </div>

                    <p className="text-xs md:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-150">
                        <MapPin size={13} className="text-[#176B91]" />
                        <span>Location:</span> <strong className="text-slate-900 font-bold">{c.location}</strong>
                      </span>
                      <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-150">
                        <User size={13} className="text-[#176B91]" />
                        <span>Assigned:</span> <strong className="text-slate-900 font-bold">{c.assignedToName || 'Unassigned'}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-semibold">Urgency:</span>
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black tracking-wide uppercase ${
                          c.urgency === 'CRITICAL' || c.urgency === 'HIGH'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : c.urgency === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {c.urgency}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Escalation Matrix & Action Buttons */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-4 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-left lg:text-right">
                      <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">
                        Escalation Matrix
                      </span>
                      <div className="mt-1 flex items-center lg:justify-end gap-1.5">
                        <span className="px-2 py-0.5 bg-white text-slate-800 font-extrabold text-xs rounded border border-slate-200 shadow-2xs">
                          Level: {c.escalationLevel}
                        </span>
                      </div>
                      <div className="mt-1.5">
                        {isBreached ? (
                          <span className="text-rose-600 font-black text-xs inline-flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                            <AlertTriangle size={13} className="text-rose-600" /> SLA BREACHED
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-bold text-xs inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            <Timer size={13} className="text-emerald-600" /> SLA: {c.slaMinutes}m
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {c.status === 'VERIFICATION_REQUIRED' && activeRole === 'resident' && (
                        <button
                          onClick={() => setVerifyComplaint(c)}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition whitespace-nowrap cursor-pointer"
                          style={{ color: '#FFFFFF' }}
                        >
                          <CheckSquare size={15} /> Confirm Resolution
                        </button>
                      )}

                      {c.status !== 'CLOSED' && c.status !== 'VERIFICATION_REQUIRED' && (
                        <button
                          onClick={() => handleResolveTicket(c.id)}
                          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-xl font-bold text-xs shadow-sm transition whitespace-nowrap cursor-pointer"
                          style={{ color: '#FFFFFF' }}
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

      {/* SLA Policy Modal */}
      <Modal
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
        title="Configure Category SLA Policy"
        subtitle="Set automated resolution thresholds and escalation limits per service category"
        maxWidth="500px"
      >
        <form onSubmit={handleUpdatePolicy} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Service Category
            </label>
            <select
              value={selectedPolicyCat}
              onChange={(e) => setSelectedPolicyCat(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B91]/20 focus:border-[#176B91]"
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
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Target Resolution SLA (Minutes)
            </label>
            <input
              type="number"
              value={newSlaMinutes}
              onChange={(e) => setNewSlaMinutes(Number(e.target.value))}
              min={5}
              max={10080}
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#176B91]/20 focus:border-[#176B91]"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Tickets not resolved within this window automatically escalate up the committee chain.
            </p>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowPolicyModal(false)}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-white font-bold rounded-xl text-xs shadow-md transition"
              style={{ background: 'var(--aarizo-blue, #176B91)' }}
            >
              Save Policy
            </button>
          </div>
        </form>
      </Modal>

      {/* Resident Post-Service Verification Modal */}
      <Modal
        isOpen={Boolean(verifyComplaint)}
        onClose={() => setVerifyComplaint(null)}
        title="Resident Verification"
        subtitle="Confirm ticket resolution before it is archived"
        maxWidth="460px"
      >
        {verifyComplaint && (
          <div className="space-y-4 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Ticket</span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{verifyComplaint.title}</p>
              <p className="text-[11px] text-slate-500 mt-1">{verifyComplaint.description}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Resident Feedback or Notes (Optional)
              </label>
              <textarea
                placeholder="Share any comments regarding work quality or pending items..."
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B91]/20 focus:border-[#176B91]"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleResidentVerify(false)}
                className="py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
              >
                <XCircle size={15} /> Still Not Resolved
              </button>

              <button
                type="button"
                onClick={() => handleResidentVerify(true)}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <CheckCircle size={15} /> Confirm &amp; Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Log New Complaint Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Log Maintenance Complaint"
        subtitle="Open an urgent work order with real-time SLA countdown"
        maxWidth="540px"
      >
        <form onSubmit={handleCreateComplaint} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Complaint Title *
            </label>
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
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B91]/20 focus:border-[#176B91]"
              >
                <option value="PLUMBING">PLUMBING (4h SLA)</option>
                <option value="ELECTRICAL">ELECTRICAL (2h SLA)</option>
                <option value="LIFT">LIFT / ELEVATOR (30m SLA)</option>
                <option value="SECURITY">SECURITY (15m SLA)</option>
                <option value="HOUSEKEEPING">HOUSEKEEPING (3h SLA)</option>
                <option value="PARKING">PARKING (1h SLA)</option>
                <option value="OTHER">OTHER (24h SLA)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Urgency Level *
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH (Fast-track FM)</option>
                <option value="CRITICAL">CRITICAL (Direct Emergency Escalation)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Location / Flat *
            </label>
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
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Description *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Provide specific details about the malfunction or problem..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#176B91]/20 focus:border-[#176B91] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Attach Issue Photo or Proof (Optional)
            </label>
            <FileUpload
              label="Upload Photo or Document"
              category="tickets"
              accept="image/*,application/pdf"
              maxSizeMB={5}
              currentUrl={photoUrl}
              onUploadSuccess={(url) => setPhotoUrl(url)}
              onRemove={() => setPhotoUrl('')}
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowSubmitModal(false)}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-white font-bold rounded-xl text-xs shadow-md transition"
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
