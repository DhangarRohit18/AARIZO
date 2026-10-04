import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Lock,
  ArrowRight,
  RefreshCw,
  Printer,
  XCircle,
} from 'lucide-react';
import { RazorpayService, type CheckoutResult } from '../../services/payment/RazorpayService';
import { ReceiptModal } from './ReceiptModal';
import type { SocietyInvoice, PaymentTransaction } from '../../types/billing';

export type PaymentUIState = 'READY' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'PENDING';

export interface RazorpayCheckoutProps {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  societyName?: string;
  purpose?: string;
  residentName?: string;
  residentEmail?: string;
  residentPhone?: string;
  flatCode?: string;
  onSuccess?: (result: CheckoutResult) => void;
  onFailure?: (error: string) => void;
  onClose?: () => void;
  asModal?: boolean;
}

export const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  invoiceId,
  invoiceNumber,
  amount,
  societyName = 'AARIZO Smart Society',
  purpose = 'Society Maintenance Dues',
  residentName = 'Resident',
  residentEmail = 'resident@aarizo.com',
  residentPhone = '9876543210',
  flatCode = 'Flat Unit',
  onSuccess,
  onFailure,
  onClose,
  asModal = false,
}) => {
  const [uiState, setUiState] = useState<PaymentUIState>('READY');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [completedPayment, setCompletedPayment] = useState<CheckoutResult | null>(null);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);

  const handleStartPayment = async () => {
    if (uiState === 'PROCESSING') return;

    setUiState('PROCESSING');
    setStatusMessage('Initiating secure handshake with Razorpay...');
    setErrorMessage('');

    try {
      const result = await RazorpayService.executeCheckout({
        invoiceId,
        invoiceNumber,
        societyName,
        purpose,
        userName: residentName,
        userEmail: residentEmail,
        userPhone: residentPhone,
        onProcessing: (msg) => {
          setStatusMessage(msg);
        },
      });

      if (result.success) {
        setUiState('SUCCESS');
        setCompletedPayment(result);
        onSuccess?.(result);
      } else if (result.cancelled) {
        setUiState('CANCELLED');
        setStatusMessage('Payment cancelled by user.');
      } else {
        setUiState('FAILED');
        setErrorMessage(result.message || 'Payment failed or was declined by bank.');
        onFailure?.(result.message || 'Payment failed.');
      }
    } catch (err: any) {
      console.error('[RazorpayCheckout] Payment error:', err);
      setUiState('FAILED');
      const errText = err?.message || 'Payment verification encountered a network error. If amount was deducted, it will auto-reconcile within 10 minutes.';
      setErrorMessage(errText);
      onFailure?.(errText);
    }
  };

  const receiptInvoice: SocietyInvoice = {
    id: invoiceId,
    invoiceNumber,
    societyId: 'soc-gvs',
    flatId: 'flat-current',
    flatCode,
    residentId: 'res-current',
    residentName,
    billingCycleId: 'cycle-current',
    cycleName: purpose,
    lineItems: [
      { id: 'li-1', component: 'MAINTENANCE', description: purpose, amount },
    ],
    totalAmount: amount,
    paidAmount: amount,
    outstandingBalance: 0,
    status: 'PAID',
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const receiptTxn: PaymentTransaction | undefined = completedPayment?.paymentId
    ? {
        id: completedPayment.paymentId,
        invoiceId,
        invoiceNumber,
        societyId: 'soc-gvs',
        flatCode,
        residentName,
        transactionId: completedPayment.paymentId,
        amount,
        paymentMethod: 'ONLINE_GATEWAY',
        status: 'SUCCESS',
        gatewayReference: completedPayment.paymentId,
        gatewayResponseNotes: completedPayment.message || 'Cryptographically verified with Razorpay',
        paymentDate: new Date().toLocaleString(),
      }
    : undefined;

  const content = (
    <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full font-sans transition-all">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#083B56] via-[#0D4767] to-[#176B91] p-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center font-bold text-lg text-white shadow-xs">
            ₹
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#A3D4E8] uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Razorpay Verified
            </div>
            <div className="font-extrabold text-base truncate max-w-[240px]">{societyName}</div>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            disabled={uiState === 'PROCESSING'}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white disabled:opacity-40"
          >
            ✕
          </button>
        )}
      </div>

      {/* Bill Summary Strip */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <div>
          <span className="font-semibold text-slate-400 uppercase tracking-wider block">
            {invoiceNumber}
          </span>
          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{purpose}</span>
        </div>
        <div className="text-right">
          <span className="font-semibold text-slate-400 block">Payable Dues</span>
          <span className="text-xl font-black text-[#083B56] dark:text-[#83CBEA]">
            ₹{Number(amount).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Body States */}
      <div className="p-6">
        {/* STATE: PROCESSING */}
        {uiState === 'PROCESSING' && (
          <div className="py-6 flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-[#083B56] dark:border-t-sky-400 animate-spin" />
              <CreditCard className="w-6 h-6 text-[#083B56] dark:text-sky-400 absolute inset-0 m-auto" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Payment Processing
              </h3>
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                Do not close or refresh this window.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto pt-1">
                {statusMessage || 'Verifying transaction status with Razorpay servers...'}
              </p>
            </div>
          </div>
        )}

        {/* STATE: SUCCESS */}
        {uiState === 'SUCCESS' && completedPayment && (
          <div className="py-4 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-400 text-emerald-600 flex items-center justify-center animate-in zoom-in-50 duration-300">
              <CheckCircle className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                Verified by Server
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                ₹{Number(completedPayment.amount || amount).toLocaleString('en-IN')}
              </h3>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Payment Received Successfully!
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="w-full bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 select-all">
                  {completedPayment.paymentId}
                </span>
              </div>
              {completedPayment.orderId && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Razorpay Order ID:</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">
                    {completedPayment.orderId}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Date &amp; Time:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {new Date().toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> PAID
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full pt-2">
              <button
                type="button"
                onClick={() => setShowReceipt(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Printer className="w-4 h-4 text-[#176B91]" /> View / Print Receipt
              </button>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#083B56] hover:bg-[#0D4767] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        )}

        {/* STATE: FAILED */}
        {uiState === 'FAILED' && (
          <div className="py-4 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 border-2 border-rose-400 text-rose-600 flex items-center justify-center">
              <XCircle className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-rose-700 dark:text-rose-400">
                Payment Declined or Failed
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                {errorMessage || 'The issuing bank or gateway declined the transaction.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleStartPayment}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#083B56] to-[#176B91] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:brightness-110 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Retry Payment via Razorpay
            </button>
          </div>
        )}

        {/* STATE: CANCELLED */}
        {uiState === 'CANCELLED' && (
          <div className="py-4 flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Payment Cancelled
              </h3>
              <p className="text-xs text-slate-500">
                You cancelled the checkout session. No funds were debited.
              </p>
            </div>
            <button
              type="button"
              onClick={handleStartPayment}
              className="w-full py-3 px-4 rounded-xl bg-[#083B56] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#0D4767] transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Start Over
            </button>
          </div>
        )}

        {/* STATE: READY */}
        {uiState === 'READY' && (
          <div className="space-y-5">
            {/* Accepted Methods Pills */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>Available Payment Modes:</span>
                <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Instant Verification
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                <div className="p-2 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 shadow-2xs">
                  UPI / QR
                </div>
                <div className="p-2 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 shadow-2xs">
                  Debit Cards
                </div>
                <div className="p-2 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 shadow-2xs">
                  Credit Cards
                </div>
                <div className="p-2 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 shadow-2xs">
                  Net Banking
                </div>
              </div>
            </div>

            {/* Resident Context */}
            <div className="text-xs text-slate-500 space-y-1 border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex justify-between">
                <span>Paying For:</span>
                <strong className="text-slate-800 dark:text-slate-200">{residentName} ({flatCode})</strong>
              </div>
              <div className="flex justify-between">
                <span>Invoice ID:</span>
                <span className="font-mono">{invoiceNumber}</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="button"
              onClick={handleStartPayment}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#083B56] to-[#176B91] hover:from-[#0D4767] hover:to-[#1B7FA6] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>Pay ₹{Number(amount).toLocaleString('en-IN')} via Razorpay</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Security Assurance */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-Bit SSL Encrypted &amp; PCI-DSS Level 1 Verified</span>
            </div>
          </div>
        )}
      </div>

      {/* Printable Receipt Modal */}
      {showReceipt && (
        <ReceiptModal
          invoice={receiptInvoice}
          transaction={receiptTxn}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );

  if (asModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
        {content}
      </div>
    );
  }

  return content;
};
