import React from 'react';
import { can } from '../../../utils/permissions';
import type { Complaint } from '../types';
import type { RBACUser } from '../../../types/rbac';

interface ComplaintCardProps {
  complaint: Complaint;
  currentUser: RBACUser;
  onApprove: (id: string) => void;
  onResolve: (id: string) => void;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({ 
  complaint, 
  currentUser, 
  onApprove, 
  onResolve 
}) => {
  return (
    <div className="p-4 md:p-5 border border-[#DCE8EF] rounded-2xl shadow-sm bg-white space-y-3">
      <h3 className="text-base font-bold text-[#083B56]">{complaint.title}</h3>
      <p className="text-xs text-slate-600 leading-relaxed">{complaint.description}</p>
      
      <div className="mt-4 flex flex-wrap gap-2">
        {/* Secretary / Committee action */}
        {can(currentUser, 'complaint:approve') && complaint.status === 'OPEN' && (
          <button 
            onClick={() => onApprove(complaint.id)}
            className="bg-[#083B56] hover:bg-[#176B91] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Approve & Assign
          </button>
        )}

        {/* Vendor / Facility Manager action */}
        {can(currentUser, 'complaint:resolve') && complaint.status === 'ASSIGNED' && (
          <button 
            onClick={() => onResolve(complaint.id)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Mark Resolved
          </button>
        )}
      </div>
    </div>
  );
};
