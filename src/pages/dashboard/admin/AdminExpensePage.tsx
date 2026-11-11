import React from 'react';
import { SocietyExpenseHub } from '../../../domains/expenses';

export const AdminExpensePage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)', maxWidth: '1280px', margin: '0 auto', paddingBottom: '6rem' }}>
      {/* Page Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)',
        padding: '1.25rem 1rem 1.5rem',
      }}>
        <p style={{ color: 'var(--aarizo-gold, #E5B842)', fontSize: '0.75rem', fontWeight: 700, margin: '0 0 0.25rem' }}>Society Financial Operations</p>
        <h1 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>
          Expense Approval & Budget Ledger
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
          Approve operational expenditures, review vendor invoices & audit society funds
        </p>
      </div>
      <div style={{ padding: '1rem' }}>
        <SocietyExpenseHub userRole="SOCIETY_ADMIN" />
      </div>
    </div>
  );
};

export default AdminExpensePage;
