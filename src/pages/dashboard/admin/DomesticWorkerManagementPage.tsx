import React from 'react';
import { DomesticHelpManager } from '../../../domains/domestic-help/components/DomesticHelpManager';

export const DomesticWorkerManagementPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)' }}>
      <div style={{
        background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)',
        padding: '1.25rem 1rem 1.5rem',
      }}>
        <p style={{ color: 'var(--aarizo-sky, #83CBEA)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem' }}>
          Staff Management
        </p>
        <h1 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.125rem', margin: 0 }}>
          Domestic Worker Management
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
          Manage maids, cooks &amp; domestic staff across all flats
        </p>
      </div>
      <div style={{ padding: '1rem' }}>
        <DomesticHelpManager />
      </div>
    </div>
  );
};

export default DomesticWorkerManagementPage;
