import React, { useState } from 'react';
import type { PaymentRecord, PaymentMethod } from '../../../domains/payments';
import { formatCurrency } from '../../../domains/payments';
import { Modal, Button, Input } from '../../common';
import {
  QrCode,
  CreditCard,
  Building,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import '../resident.css';
import './payments.css';

export interface PaymentCheckoutProps {
  isOpen: boolean;
  payment: PaymentRecord | null;
  onClose: () => void;
  onPaymentSuccess: (
    paymentId: string,
    method: PaymentMethod,
    transactionId: string
  ) => void;
}

export const PaymentCheckout: React.FC<PaymentCheckoutProps> = ({
  isOpen,
  payment,
  onClose,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [upiVpa, setUpiVpa] = useState('sarvesh@okicici');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!payment) return null;

  const totalAmount = payment.amount + (payment.penaltyAmount || 0);

  const handleConfirmPayment = () => {
    setIsProcessing(true);

    // Simulate payment gateway delay (1.2s)
    setTimeout(() => {
      setIsProcessing(false);
      const mockTxnId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
      onPaymentSuccess(payment.id, selectedMethod, mockTxnId);
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isProcessing && onClose()}
      title="Secure Checkout"
      footer={
        !isProcessing ? (
          <>
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmPayment}
              leftIcon={<Lock size={14} />}
            >
              Pay {formatCurrency(totalAmount)}
            </Button>
          </>
        ) : null
      }
    >
      {isProcessing ? (
        <div className="res-pay-processing-box">
          <div className="res-pay-spinner" />
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, margin: '0 0 4px 0' }}>
              Processing Payment...
            </h4>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>
              Simulating secure transaction with gateway. Please do not close or refresh.
            </p>
          </div>
        </div>
      ) : (
        <div className="res-checkout-modal-content">
          {/* Order Summary Box */}
          <div className="res-checkout-preview-card">
            <span className="checkout-preview-title">{payment.title}</span>
            <div className="checkout-preview-row">
              <span>Account Ref:</span>
              <span style={{ fontWeight: 600 }}>{payment.accountReference}</span>
            </div>
            <div className="checkout-preview-row">
              <span>Base Dues Amount:</span>
              <span>{formatCurrency(payment.amount)}</span>
            </div>
            {payment.penaltyAmount && payment.penaltyAmount > 0 ? (
              <div className="checkout-preview-row" style={{ color: 'var(--color-danger)' }}>
                <span>Late Fee / Penalty:</span>
                <span>+{formatCurrency(payment.penaltyAmount)}</span>
              </div>
            ) : null}
            <div className="checkout-preview-row checkout-preview-total">
              <span>Total Amount:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <span
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                marginBottom: '6px',
              }}
            >
              Select Payment Method (Simulated)
            </span>
            <div className="res-method-tabs">
              <button
                className={`res-method-tab-btn ${selectedMethod === 'upi' ? 'active' : ''}`}
                onClick={() => setSelectedMethod('upi')}
              >
                <QrCode size={18} />
                <span>UPI / GPay</span>
              </button>
              <button
                className={`res-method-tab-btn ${selectedMethod === 'card' ? 'active' : ''}`}
                onClick={() => setSelectedMethod('card')}
              >
                <CreditCard size={18} />
                <span>Debit / Credit</span>
              </button>
              <button
                className={`res-method-tab-btn ${selectedMethod === 'net_banking' ? 'active' : ''}`}
                onClick={() => setSelectedMethod('net_banking')}
              >
                <Building size={18} />
                <span>Net Banking</span>
              </button>
            </div>
          </div>

          {/* Method Form Box */}
          <div className="res-method-form-box">
            {selectedMethod === 'upi' && (
              <>
                <Input
                  label="VPA / UPI ID"
                  value={upiVpa}
                  onChange={(e) => setUpiVpa(e.target.value)}
                  placeholder="name@upi"
                />
                <div
                  style={{
                    display: 'flex',
                    gap: '6px',
                    fontSize: '10px',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <span style={{ fontWeight: 700 }}>Popular:</span>
                  <span>Google Pay</span> • <span>PhonePe</span> • <span>Paytm</span> • <span>BHIM</span>
                </div>
              </>
            )}

            {selectedMethod === 'card' && (
              <>
                <Input label="Card Number" value="4532 •••• •••• 4242" readOnly />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <Input label="Expiry Date" value="08/28" readOnly />
                  <Input label="CVV" value="•••" readOnly />
                </div>
              </>
            )}

            {selectedMethod === 'net_banking' && (
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--color-text-muted)',
                    marginBottom: '4px',
                  }}
                >
                  Select Bank
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border-subtle)',
                    fontSize: '12px',
                  }}
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="State Bank of India">State Bank of India (SBI)</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '10px',
                color: 'var(--color-text-subtle)',
                marginTop: '4px',
              }}
            >
              <ShieldCheck size={12} style={{ color: 'var(--color-success)' }} />
              <span>256-bit SSL Simulated Encrypted Transaction</span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
