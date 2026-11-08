import React from 'react';
import { SafetyCommandHub } from '../../../domains/safety';

export const ResidentChildSafetyPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)' }}>
      {/* Page Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)',
        padding: '1.25rem 1rem 1.5rem',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ color: 'var(--aarizo-gold, #E5B842)', fontSize: '0.75rem', fontWeight: 700, margin: '0 0 0.25rem' }}>Child Security & Gate Authorization</p>
          <h1 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>
            Child Exit Pass & Safety Radar
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
            Biometric exit authorization, trusted escort passes & instant guard alerts
          </p>
        </div>
      </div>
      <div style={{ padding: '1rem', paddingBottom: '6rem', maxWidth: '1200px', margin: '0 auto' }}>
        <SafetyCommandHub initialTab="CHILD_SAFETY" />
      </div>
    </div>
  );
};

export default ResidentChildSafetyPage;
