import React, { useState, useEffect } from 'react';
import { CreditCard, FileText, CheckCircle, AlertTriangle, ShieldCheck, History } from 'lucide-react';
import { billingService } from '../../../services/billingService';
import type { SocietyInvoice, PaymentTransaction } from '../../../types/billing';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ReceiptModal } from '../../../components/billing/ReceiptModal';
import { DataTable } from '../../../components/ui/DataTable';
import { MobileDataCard } from '../../../components/ui/MobileDataCard';

export const ResidentBillingPage: React.FC = () => {
  const currentSocietyId = 'soc-gvs';
  const currentResident = {
    id: 'res-1',
    name: 'Rajesh Kumar',
    flatCode: 'B-1204',
    flatId: 'flat-1204',
    role: 'resident',
  };

  const [invoices, setInvoices] = useState<SocietyInvoice[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);

  // Online Checkout Modal State
  const [checkoutInvoice, setCheckoutInvoice] = useState<SocietyInvoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<{ success: boolean; message: string } | null>(null);

  // Receipt Modal State
  const [receiptInvoice, setReceiptInvoice] = useState<SocietyInvoice | null>(null);

  const reloadData = () => {
    const invList = billingService
      .getInvoices(currentSocietyId)
      .filter((i) => i.flatCode === currentResident.flatCode || i.residentId === currentResident.id);
    const txnList = billingService
      .getTransactions(currentSocietyId)
      .filter((t) => t.flatCode === currentResident.flatCode);

    setInvoices(invList);
    setTransactions(txnList);
  };

  useEffect(() => {
    reloadData();
  }, []);

  const activeInvoice = invoices.find((i) => i.outstandingBalance > 0) || invoices[0];

  const handleOnlineCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutInvoice || paymentAmount <= 0) return;

    setIsProcessing(true);
    setCheckoutResult(null);

    try {
      const res = await billingService.processOnlinePayment(
        checkoutInvoice.id,
        paymentAmount,
        currentResident
      );

      if (res.success) {
        setCheckoutResult({
          success: true,
          message: 'Payment completed successfully via Payment Gateway Adapter!',
        });
        reloadData();
      } else {
        setCheckoutResult({
          success: false,
          message: res.message || 'Payment declined by gateway.',
        });
      }
    } catch (err: any) {
      setCheckoutResult({
        success: false,
        message: err.message || 'Payment processing error.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Society Billing & Maintenance Dues
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View current maintenance bill breakdown for Flat {currentResident.flatCode}, pay online, and download tax receipts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold">
            Flat {currentResident.flatCode}
          </span>
        </div>
      </div>

      {/* Active Bill Hero Card */}
      {activeInvoice && (
        <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {activeInvoice.cycleName}
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                Invoice {activeInvoice.invoiceNumber}
              </h2>
              <div className="text-xs text-slate-500 mt-1">Due Date: {activeInvoice.dueDate}</div>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge
                variant={
                  activeInvoice.status === 'PAID'
                    ? 'success'
                    : activeInvoice.status === 'PARTIALLY_PAID'
                    ? 'info'
                    : 'warning'
                }
                label={activeInvoice.status}
              />
              <button
                onClick={() => setReceiptInvoice(activeInvoice)}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-4 h-4" /> Download Receipt
              </button>
            </div>
          </div>

          {/* Line Items Breakdown Table */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Itemized Bill Components</h3>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Component</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Amount (â‚¹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-800 dark:text-slate-200">
                  {activeInvoice.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="p-3 font-semibold text-indigo-600 dark:text-indigo-400">{item.component}</td>
                      <td className="p-3">{item.description}</td>
                      <td className="p-3 text-right font-medium">â‚¹{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Amount Breakdown & Online Pay Action */}
          <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>Total Bill: <strong>â‚¹{activeInvoice.totalAmount.toLocaleString()}</strong></span>
                <span>Paid So Far: <strong className="text-emerald-600">â‚¹{activeInvoice.paidAmount.toLocaleString()}</strong></span>
              </div>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                Outstanding Dues: <span className="text-rose-600 dark:text-rose-400">â‚¹{activeInvoice.outstandingBalance.toLocaleString()}</span>
              </div>
            </div>

            {activeInvoice.outstandingBalance > 0 ? (
              <button
                onClick={() => {
                  setCheckoutInvoice(activeInvoice);
                  setPaymentAmount(activeInvoice.outstandingBalance);
                  setCheckoutResult(null);
                }}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <CreditCard className="w-4 h-4" /> PAY ONLINE VIA GATEWAY
              </button>
            ) : (
              <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                <CheckCircle className="w-5 h-5" /> ALL DUES PAID IN FULL
              </div>
            )}
          </div>
        </div>
      )}

      {/* Past Invoices & Payment History */}
      <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Payment & Transaction History
        </h2>

        <div className="mt-4">
          <DataTable
            columns={[
              { key: 'transactionId', header: 'Txn ID', render: (t: PaymentTransaction) => <span className="font-semibold text-indigo-600 dark:text-indigo-400">{t.transactionId}</span> },
              { key: 'paymentDate', header: 'Date' },
              { key: 'paymentMethod', header: 'Method', render: (t: PaymentTransaction) => <span className="font-medium">{t.paymentMethod}</span> },
              { key: 'amount', header: 'Amount (₹)', render: (t: PaymentTransaction) => <span className="font-bold">₹{t.amount.toLocaleString()}</span> },
              {
                key: 'status',
                header: 'Status',
                render: (t: PaymentTransaction) => (
                  <StatusBadge
                    variant={t.status === 'SUCCESS' ? 'success' : 'danger'}
                    label={t.status}
                  />
                )
              }
            ]}
            data={transactions}
            keyExtractor={(t: PaymentTransaction) => t.id}
            pageSize={10}
            mobileRender={(t: PaymentTransaction) => (
              <MobileDataCard
                title={`Payment ₹${t.amount.toLocaleString()}`}
                subtitle={`Txn #${t.transactionId} • ${t.paymentDate}`}
                status={
                  <StatusBadge
                    variant={t.status === 'SUCCESS' ? 'success' : 'danger'}
                    label={t.status}
                  />
                }
                attributes={[
                  { label: 'Method', value: t.paymentMethod },
                  { label: 'Amount', value: `₹${t.amount.toLocaleString()}` },
                  { label: 'Date', value: t.paymentDate }
                ]}
              />
            )}
          />
        </div>
      </div>

      {/* Online Gateway Checkout Modal */}
      {checkoutInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleOnlineCheckout}
            className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-4 md:p-6 space-y-5 border border-slate-200 dark:border-slate-700 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Payment Gateway Checkout</h3>
                <p className="text-xs text-slate-500">Invoice: {checkoutInvoice.invoiceNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutInvoice(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                âœ•
              </button>
            </div>

            {checkoutResult && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  checkoutResult.success
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}
              >
                {checkoutResult.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{checkoutResult.message}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-1 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Invoice Dues:</span>
                  <span className="font-bold">â‚¹{checkoutInvoice.outstandingBalance.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Enter Payment Amount (â‚¹) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={checkoutInvoice.outstandingBalance}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Supports full or partial payment.
                </span>
              </div>

              <div className="p-3 border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-lg text-[11px] text-indigo-900 dark:text-indigo-200 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" /> Gateway Adapter Active
                </div>
                <div>Connected to PaymentGatewayAdapter (Razorpay / Stripe ready interface).</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCheckoutInvoice(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
              {!checkoutResult?.success && (
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-2"
                >
                  {isProcessing ? 'Connecting Gateway...' : `Confirm & Pay â‚¹${paymentAmount.toLocaleString()}`}
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptInvoice && (
        <ReceiptModal
          invoice={receiptInvoice}
          transaction={transactions.find((t) => t.invoiceId === receiptInvoice.id)}
          onClose={() => setReceiptInvoice(null)}
        />
      )}
    </div>
  );
};

