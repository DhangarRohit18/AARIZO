import React from 'react';
import { GuardDashboard } from './GuardDashboard';
import { ResidentDashboard } from './ResidentDashboard';
import { SecretaryDashboard } from './SecretaryDashboard';
import type { RBACUser } from '../../types/rbac';

export const DashboardWrapper: React.FC<{ user: RBACUser }> = ({ user }) => {
  // Map the strict RBAC Role to the appropriate Dashboard
  switch (user.role) {
    case 'GUARD':
      return <GuardDashboard user={user} />;
    
    case 'RESIDENT':
      return <ResidentDashboard user={user} />;
    
    case 'SECRETARY':
    case 'ADMIN': // Admin can typically see the Secretary view for operational oversight
      return <SecretaryDashboard user={user} />;
      
    case 'FACILITY_MANAGER':
      // return <FacilityDashboard user={user} />;
      return <div className="p-4 text-gray-500">Facility Manager Dashboard coming soon.</div>;
      
    case 'COMMITTEE':
      return <div className="p-4 text-gray-500">Committee Governance Dashboard coming soon.</div>;
      
    case 'VENDOR':
      return <div className="p-4 text-gray-500">Vendor Task Dashboard coming soon.</div>;
      
    default:
      return (
        <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded">
          Error: Unauthorized role ({user.role}) or role dashboard not found.
        </div>
      );
  }
};
