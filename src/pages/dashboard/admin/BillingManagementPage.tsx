import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Download,
  TrendingUp,
  FileText,
  RefreshCw,
  Receipt,
  CheckCircle,
  Printer,
  Filter,
} from 'lucide-react';
import { billingService } from '../../../services/billingService';
import { paymentRepository } from '../../../repositories/payments/PaymentRepository';
import type {
  SocietyInvoice,
  BillingCycle,
  PaymentTransaction,
  BillingAnalytics,
  InvoiceStatus,
  PaymentMethod,
} from '../../../types/billing';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ReceiptModal } from '../../../components/billing/ReceiptModal';
import { DataTable } from '../../../components/ui/DataTable';
import { MobileDataCard } from '../../../components/ui/MobileDataCard';
import { apiClient } from '../../../services/apiClient';
import { realtimeService } from '../../../services/realtimeService';
import { FileUpload } from '../../../components/ui/FileUpload';

export const BillingManagementPage: React.FC = () => {
  const currentSocietyId = 'soc-gvs';
  const adminActor = { id: 'admin-1', name: 'Mayuri Udar', role: 'SOCIETY_ADMIN' };

  const [activeTab, setActiveTab] = useState<'INVOICES' | 'CYCLES' | 'TRANSACTIONS'>('INVOICES');
  const [invoices, setInvoices] = useState<SocietyInvoice[]>([]);
  const [cycles, setCycles] = useState<BillingCycle[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [analytics, setAnalytics] = useState<BillingAnalytics>({
    totalBilled: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    totalOverdue: 0,
    collectionPercentage: 0,
  });

  // Invoice Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Transaction Filters (Part 7)
  const [txnSearch, setTxnSearch] = useState('');
  const [txnStatus, setTxnStatus] = useState<string>('ALL');
  const [txnDate, setTxnDate] = useState('');
  const [txnMinAmount, setTxnMinAmount] = useState<number | ''>('');

  // Refund Modal State (Part 9)
  const [refundTarget, setRefundTarget] = useState<PaymentTransaction | null>(null);
  const [refundReasonInput, setRefundReasonInput] = useState('Admin Authorized Refund');
  const [refundAmountInput, setRefundAmountInput] = useState<number>(0);
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

  // Modal State for New Cycle
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
  const [cycleName, setCycleName] = useState('');
  const [cycleMonth, setCycleMonth] = useState('2026-10');
  const [dueDate, setDueDate] = useState('2026-10-25');

  // Modal State for Manual Payment
  const [manualInvoice, setManualInvoice] = useState<SocietyInvoice | null>(null);
  const [manualAmount, setManualAmount] = useState<number>(0);
  const [manualMethod, setManualMethod] = useState<PaymentMethod>('CASH');
  const [manualNotes, setManualNotes] = useState('');
  const [manualReceiptUrl, setManualReceiptUrl] = useState('');

  // Modal State for Penalty / Adjustment
  const [penaltyInvoice, setPenaltyInvoice] = useState<SocietyInvoice | null>(null);
  const [penaltyType, setPenaltyType] = useState<'PENALTY' | 'SPECIAL_CONTRIBUTION' | 'OTHER'>('PENALTY');
  const [penaltyAmount, setPenaltyAmount] = useState<number>(250);
  const [penaltyReason, setPenaltyReason] = useState('');

  // Receipt Modal State
  const [receiptInvoice, setReceiptInvoice] = useState<SocietyInvoice | null>(null);
  const [receiptTxn, setReceiptTxn] = useState<PaymentTransaction | undefined>(undefined);

  const reloadData = async () => {
    try {
      const dbInvoices = await apiClient.getBillingInvoices();
      if (dbInvoices && Array.isArray(dbInvoices) && dbInvoices.length > 0) {
        const mapped: SocietyInvoice[] = dbInvoices.map((inv: any) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          societyId: inv.societyId || 'soc-gvs',
          flatId: inv.flatId || 'flat-1204',
          flatCode: inv.flat?.flatNumber ? `B-${inv.flat.flatNumber}` : 'B-1204',
          residentId: inv.residentId || 'res-1',
          residentName: inv.resident?.name || 'Vikram Joshi',
          billingCycleId: inv.cycleId || 'cycle-2026-09',
          cycleName: 'September 2026 Maintenance & Utility Bill',
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
      } else {
        setInvoices(billingService.getInvoices(currentSocietyId));
      }

      // Fetch payments from Prisma/PostgreSQL
      const dbPayments = await apiClient.getPayments(currentSocietyId);
      if (dbPayments && Array.isArray(dbPayments) && dbPayments.length > 0) {
        const mappedTxns: PaymentTransaction[] = dbPayments.map((p: any) => ({
          id: p.id,
          invoiceId: p.invoiceId || 'inv-unknown',
          invoiceNumber: p.invoice?.invoiceNumber || p.metadata?.invoiceNumber || p.invoiceId || 'INV-PAYMENT',
          societyId: p.societyId,
          flatCode: p.invoice?.flat?.flatNumber ? `B-${p.invoice.flat.flatNumber}` : 'B-1204',
          residentName: p.resident?.name || 'Resident',
          transactionId: p.razorpayPaymentId || p.razorpayOrderId || p.id,
          amount: Number(p.amount || 0),
          paymentMethod: (p.paymentMethod as any) || 'RAZORPAY',
          status: p.status === 'SUCCESS' ? 'SUCCESS' : p.status === 'REFUNDED' ? 'REFUNDED' : 'FAILED',
          gatewayReference: p.razorpayPaymentId || p.razorpayOrderId || 'N/A',
          gatewayResponseNotes: p.refundReason || p.failureReason || (p.status === 'SUCCESS' ? 'Verified by PostgreSQL/Prisma' : ''),
          paymentDate: new Date(p.createdAt).toLocaleString('en-IN'),
        }));
        setTransactions(mappedTxns);
      } else {
        setTransactions(billingService.getTransactions(currentSocietyId));
      }
    } catch {
      setInvoices(billingService.getInvoices(currentSocietyId));
      setTransactions(billingService.getTransactions(currentSocietyId));
    }
    setCycles(billingService.getBillingCycles(currentSocietyId));
    setAnalytics(billingService.getAnalytics(currentSocietyId));
  };

  useEffect(() => {
    reloadData();

    // Live Firestore payments listener for admin billing dashboard
    const unsubPayments = paymentRepository.subscribeBySociety(currentSocietyId, (livePayments) => {
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
            flatCode: p.flatCode || '',
            residentName: p.residentName || 'Resident',
            transactionId: p.razorpayPaymentId || p.id,
            amount: p.amount,
            paymentMethod: (p.paymentMethod as any) || 'RAZORPAY',
            status: p.status === 'SUCCESS' ? 'SUCCESS' : p.status === 'REFUNDED' ? 'REFUNDED' : 'FAILED',
            gatewayReference: p.razorpayPaymentId || p.razorpayOrderId || 'N/A',
            gatewayResponseNotes: p.refundReason || p.failureReason || (p.status === 'SUCCESS' ? 'Cryptographically verified via Razorpay' : ''),
            paymentDate: dateStr,
          };
        });

        setTransactions((prev) => {
          const liveIds = new Set(mappedTxns.map((t) => t.id));
          const nonDupes = prev.filter((p) => !liveIds.has(p.id) && !liveIds.has(p.transactionId));
          return [...mappedTxns, ...nonDupes];
        });
      }
    });

    const unsub = realtimeService.subscribe('*', () => {
      reloadData();
    });
    return () => {
      unsubPayments();
      unsub();
    };
  }, [currentSocietyId]);

  const handleCreateCycle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cycleName) return;

    billingService.createBillingCycle(
      {
        societyId: currentSocietyId,
        cycleName,
        cycleMonth,
        dueDate,
      },
      adminActor
    );

    setIsCycleModalOpen(false);
    setCycleName('');
    reloadData();
  };

  const handleManualPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInvoice || manualAmount <= 0) return;

    const finalNotes = manualReceiptUrl
      ? `${manualNotes ? manualNotes + ' - ' : ''}Receipt: ${manualReceiptUrl}`
      : manualNotes;

    billingService.recordManualPayment(
      manualInvoice.id,
      manualAmount,
      manualMethod,
      finalNotes,
      adminActor
    );

    setManualInvoice(null);
    setManualAmount(0);
    setManualNotes('');
    setManualReceiptUrl('');
    reloadData();
  };

  const handlePenaltySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!penaltyInvoice || penaltyAmount <= 0) return;

    billingService.applyPenaltyOrAdjustment(
      penaltyInvoice.id,
      penaltyType,
      penaltyAmount,
      penaltyReason || 'Admin Applied Charge',
      adminActor
    );

    setPenaltyInvoice(null);
    setPenaltyAmount(250);
    setPenaltyReason('');
    reloadData();
  };


  const exportReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'InvoiceNumber,FlatCode,ResidentName,TotalAmount,PaidAmount,OutstandingBalance,Status,DueDate\n' +
      invoices
        .map(
          (i) =>
            `${i.invoiceNumber},${i.flatCode},"${i.residentName}",${i.totalAmount},${i.paidAmount},${i.outstandingBalance},${i.status},${i.dueDate}`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Society_Billing_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredInvoices = invoices.filter((i) => {
    const matchesSearch =
      i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.flatCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.residentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      (t.transactionId || '').toLowerCase().includes(txnSearch.toLowerCase()) ||
      (t.invoiceNumber || '').toLowerCase().includes(txnSearch.toLowerCase()) ||
      (t.residentName || '').toLowerCase().includes(txnSearch.toLowerCase()) ||
      (t.flatCode || '').toLowerCase().includes(txnSearch.toLowerCase());
    const matchesStatus = txnStatus === 'ALL' || t.status === txnStatus;
    const matchesDate = !txnDate || (t.paymentDate && t.paymentDate.includes(txnDate));
    const matchesAmount = txnMinAmount === '' || t.amount >= Number(txnMinAmount);
    return matchesSearch && matchesStatus && matchesDate && matchesAmount;
  });

  const getStatusVariant = (status: InvoiceStatus): 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PARTIALLY_PAID':
        return 'info';
      case 'UNPAID':
        return 'warning';
      case 'OVERDUE':
      case 'FAILED':
        return 'danger';
      case 'REFUNDED':
        return 'purple';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 pb-24 space-y-4 md:space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-[#083B56] dark:text-[#83CBEA]" />
            Society Financial Billing & Revenue Engine
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Generate monthly billing cycles, collect 9 charge components, apply penalties, mark manual payments, and view gateway transactions.
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={exportReport}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV Report
          </button>
          <button
            onClick={() => setIsCycleModalOpen(true)}
            className="px-4 py-2 bg-[#083B56] hover:bg-[#176B91] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Billing Cycle
          </button>
        </div>
      </div>

      {/* Analytics Hero & 2x2 Metrics Grid */}
      <div className="space-y-3">
        {/* Hero Card: Total Billed & Collection Rate */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#083B56] to-[#176B91] text-white shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-200">Total Billed</span>
            <div className="text-2xl font-black mt-0.5">₹{analytics.totalBilled.toLocaleString()}</div>
            <div className="text-[11px] text-sky-100 mt-1">Society Collection Rate: {analytics.collectionPercentage}%</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/20 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> {analytics.collectionPercentage}%
            </span>
            <span className="text-[10px] text-sky-200">Collected</span>
          </div>
        </div>

        {/* 2x2 Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Total Collected</span>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              ₹{analytics.totalCollected.toLocaleString()}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Outstanding</span>
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              ₹{analytics.totalOutstanding.toLocaleString()}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">Overdue Total</span>
            <div className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-0.5">
              ₹{analytics.totalOverdue.toLocaleString()}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[11px] font-medium text-[#083B56] dark:text-[#83CBEA]">Recovery Status</span>
            <div className="text-lg font-bold text-[#083B56] dark:text-[#83CBEA] mt-0.5">
              {analytics.collectionPercentage >= 80 ? 'Healthy' : 'Needs Action'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div
        style={{
          background: '#EBF3F7',
          borderRadius: '16px',
          padding: '0.375rem',
          display: 'flex',
          gap: '0.375rem',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          boxShadow: 'inset 0 1px 3px rgba(8, 59, 86, 0.06)',
          marginBottom: '1.25rem',
        }}
      >
        {[
          { key: 'INVOICES', label: `Invoices & Collections (${invoices.length})`, icon: FileText },
          { key: 'CYCLES', label: `Billing Cycles (${cycles.length})`, icon: RefreshCw },
          { key: 'TRANSACTIONS', label: `Transactions & Gateway Logs (${transactions.length})`, icon: Receipt },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1rem',
                borderRadius: '12px',
                border: isActive ? 'none' : '1px solid #DCE8EF',
                background: isActive ? 'var(--aarizo-navy, #083B56)' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#475569',
                fontWeight: 700,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 3px 10px rgba(8, 59, 86, 0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
                flexShrink: 0,
              }}
            >
              <Icon size={15} color={isActive ? 'var(--aarizo-sky, #83CBEA)' : 'var(--aarizo-blue, #176B91)'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Invoices */}
      {activeTab === 'INVOICES' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search flat, resident, invoice number..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#083B56]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="py-2 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="UNPAID">UNPAID</option>
              <option value="PARTIALLY_PAID">PARTIALLY_PAID</option>
              <option value="PAID">PAID</option>
              <option value="OVERDUE">OVERDUE</option>
              <option value="FAILED">FAILED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
            <DataTable
              columns={[
                { key: 'invoiceNumber', header: 'Invoice ID', render: (inv: SocietyInvoice) => <span className="font-semibold text-[#083B56] dark:text-[#83CBEA]">{inv.invoiceNumber}</span> },
                { key: 'flatResident', header: 'Flat & Resident', render: (inv: SocietyInvoice) => `Flat ${inv.flatCode} (${inv.residentName})` },
                { key: 'totalAmount', header: 'Total (₹)', render: (inv: SocietyInvoice) => <span className="font-bold">₹{inv.totalAmount.toLocaleString()}</span> },
                { key: 'paidAmount', header: 'Paid (₹)', render: (inv: SocietyInvoice) => <span className="text-emerald-600 dark:text-emerald-400 font-semibold">₹{inv.paidAmount.toLocaleString()}</span> },
                { key: 'balance', header: 'Balance (₹)', render: (inv: SocietyInvoice) => <span className="text-rose-600 dark:text-rose-400 font-bold">₹{inv.outstandingBalance.toLocaleString()}</span> },
                { key: 'dueDate', header: 'Due Date' },
                {
                  key: 'status',
                  header: 'Status',
                  render: (inv: SocietyInvoice) => <StatusBadge variant={getStatusVariant(inv.status)} label={inv.status} />
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (inv: SocietyInvoice) => (
                    <div className="space-x-1.5 text-right">
                      <button
                        onClick={() => setReceiptInvoice(inv)}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded font-semibold text-[11px]"
                      >
                        Receipt
                      </button>

                      {inv.outstandingBalance > 0 && (
                        <>
                          <button
                            onClick={() => {
                              setManualInvoice(inv);
                              setManualAmount(inv.outstandingBalance);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-[11px]"
                          >
                            Mark Paid
                          </button>

                          <button
                            onClick={() => setPenaltyInvoice(inv)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-semibold text-[11px]"
                          >
                            + Charge
                          </button>
                        </>
                      )}
                    </div>
                  )
                }
              ]}
              data={filteredInvoices}
              keyExtractor={(inv: SocietyInvoice) => inv.id}
              pageSize={10}
              mobileRender={(inv: SocietyInvoice) => (
                <MobileDataCard
                  title={`Flat ${inv.flatCode} • ${inv.residentName}`}
                  subtitle={`Invoice #${inv.invoiceNumber} • Due: ${inv.dueDate}`}
                  status={<StatusBadge variant={getStatusVariant(inv.status)} label={inv.status} />}
                  attributes={[
                    { label: 'Total Billed', value: `₹${inv.totalAmount.toLocaleString()}` },
                    { label: 'Amount Paid', value: `₹${inv.paidAmount.toLocaleString()}` },
                    { label: 'Outstanding Balance', value: `₹${inv.outstandingBalance.toLocaleString()}` }
                  ]}
                  actions={
                    <div className="flex flex-wrap gap-2 w-full mt-2">
                      <button
                        onClick={() => setReceiptInvoice(inv)}
                        className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg min-h-[44px]"
                      >
                        Receipt
                      </button>
                      {inv.outstandingBalance > 0 && (
                        <>
                          <button
                            onClick={() => {
                              setManualInvoice(inv);
                              setManualAmount(inv.outstandingBalance);
                            }}
                            className="flex-1 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg min-h-[44px]"
                          >
                            Mark Paid
                          </button>
                          <button
                            onClick={() => setPenaltyInvoice(inv)}
                            className="flex-1 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg min-h-[44px]"
                          >
                            + Charge
                          </button>
                        </>
                      )}
                    </div>
                  }
                />
              )}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Billing Cycles */}
      {activeTab === 'CYCLES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cycles.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">{c.cycleName}</span>
                <StatusBadge variant={c.status === 'PUBLISHED' ? 'success' : 'neutral'} label={c.status} />
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <div>Cycle Month: <strong>{c.cycleMonth}</strong></div>
                <div>Payment Due Date: <strong>{c.dueDate}</strong></div>
                <div>Created At: <strong>{new Date(c.createdAt).toLocaleDateString()}</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Transactions & Refunds */}
      {activeTab === 'TRANSACTIONS' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 space-y-4">
          {/* Payment & Transaction Filters (Part 7) */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 shrink-0">
              <Filter className="w-4 h-4 text-[#176B91]" />
              <span>Payment Filters:</span>
            </div>

            {/* Resident / ID / Invoice Search */}
            <div className="flex-1 min-w-[180px] relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search Txn ID, Resident, Flat, Invoice..."
                value={txnSearch}
                onChange={(e) => setTxnSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>

            {/* Status Filter */}
            <select
              value={txnStatus}
              onChange={(e) => setTxnStatus(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="REFUNDED">Refunded</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={txnDate}
              onChange={(e) => setTxnDate(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              title="Filter by payment date"
            />

            {/* Min Amount Filter */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Min ₹:</span>
              <input
                type="number"
                placeholder="0"
                value={txnMinAmount}
                onChange={(e) => setTxnMinAmount(e.target.value ? Number(e.target.value) : '')}
                className="w-20 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>

            {(txnSearch || txnStatus !== 'ALL' || txnDate || txnMinAmount !== '') && (
              <button
                type="button"
                onClick={() => {
                  setTxnSearch('');
                  setTxnStatus('ALL');
                  setTxnDate('');
                  setTxnMinAmount('');
                }}
                className="px-2.5 py-1.5 text-rose-600 font-bold hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          <DataTable
            columns={[
              {
                key: 'transactionId',
                header: 'Txn ID',
                render: (t: PaymentTransaction) => (
                  <span className="font-semibold text-[#083B56] dark:text-[#83CBEA] font-mono select-all">
                    {t.transactionId}
                  </span>
                ),
              },
              { key: 'invoiceNumber', header: 'Invoice' },
              {
                key: 'flatResident',
                header: 'Flat & Resident',
                render: (t: PaymentTransaction) => `Flat ${t.flatCode} (${t.residentName})`,
              },
              {
                key: 'amount',
                header: 'Amount (₹)',
                render: (t: PaymentTransaction) => <span className="font-bold">₹{t.amount.toLocaleString()}</span>,
              },
              { key: 'paymentMethod', header: 'Method' },
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
              { key: 'paymentDate', header: 'Date' },
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
                        residentId: 'res-unknown',
                        residentName: t.residentName,
                        billingCycleId: 'cycle-admin',
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
                      setReceiptInvoice(matchInv);
                      setReceiptTxn(t);
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#176B91] hover:text-[#083B56] transition flex items-center gap-1 text-xs font-bold"
                    title="View & Print Official Receipt"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Receipt</span>
                  </button>
                ),
              },
              {
                key: 'actions',
                header: 'Refund Action',
                render: (t: PaymentTransaction) => (
                  t.status === 'SUCCESS' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setRefundTarget(t);
                        setRefundAmountInput(t.amount);
                        setRefundReasonInput('Admin Approved Refund / Settlement Adjustment');
                      }}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-semibold text-[11px]"
                    >
                      Refund
                    </button>
                  ) : null
                ),
              },
            ]}
            data={filteredTransactions}
            keyExtractor={(t: PaymentTransaction) => t.id}
            pageSize={10}
            mobileRender={(t: PaymentTransaction) => (
              <MobileDataCard
                title={`Txn #${t.transactionId} • Flat ${t.flatCode}`}
                subtitle={`Invoice: ${t.invoiceNumber} • Resident: ${t.residentName}`}
                status={
                  <StatusBadge
                    variant={t.status === 'SUCCESS' ? 'success' : t.status === 'REFUNDED' ? 'purple' : 'danger'}
                    label={t.status}
                  />
                }
                attributes={[
                  { label: 'Amount', value: `₹${t.amount.toLocaleString()}` },
                  { label: 'Payment Method', value: t.paymentMethod },
                  { label: 'Gateway Reference', value: t.gatewayReference || 'N/A' },
                  { label: 'Date', value: t.paymentDate },
                ]}
                actions={
                  <div className="flex items-center gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => {
                        const matchInv = invoices.find((i) => i.id === t.invoiceId || i.invoiceNumber === t.invoiceNumber) || {
                          id: t.invoiceId,
                          invoiceNumber: t.invoiceNumber || 'INV-PAID',
                          societyId: currentSocietyId,
                          flatId: 'flat-1204',
                          flatCode: t.flatCode,
                          residentId: 'res-unknown',
                          residentName: t.residentName,
                          billingCycleId: 'cycle-admin',
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
                        setReceiptInvoice(matchInv);
                        setReceiptTxn(t);
                      }}
                      className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg min-h-[44px] flex items-center justify-center gap-1"
                    >
                      <Printer className="w-4 h-4" /> Receipt
                    </button>
                    {t.status === 'SUCCESS' && (
                      <button
                        type="button"
                        onClick={() => {
                          setRefundTarget(t);
                          setRefundAmountInput(t.amount);
                          setRefundReasonInput('Admin Approved Refund / Settlement Adjustment');
                        }}
                        className="flex-1 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg min-h-[44px]"
                      >
                        Process Refund
                      </button>
                    )}
                  </div>
                }
              />
            )}
          />
        </div>
      )}


      {/* Modal: New Billing Cycle */}
      {isCycleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCycle}
            className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-4 md:p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-xl"
          >
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Create New Billing Cycle</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Cycle Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. October 2026 Maintenance Bill"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  value={cycleName}
                  onChange={(e) => setCycleName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Cycle Month</label>
                  <input
                    type="month"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    value={cycleMonth}
                    onChange={(e) => setCycleMonth(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCycleModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#083B56] hover:bg-[#176B91] text-white rounded-lg text-xs font-semibold"
              >
                Publish Cycle & Generate Invoices
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Manual Offline Payment */}
      {manualInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleManualPaymentSubmit}
            className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-4 md:p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-xl"
          >
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Mark Manual Offline Payment - Flat {manualInvoice.flatCode}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Amount Received (₹) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={manualInvoice.outstandingBalance}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Payment Method *</label>
                <select
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  value={manualMethod}
                  onChange={(e) => setManualMethod(e.target.value as PaymentMethod)}
                >
                  <option value="CASH">Cash</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                  <option value="UPI">UPI Direct</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Cheque No / Reference Notes</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Cheque #009210"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Cheque / NEFT Counterfoil Photo (Optional)
                </label>
                <FileUpload
                  category="receipts"
                  label="Upload Bank Cheque Photo or NEFT Counterfoil"
                  onUploadSuccess={(url: string) => {
                    setManualReceiptUrl(url);
                  }}
                />
                {manualReceiptUrl && (
                  <div className="mt-1 text-emerald-600 flex items-center gap-1 font-medium text-[11px]">
                    <CheckCircle size={12} />
                    <span>Receipt proof attached</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setManualInvoice(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
              >
                Record Payment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Penalty or Adjustment */}
      {penaltyInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handlePenaltySubmit}
            className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-4 md:p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-xl"
          >
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Apply Charge / Penalty - Flat {penaltyInvoice.flatCode}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Charge Type</label>
                <select
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  value={penaltyType}
                  onChange={(e) => setPenaltyType(e.target.value as any)}
                >
                  <option value="PENALTY">Late Penalty Charge</option>
                  <option value="SPECIAL_CONTRIBUTION">Special Contribution Fund</option>
                  <option value="OTHER">Other Adjustment</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  value={penaltyAmount}
                  onChange={(e) => setPenaltyAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Reason / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Overdue payment penalty"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  value={penaltyReason}
                  onChange={(e) => setPenaltyReason(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPenaltyInvoice(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
              >
                Apply Charge
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Admin Refund Processor (Part 9) */}
      {refundTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setIsProcessingRefund(true);
              try {
                const res = await billingService.processRefund(
                  refundTarget.id,
                  refundAmountInput,
                  refundReasonInput,
                  adminActor
                );
                alert(res.message || 'Refund successfully processed.');
                setRefundTarget(null);
                reloadData();
              } catch (err: any) {
                alert(err?.message || 'Refund failed');
              } finally {
                setIsProcessingRefund(false);
              }
            }}
            className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 border border-slate-200 dark:border-slate-700 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Process Razorpay Refund
              </h3>
              <button
                type="button"
                onClick={() => setRefundTarget(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs space-y-1">
              <div>Transaction ID: <span className="font-mono font-bold text-[#176B91]">{refundTarget.transactionId}</span></div>
              <div>Resident: <strong>{refundTarget.residentName} (Flat {refundTarget.flatCode})</strong></div>
              <div>Invoice: <strong>{refundTarget.invoiceNumber}</strong></div>
              <div>Original Amount Paid: <strong className="text-emerald-600">₹{refundTarget.amount.toLocaleString()}</strong></div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Refund Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={refundTarget.amount}
                  value={refundAmountInput}
                  onChange={(e) => setRefundAmountInput(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Reason for Refund *</label>
                <input
                  type="text"
                  required
                  value={refundReasonInput}
                  onChange={(e) => setRefundReasonInput(e.target.value)}
                  placeholder="e.g. Duplicate transaction or billing dispute adjustment"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setRefundTarget(null)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessingRefund}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
              >
                {isProcessingRefund ? 'Processing via Razorpay...' : `Confirm Refund of ₹${refundAmountInput}`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Printable Receipt */}
      {receiptInvoice && (
        <ReceiptModal
          invoice={receiptInvoice}
          transaction={receiptTxn || transactions.find((t) => t.invoiceId === receiptInvoice.id)}
          onClose={() => {
            setReceiptInvoice(null);
            setReceiptTxn(undefined);
          }}
        />
      )}
    </div>
  );
};


