import React from 'react';
import { SafetyCommandHub } from '../../../domains/safety';

export const ResidentEmergencyPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)', padding: '1rem', paddingBottom: '6rem', maxWidth: '1200px', margin: '0 auto' }}>
      <SafetyCommandHub />
    </div>
  );
};

export default ResidentEmergencyPage;
