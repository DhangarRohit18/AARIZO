import React from 'react';
import { SafetyCommandHub } from '../../../domains/safety';

export const AdminSafetyCommandPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: '#f7f8fa', padding: '1.5rem' }}>
      <SafetyCommandHub />
    </div>
  );
};

export default AdminSafetyCommandPage;
