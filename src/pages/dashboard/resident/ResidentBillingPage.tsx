import React, { useState, useEffect } from 'react';
import { CreditCard, FileText, CheckCircle, History, UploadCloud, Printer } from 'lucide-react';
import { billingService } from '../../../services/billingService';
import { realtimeService } from '../../../services/realtimeService';
import { paymentRepository } from '../../../repositories/payments/PaymentRepository';
import { useAuth } from '../../../context/AuthContext';
import type { SocietyInvoice, PaymentTransaction } from '../../../types/billing';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ReceiptModal } from '../../../components/billing/ReceiptModal';
import { DataTable } from '../../../components/ui/DataTable';
import { MobileDataCard } from '../../../components/ui/MobileDataCard';
import { RazorpayCheckoutModal } from '../../../domains/payments/RazorpayCheckoutModal';
import { apiClient } from '../../../services/apiClient';
import { RealtimeSyncBadge, FileUploader } from '../../../components/common';
import { Modal } from '../../../components/ui/Modal';
import { AdvertisementPopup } from '../../../components/ads/AdvertisementPopup';
import { OffersLauncherPill } from '../../../components/ads/OffersLauncherPill';

const formatINR = (amt: number): string => `₹${Number(amt || 0).toLocaleString('en-IN')}`;

