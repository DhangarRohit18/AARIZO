import React from 'react';
import type { PaymentRecord } from '../../../domains/payments';
import {
  getPaymentStatusBadgeVariant,
  getPaymentStatusLabel,
  getPaymentCategoryLabel,
  formatCurrency,
} from '../../../domains/payments';
import { Badge } from '../../common';
import {
  CreditCard,
  Zap,
  Droplets,
  Car,
  Calendar,
  Layers,
  ChevronRight,
  Receipt,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import '../resident.css';
import './payments.css';

export interface PaymentCardProps {
  payment: PaymentRecord;
  onPayNow?: (payment: PaymentRecord) => void;
  onViewReceipt?: (payment: PaymentRecord) => void;
  onCardClick?: (payment: PaymentRecord) => void;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({
  payment,
  onPayNow,
  onViewReceipt,
  onCardClick,
}) => {
  const getCategoryIcon = () => {
    switch (payment.category) {
      case 'maintenance':
        return <Layers size={14} className="cat-ic" />;
      case 'electricity':
        return <Zap size={14} className="cat-ic" />;
      case 'water':
        return <Droplets size={14} className="cat-ic" />;
      case 'parking':
        return <Car size={14} className="cat-ic" />;
      case 'amenity':
        return <Calendar size={14} className="cat-ic" />;
      default:
        return <CreditCard size={14} className="cat-ic" />;
    }
  };

  const getCardBorderClass = () => {
    switch (payment.status) {
      case 'OVERDUE':
        return 'card-overdue';
      case 'DUE':
        return 'card-due';
      case 'PAID':
        return 'card-paid';
      case 'FAILED':
        return 'card-failed';
      default:
        return '';
    }
  };

  const totalAmount = payment.amount + (payment.penaltyAmount || 0);

  return (
    <div
      className={`res-payment-card ${getCardBorderClass()}`}
      onClick={() => onCardClick && onCardClick(payment)}
    >
      <div className="res-pay-card-header">
        <div className="res-cat-chip">
          {getCategoryIcon()}
          <span>{getPaymentCategoryLabel(payment.category)}</span>
        </div>
        <Badge variant={getPaymentStatusBadgeVariant(payment.status)}>
          {getPaymentStatusLabel(payment.status)}
        </Badge>
      </div>

      <div className="res-pay-card-main">
        <div>
          <h4 className="res-pay-card-title">{payment.title}</h4>
          <p className="res-pay-card-desc">{payment.description}</p>
        </div>
        <div className="res-pay-card-amount">
          <span>{formatCurrency(totalAmount)}</span>
          {payment.penaltyAmount && payment.penaltyAmount > 0 && (
            <span style={{ display: 'block', fontSize: '9px', color: 'var(--color-danger)' }}>
              (incl. ₹{payment.penaltyAmount} late fee)
            </span>
          )}
        </div>
      </div>

      <div className="res-pay-card-footer">
        <div className="res-pay-date-info">
          {payment.status === 'PAID' ? (
            <>
              <CheckCircle2 size={12} style={{ color: 'var(--color-success)' }} />
              <span>Paid on {payment.paymentDate || 'Recent'}</span>
            </>
          ) : payment.status === 'OVERDUE' ? (
            <>
              <AlertCircle size={12} style={{ color: 'var(--color-danger)' }} />
              <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>
                Overdue since {payment.dueDate}
              </span>
            </>
          ) : payment.status === 'FAILED' ? (
            <>
              <AlertCircle size={12} style={{ color: 'var(--color-danger)' }} />
              <span style={{ color: 'var(--color-danger)' }}>Failed transaction</span>
            </>
          ) : (
            <>
              <Clock size={12} />
              <span>Due by {payment.dueDate}</span>
            </>
          )}
        </div>

        <div className="res-pay-btn-group" onClick={(e) => e.stopPropagation()}>
          {payment.status === 'PAID' ? (
            <button
              className="res-receipt-btn"
              onClick={() => onViewReceipt && onViewReceipt(payment)}
            >
              <Receipt size={12} />
              <span>Receipt</span>
            </button>
          ) : (
            <button
              className="res-pay-cta-btn"
              onClick={() => onPayNow && onPayNow(payment)}
            >
              <span>{payment.status === 'FAILED' ? 'Retry Payment' : 'Pay Now'}</span>
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
