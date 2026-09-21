import React from 'react';
import { MoveRenovationHub } from '../../../domains/move-management';

export const AdminMoveRenovationPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: '#f7f8fa' }}>
      <div style={{
        background: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 100%)',
        padding: '1.25rem 1rem 1.5rem',
      }}>
        <p style={{ color: '#bae6fd', fontSize: '0.75rem', margin: '0 0 0.25rem' }}>Operations</p>
        <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '1.125rem', margin: 0 }}>
          Moves & Renovations Hub
        </h1>
        <p style={{ color: '#e0f2fe', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
          Approve, monitor and control all flat transitions
        </p>
      </div>
      <div style={{ padding: '1rem' }}>
        <MoveRenovationHub />
      </div>
    </div>
  );
};

export default AdminMoveRenovationPage;
