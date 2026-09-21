import React from 'react';
import { SafetyCommandHub } from '../../../domains/safety';

export const ResidentEmergencyPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)', padding: '1rem' }}>
      <SafetyCommandHub />
    </div>
  );
};

export default ResidentEmergencyPage;
