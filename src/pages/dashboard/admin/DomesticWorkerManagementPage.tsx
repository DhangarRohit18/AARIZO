import React from 'react';
import { DomesticHelpManager } from '../../../domains/domestic-help/components/DomesticHelpManager';

export const DomesticWorkerManagementPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)' }}>
      <div className="max-w-7xl mx-auto p-3 sm:p-6 pb-24">
        <DomesticHelpManager />
      </div>
    </div>
  );
};

export default DomesticWorkerManagementPage;
