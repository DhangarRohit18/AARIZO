import React from 'react';
import { ComplaintSLAEngineHub } from '../../../domains/complaints/components/ComplaintSLAEngineHub';

export const ResidentMaintenancePage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)' }} className="pb-24">
      <ComplaintSLAEngineHub />
    </div>
  );
};

export default ResidentMaintenancePage;
