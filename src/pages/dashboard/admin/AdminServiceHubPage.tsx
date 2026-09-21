import React from 'react';
import { SocietyServicesHub } from '../../../domains/services';

export const AdminServiceHubPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: '#f7f8fa', padding: '1.5rem' }}>
      <SocietyServicesHub userRoleOverride="SOCIETY_ADMIN" />
    </div>
  );
};

export default AdminServiceHubPage;