export const ResidentBillingPage: React.FC = () => {
  const { currentUser } = useAuth();
  const currentSocietyId = currentUser?.societyId || 'soc-gvs';
  const currentResident = {
    id: currentUser?.uid || currentUser?.id || 'res-1',
    name: currentUser?.name || 'Vikram Joshi',
    flatCode: (currentUser as any)?.flatNumber ? `B-${(currentUser as any).flatNumber}` : 'B-1204',
    flatId: 'flat-1204',
    role: currentUser?.role || 'resident',
    email: currentUser?.email || 'resident@aarizo.com',
    phone: currentUser?.phone || '9876543210',
  };

  const [invoices, setInvoices] = useState<SocietyInvoice[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);

  // Online Checkout Modal State
  const [checkoutInvoice, setCheckoutInvoice] = useState<SocietyInvoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  // Offline Payment Slip Modal State
  const [isOfflineSlipModalOpen, setIsOfflineSlipModalOpen] = useState(false);
  const [offlineSlipUrl, setOfflineSlipUrl] = useState('');
  const [offlineSlipFilename, setOfflineSlipFilename] = useState('');
  const [offlineSlipNotes, setOfflineSlipNotes] = useState('');
  const [isAdOpen, setIsAdOpen] = useState(false);

  // Receipt Modal State
  const [receiptInvoice, setReceiptInvoice] = useState<SocietyInvoice | null>(null);
  const [receiptTransaction, setReceiptTransaction] = useState<PaymentTransaction | undefined>(undefined);

  const reloadData = async () => {
    try {
      const dbInvoices = await apiClient.getBillingInvoices();
      if (dbInvoices && Array.isArray(dbInvoices) && dbInvoices.length > 0) {
        const mapped: SocietyInvoice[] = dbInvoices.map((inv: any) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          societyId: inv.societyId || currentSocietyId,
          flatId: inv.flatId || 'flat-1204',
          flatCode: inv.flat?.flatNumber ? `B-${inv.flat.flatNumber}` : currentResident.flatCode,
          residentId: inv.residentId || currentResident.id,
          residentName: inv.resident?.name || currentResident.name,
          billingCycleId: inv.cycleId || 'cycle-2026-09',
          cycleName: 'Society Maintenance & Utility Bill',
          lineItems: [
            { id: 'li-1', component: 'MAINTENANCE', description: 'Monthly Society Maintenance Fee', amount: Number(inv.maintenanceAmount || 0) },
            { id: 'li-2', component: 'WATER', description: 'Water & Common Utility Charges', amount: Number(inv.utilityAmount || 0) },
          ],
          totalAmount: Number(inv.totalAmount || 0),
          paidAmount: Number(inv.paidAmount || 0),
          outstandingBalance: inv.status === 'PAID' ? 0 : Number(inv.totalAmount || 0) - Number(inv.paidAmount || 0),
          status: inv.status as any,
          dueDate: new Date(inv.dueDate).toISOString().split('T')[0],
          createdAt: new Date(inv.createdAt).toISOString(),
          updatedAt: new Date(inv.updatedAt).toISOString(),
        }));
        setInvoices(mapped);
      }

      // Fetch payment ledger records directly from Prisma / PostgreSQL
      const dbPayments = await apiClient.getPayments(currentSocietyId);
      if (dbPayments && Array.isArray(dbPayments) && dbPayments.length > 0) {
        const mappedTxns: PaymentTransaction[] = dbPayments.map((p: any) => ({
          id: p.id,
          invoiceId: p.invoiceId || 'inv-unknown',
          invoiceNumber: p.invoice?.invoiceNumber || p.metadata?.invoiceNumber || p.invoiceId || 'INV-SETTLED',
          societyId: p.societyId,
          flatCode: currentResident.flatCode,
          residentName: p.resident?.name || currentResident.name,
          transactionId: p.razorpayPaymentId || p.razorpayOrderId || p.id,
          amount: Number(p.amount || 0),
          paymentMethod: (p.paymentMethod as any) || 'RAZORPAY',
          status: p.status === 'SUCCESS' ? 'SUCCESS' : p.status === 'REFUNDED' ? 'REFUNDED' : 'FAILED',
          gatewayReference: p.razorpayPaymentId || p.razorpayOrderId || 'N/A',
          gatewayResponseNotes: p.failureReason || (p.status === 'SUCCESS' ? 'Verified by PostgreSQL/Prisma' : ''),
          paymentDate: new Date(p.createdAt).toLocaleString('en-IN'),
        }));
        setTransactions(mappedTxns);
        return;
      }
    } catch (e) {
      // Fallback
    }

    const invList = billingService
      .getInvoices(currentSocietyId)
      .filter((i) => i.flatCode === currentResident.flatCode || i.residentId === currentResident.id);
    const txnList = billingService
      .getTransactions(currentSocietyId)
      .filter((t) => t.flatCode === currentResident.flatCode || t.residentName === currentResident.name);

    setInvoices((prev) => (prev.length > 0 ? prev : invList));
    setTransactions((prev) => (prev.length > 0 ? prev : txnList));
  };

  useEffect(() => {
    reloadData();

    // 1. Live Firestore real-time billing listener
    const unsubFirestore = billingService.subscribeInvoices(currentSocietyId, (liveInvoices) => {
      if (liveInvoices && liveInvoices.length > 0) {
        const filtered = liveInvoices.filter(
          (i) => i.flatCode === currentResident.flatCode || i.residentId === currentResident.id
        );
        if (filtered.length > 0) {
          setInvoices(filtered);
        }
      }
    });

    // 2. Live Firestore payments listener for real-time history sync
    const unsubPayments = paymentRepository.subscribeByResident(currentResident.id, (livePayments) => {
      if (livePayments && livePayments.length > 0) {
        const mappedTxns: PaymentTransaction[] = livePayments.map((p) => {
          let dateStr = new Date().toLocaleString('en-IN');
          if (p.createdAt) {
            try {
              dateStr = typeof p.createdAt?.toDate === 'function'
                ? p.createdAt.toDate().toLocaleString('en-IN')
                : new Date(p.createdAt).toLocaleString('en-IN');
            } catch {
              dateStr = new Date().toLocaleString('en-IN');
            }
          }
          return {
            id: p.id,
            invoiceId: p.invoiceId,
            invoiceNumber: p.invoiceNumber || p.invoiceId,
            societyId: p.societyId,
            flatCode: p.flatCode || currentResident.flatCode,
            residentName: p.residentName || currentResident.name,
            transactionId: p.razorpayPaymentId || p.id,
            amount: p.amount,
            paymentMethod: (p.paymentMethod as any) || 'RAZORPAY',
            status: p.status === 'SUCCESS' ? 'SUCCESS' : p.status === 'REFUNDED' ? 'REFUNDED' : 'FAILED',
            gatewayReference: p.razorpayPaymentId || p.razorpayOrderId || 'N/A',
            gatewayResponseNotes: p.failureReason || (p.status === 'SUCCESS' ? 'Verified by Razorpay server' : ''),
            paymentDate: dateStr,
          };
        });

        // Combine live payments with any local ledger transactions avoiding duplicate IDs
        setTransactions((prev) => {
          const liveIds = new Set(mappedTxns.map((t) => t.id));
          const nonDupes = prev.filter((p) => !liveIds.has(p.id) && !liveIds.has(p.transactionId));
          return [...mappedTxns, ...nonDupes];
        });
      }
    });

    const unsub = realtimeService.subscribe('*', (msg) => {
      if (['PAYMENT_COMPLETED', 'BILLING_UPDATED', 'INVOICE_GENERATED', 'OFFLINE_PAYMENT_LOGGED'].includes(msg.topic)) {
        reloadData();
      }
    });

    return () => {
      unsubFirestore();
      unsubPayments();
      unsub();
    };
  }, [currentResident.id, currentSocietyId]);

  const activeInvoice = invoices.find((i) => i.outstandingBalance > 0) || invoices[0];

  const handleOpenReceipt = (invoice: SocietyInvoice, txn?: PaymentTransaction) => {
    setReceiptInvoice(invoice);
    setReceiptTransaction(txn);
  };

  return (
    <div className="p-3 sm:p-6 pb-24 space-y-4 md:space-y-6 max-w-6xl mx-auto font-sans text-slate-800">
      {/* Aarizo Gradient Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          color: '#FFFFFF',
          boxShadow: '0 4px 16px rgba(8, 59, 86, 0.08)',
        }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6" style={{ color: 'var(--aarizo-sky, #83CBEA)' }} />
            <h1 className="text-lg sm:text-xl font-bold text-white">Society Billing &amp; Maintenance Dues</h1>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--aarizo-sky, #83CBEA)' }}>
            View current maintenance bill breakdown for Flat {currentResident.flatCode}, pay online via Razorpay, and download tax receipts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RealtimeSyncBadge state="live" label="Live Razorpay Sync" />
          <span className="px-3.5 py-1.5 bg-white/10 border border-white/20 text-white rounded-full text-xs font-bold">
            Flat {currentResident.flatCode}
          </span>
        </div>
      </div>

      {/* Active Bill Hero Card */}
      {activeInvoice && (
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-200">
            <div>
              <span className="text-xs font-bold text-[#176B91] uppercase tracking-wider">
                {activeInvoice.cycleName}
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
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
                onClick={() => handleOpenReceipt(activeInvoice)}
                style={{ background: '#F1F5F9', color: '#1E293B' }}
                className="px-3.5 py-2 font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-slate-200 hover:bg-slate-200 transition-colors shadow-sm"
              >
                <FileText className="w-4 h-4 text-[#176B91]" /> View Tax Receipt
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
                    <th className="p-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-800 dark:text-slate-200">
                  {activeInvoice.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="p-3 font-semibold text-[#176B91] dark:text-sky-400">{item.component}</td>
                      <td className="p-3">{item.description}</td>
                      <td className="p-3 text-right font-semibold text-slate-900 dark:text-white">{formatINR(item.amount)}</td>
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
                <span>Total Bill: <strong className="text-slate-900 dark:text-white">{formatINR(activeInvoice.totalAmount)}</strong></span>
                <span>Paid So Far: <strong className="text-emerald-600">{formatINR(activeInvoice.paidAmount)}</strong></span>
              </div>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                Outstanding Dues: <span className="text-rose-600 dark:text-rose-400 font-black">{formatINR(activeInvoice.outstandingBalance)}</span>
              </div>
            </div>

            {activeInvoice.outstandingBalance > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOfflineSlipModalOpen(true)}
                  className="px-4 py-3 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-300 bg-white hover:bg-slate-100 transition-all text-slate-700 shadow-sm"
                >
                  <UploadCloud className="w-4 h-4 text-[#176B91]" /> Upload Bank Slip
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCheckoutInvoice(activeInvoice);
                    setPaymentAmount(activeInvoice.outstandingBalance);
                  }}
                  style={{ background: '#059669', color: '#FFFFFF' }}
                  className="w-full sm:w-auto px-6 py-3 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:brightness-110 active:scale-95"
                >
                  <CreditCard className="w-4 h-4" /> PAY ONLINE VIA RAZORPAY
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                <CheckCircle className="w-5 h-5" /> ALL DUES PAID IN FULL
              </div>
            )}
          </div>
        </div>
      )}

      {/* Past Invoices & Payment History */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <History className="w-5 h-5 text-[#176B91]" /> Payment History &amp; Official Receipts
          </h2>
          <span className="text-xs text-slate-400">Live sync from Firestore</span>
        </div>

        <div className="mt-4">
          <DataTable
            columns={[
              {
                key: 'paymentDate',
                header: 'Date',
                render: (t: PaymentTransaction) => <span className="text-xs text-slate-600">{t.paymentDate}</span>,
              },
              {
                key: 'invoiceNumber',
                header: 'Invoice',
                render: (t: PaymentTransaction) => (
                  <span className="font-semibold text-slate-800">{t.invoiceNumber || 'INV-DUE'}</span>
                ),
              },
              {
                key: 'amount',
                header: 'Amount (₹)',
                render: (t: PaymentTransaction) => <span className="font-extrabold text-slate-900">{formatINR(t.amount)}</span>,
              },
              {
                key: 'paymentMethod',
                header: 'Method',
                render: (t: PaymentTransaction) => (
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono text-[11px] font-bold text-slate-700">
                    {t.paymentMethod}
                  </span>
                ),
              },
              {
                key: 'transactionId',
                header: 'Transaction ID',
                render: (t: PaymentTransaction) => (
                  <span className="font-mono text-xs text-[#176B91] select-all font-semibold">
                    {t.transactionId}
                  </span>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (t: PaymentTransaction) => (
                  <StatusBadge
                    variant={t.status === 'SUCCESS' ? 'success' : t.status === 'REFUNDED' ? 'purple' : 'danger'}
                    label={t.status}
                  />
                ),
              },
              {
                key: 'receipt',
                header: 'Receipt',
                render: (t: PaymentTransaction) => (
                  <button
                    type="button"
                    onClick={() => {
                      const matchInv = invoices.find((i) => i.id === t.invoiceId || i.invoiceNumber === t.invoiceNumber) || {
                        id: t.invoiceId,
                        invoiceNumber: t.invoiceNumber || 'INV-PAID',
                        societyId: currentSocietyId,
                        flatId: 'flat-1204',
                        flatCode: t.flatCode,
                        residentId: currentResident.id,
                        residentName: t.residentName,
                        billingCycleId: 'cycle-hist',
                        cycleName: 'Society Maintenance Dues',
                        lineItems: [{ id: 'li-1', component: 'MAINTENANCE', description: 'Maintenance Dues', amount: t.amount }],
                        totalAmount: t.amount,
                        paidAmount: t.amount,
                        outstandingBalance: 0,
                        status: 'PAID',
                        dueDate: t.paymentDate,
                        createdAt: t.paymentDate,
                        updatedAt: t.paymentDate,
                      };
                      handleOpenReceipt(matchInv, t);
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#176B91] hover:text-[#083B56] transition flex items-center gap-1 text-xs font-bold"
                    title="View & Print Official Receipt"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Receipt</span>
                  </button>
                ),
              },
            ]}
            data={transactions}
            keyExtractor={(t: PaymentTransaction) => t.id}
            pageSize={10}
            mobileRender={(t: PaymentTransaction) => (
              <MobileDataCard
                title={`Payment ${formatINR(t.amount)}`}
                subtitle={`Invoice: ${t.invoiceNumber} • ${t.paymentDate}`}
                status={
                  <StatusBadge
                    variant={t.status === 'SUCCESS' ? 'success' : t.status === 'REFUNDED' ? 'purple' : 'danger'}
                    label={t.status}
                  />
                }
                attributes={[
                  { label: 'Method', value: t.paymentMethod },
                  { label: 'Amount', value: `₹${t.amount.toLocaleString()}` },
                  { label: 'Txn ID', value: t.transactionId },
                  { label: 'Date', value: t.paymentDate },
                ]}
                actions={
                  <button
                    type="button"
                    onClick={() => {
                      const matchInv = invoices.find((i) => i.id === t.invoiceId || i.invoiceNumber === t.invoiceNumber) || {
                        id: t.invoiceId,
                        invoiceNumber: t.invoiceNumber || 'INV-PAID',
                        societyId: currentSocietyId,
                        flatId: 'flat-1204',
                        flatCode: t.flatCode,
                        residentId: currentResident.id,
                        residentName: t.residentName,
                        billingCycleId: 'cycle-hist',
                        cycleName: 'Society Maintenance Dues',
                        lineItems: [{ id: 'li-1', component: 'MAINTENANCE', description: 'Maintenance Dues', amount: t.amount }],
                        totalAmount: t.amount,
                        paidAmount: t.amount,
                        outstandingBalance: 0,
                        status: 'PAID',
                        dueDate: t.paymentDate,
                        createdAt: t.paymentDate,
                        updatedAt: t.paymentDate,
                      };
                      handleOpenReceipt(matchInv, t);
                    }}
                    className="w-full py-2 bg-slate-100 text-[#176B91] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" /> View / Print Receipt
                  </button>
                }
              />
            )}
          />
        </div>
      </div>

      {/* Razorpay Payment Modal */}
      {checkoutInvoice && (
        <RazorpayCheckoutModal
          isOpen={!!checkoutInvoice}
          onClose={() => setCheckoutInvoice(null)}
          amount={paymentAmount || checkoutInvoice.outstandingBalance}
          purpose={checkoutInvoice.cycleName}
          invoiceNumber={checkoutInvoice.invoiceNumber}
          invoiceId={checkoutInvoice.id}
          userPhone={currentResident.phone}
          userEmail={currentResident.email}
          userName={currentResident.name}
          flatCode={currentResident.flatCode}
          onSuccess={async (paymentDetails) => {
            // Cryptographic server verification already performed inside RazorpayService.executeCheckout
            // Also notify local billing service for ledger consistency
            try {
              await billingService.processOnlinePayment(
                checkoutInvoice.id,
                paymentDetails.amount,
                currentResident
              );
            } catch (err) {
              console.warn('[ResidentBilling] Local ledger update note:', err);
            }
            reloadData();
            setCheckoutInvoice(null);
          }}
        />
      )}

      {/* Offline Slip Upload Modal */}
      {isOfflineSlipModalOpen && activeInvoice && (
        <Modal
          isOpen={isOfflineSlipModalOpen}
          onClose={() => setIsOfflineSlipModalOpen(false)}
          title={`Upload Offline Payment Receipt · Invoice #${activeInvoice.invoiceNumber}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Paid via NEFT, IMPS, UPI direct transfer, or physical Cheque? Upload your bank counterfoil or payment screenshot for society office reconciliation.
            </p>

            <FileUploader
              label="Bank Transfer Counterfoil / Cheque Copy (PDF or Photo)"
              entityType="resident"
              entityId="flat-1204"
              societyId={currentSocietyId}
              onUploadSuccess={(res) => {
                setOfflineSlipUrl(res.downloadUrl);
                setOfflineSlipFilename(res.name);
              }}
              onRemove={() => {
                setOfflineSlipUrl('');
                setOfflineSlipFilename('');
              }}
            />

            {offlineSlipUrl && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                <span>Receipt Uploaded: <strong>{offlineSlipFilename || 'slip.pdf'}</strong></span>
                <a href={offlineSlipUrl} target="_blank" rel="noreferrer" className="text-[#176B91] underline font-bold">Preview</a>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Ref / Cheque No. &amp; Notes</label>
              <textarea
                rows={2}
                value={offlineSlipNotes}
                onChange={(e) => setOfflineSlipNotes(e.target.value)}
                placeholder="e.g. UTR # 4291829012 deposited in HDFC Society A/c on 02 Oct"
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsOfflineSlipModalOpen(false)}
                className="px-4 py-2 border rounded-xl text-xs text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!offlineSlipUrl}
                onClick={() => {
                  realtimeService.publish(
                    'OFFLINE_PAYMENT_LOGGED',
                    {
                      invoiceId: activeInvoice.id,
                      invoiceNumber: activeInvoice.invoiceNumber,
                      flatCode: currentResident.flatCode,
                      residentName: currentResident.name,
                      documentUrl: offlineSlipUrl,
                      notes: offlineSlipNotes,
                    },
                    currentSocietyId,
                    'RESIDENT'
                  );
                  alert('Bank payment slip submitted! Society accountant will verify and issue official tax receipt.');
                  setIsOfflineSlipModalOpen(false);
                  setOfflineSlipUrl('');
                  setOfflineSlipNotes('');
                }}
                className={`px-4 py-2 text-white font-bold rounded-xl text-xs transition-all ${
                  offlineSlipUrl ? 'bg-[#083B56] hover:bg-[#176B91]' : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                Submit for Verification
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Official Receipt Modal */}
      {receiptInvoice && (
        <ReceiptModal
          invoice={receiptInvoice}
          transaction={receiptTransaction || transactions.find((t) => t.invoiceId === receiptInvoice.id)}
          onClose={() => {
            setReceiptInvoice(null);
            setReceiptTransaction(undefined);
          }}
        />
      )}

      {/* Society Partner Discounts Launcher & Modal */}
      <OffersLauncherPill onClick={() => setIsAdOpen(true)} label="Utility & Home Insurance Deals" />
      <AdvertisementPopup isOpen={isAdOpen} onClose={() => setIsAdOpen(false)} />
    </div>
  );
};

export default ResidentBillingPage;
