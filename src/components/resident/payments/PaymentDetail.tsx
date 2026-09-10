import React from 'react';
import type { PaymentRecord } from '../../../domains/payments';
import {
  getPaymentStatusBadgeVariant,
  getPaymentStatusLabel,
  getPaymentCategoryLabel,
  getPaymentMethodLabel,
  formatCurrency,
} from '../../../domains/payments';
import { Badge, Button } from '../../common';
import {
  ArrowLeft,
  Receipt,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import '../resident.css';
import './payments.css';

export interface PaymentDetailProps {
  payment: PaymentRecord;
  onBack: () => void;
  onPayNow: (payment: PaymentRecord) => void;
  onViewReceipt: (payment: PaymentRecord) => void;
}

export const PaymentDetail: React.FC<PaymentDetailProps> = ({
  payment,
  onBack,
  onPayNow,
  onViewReceipt,
}) => {
  const totalAmount = payment.amount + (payment.penaltyAmount || 0);

  return (
    <div className="res-payment-detail-container">
      {/* Header */}
      <div className="res-screen-header">
        <button className="vis-back-icon-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="vis-screen-title">Payment Breakdown</h2>
          <p className="vis-screen-subtitle">Ref: {payment.accountReference}</p>
        </div>
      </div>

      {/* Hero Card */}
      <div className="res-detail-hero-card">
        <Badge variant={getPaymentStatusBadgeVariant(payment.status)}>
          {getPaymentStatusLabel(payment.status)}
        </Badge>
        <span className="detail-amount-lg">{formatCurrency(totalAmount)}</span>
        <h3 className="detail-title-lg">{payment.title}</h3>
        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>
          {getPaymentCategoryLabel(payment.category)} • Billing Period: {payment.period}
        </p>
      </div>

      {/* Breakdown & Information */}
      <div className="res-detail-info-grid">
        <div className="res-info-item-row">
          <span className="info-item-lbl">Property / Unit</span>
          <span className="info-item-val">Lakeview Residency • Tower B · Flat 1204</span>
        </div>

        <div className="res-info-item-row">
          <span className="info-item-lbl">Category</span>
          <span className="info-item-val">{getPaymentCategoryLabel(payment.category)}</span>
        </div>

        <div className="res-info-item-row">
          <span className="info-item-lbl">Account Reference</span>
          <span className="info-item-val">{payment.accountReference}</span>
        </div>

        <div className="res-info-item-row">
          <span className="info-item-lbl">Due Date</span>
          <span className="info-item-val">{payment.dueDate}</span>
        </div>

        <div className="res-info-item-row">
          <span className="info-item-lbl">Base Dues Amount</span>
          <span className="info-item-val">{formatCurrency(payment.amount)}</span>
        </div>

        {payment.penaltyAmount && payment.penaltyAmount > 0 ? (
          <div className="res-info-item-row">
            <span className="info-item-lbl" style={{ color: 'var(--color-danger)' }}>
              Late Fee / Penalty
            </span>
            <span className="info-item-val" style={{ color: 'var(--color-danger)' }}>
              +{formatCurrency(payment.penaltyAmount)}
            </span>
          </div>
        ) : null}

        <div className="res-info-item-row" style={{ fontWeight: 800 }}>
          <span className="info-item-lbl" style={{ fontWeight: 800, color: 'var(--color-text)' }}>
            Total Payable
          </span>
          <span className="info-item-val" style={{ fontSize: '14px', color: 'var(--color-primary)' }}>
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>

      {/* Description Card */}
      <div
        className="res-detail-info-grid"
        style={{ gap: '4px' }}
      >
        <span className="info-item-lbl">Description & Notes</span>
        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4 }}>
          {payment.description}
        </p>
      </div>

      {/* Status Specific Footer Actions */}
      {payment.status === 'PAID' ? (
        <div className="res-detail-info-grid" style={{ gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} style={{ color: 'var(--color-success)' }} />
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)' }}>
                Paid & Verified
              </span>
              <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)' }}>
                Transaction ID: {payment.transactionId || 'TXN-SIMULATED'} • Paid via{' '}
                {payment.paymentMethod ? getPaymentMethodLabel(payment.paymentMethod) : 'UPI'}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            fullWidth
            onClick={() => onViewReceipt(payment)}
            leftIcon={<Receipt size={16} />}
          >
            View Official Digital Receipt
          </Button>
        </div>
      ) : payment.status === 'FAILED' ? (
        <div className="res-detail-info-grid" style={{ gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)' }}>
            <AlertCircle size={20} />
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>Transaction Failed</span>
              <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)' }}>
                {payment.failureReason || 'Payment failed during gateway authorization.'}
              </span>
            </div>
          </div>
          <Button variant="primary" fullWidth onClick={() => onPayNow(payment)}>
            Retry Payment ({formatCurrency(totalAmount)})
          </Button>
        </div>
      ) : (
        <div className="res-detail-info-grid" style={{ gap: 'var(--space-3)' }}>
          {payment.status === 'OVERDUE' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                background: 'var(--color-danger-bg)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-danger)',
                fontSize: '11px',
              }}
            >
              <AlertCircle size={16} />
              <span>This bill is overdue. Please settle to avoid disruption to amenities.</span>
            </div>
          )}
          <Button variant="primary" fullWidth onClick={() => onPayNow(payment)}>
            Proceed to Pay ({formatCurrency(totalAmount)})
          </Button>
        </div>
      )}
    </div>
  );
};
