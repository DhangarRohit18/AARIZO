import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Paperclip,
  History,
} from 'lucide-react';
import { societyRequestService } from '../services/societyRequestService';
import type { SocietyRequest, SocietyRequestCategory, SocietyRequestStatus, RequestDocument } from '../types';
import { useAuth } from '../../../context/AuthContext';
import { useRBAC } from '../../../hooks/useRBAC';

export const UnifiedRequestCenter: React.FC = () => {
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
      ? [{ id: `doc-${Date.now()}`, fileName: newFileName, fileUrl: `/docs/${newFileName}`, uploadedBy: currentUser?.name || 'Resident', uploadedAt: new Date().toLocaleString() }]
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
      currentUser?.name || 'Resident',
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
    if (activeRole === 'RESIDENT' && r.residentId !== (currentUser?.id || 'res-1')) {
      return false;
    }

    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'ALL' || r.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Unified Society Request Centre</h1>
          <p className="text-sm text-slate-500">
            NOCs, Tenant Registrations, Renovation Permits, Certificates & Society Approvals Pipeline
          </p>
        </div>
        <div className="mt-3 md:mt-0 flex gap-2">
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} /> Submit New Request / NOC
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search request title, resident, or Request ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs border-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={16} className="text-slate-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border rounded-xl text-xs border-slate-200 bg-white"
          >
            <option value="ALL">All Categories</option>
            <option value="NOC">NOC Certificate</option>
            <option value="TENANT_REGISTRATION">Tenant Onboarding</option>
            <option value="RENOVATION_PERMISSION">Renovation Permit</option>
            <option value="EVENT_PERMISSION">Event Permission</option>
            <option value="PARKING_REQUEST">Parking Slot Request</option>
            <option value="SOCIETY_CERTIFICATE">Statutory Certificate</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-xl text-xs border-slate-200 bg-white"
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

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredRequests.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400">
            No society requests match the filter criteria.
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              onClick={() => setSelectedRequest(req)}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-indigo-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono font-bold text-slate-400">{req.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                    req.status === 'APPROVED' || req.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                    req.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-800' :
                    req.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-sm mt-2 line-clamp-2">{req.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{req.description}</p>
              </div>

              <div className="border-t pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Resident:</span>
                  <strong className="text-slate-800">{req.residentName} ({req.flatCode})</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Category:</span>
                  <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                    {req.category}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Documents:</span>
                  <span>{req.documents.length} attached</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-4 md:p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Submit New Society Request / NOC</h3>
            <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Request Title</label>
                <input
                  type="text"
                  placeholder="e.g. Balcony Grill Expansion Permission"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 border rounded-lg border-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2 border rounded-lg border-slate-300"
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
                  <label className="block font-semibold mb-1 text-slate-700">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full p-2 border rounded-lg border-slate-300"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Description & Details</label>
                <textarea
                  rows={3}
                  placeholder="Provide complete explanation for committee review..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2 border rounded-lg border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Upload Supporting Document / Agreement</label>
                <input
                  type="text"
                  placeholder="e.g. Registered_Agreement.pdf or Architectural_Plan.pdf"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full p-2 border rounded-lg border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Request Detail Drawer */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-end z-50">
          <div className="bg-white w-full max-w-xl h-full p-4 md:p-6 shadow-2xl overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-600">{selectedRequest.id}</span>
                  <h2 className="text-xl font-bold text-slate-900">{selectedRequest.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-slate-500 block">Resident:</span>
                  <strong className="text-slate-800">{selectedRequest.residentName} ({selectedRequest.flatCode})</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Status:</span>
                  <strong className="text-indigo-600 font-extrabold">{selectedRequest.status}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Category:</span>
                  <span className="font-semibold text-slate-700">{selectedRequest.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Assigned Officer:</span>
                  <span className="font-semibold text-slate-700">{selectedRequest.assignedOfficerName || 'Unassigned'}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-bold text-slate-800 text-xs mb-1">Description</h4>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border">{selectedRequest.description}</p>
              </div>

              {/* Documents List */}
              <div>
                <h4 className="font-bold text-slate-800 text-xs mb-2 flex items-center gap-1">
                  <Paperclip size={14} /> Attached Documents ({selectedRequest.documents.length})
                </h4>
                <div className="space-y-2">
                  {selectedRequest.documents.map((doc) => (
                    <div key={doc.id} className="p-2.5 bg-slate-50 rounded-lg border flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <Paperclip size={14} className="text-indigo-600" />
                        <span className="font-semibold text-slate-800">{doc.fileName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">by {doc.uploadedBy}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit Trail */}
              <div>
                <h4 className="font-bold text-slate-800 text-xs mb-2 flex items-center gap-1">
                  <History size={14} /> Audit Log History ({selectedRequest.history.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedRequest.history.map((h) => (
                    <div key={h.id} className="p-2.5 bg-slate-50 rounded-lg border text-xs space-y-1">
                      <div className="flex justify-between text-slate-500 text-[10px]">
                        <span><strong>{h.actorName}</strong> ({h.actorRole})</span>
                        <span>{h.timestamp}</span>
                      </div>
                      <div className="font-bold text-slate-800">{h.action}</div>
                      {h.notes && <p className="text-slate-600 text-[11px] italic">"{h.notes}"</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Admin / Committee Action Panel */}
            {(activeRole === 'SOCIETY_ADMIN' || activeRole === 'COMMITTEE_MEMBER' || activeRole === 'SUPER_ADMIN') && (
              <div className="border-t pt-4 space-y-3 bg-slate-50 p-4 rounded-xl border">
                <h4 className="font-bold text-slate-900 text-xs">Admin & Committee Review Actions</h4>
                <input
                  type="text"
                  placeholder="Add officer review notes / correction instructions..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full p-2 border rounded-lg text-xs border-slate-300"
                />
                <input
                  type="text"
                  placeholder="Assign Officer Name (e.g. Committee Sec. Rajesh)"
                  value={assignedOfficer}
                  onChange={(e) => setAssignedOfficer(e.target.value)}
                  className="w-full p-2 border rounded-lg text-xs border-slate-300"
                />
                <input
                  type="text"
                  placeholder="Upload Official Approval Certificate / NOC (e.g. Official_NOC_Signed.pdf)"
                  value={approvalDocName}
                  onChange={(e) => setApprovalDocName(e.target.value)}
                  className="w-full p-2 border rounded-lg text-xs border-slate-300"
                />

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleStatusTransition('UNDER_REVIEW')}
                    className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded font-bold text-xs"
                  >
                    Mark Under Review
                  </button>
                  <button
                    onClick={() => handleStatusTransition('APPROVED')}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs"
                  >
                    Approve Request
                  </button>
                  <button
                    onClick={() => handleStatusTransition('REJECTED')}
                    className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-xs"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
