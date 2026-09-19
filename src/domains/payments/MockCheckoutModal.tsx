import React, { useState } from 'react';
import { ShieldCheck, CreditCard, Smartphone, Building, CheckCircle2, AlertCircle, X, RefreshCw } from 'lucide-react';
import { formatCurrency } from './states';

export interface MockCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentDetails: {
    transactionId: string;
    method: 'upi' | 'card' | 'net_banking';
    amount: number;
  }) => void;
  amount: number;
  purpose: string;
  societyName?: string;
  invoiceNumber?: string;
}

export const MockCheckoutModal: React.FC<MockCheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  purpose,
  societyName = 'Green Valley Society',
  invoiceNumber = 'INV-2026-09',
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'net_banking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulationOutcome, setSimulationOutcome] = useState<'SUCCESS' | 'FAILED'>('SUCCESS');

  if (!isOpen) return null;

  const handlePay = async () => {
    setIsProcessing(true);
    await new Promise((res) => setTimeout(res, 1200));

    if (simulationOutcome === 'SUCCESS') {
      const transactionId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
      onSuccess({
        transactionId,
        method: selectedMethod,
        amount,
      });
      setIsProcessing(false);
      onClose();
    } else {
      setIsProcessing(false);
      alert('Mock Payment Simulation: Transaction was declined by bank test simulator.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-lg">
              A
            </div>
            <div>
              <div className="text-xs font-semibold text-blue-200 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Razorpay Test Gateway
              </div>
              <div className="font-bold text-base">{societyName}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Payment Summary */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Order: {invoiceNumber}</div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{purpose}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 dark:text-slate-400">Amount Due</div>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {formatCurrency(amount)}
            </div>
          </div>
        </div>

        {/* Method Selectors */}
        <div className="p-5 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Payment Method</div>

          {/* UPI */}
          <button
            type="button"
            onClick={() => setSelectedMethod('upi')}
            className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all ${
              selectedMethod === 'upi'
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-indigo-600" />
              <div className="text-left">
                <div className="font-bold text-sm">UPI (GPay, PhonePe, Paytm)</div>
                <div className="text-xs text-slate-500">Fast & Zero Gateway Surcharge</div>
              </div>
            </div>
            {selectedMethod === 'upi' && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
          </button>

          {/* Cards */}
          <button
            type="button"
            onClick={() => setSelectedMethod('card')}
            className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all ${
              selectedMethod === 'card'
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <div className="font-bold text-sm">Credit / Debit Cards</div>
                <div className="text-xs text-slate-500">Visa, Mastercard, RuPay</div>
              </div>
            </div>
            {selectedMethod === 'card' && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
          </button>

          {/* Net Banking */}
          <button
            type="button"
            onClick={() => setSelectedMethod('net_banking')}
            className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all ${
              selectedMethod === 'net_banking'
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-slate-600" />
              <div className="text-left">
                <div className="font-bold text-sm">Net Banking</div>
                <div className="text-xs text-slate-500">All major Indian banks</div>
              </div>
            </div>
            {selectedMethod === 'net_banking' && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
          </button>
        </div>

        {/* Demo Test Switcher */}
        <div className="px-5 py-3 bg-amber-50 dark:bg-amber-950/30 border-y border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-semibold">
            <AlertCircle className="w-4 h-4" /> Simulator Outcome:
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSimulationOutcome('SUCCESS')}
              className={`px-2 py-0.5 rounded-md font-bold ${
                simulationOutcome === 'SUCCESS' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              Success
            </button>
            <button
              type="button"
              onClick={() => setSimulationOutcome('FAILED')}
              className={`px-2 py-0.5 rounded-md font-bold ${
                simulationOutcome === 'FAILED' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              Fail
            </button>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-5 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Processing Secure Payment...
              </>
            ) : (
              `Pay ${formatCurrency(amount)}`
            )}
          </button>
          <div className="text-center text-xs text-slate-400 mt-2">
            🔒 256-Bit Encrypted Mock Payment Sandbox
          </div>
        </div>
      </div>
    </div>
  );
};
