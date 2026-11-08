import React from 'react';
import { MoveRenovationHub } from '../../../domains/move-management';

export const AdminMoveRenovationPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)', maxWidth: '1280px', margin: '0 auto', paddingBottom: '6rem' }}>
      {/* Page Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)',
        padding: '1.25rem 1rem 1.5rem',
      }}>
        <p style={{ color: 'var(--aarizo-sky, #83CBEA)', fontSize: '0.75rem', margin: '0 0 0.25rem' }}>Logistics & Operations</p>
        <h1 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.125rem', margin: 0 }}>
          Move-In / Move-Out & Renovation Desk
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
          Freight elevator slots, contractor permits, and refundable security deposits
        </p>
      </div>
      <div style={{ padding: '1rem' }}>
        <MoveRenovationHub />
      </div>
    </div>
  );
};

export default AdminMoveRenovationPage;
