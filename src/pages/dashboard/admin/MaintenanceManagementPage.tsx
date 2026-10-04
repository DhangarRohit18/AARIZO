import React from 'react';
import { ComplaintSLAEngineHub } from '../../../domains/complaints/components/ComplaintSLAEngineHub';

export const MaintenanceManagementPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)' }}>
      <ComplaintSLAEngineHub />
    </div>
  );
};

export default MaintenanceManagementPage;
