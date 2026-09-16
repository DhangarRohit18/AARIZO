import React from 'react';
import { SocietyExpenseHub } from '../../../domains/expenses';

export const AdminExpensePage: React.FC = () => {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <SocietyExpenseHub userRole="SOCIETY_ADMIN" />
    </div>
  );
};

export default AdminExpensePage;
