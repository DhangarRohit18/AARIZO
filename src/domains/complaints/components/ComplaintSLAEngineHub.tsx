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
} from 'lucide-react';
import { complaintSLAService } from '../services/complaintSLAService';
import type { Complaint, ComplaintCategory, SLAPolicy, SLAAnalytics } from '../types';
import { useAuth } from '../../../context/AuthContext';
import { useRBAC } from '../../../hooks/useRBAC';
import { realtimeService } from '../../../services/realtimeService';

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
    const list = complaintSLAService.getAllComplaints('soc-gvs');
    setComplaints(list);
    setSlaPolicies(complaintSLAService.getSLAPolicies('soc-gvs'));
    setAnalytics(complaintSLAService.getSLAAnalytics('soc-gvs'));
  };

  useEffect(() => {
    loadData();

    const unsubscribe = realtimeService.subscribe('MAINTENANCE_STATUS', () => {
      loadData();
    });

    return () => unsubscribe();
  }, []);

  const handleCreateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    complaintSLAService.createComplaint({
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
    });
    setShowSubmitModal(false);
    setTitle('');
    setDescription('');
    setPhotoUrl('');
    loadData();
  };

  const handleUpdatePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    complaintSLAService.updateSLAPolicy('soc-gvs', selectedPolicyCat, newSlaMinutes, currentUser?.name || 'Admin');
    setShowPolicyModal(false);
    loadData();
  };

  const handleResolveTicket = (id: string) => {
    complaintSLAService.resolveComplaint(id, currentUser?.name || 'Technician', 'Work completed and tested');
    loadData();
  };

  const handleResidentVerify = (isResolved: boolean) => {
    if (!verifyComplaint) return;
    complaintSLAService.residentVerifyComplaint(verifyComplaint.id, isResolved, feedbackNotes);
    setVerifyComplaint(null);
    setFeedbackNotes('');
    loadData();
  };

  const filtered = complaints.filter((c) => {
    if (activeRole === 'RESIDENT' && c.residentId !== (currentUser?.id || 'res-1')) {
      return false;
    }
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || c.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Helpdesk & Complaint SLA Escalation Engine</h1>
          <p className="text-sm text-slate-500">
            Persistent category SLA timers, automated 4-tier escalation (Staff ➔ FM ➔ Admin ➔ Committee), & post-service verification
          </p>
        </div>
        <div className="mt-3 md:mt-0 flex gap-2">
          {(activeRole === 'SOCIETY_ADMIN' || activeRole === 'FACILITY_MANAGER' || activeRole === 'SUPER_ADMIN') && (
            <button
              onClick={() => setShowPolicyModal(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-2"
            >
              <Sliders size={15} /> Configure SLA Targets
            </button>
          )}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} /> File New Complaint
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">SLA Compliance Rate</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{analytics.slaComplianceRate}%</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
              <ShieldCheck size={24} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">SLA Breached Tickets</p>
              <h3 className="text-2xl font-bold text-rose-600 mt-1">{analytics.breachedCount}</h3>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
              <AlertTriangle size={24} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Avg Resolution Speed</p>
              <h3 className="text-2xl font-bold text-indigo-600 mt-1">{analytics.avgResolutionTimeHours} hrs</h3>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
              <Clock size={24} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Helpdesk Tickets</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{analytics.totalComplaints}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <Wrench size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search ticket title or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs border-slate-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border rounded-xl text-xs border-slate-200 bg-white"
          >
            <option value="ALL">All Categories</option>
            <option value="SECURITY">Security (15m SLA)</option>
            <option value="LIFT">Elevator / Lift (30m SLA)</option>
            <option value="PLUMBING">Plumbing (4h SLA)</option>
            <option value="ELECTRICAL">Electrical (2h SLA)</option>
            <option value="HOUSEKEEPING">Housekeeping (3h SLA)</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filtered.map((c) => (
          <div
            key={c.id}
            className={`p-5 rounded-2xl border bg-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
              c.isBreached ? 'border-rose-300 bg-rose-50/20' : c.isWarningState ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-400 text-xs">{c.id}</span>
                <span className="font-bold text-slate-900 text-sm">{c.title}</span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded">{c.category}</span>
                {c.reopenCount > 0 && (
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-extrabold text-[10px] rounded flex items-center gap-1">
                    <RotateCcw size={10} /> Reopened x{c.reopenCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">{c.description}</p>
              <div className="text-[11px] text-slate-400 flex gap-4 pt-1">
                <span>Location: <strong>{c.location}</strong></span>
                <span>Assigned: <strong>{c.assignedToName || 'Unassigned'}</strong></span>
                <span>Urgency: <strong className="text-amber-600">{c.urgency}</strong></span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Escalation Tier</span>
                <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 font-extrabold text-xs rounded-full">
                  Level: {c.escalationLevel}
                </span>
                <div className="text-[10px] font-bold mt-1">
                  {c.isBreached ? (
                    <span className="text-rose-600 font-extrabold flex items-center justify-end gap-1">
                      <AlertTriangle size={12} /> SLA BREACHED
                    </span>
                  ) : (
                    <span className="text-emerald-600">SLA Target: {c.slaMinutes} mins</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {c.status === 'VERIFICATION_REQUIRED' && activeRole === 'RESIDENT' && (
                  <button
                    onClick={() => setVerifyComplaint(c)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckSquare size={16} /> Confirm Resolution
                  </button>
                )}

                {c.status !== 'CLOSED' && c.status !== 'VERIFICATION_REQUIRED' && (
                  <button
                    onClick={() => handleResolveTicket(c.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Policy Config Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-4 md:p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Configure Category SLA Policy</h3>
            <form onSubmit={handleUpdatePolicy} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Category</label>
                <select
                  value={selectedPolicyCat}
                  onChange={(e) => setSelectedPolicyCat(e.target.value as any)}
                  className="w-full p-2 border rounded-lg border-slate-300"
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
                <label className="block font-semibold mb-1 text-slate-700">Target SLA Resolution Duration (Minutes)</label>
                <input
                  type="number"
                  value={newSlaMinutes}
                  onChange={(e) => setNewSlaMinutes(Number(e.target.value))}
                  className="w-full p-2 border rounded-lg border-slate-300 font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPolicyModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resident Post-Service Verification Modal */}
      {verifyComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-4 md:p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Post-Service Verification</h3>
            <p className="text-xs text-slate-600">
              Was ticket <strong>"{verifyComplaint.title}"</strong> resolved to your satisfaction?
            </p>

            <textarea
              placeholder="Optional resident feedback or notes..."
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              className="w-full p-2 border rounded-lg text-xs border-slate-300"
              rows={2}
            />

            <div className="flex gap-2">
              <button
                onClick={() => handleResidentVerify(false)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1"
              >
                <XCircle size={16} /> NO, NOT RESOLVED
              </button>

              <button
                onClick={() => handleResidentVerify(true)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1"
              >
                <CheckCircle size={16} /> YES, RESOLVED
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Ticket Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-4 md:p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Log New Complaint / Issue</h3>
            <form onSubmit={handleCreateComplaint} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Complaint Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Water leakage in bathroom"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border rounded-lg border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                    className="w-full p-2 border rounded-lg border-slate-300 bg-white font-bold"
                  >
                    <option value="PLUMBING">PLUMBING</option>
                    <option value="ELECTRICAL">ELECTRICAL</option>
                    <option value="LIFT">LIFT / ELEVATOR</option>
                    <option value="SECURITY">SECURITY</option>
                    <option value="HOUSEKEEPING">HOUSEKEEPING</option>
                    <option value="PARKING">PARKING</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Urgency Level</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full p-2 border rounded-lg border-slate-300 bg-white font-bold text-rose-600"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Location / Flat</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2 border rounded-lg border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide detail about the problem..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded-lg border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-md"
                >
                  Submit & Start SLA Timer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
