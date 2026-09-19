import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Download,
  TrendingUp,
} from 'lucide-react';
import { billingService } from '../../../services/billingService';
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

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

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

  // Modal State for Penalty / Adjustment
  const [penaltyInvoice, setPenaltyInvoice] = useState<SocietyInvoice | null>(null);
  const [penaltyType, setPenaltyType] = useState<'PENALTY' | 'SPECIAL_CONTRIBUTION' | 'OTHER'>('PENALTY');
  const [penaltyAmount, setPenaltyAmount] = useState<number>(250);
  const [penaltyReason, setPenaltyReason] = useState('');

  // Receipt Modal State
  const [receiptInvoice, setReceiptInvoice] = useState<SocietyInvoice | null>(null);

  const reloadData = () => {
    setInvoices(billingService.getInvoices(currentSocietyId));
    setCycles(billingService.getBillingCycles(currentSocietyId));
    setTransactions(billingService.getTransactions(currentSocietyId));
    setAnalytics(billingService.getAnalytics(currentSocietyId));
  };

  useEffect(() => {
    reloadData();
  }, []);

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

    billingService.recordManualPayment(
      manualInvoice.id,
      manualAmount,
      manualMethod,
      manualNotes,
      adminActor
    );

    setManualInvoice(null);
    setManualAmount(0);
    setManualNotes('');
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

  const handleRefund = async (txn: PaymentTransaction) => {
    try {
      const res = await billingService.processRefund(txn.id, txn.amount, 'Admin Initiated Refund', adminActor);
      alert(res.message);
      reloadData();
    } catch (err: any) {
      alert(err.message || 'Refund failed');
    }
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
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Society Financial Billing & Revenue Engine
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Generate monthly billing cycles, collect 9 charge components, apply penalties, mark manual payments, and view gateway transactions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportReport}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV Report
          </button>
          <button
            onClick={() => setIsCycleModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Billing Cycle
          </button>
        </div>
      </div>

      {/* Analytics Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Total Billed</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            â‚¹{analytics.totalBilled.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Total Collected</span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            â‚¹{analytics.totalCollected.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Outstanding Balance</span>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            â‚¹{analytics.totalOutstanding.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-medium text-rose-600 dark:text-rose-400">Overdue Total</span>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            â‚¹{analytics.totalOverdue.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Collection Rate</span>
          <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-5 h-5" /> {analytics.collectionPercentage}%
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
        <button
          onClick={() => setActiveTab('INVOICES')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'INVOICES'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Invoices & Collections ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('CYCLES')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'CYCLES'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Billing Cycles ({cycles.length})
        </button>
        <button
          onClick={() => setActiveTab('TRANSACTIONS')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'TRANSACTIONS'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Transactions & Gateway Logs ({transactions.length})
        </button>
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
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                { key: 'invoiceNumber', header: 'Invoice ID', render: (inv: SocietyInvoice) => <span className="font-semibold text-indigo-600 dark:text-indigo-400">{inv.invoiceNumber}</span> },
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
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
          <DataTable
            columns={[
              { key: 'transactionId', header: 'Txn ID', render: (t: PaymentTransaction) => <span className="font-semibold text-indigo-600 dark:text-indigo-400">{t.transactionId}</span> },
              { key: 'invoiceNumber', header: 'Invoice' },
              { key: 'flatResident', header: 'Flat & Resident', render: (t: PaymentTransaction) => `Flat ${t.flatCode} (${t.residentName})` },
              { key: 'amount', header: 'Amount (₹)', render: (t: PaymentTransaction) => <span className="font-bold">₹{t.amount.toLocaleString()}</span> },
              { key: 'paymentMethod', header: 'Method' },
              {
                key: 'status',
                header: 'Status',
                render: (t: PaymentTransaction) => (
                  <StatusBadge
                    variant={t.status === 'SUCCESS' ? 'success' : t.status === 'REFUNDED' ? 'purple' : 'danger'}
                    label={t.status}
                  />
                )
              },
              { key: 'gatewayReference', header: 'Gateway Ref', render: (t: PaymentTransaction) => t.gatewayReference || 'N/A' },
              {
                key: 'actions',
                header: 'Refund Action',
                render: (t: PaymentTransaction) => (
                  t.status === 'SUCCESS' ? (
                    <button
                      onClick={() => handleRefund(t)}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-semibold text-[11px]"
                    >
                      Refund
                    </button>
                  ) : null
                )
              }
            ]}
            data={transactions}
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
                  { label: 'Gateway Reference', value: t.gatewayReference || 'N/A' }
                ]}
                actions={
                  t.status === 'SUCCESS' ? (
                    <button
                      onClick={() => handleRefund(t)}
                      className="w-full py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg min-h-[44px]"
                    >
                      Process Refund
                    </button>
                  ) : undefined
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
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
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
                <label className="block font-semibold mb-1">Amount Received (â‚¹) *</label>
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
                <label className="block font-semibold mb-1">Amount (â‚¹) *</label>
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

      {/* Modal: Printable Receipt */}
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

