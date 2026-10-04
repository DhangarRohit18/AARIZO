import React from 'react';
import { Building, DollarSign, ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react';
import type { ExpenseSummary } from '../types';

interface ExpenseOverviewKpisProps {
  summary: ExpenseSummary | null;
  pendingCount: number;
  formatCurrency: (amount: number) => string;
}

export const ExpenseOverviewKpis: React.FC<ExpenseOverviewKpisProps> = ({
  summary,
  pendingCount,
  formatCurrency,
}) => {
  if (!summary) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
      {/* Card 1: Total Allocated Budget */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #DCE8EF', padding: '0.875rem', boxShadow: '0 2px 6px rgba(8,59,86,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#657785', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>Allocated Budget</p>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#083B56', marginTop: '0.2rem', lineHeight: 1.1 }}>{formatCurrency(summary.totalBudget)}</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#EBF5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Building size={18} color="#176B91" />
          </div>
        </div>
        <p style={{ fontSize: '0.6875rem', color: '#8B9AA5', margin: '0.35rem 0 0', fontWeight: 500 }}>Sept 2026 Fiscal</p>
      </div>

      {/* Card 2: Actual Expenses */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #DCE8EF', padding: '0.875rem', boxShadow: '0 2px 6px rgba(8,59,86,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#657785', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>Actual Expenses</p>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#083B56', marginTop: '0.2rem', lineHeight: 1.1 }}>{formatCurrency(summary.totalActual)}</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <DollarSign size={18} color="#059669" />
          </div>
        </div>
        <p style={{ fontSize: '0.6875rem', color: '#059669', margin: '0.35rem 0 0', fontWeight: 700 }}>
          {Math.round((summary.totalActual / (summary.totalBudget || 1)) * 100)}% Utilized
        </p>
      </div>

      {/* Card 3: Net Variance */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #DCE8EF', padding: '0.875rem', boxShadow: '0 2px 6px rgba(8,59,86,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#657785', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>Net Variance</p>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: summary.isOverBudget ? '#E11D48' : '#059669', marginTop: '0.2rem', lineHeight: 1.1 }}>
              {summary.totalVariance >= 0 ? '+' : ''}{formatCurrency(summary.totalVariance)}
            </div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: summary.isOverBudget ? '#FFF0F1' : '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {summary.isOverBudget ? <ArrowUpRight size={18} color="#E11D48" /> : <ArrowDownRight size={18} color="#059669" />}
          </div>
        </div>
        <p style={{ fontSize: '0.6875rem', color: summary.isOverBudget ? '#E11D48' : '#059669', margin: '0.35rem 0 0', fontWeight: 600 }}>
          {summary.isOverBudget ? '⚠️ Exceeded' : '✓ Under Budget'}
        </p>
      </div>

      {/* Card 4: Pending Claims */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #DCE8EF', padding: '0.875rem', boxShadow: '0 2px 6px rgba(8,59,86,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#657785', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>Pending Claims</p>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#D97706', marginTop: '0.2rem', lineHeight: 1.1 }}>
              {pendingCount}
            </div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={18} color="#D97706" />
          </div>
        </div>
        <p style={{ fontSize: '0.6875rem', color: '#D97706', margin: '0.35rem 0 0', fontWeight: 600 }}>Requires Review</p>
      </div>
    </div>
  );
};
