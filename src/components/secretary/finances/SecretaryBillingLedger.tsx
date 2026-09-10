import React, { useState } from 'react';
import type { CanonicalBillingRecord, PaymentStatus } from '../../../domains/secretary/types';
import { CreditCard, Search, Plus, DollarSign, AlertTriangle, X } from 'lucide-react';
import { IssueBillModal } from './IssueBillModal';
import '../secretary.css';

interface SecretaryBillingLedgerProps {
  ledgerList: CanonicalBillingRecord[];
  onIssueNewBill: (bill: Omit<CanonicalBillingRecord, 'id' | 'billNumber' | 'accountReference' | 'amountPaid' | 'outstandingAmount' | 'status'>) => void;
  initialIssueOpen?: boolean;
}

export const SecretaryBillingLedger: React.FC<SecretaryBillingLedgerProps> = ({
  ledgerList,
  onIssueNewBill,
  initialIssueOpen = false,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');
  const [isIssueModalOpen, setIsIssueModalOpen] = useState<boolean>(initialIssueOpen);
  const [selectedBill, setSelectedBill] = useState<CanonicalBillingRecord | null>(null);

  const totalBilled = ledgerList.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalCollected = ledgerList.reduce((acc, curr) => acc + curr.amountPaid, 0);
  const totalOutstanding = ledgerList.reduce((acc, curr) => acc + curr.outstandingAmount, 0);
  const overdueCount = ledgerList.filter((b) => b.status === 'OVERDUE').length;
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  const filteredLedger = ledgerList.filter((item) => {
    const matchesSearch =
      item.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.canonicalDisplay.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.accountReference.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Header Row */}
      <div className="section-heading-row">
        <div>
          <h3 className="section-title">Society Maintenance Billing Ledger</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
            Society Dues Collection, Itemized Ledger & Accounts
          </p>
        </div>
        <button
          className="btn-onboarding-primary"
          style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.75rem' }}
          onClick={() => setIsIssueModalOpen(true)}
        >
          <Plus size={16} />
          <span>+ Issue Maintenance Bill</span>
        </button>
      </div>

      {/* Financial Metrics Cards Grid */}
      <div className="stats-grid-2x2" style={{ marginBottom: '1rem' }}>
        <div className="secretary-stat-card">
          <div className="stat-icon-wrapper stat-icon-emerald">
            <DollarSign size={18} />
          </div>
          <div className="stat-value">₹{(totalCollected / 1000).toFixed(1)}k</div>
          <div className="stat-label">Total Dues Collected</div>
        </div>

        <div className="secretary-stat-card">
          <div className="stat-icon-wrapper stat-icon-rose">
            <AlertTriangle size={18} />
          </div>
          <div className="stat-value">₹{(totalOutstanding / 1000).toFixed(1)}k</div>
          <div className="stat-label">Outstanding ({overdueCount} Overdue)</div>
        </div>
      </div>

      {/* Dues Progress Bar */}
      <div
        className="login-form-card"
        style={{ marginBottom: '1rem', padding: '0.875rem 1rem', background: '#f8fafc' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.375rem' }}>
          <span>Overall Collection Progress</span>
          <span style={{ color: '#16a34a' }}>{collectionRate}% Paid</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${collectionRate}%`, height: '100%', background: '#16a34a', borderRadius: '4px' }} />
        </div>
      </div>

      {/* Search & Status Filter Bar */}
      <div className="resident-search-bar" style={{ gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div className="search-input-wrapper" style={{ flex: 1 }}>
          <Search size={18} style={{ color: '#94a3b8' }} />
          <input
            type="text"
            className="search-input-field"
            placeholder="Search by flat (e.g. 1204), resident name, or ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="wing-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'ALL')}
        >
          <option value="ALL">All Statuses</option>
          <option value="DUE">DUE</option>
          <option value="OVERDUE">OVERDUE</option>
          <option value="PAID">PAID</option>
        </select>
      </div>

      {/* Ledger Feed Cards */}
      {filteredLedger.length === 0 ? (
        <div className="login-form-card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <CreditCard size={32} style={{ color: '#94a3b8', marginBottom: '0.5rem' }} />
          <h4 style={{ margin: '0 0 0.25rem 0' }}>No Billing Records Match Filter</h4>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
            Adjust your search terms or filter dropdown above.
          </p>
        </div>
      ) : (
        filteredLedger.map((bill) => (
          <div
            key={bill.id}
            className="resident-card"
            style={{ marginBottom: '0.75rem', cursor: 'pointer' }}
            onClick={() => setSelectedBill(bill)}
          >
            <div className="resident-card-left">
              <div className="resident-flat-badge">{bill.canonicalDisplay}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h4 className="resident-name">{bill.title}</h4>
                  <span
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      padding: '0.125rem 0.375rem',
                      borderRadius: '4px',
                      background:
                        bill.status === 'PAID'
                          ? '#f0fdf4'
                          : bill.status === 'OVERDUE'
                          ? '#fef2f2'
                          : '#fffbeb',
                      color:
                        bill.status === 'PAID'
                          ? '#16a34a'
                          : bill.status === 'OVERDUE'
                          ? '#dc2626'
                          : '#d97706',
                    }}
                  >
                    {bill.status}
                  </span>
                </div>
                <p className="resident-details">
                  {bill.residentName} • Ref: <code>{bill.accountReference}</code>
                </p>
                <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Due: {bill.dueDate} {bill.paidAt ? `• Paid on ${bill.paidAt}` : ''}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>
                ₹{bill.totalAmount.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.6875rem', color: bill.outstandingAmount > 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                {bill.outstandingAmount > 0 ? `Outstanding: ₹${bill.outstandingAmount.toLocaleString()}` : 'Fully Paid'}
              </div>
            </div>
          </div>
        ))
      )}

      {/* Issue Bill Modal */}
      {isIssueModalOpen && (
        <IssueBillModal
          onClose={() => setIsIssueModalOpen(false)}
          onIssueBill={onIssueNewBill}
        />
      )}

      {/* Bill Detail View Modal */}
      {selectedBill && (
        <div className="auth-modal-overlay">
          <div className="auth-modal-card" style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', cursor: 'pointer' }} onClick={() => setSelectedBill(null)}>
              <X size={18} style={{ color: '#94a3b8' }} />
            </div>

            <div className="otp-icon-header" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <CreditCard size={24} />
            </div>

            <h3 className="otp-title">{selectedBill.title}</h3>
            <p className="otp-desc">
              Ref: <code>{selectedBill.accountReference}</code> • Cycle: {selectedBill.billingCycle}
            </p>

            <div className="login-form-card" style={{ background: '#f8fafc', marginBottom: '1.25rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.375rem' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Flat & Unit:</span>
                <strong style={{ fontSize: '0.8125rem' }}>{selectedBill.canonicalDisplay}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.375rem' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Resident Name:</span>
                <strong style={{ fontSize: '0.8125rem' }}>{selectedBill.residentName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.375rem' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Total Bill Amount:</span>
                <strong style={{ fontSize: '0.8125rem', color: '#2563eb' }}>₹{selectedBill.totalAmount.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Payment Status:</span>
                <strong style={{ fontSize: '0.8125rem', color: selectedBill.status === 'PAID' ? '#16a34a' : '#dc2626' }}>
                  {selectedBill.status}
                </strong>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#475569', margin: '0.5rem 0 0 0', fontStyle: 'italic' }}>
                {selectedBill.description}
              </p>
            </div>

            <button className="btn-login-submit" onClick={() => setSelectedBill(null)}>
              Close Ledger View
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
