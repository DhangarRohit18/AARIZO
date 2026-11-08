import React from 'react';
import { SafetyCommandHub } from '../../../domains/safety';

export const ResidentEmergencyPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)' }}>
      {/* Page Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 100%)',
        padding: '1.25rem 1rem 1.5rem',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ color: '#FCA5A5', fontSize: '0.75rem', fontWeight: 700, margin: '0 0 0.25rem' }}>Priority Response</p>
          <h1 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>
            Resident Emergency & Safety Command
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
            Instant SOS broadcast to security gate, medical teams & society management
          </p>
        </div>
      </div>
      <div style={{ padding: '1rem', paddingBottom: '6rem', maxWidth: '1200px', margin: '0 auto' }}>
        <SafetyCommandHub />
      </div>
    </div>
  );
};

export default ResidentEmergencyPage;
