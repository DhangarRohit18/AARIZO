import React from 'react';
import type { PaymentRecord } from '../../../domains/payments';
import { formatCurrency, getPaymentMethodLabel } from '../../../domains/payments';
import { Button } from '../../common';
import { CheckCircle2, Receipt, ArrowLeft, ShieldCheck } from 'lucide-react';
import '../resident.css';
import './payments.css';

export interface PaymentSuccessProps {
  payment: PaymentRecord;
  transactionId: string;
  onViewReceipt: () => void;
  onBackToPayments: () => void;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  payment,
  transactionId,
  onViewReceipt,
  onBackToPayments,
}) => {
  const totalAmount = payment.amount + (payment.penaltyAmount || 0);

  return (
    <div className="res-success-container">
      <div className="res-success-ic-box">
        <CheckCircle2 size={36} />
      </div>

      <div>
        <h2 className="res-success-title">Payment Successful!</h2>
        <p className="res-success-subtitle">
          Transaction completed and verified for Flat 1204
        </p>
      </div>

      <div className="res-success-card">
        <div className="res-info-item-row">
          <span className="info-item-lbl">Amount Paid</span>
          <span className="info-item-val" style={{ fontSize: '14px', color: 'var(--color-success)' }}>
            {formatCurrency(totalAmount)}
          </span>
        </div>

        <div className="res-info-item-row">
          <span className="info-item-lbl">Payment Dues</span>
          <span className="info-item-val">{payment.title}</span>
        </div>

        <div className="res-info-item-row">
          <span className="info-item-lbl">Transaction Reference</span>
          <span className="info-item-val" style={{ fontFamily: 'monospace' }}>
            {transactionId}
          </span>
        </div>

        <div className="res-info-item-row">
          <span className="info-item-lbl">Payment Method</span>
          <span className="info-item-val">
            {payment.paymentMethod ? getPaymentMethodLabel(payment.paymentMethod) : 'Instant UPI'}
          </span>
        </div>

        <div className="res-info-item-row">
          <span className="info-item-lbl">Date & Timestamp</span>
          <span className="info-item-val">{payment.paymentDate || 'Just now'}</span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '11px',
          color: 'var(--color-text-muted)',
        }}
      >
        <ShieldCheck size={14} style={{ color: 'var(--color-success)' }} />
        <span>Estate account updated automatically. Digital receipt generated.</span>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
        <Button variant="primary" fullWidth onClick={onViewReceipt} leftIcon={<Receipt size={16} />}>
          View Official Digital Receipt
        </Button>
        <Button variant="outline" fullWidth onClick={onBackToPayments} leftIcon={<ArrowLeft size={16} />}>
          Back to Payments Dashboard
        </Button>
      </div>
    </div>
  );
};
