import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  FileText,
  Paperclip,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  PieChart as PieChartIcon,
  Building,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Edit,
} from 'lucide-react';
import { societyExpenseEngine } from '../services/societyExpenseEngine';
import type {
  SocietyExpense,
  Budget,
  ExpenseCategory,
  ExpenseStatus,
  ExpenseSummary,
  VendorInvoice,
} from '../types';
import { DataTable } from '../../../components/ui/DataTable';
import { MobileDataCard } from '../../../components/ui/MobileDataCard';

interface SocietyExpenseHubProps {
  userRole?: 'SOCIETY_ADMIN' | 'COMMITTEE_MEMBER' | 'FACILITY_MANAGER' | 'SUPER_ADMIN';
}

export const SocietyExpenseHub: React.FC<SocietyExpenseHubProps> = ({
  userRole = 'SOCIETY_ADMIN',
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'EXPENSES' | 'BUDGET' | 'ANALYTICS'>('OVERVIEW');
  const [expenses, setExpenses] = useState<SocietyExpense[]>([]);
  const [budget, setBudget] = useState<Budget | undefined>(undefined);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<ExpenseStatus | 'ALL'>('ALL');

  // Modal States
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<VendorInvoice | null>(null);

  // Expense Form State
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('utilities');
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseDate, setExpenseDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [expenseVendor, setExpenseVendor] = useState('');

  // Invoice Form State
  const [attachInvoice, setAttachInvoice] = useState(false);
  const [invoiceNum, setInvoiceNum] = useState('');
  const [invoiceDueDate, setInvoiceDueDate] = useState('');
  const [invoiceUrl, setInvoiceUrl] = useState('');

  // Budget Edit Form State
  const [budgetCategories, setBudgetCategories] = useState<
    { category: ExpenseCategory; allocatedAmount: number }[]
  >([
    { category: 'utilities', allocatedAmount: 160000 },
    { category: 'staff', allocatedAmount: 120000 },
    { category: 'maintenance', allocatedAmount: 50000 },
    { category: 'repair', allocatedAmount: 30000 },
    { category: 'AMC', allocatedAmount: 90000 },
    { category: 'security', allocatedAmount: 185000 },
    { category: 'events', allocatedAmount: 25000 },
    { category: 'cleaning', allocatedAmount: 25000 },
    { category: 'other', allocatedAmount: 15000 },
  ]);

  const refreshData = () => {
    const list = societyExpenseEngine.getExpenses({
      category: selectedCategory,
      status: selectedStatus,
      searchQuery,
    });
    setExpenses(list);
    setBudget(societyExpenseEngine.getCurrentBudget());
    setSummary(societyExpenseEngine.getExpenseSummary());
  };

  useEffect(() => {
    refreshData();
  }, [selectedCategory, selectedStatus, searchQuery]);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle || expenseAmount <= 0) return;

    let invoiceObj: VendorInvoice | undefined = undefined;
    if (attachInvoice && invoiceNum) {
      invoiceObj = {
        id: `inv-${Date.now()}`,
        invoiceNumber: invoiceNum,
        vendorName: expenseVendor || 'Direct Vendor',
        invoiceDate: expenseDate,
        dueDate: invoiceDueDate || expenseDate,
        amount: expenseAmount,
        documentUrl: invoiceUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
      };
    }

    societyExpenseEngine.createExpense({
      societyId: 'soc-gvs',
      title: expenseTitle,
      description: expenseDesc,
      category: expenseCategory,
      amount: Number(expenseAmount),
      expenseDate: expenseDate,
      vendorName: expenseVendor,
      invoice: invoiceObj,
      status: 'PENDING_APPROVAL',
      createdBy: 'user-current',
      createdByName: userRole === 'COMMITTEE_MEMBER' ? 'Committee Member' : 'Mayuri Udar (Admin)',
    });

    setIsExpenseModalOpen(false);
    resetExpenseForm();
    refreshData();
  };

  const resetExpenseForm = () => {
    setExpenseTitle('');
    setExpenseDesc('');
    setExpenseCategory('utilities');
    setExpenseAmount(0);
    setExpenseVendor('');
    setAttachInvoice(false);
    setInvoiceNum('');
    setInvoiceDueDate('');
    setInvoiceUrl('');
  };

  const handleApproveExpense = (id: string, isApproved: boolean) => {
    societyExpenseEngine.approveExpense(
      id,
      'committee-user',
      'Rajesh Kumar (Treasurer)',
      isApproved ? 'APPROVED' : 'REJECTED'
    );
    refreshData();
  };

  const handleMarkPaid = (id: string) => {
    const ref = prompt('Enter payment transaction reference (e.g. UPI/NEFT ID):', 'NEFT/2026/BANK-882');
    if (ref) {
      societyExpenseEngine.markExpensePaid(id, ref);
      refreshData();
    }
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    societyExpenseEngine.saveBudget({
      societyId: 'soc-gvs',
      title: 'September 2026 Revised Budget',
      fiscalYear: '2026-2027',
      period: 'MONTHLY',
      month: '2026-09',
      totalAllocated: budgetCategories.reduce((a, b) => a + Number(b.allocatedAmount || 0), 0),
      categories: budgetCategories,
      status: 'APPROVED',
      createdBy: 'committee-user',
      createdByName: 'Rajesh Kumar (Treasurer)',
    });
    setIsBudgetModalOpen(false);
    refreshData();
  };

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
      amt
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #DCE8EF',
          padding: '0.875rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          boxShadow: '0 2px 6px rgba(8,59,86,0.03)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#083B56', margin: 0 }}>
              Society Expense &amp; Budget Management
            </h2>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '0.15rem 0.5rem', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
              Active Module
            </span>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#657785', margin: '0.2rem 0 0' }}>
            Operational spending, vendor payouts &amp; budget variance
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {userRole !== 'COMMITTEE_MEMBER' && (
            <button
              type="button"
              onClick={() => setIsExpenseModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.8rem',
                background: '#176B91',
                color: '#ffffff',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                border: 'none',
                boxShadow: '0 2px 6px rgba(23,107,145,0.2)',
              }}
            >
              <Plus size={14} /> Record Expense
            </button>
          )}

          {(userRole === 'COMMITTEE_MEMBER' || userRole === 'SOCIETY_ADMIN') && (
            <button
              type="button"
              onClick={() => setIsBudgetModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.8rem',
                background: '#083B56',
                color: '#ffffff',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                border: 'none',
                boxShadow: '0 2px 6px rgba(8,59,86,0.15)',
              }}
            >
              <Edit size={13} /> Configure Budget
            </button>
          )}
        </div>
      </div>

      {/* Overview KPI Stat Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem' }}>
          {/* Card 1: Total Allocated Budget */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #DCE8EF', padding: '0.875rem', boxShadow: '0 2px 6px rgba(8,59,86,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#657785', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>Allocated Budget</p>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#083B56', marginTop: '0.2rem', lineHeight: 1.1 }}>{formatCurrency(summary.totalBudget)}</div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#EBF5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building size={18} color="#176B91" />
              </div>
            </div>
            <p style={{ fontSize: '0.6875rem', color: '#8B9AA5', margin: '0.35rem 0 0', fontWeight: 500 }}>Sept 2026 Fiscal</p>
          </div>

          {/* Card 2: Actual Expenses */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #DCE8EF', padding: '0.875rem', boxShadow: '0 2px 6px rgba(8,59,86,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#657785', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>Actual Expenses</p>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#083B56', marginTop: '0.2rem', lineHeight: 1.1 }}>{formatCurrency(summary.totalActual)}</div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <DollarSign size={18} color="#059669" />
              </div>
            </div>
            <p style={{ fontSize: '0.6875rem', color: '#059669', margin: '0.35rem 0 0', fontWeight: 700 }}>
              {Math.round((summary.totalActual / (summary.totalBudget || 1)) * 100)}% Utilized
            </p>
          </div>

          {/* Card 3: Net Variance */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #DCE8EF', padding: '0.875rem', boxShadow: '0 2px 6px rgba(8,59,86,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#657785', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>Net Variance</p>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: summary.isOverBudget ? '#E11D48' : '#059669', marginTop: '0.2rem', lineHeight: 1.1 }}>
                  {summary.totalVariance >= 0 ? '+' : ''}{formatCurrency(summary.totalVariance)}
                </div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: '10px', background: summary.isOverBudget ? '#FFF0F1' : '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {summary.isOverBudget ? <ArrowUpRight size={18} color="#E11D48" /> : <ArrowDownRight size={18} color="#059669" />}
              </div>
            </div>
            <p style={{ fontSize: '0.6875rem', color: summary.isOverBudget ? '#E11D48' : '#059669', margin: '0.35rem 0 0', fontWeight: 600 }}>
              {summary.isOverBudget ? '⚠️ Exceeded' : '✓ Under Budget'}
            </p>
          </div>

          {/* Card 4: Pending Claims */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #DCE8EF', padding: '0.875rem', boxShadow: '0 2px 6px rgba(8,59,86,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#657785', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>Pending Claims</p>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#D97706', marginTop: '0.2rem', lineHeight: 1.1 }}>
                  {expenses.filter((e) => e.status === 'PENDING_APPROVAL').length}
                </div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={18} color="#D97706" />
              </div>
            </div>
            <p style={{ fontSize: '0.6875rem', color: '#D97706', margin: '0.35rem 0 0', fontWeight: 600 }}>Requires Review</p>
          </div>
        </div>
      )}

      {/* Tabs Bar - Scrollable Pills */}
      <div
        style={{
          display: 'flex',
          gap: '0.35rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          scrollbarWidth: 'none',
        }}
      >
        {[
          { key: 'OVERVIEW', label: 'Budget vs Actual', icon: PieChartIcon },
          { key: 'EXPENSES', label: 'Expense Audit', icon: FileText },
          { key: 'BUDGET', label: 'Breakdown', icon: Layers },
          { key: 'ANALYTICS', label: 'Analytics', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.55rem 0.875rem',
                borderRadius: '10px',
                background: active ? '#083B56' : '#ffffff',
                color: active ? '#ffffff' : '#657785',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                boxShadow: active ? '0 2px 8px rgba(8,59,86,0.25)' : '0 1px 3px rgba(8,59,86,0.08)',
                border: active ? 'none' : '1px solid #DCE8EF',
                flexShrink: 0,
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & VARIANCE */}
      {activeTab === 'OVERVIEW' && summary && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE8EF', padding: '1rem', boxShadow: '0 2px 6px rgba(8,59,86,0.03)' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#083B56', margin: '0 0 0.75rem' }}>
              Category-Wise Budget vs Actual Breakdown
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {summary.categoryBreakdown.map((item) => {
                const percent = item.budgeted > 0 ? Math.min(Math.round((item.actual / item.budgeted) * 100), 100) : 0;
                const isOver = item.variance < 0;

                return (
                  <div
                    key={item.category}
                    style={{
                      background: '#F7FBFE',
                      borderRadius: '12px',
                      border: '1px solid #E8F1F5',
                      padding: '0.75rem 0.875rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.8125rem', color: '#083B56', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {item.category}
                        </span>
                        {isOver && (
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#DC2626', background: '#FEF2F2', padding: '0.1rem 0.4rem', borderRadius: '6px', border: '1px solid #FECACA' }}>
                            OVER BUDGET
                          </span>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.8125rem', color: '#083B56' }}>{formatCurrency(item.actual)}</span>
                        <span style={{ fontSize: '0.72rem', color: '#8B9AA5', marginLeft: '0.25rem' }}>/ {formatCurrency(item.budgeted)}</span>
                      </div>
                    </div>

                    {/* Progress Track */}
                    <div style={{ width: '100%', height: '7px', background: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden', margin: '0.35rem 0' }}>
                      <div
                        style={{
                          height: '100%',
                          borderRadius: '9999px',
                          width: `${percent}%`,
                          background: isOver ? '#DC2626' : percent > 85 ? '#D97706' : '#059669',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.6875rem', marginTop: '0.25rem' }}>
                      <span style={{ color: '#657785', fontWeight: 600 }}>Utilized: {percent}%</span>
                      <span style={{ fontWeight: 700, color: isOver ? '#DC2626' : '#059669' }}>
                        Variance: {item.variance >= 0 ? '+' : ''}{formatCurrency(item.variance)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXPENSES AUDIT LIST */}
      {activeTab === 'EXPENSES' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search expense, vendor, invoice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
              >
                <option value="ALL">All Categories</option>
                <option value="utilities">Utilities</option>
                <option value="staff">Staff</option>
                <option value="maintenance">Maintenance</option>
                <option value="repair">Repair</option>
                <option value="AMC">AMC</option>
                <option value="security">Security</option>
                <option value="events">Events</option>
                <option value="cleaning">Cleaning</option>
                <option value="other">Other</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="PAID">Paid</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Expense Items List / Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <DataTable
              columns={[
                {
                  key: 'title',
                  header: 'Expense Record',
                  render: (item: SocietyExpense) => (
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{item.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.description}</div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Calendar size={12} /> {item.expenseDate} • Created by {item.createdByName}
                      </div>
                    </div>
                  )
                },
                {
                  key: 'category',
                  header: 'Category',
                  render: (item: SocietyExpense) => (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      {item.category}
                    </span>
                  )
                },
                {
                  key: 'amount',
                  header: 'Amount',
                  render: (item: SocietyExpense) => (
                    <div className="font-bold text-slate-900 text-sm">{formatCurrency(item.amount)}</div>
                  )
                },
                {
                  key: 'vendor',
                  header: 'Vendor / Invoice',
                  render: (item: SocietyExpense) => (
                    <div>
                      <div className="font-semibold text-slate-800">{item.vendorName || 'Internal'}</div>
                      {item.invoice ? (
                        <button
                          onClick={() => {
                            setActiveInvoice(item.invoice!);
                            setIsInvoiceModalOpen(true);
                          }}
                          className="mt-1 text-[11px] text-indigo-600 font-semibold flex items-center gap-1 hover:underline"
                        >
                          <Paperclip size={12} /> #{item.invoice.invoiceNumber}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">No invoice attached</span>
                      )}
                    </div>
                  )
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (item: SocietyExpense) => (
                    <div>
                      {item.status === 'PAID' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-max">
                          <CheckCircle size={12} /> PAID
                        </span>
                      )}
                      {item.status === 'APPROVED' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 w-max">
                          <CheckCircle size={12} /> APPROVED
                        </span>
                      )}
                      {item.status === 'PENDING_APPROVAL' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-max">
                          <AlertTriangle size={12} /> PENDING
                        </span>
                      )}
                      {item.status === 'REJECTED' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 w-max">
                          <XCircle size={12} /> REJECTED
                        </span>
                      )}
                    </div>
                  )
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (item: SocietyExpense) => (
                    <div className="text-right space-x-1">
                      {item.status === 'PENDING_APPROVAL' &&
                        (userRole === 'COMMITTEE_MEMBER' || userRole === 'SOCIETY_ADMIN') && (
                          <>
                            <button
                              onClick={() => handleApproveExpense(item.id, true)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApproveExpense(item.id, false)}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold"
                            >
                              Reject
                            </button>
                          </>
                        )}

                      {item.status === 'APPROVED' && (
                        <button
                          onClick={() => handleMarkPaid(item.id)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-bold"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  )
                }
              ]}
              data={expenses}
              keyExtractor={(item: SocietyExpense) => item.id}
              pageSize={10}
              mobileRender={(item: SocietyExpense) => (
                <MobileDataCard
                  title={item.title}
                  subtitle={`${formatCurrency(item.amount)} • ${item.category} • ${item.expenseDate}`}
                  status={
                    item.status === 'PAID' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        PAID
                      </span>
                    ) : item.status === 'APPROVED' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        APPROVED
                      </span>
                    ) : item.status === 'PENDING_APPROVAL' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        PENDING
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        REJECTED
                      </span>
                    )
                  }
                  attributes={[
                    { label: 'Description', value: item.description },
                    { label: 'Vendor', value: item.vendorName || 'Internal' },
                    { label: 'Created By', value: item.createdByName }
                  ]}
                  actions={
                    <div className="flex flex-wrap gap-2 w-full mt-2">
                      {item.invoice && (
                        <button
                          onClick={() => {
                            setActiveInvoice(item.invoice!);
                            setIsInvoiceModalOpen(true);
                          }}
                          className="flex-1 py-1.5 border border-indigo-200 text-indigo-600 bg-indigo-50/50 text-xs font-semibold rounded-lg min-h-[44px]"
                        >
                          View Invoice #{item.invoice.invoiceNumber}
                        </button>
                      )}
                      {item.status === 'PENDING_APPROVAL' &&
                        (userRole === 'COMMITTEE_MEMBER' || userRole === 'SOCIETY_ADMIN') && (
                          <>
                            <button
                              onClick={() => handleApproveExpense(item.id, true)}
                              className="flex-1 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg min-h-[44px]"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApproveExpense(item.id, false)}
                              className="flex-1 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg min-h-[44px]"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      {item.status === 'APPROVED' && (
                        <button
                          onClick={() => handleMarkPaid(item.id)}
                          className="w-full py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg min-h-[44px]"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  }
                />
              )}
            />
          </div>
        </div>
      )}

      {/* TAB 3: BUDGET BREAKDOWN */}
      {activeTab === 'BUDGET' && budget && (
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">{budget.title}</h2>
              <p className="text-xs text-slate-500">
                Period: {budget.month} • Total Allocation: {formatCurrency(budget.totalAllocated)}
              </p>
            </div>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full font-bold text-xs">
              Status: {budget.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {budget.categories.map((c) => (
              <div key={c.category} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{c.category}</span>
                <h4 className="text-xl font-extrabold text-slate-900 mt-1">{formatCurrency(c.allocatedAmount)}</h4>
                {c.notes && <p className="text-[11px] text-slate-500 mt-1">{c.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: VENDOR & MONTHLY ANALYTICS */}
      {activeTab === 'ANALYTICS' && summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">Vendor Payout Ranking</h2>
            <div className="space-y-3">
              {summary.vendorSpending.map((v) => (
                <div key={v.vendorName} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{v.vendorName}</h4>
                    <span className="text-[11px] text-slate-400">{v.count} invoice(s) processed</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-600">{formatCurrency(v.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">Monthly Expenditure History</h2>
            <div className="space-y-3">
              {summary.monthlySpending.map((m) => (
                <div key={m.month} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-800">{m.month}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{formatCurrency(m.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE EXPENSE */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 md:p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Record New Society Expense</h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title / Purpose</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MSEDCL Electricity Bill"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="utilities">utilities</option>
                    <option value="staff">staff</option>
                    <option value="maintenance">maintenance</option>
                    <option value="repair">repair</option>
                    <option value="AMC">AMC</option>
                    <option value="security">security</option>
                    <option value="events">events</option>
                    <option value="cleaning">cleaning</option>
                    <option value="other">other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={expenseAmount || ''}
                    onChange={(e) => setExpenseAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expense Date</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vendor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Otis Elevators"
                    value={expenseVendor}
                    onChange={(e) => setExpenseVendor(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {/* Attach Invoice Toggle */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-indigo-700">
                  <input
                    type="checkbox"
                    checked={attachInvoice}
                    onChange={(e) => setAttachInvoice(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Attach Vendor Invoice details
                </label>

                {attachInvoice && (
                  <div className="mt-3 space-y-2 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    <input
                      type="text"
                      placeholder="Invoice Number (e.g. INV-98124)"
                      value={invoiceNum}
                      onChange={(e) => setInvoiceNum(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="date"
                      placeholder="Due Date"
                      value={invoiceDueDate}
                      onChange={(e) => setInvoiceDueDate(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm"
                >
                  Submit Expense Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INVOICE PREVIEW */}
      {isInvoiceModalOpen && activeInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 md:p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Vendor Invoice Details</h3>
              <button onClick={() => setIsInvoiceModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Invoice Number:</span>
                <span className="font-bold text-slate-900">#{activeInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Vendor Name:</span>
                <span className="font-bold text-slate-900">{activeInvoice.vendorName}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Total Amount:</span>
                <span className="font-bold text-indigo-600 text-sm">{formatCurrency(activeInvoice.amount)}</span>
              </div>

              {activeInvoice.documentUrl && (
                <div className="mt-3">
                  <p className="text-slate-500 font-bold mb-1">Attached Document:</p>
                  <img
                    src={activeInvoice.documentUrl}
                    alt="Invoice Attachment"
                    className="w-full h-40 object-cover rounded-xl border"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT BUDGET */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 md:p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Configure Monthly Budget Allocations</h3>
              <button onClick={() => setIsBudgetModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-3">
              {budgetCategories.map((catItem, idx) => (
                <div key={catItem.category} className="flex justify-between items-center gap-3">
                  <span className="text-xs font-bold text-slate-700 uppercase w-28">{catItem.category}</span>
                  <input
                    type="number"
                    min={0}
                    value={catItem.allocatedAmount}
                    onChange={(e) => {
                      const copy = [...budgetCategories];
                      copy[idx].allocatedAmount = Number(e.target.value);
                      setBudgetCategories(copy);
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                  />
                </div>
              ))}

              <div className="flex justify-between items-center pt-3 border-t font-bold text-sm text-slate-900">
                <span>Total Budget:</span>
                <span className="text-indigo-600">
                  {formatCurrency(budgetCategories.reduce((a, b) => a + Number(b.allocatedAmount || 0), 0))}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsBudgetModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm"
                >
                  Save & Approve Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
