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
    <div className="p-4 border rounded shadow-sm bg-white">
      <h3 className="text-lg font-bold">{complaint.title}</h3>
      <p className="text-sm text-gray-600">{complaint.description}</p>
      
      <div className="mt-4 flex gap-2">
        {/* Secretary / Committee action */}
        {can(currentUser, 'complaint:approve') && complaint.status === 'OPEN' && (
          <button 
            onClick={() => onApprove(complaint.id)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Approve & Assign
          </button>
        )}

        {/* Vendor / Facility Manager action */}
        {can(currentUser, 'complaint:resolve') && complaint.status === 'ASSIGNED' && (
          <button 
            onClick={() => onResolve(complaint.id)}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Mark Resolved
          </button>
        )}
      </div>
    </div>
  );
};
