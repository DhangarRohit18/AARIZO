import React from 'react';
import { SafetyCommandHub } from '../../../domains/safety';

export const AdminSafetyCommandPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)' }}>
      <div className="max-w-7xl mx-auto p-3 sm:p-6 pb-24">
        <SafetyCommandHub />
      </div>
    </div>
  );
};

export default AdminSafetyCommandPage;
