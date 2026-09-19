import React from 'react';
import { GuardDashboard } from './GuardDashboard';
import { ResidentDashboard } from './ResidentDashboard';
import { SecretaryDashboard } from './SecretaryDashboard';
import type { RBACUser } from '../../types/rbac';

export const DashboardWrapper: React.FC<{ user: RBACUser }> = ({ user }) => {
  // Map the strict RBAC Role to the appropriate Dashboard
  switch (user.role) {
    case 'guard':
      return <GuardDashboard user={user} />;
    
    case 'resident':
      return <ResidentDashboard user={user} />;
    
    case 'secretary':
    case 'admin': // Admin can typically see the Secretary view for operational oversight
      return <SecretaryDashboard user={user} />;
      
    case 'facility_manager':
      // return <FacilityDashboard user={user} />;
      return <div className="p-4 text-gray-500">Facility Manager Dashboard coming soon.</div>;
      
    case 'committee':
      return <div className="p-4 text-gray-500">Committee Governance Dashboard coming soon.</div>;
      
    case 'vendor':
      return <div className="p-4 text-gray-500">Vendor Task Dashboard coming soon.</div>;
      
    default:
      return (
        <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded">
          Error: Unauthorized role ({user.role}) or role dashboard not found.
        </div>
      );
  }
};


