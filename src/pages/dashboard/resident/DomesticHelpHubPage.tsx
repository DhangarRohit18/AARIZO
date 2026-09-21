import React from 'react';
import { DomesticHelpManager } from '../../../domains/domestic-help/components/DomesticHelpManager';

export const DomesticHelpHubPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: '#f7f8fa', padding: '1rem' }}>
      <DomesticHelpManager />
    </div>
  );
};

export default DomesticHelpHubPage;
