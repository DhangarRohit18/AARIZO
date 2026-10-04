import React, { useState } from 'react';
import type { SocietyRequestCategory } from '../types';
import { FileUpload } from '../../../components/ui/FileUpload';
import { Modal } from '../../../components/ui/Modal';
import { FileText, CheckCircle2 } from 'lucide-react';

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
  newFileUrl?: string;
  setNewFileUrl?: (v: string) => void;
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
  newFileUrl,
  setNewFileUrl,
}) => {
  const [uploadedUrl, setUploadedUrl] = useState<string>(newFileUrl || '');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit New Request / NOC"
      subtitle="Apply for society certificates, approvals, and permissions"
      maxWidth="540px"
    >
      <form onSubmit={handleCreateRequest} id="societyRequestForm" className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Request Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Balcony Grill Expansion Permission"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176B91]/20 focus:border-[#176B91] transition-all"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176B91]/20 focus:border-[#176B91] transition-all"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Priority Level</label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176B91]/20 focus:border-[#176B91] transition-all"
            >
              <option value="LOW">Low (72 hrs)</option>
              <option value="MEDIUM">Medium (48 hrs)</option>
              <option value="HIGH">High (24 hrs)</option>
              <option value="URGENT">Urgent (Immediate)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Description &amp; Details <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Provide complete explanation for committee review..."
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176B91]/20 focus:border-[#176B91] transition-all"
            required
          />
        </div>

        {/* Real Interactive File Upload Section */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <FileText size={14} className="text-[#176B91]" />
            Upload Supporting Document / Agreement
          </label>

          <FileUpload
            label="Upload Document (PDF, PNG, JPG up to 10MB)"
            category="general"
            accept="application/pdf,image/*"
            currentUrl={uploadedUrl}
            onUploadSuccess={(url, filename) => {
              setUploadedUrl(url);
              setNewFileName(filename);
              if (setNewFileUrl) setNewFileUrl(url);
            }}
            onRemove={() => {
              setUploadedUrl('');
              setNewFileName('');
              if (setNewFileUrl) setNewFileUrl('');
            }}
          />

          {newFileName && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Attached: <strong>{newFileName}</strong></span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="societyRequestForm"
            className="px-5 py-2.5 bg-[#083B56] hover:bg-[#176B91] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            Submit Request
          </button>
        </div>
      </form>
    </Modal>
  );
};
