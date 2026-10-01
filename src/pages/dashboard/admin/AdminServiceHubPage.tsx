import React from 'react';
import { SocietyServicesHub } from '../../../domains/services';

export const AdminServiceHubPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)' }}>
      <div className="max-w-7xl mx-auto p-3 sm:p-6 pb-24">
        <SocietyServicesHub userRoleOverride="SOCIETY_ADMIN" />
      </div>
    </div>
  );
};

export default AdminServiceHubPage;
