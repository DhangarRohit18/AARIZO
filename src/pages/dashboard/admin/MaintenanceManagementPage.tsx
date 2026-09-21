import React from 'react';
import { ComplaintSLAEngineHub } from '../../../domains/complaints/components/ComplaintSLAEngineHub';

export const MaintenanceManagementPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: '#f7f8fa', padding: '1.5rem' }}>
      <ComplaintSLAEngineHub />
    </div>
  );
};

export default MaintenanceManagementPage;
