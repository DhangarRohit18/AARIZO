import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
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
  Eye,
  Check,
  Edit,
  Trash2,
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
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Society Expense & Budget Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Module
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Track operational spending, vendor payouts, budget vs actual variance, and invoice approval history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {userRole !== 'COMMITTEE_MEMBER' && (
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition"
            >
              <Plus size={16} /> Record Expense
            </button>
          )}

          {(userRole === 'COMMITTEE_MEMBER' || userRole === 'SOCIETY_ADMIN') && (
            <button
              onClick={() => setIsBudgetModalOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition"
            >
              <Edit size={14} /> Configure Budget
            </button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Allocated Budget</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(summary.totalBudget)}</h3>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Building size={20} />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Fiscal Period: Sept 2026</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Actual Expenses</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(summary.totalActual)}</h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-slate-600">
              <span>{Math.round((summary.totalActual / (summary.totalBudget || 1)) * 100)}% of Budget utilized</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Net Variance</p>
                <h3
                  className={`text-2xl font-bold mt-1 ${
                    summary.isOverBudget ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {summary.totalVariance >= 0 ? '+' : ''}
                  {formatCurrency(summary.totalVariance)}
                </h3>
              </div>
              <div
                className={`p-3 rounded-xl ${
                  summary.isOverBudget ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                {summary.isOverBudget ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">
              {summary.isOverBudget ? '⚠️ Budget limit exceeded' : '✓ Under budget margin'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Claims</p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">
                  {expenses.filter((e) => e.status === 'PENDING_APPROVAL').length}
                </h3>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <AlertTriangle size={20} />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Requires Committee review</p>
          </div>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 space-x-6">
        {[
          { key: 'OVERVIEW', label: 'Budget vs Actual', icon: PieChartIcon },
          { key: 'EXPENSES', label: 'Expense Audit Records', icon: FileText },
          { key: 'BUDGET', label: 'Budget Breakdown', icon: Layers },
          { key: 'ANALYTICS', label: 'Vendor & Monthly Analysis', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & VARIANCE */}
      {activeTab === 'OVERVIEW' && summary && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">Category-Wise Budget vs Actual Breakdown</h2>
            <div className="space-y-4">
              {summary.categoryBreakdown.map((item) => {
                const percent = item.budgeted > 0 ? Math.min(Math.round((item.actual / item.budgeted) * 100), 100) : 0;
                const isOver = item.variance < 0;

                return (
                  <div key={item.category} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 uppercase tracking-wide">{item.category}</span>
                        {isOver && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-bold text-[10px] rounded">
                            OVER BUDGET
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm text-slate-900">{formatCurrency(item.actual)}</span>
                        <span className="text-xs text-slate-500 font-medium ml-1">/ {formatCurrency(item.budgeted)}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full transition-all rounded-full ${
                          isOver ? 'bg-rose-500' : percent > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                      <span>Utilized: {percent}%</span>
                      <span className={isOver ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                        Variance: {item.variance >= 0 ? '+' : ''}
                        {formatCurrency(item.variance)}
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

          {/* Expense Items Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Expense Record</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Vendor / Invoice</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 text-xs">{item.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.description}</div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <Calendar size={12} /> {item.expenseDate} • Created by {item.createdByName}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                          {item.category}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 text-sm">{formatCurrency(item.amount)}</div>
                      </td>

                      <td className="p-3.5">
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
                      </td>

                      <td className="p-3.5">
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
                      </td>

                      <td className="p-3.5 text-right space-x-1">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BUDGET BREAKDOWN */}
      {activeTab === 'BUDGET' && budget && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
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
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
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

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
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
