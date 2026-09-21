import React from 'react';
import { SafetyCommandHub } from '../../../domains/safety';

export const ResidentChildSafetyPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: '#f7f8fa', padding: '1rem' }}>
      <SafetyCommandHub />
    </div>
  );
};

export default ResidentChildSafetyPage;
