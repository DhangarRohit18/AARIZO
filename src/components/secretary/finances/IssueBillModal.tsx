import React, { useState } from 'react';
import type { CanonicalBillingRecord, PaymentCategory } from '../../../domains/secretary/types';
import { CreditCard, X, Send } from 'lucide-react';
import '../secretary.css';

interface IssueBillModalProps {
  onClose: () => void;
  onIssueBill: (bill: Omit<CanonicalBillingRecord, 'id' | 'billNumber' | 'accountReference' | 'amountPaid' | 'outstandingAmount' | 'status'>) => void;
}

export const IssueBillModal: React.FC<IssueBillModalProps> = ({ onClose, onIssueBill }) => {
  const [title, setTitle] = useState<string>('October 2026 Maintenance Dues');
  const [billingCycle, setBillingCycle] = useState<string>('Oct 2026');
  const [category, setCategory] = useState<PaymentCategory>('maintenance');
  const [targetFlat, setTargetFlat] = useState<string>('ALL');
  const [baseFee, setBaseFee] = useState<number>(4250);
  const [dueDate, setDueDate] = useState<string>('2026-10-15');
  const [description, setDescription] = useState<string>(
    'Monthly society maintenance fee covering 24/7 security, housekeeping, lift maintenance, and water pumping.'
  );

  const handleSubmit = () => {
    onIssueBill({
      billingCycle,
      category,
      title: title.trim(),
      residentName: targetFlat === 'ALL' ? 'All Society Residents' : 'Sarvesh Kulkarni',
      flatNumber: targetFlat === 'ALL' ? 'ALL' : '1204',
      blockWing: targetFlat === 'ALL' ? 'All Blocks' : 'Block B',
      canonicalDisplay: targetFlat === 'ALL' ? 'Entire Society (128 Units)' : 'Tower B · Flat 1204',
      totalAmount: Number(baseFee) || 4250,
      dueDate,
      description: description.trim(),
    });
    onClose();
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-card" style={{ maxWidth: '440px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="otp-icon-header" style={{ width: '36px', height: '36px', background: '#eff6ff', color: '#2563eb', margin: 0 }}>
              <CreditCard size={20} />
            </div>
            <h3 className="otp-title" style={{ fontSize: '1.125rem', margin: 0 }}>
              Issue Maintenance Bill
            </h3>
          </div>
          <button className="btn-auth-text" onClick={onClose} style={{ color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        <label className="form-group-label" style={{ fontSize: '0.75rem' }}>Bill Item Title</label>
        <input
          type="text"
          className="search-input-field"
          placeholder="e.g. October 2026 Maintenance Dues"
          style={{ width: '100%', marginBottom: '0.75rem', padding: '0.5rem' }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div>
            <label className="form-group-label" style={{ fontSize: '0.75rem' }}>Billing Cycle</label>
            <input
              type="text"
              className="search-input-field"
              placeholder="Oct 2026"
              style={{ width: '100%', padding: '0.45rem' }}
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value)}
            />
          </div>

          <div>
            <label className="form-group-label" style={{ fontSize: '0.75rem' }}>Bill Category</label>
            <select
              className="wing-filter-select"
              style={{ width: '100%', padding: '0.45rem' }}
              value={category}
              onChange={(e) => setCategory(e.target.value as PaymentCategory)}
            >
              <option value="maintenance">Maintenance</option>
              <option value="parking">Parking & EV</option>
              <option value="amenity">Amenity Fee</option>
              <option value="electricity">Electricity Sub-meter</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div>
            <label className="form-group-label" style={{ fontSize: '0.75rem' }}>Total Amount (₹)</label>
            <input
              type="number"
              className="search-input-field"
              placeholder="4250"
              style={{ width: '100%', padding: '0.45rem' }}
              value={baseFee}
              onChange={(e) => setBaseFee(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="form-group-label" style={{ fontSize: '0.75rem' }}>Due Date</label>
            <input
              type="date"
              className="search-input-field"
              style={{ width: '100%', padding: '0.45rem' }}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <label className="form-group-label" style={{ fontSize: '0.75rem' }}>Target Units</label>
        <select
          className="wing-filter-select"
          style={{ width: '100%', marginBottom: '0.75rem', padding: '0.45rem' }}
          value={targetFlat}
          onChange={(e) => setTargetFlat(e.target.value)}
        >
          <option value="ALL">Entire Society (All 128 Units)</option>
          <option value="1204">Tower B · Flat 1204 (Sarvesh Kulkarni)</option>
        </select>

        <label className="form-group-label" style={{ fontSize: '0.75rem' }}>Description & Breakdown</label>
        <textarea
          className="search-input-field"
          rows={3}
          style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', fontSize: '0.8125rem' }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn-onboarding-primary"
            style={{ flex: 1, background: '#64748b' }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="btn-onboarding-primary"
            style={{ flex: 1.2, background: '#16a34a' }}
            onClick={handleSubmit}
          >
            <Send size={16} />
            <span>Generate & Dispatch</span>
          </button>
        </div>
      </div>
    </div>
  );
};
