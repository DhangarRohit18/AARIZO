import React from 'react';
import { DomesticHelpManager } from '../../../domains/domestic-help/components/DomesticHelpManager';

export const DomesticHelpHubPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)' }}>
      {/* Page Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)',
        padding: '1.25rem 1rem 1.5rem',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p style={{ color: 'var(--aarizo-gold, #E5B842)', fontSize: '0.75rem', fontWeight: 700, margin: '0 0 0.25rem' }}>Verified Society Staff</p>
          <h1 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>
            Domestic Help & Daily Staff Hub
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
            Maids, cooks, drivers, entry logs & resident endorsements
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-3 sm:p-6 pb-24">
        <DomesticHelpManager />
      </div>
    </div>
  );
};

export default DomesticHelpHubPage;
