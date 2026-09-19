import React from 'react';
import { MoveRenovationHub } from '../../../domains/move-management';

export const AdminMoveRenovationPage: React.FC = () => {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <MoveRenovationHub />
    </div>
  );
};

export default AdminMoveRenovationPage;

