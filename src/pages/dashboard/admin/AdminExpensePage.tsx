import React from 'react';
import { SocietyExpenseHub } from '../../../domains/expenses';

export const AdminExpensePage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: '#f7f8fa', padding: '1.5rem' }}>
      <SocietyExpenseHub userRole="SOCIETY_ADMIN" />
    </div>
  );
};

export default AdminExpensePage;
