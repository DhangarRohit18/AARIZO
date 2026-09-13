import React from 'react';
import { SocietyServicesHub } from '../../../domains/services';

export const AdminServiceHubPage: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <SocietyServicesHub userRoleOverride="SOCIETY_ADMIN" />
    </div>
  );
};

export default AdminServiceHubPage;
