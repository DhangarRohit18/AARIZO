import React from 'react';
import { MoveRenovationHub } from '../../../domains/move-management';

export const AdminMoveRenovationPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)' }}>
      <div className="max-w-7xl mx-auto p-3 sm:p-6 pb-24">
        <MoveRenovationHub />
      </div>
    </div>
  );
};

export default AdminMoveRenovationPage;
