import type {
  SocietyExpense,
  Budget,
  ExpenseSummary,
  ExpenseCategory,
  ExpenseFilter,
  VendorInvoice,
  BudgetCategoryItem,
} from '../types';
import { realtimeService } from '../../../services/realtimeService';

const EXPENSES_STORAGE_KEY = 'aarizo_society_expenses_v2';
const BUDGETS_STORAGE_KEY = 'aarizo_society_budgets_v2';

const CATEGORIES: ExpenseCategory[] = [
  'utilities',
  'staff',
  'maintenance',
  'repair',
  'AMC',
  'security',
  'events',
  'cleaning',
  'other',
];

const SEED_EXPENSES: SocietyExpense[] = [
  {
    id: 'exp-001',
    societyId: 'soc-gvs',
    title: 'MSEDCL Monthly Electricity Bill - Common Area',
    description: 'Electric grid usage for elevators, streetlights, and clubhouse pumps.',
    category: 'utilities',
    amount: 145000,
    expenseDate: '2026-09-02',
    vendorName: 'MSEDCL Maharashtra Power',
    invoice: {
      id: 'inv-001',
      invoiceNumber: 'MSE-2026-09-9812',
      vendorName: 'MSEDCL Maharashtra Power',
      invoiceDate: '2026-09-01',
      dueDate: '2026-09-15',
      amount: 145000,
      documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
      notes: 'Verified against meter reading #98214',
    },
    status: 'PAID',
    createdBy: 'admin-1',
    createdByName: 'Mayuri Udar',
    approvedBy: 'committee-1',
    approvedByName: 'Rajesh Kumar (Treasurer)',
    approvedAt: '2026-09-03T10:00:00Z',
    paidAt: '2026-09-04T11:30:00Z',
    paymentReference: 'UPI/9812491204',
    createdAt: '2026-09-02T08:00:00Z',
    updatedAt: '2026-09-04T11:30:00Z',
  },
  {
    id: 'exp-002',
    societyId: 'soc-gvs',
    title: 'Otis Elevator Quarterly AMC Renewal',
    description: 'Scheduled preventive maintenance and sensor calibration for Towers A & B.',
    category: 'AMC',
    amount: 85000,
    expenseDate: '2026-09-05',
    vendorName: 'Otis Elevator India Pvt Ltd',
    vendorId: 'v-otis-01',
    invoice: {
      id: 'inv-002',
      invoiceNumber: 'OTIS-AMC-Q3-441',
      vendorName: 'Otis Elevator India Pvt Ltd',
      invoiceDate: '2026-09-04',
      dueDate: '2026-09-20',
      amount: 85000,
      taxAmount: 15300,
      documentUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600',
    },
    status: 'APPROVED',
    createdBy: 'admin-1',
    createdByName: 'Mayuri Udar',
    approvedBy: 'committee-1',
    approvedByName: 'Rajesh Kumar (Treasurer)',
    approvedAt: '2026-09-06T14:20:00Z',
    createdAt: '2026-09-05T09:15:00Z',
    updatedAt: '2026-09-06T14:20:00Z',
  },
  {
    id: 'exp-003',
    societyId: 'soc-gvs',
    title: 'Security Guard Monthly Payroll - August',
    description: 'Salaries for 12 security personnel deployed across main gate and perimeter.',
    category: 'security',
    amount: 180000,
    expenseDate: '2026-09-01',
    vendorName: 'Apex Security Solutions',
    status: 'PAID',
    createdBy: 'admin-1',
    createdByName: 'Mayuri Udar',
    approvedBy: 'committee-1',
    approvedByName: 'Rajesh Kumar (Treasurer)',
    approvedAt: '2026-09-01T16:00:00Z',
    paidAt: '2026-09-01T17:45:00Z',
    paymentReference: 'NEFT/20260901/8871',
    createdAt: '2026-09-01T12:00:00Z',
    updatedAt: '2026-09-01T17:45:00Z',
  },
  {
    id: 'exp-004',
    societyId: 'soc-gvs',
    title: 'Main Underground Tank Hydraulic Pump Repair',
    description: 'Emergency motor rewinding and impeller replacement for domestic water pump.',
    category: 'repair',
    amount: 24500,
    expenseDate: '2026-09-08',
    vendorName: 'Kirloskar Authorized Service',
    invoice: {
      id: 'inv-004',
      invoiceNumber: 'KAS-9981-REP',
      vendorName: 'Kirloskar Authorized Service',
      invoiceDate: '2026-09-08',
      dueDate: '2026-09-18',
      amount: 24500,
      documentUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600',
    },
    status: 'PENDING_APPROVAL',
    createdBy: 'admin-1',
    createdByName: 'Mayuri Udar',
    createdAt: '2026-09-08T11:00:00Z',
    updatedAt: '2026-09-08T11:00:00Z',
  },
  {
    id: 'exp-005',
    societyId: 'soc-gvs',
    title: 'Swimming Pool Chemical Treatment & Cleaning',
    description: 'Chlorine dosing, pH balancing, and vacuum scrubbing supplies.',
    category: 'cleaning',
    amount: 18500,
    expenseDate: '2026-09-10',
    vendorName: 'AquaClean Services',
    status: 'PENDING_APPROVAL',
    createdBy: 'facility-1',
    createdByName: 'Ramesh Pawar (Facility Manager)',
    createdAt: '2026-09-10T10:30:00Z',
    updatedAt: '2026-09-10T10:30:00Z',
  },
];

const SEED_BUDGET: Budget = {
  id: 'budget-2026-09',
  societyId: 'soc-gvs',
  title: 'September 2026 Operational Budget',
  fiscalYear: '2026-2027',
  period: 'MONTHLY',
  month: '2026-09',
  totalAllocated: 600000,
  categories: [
    { category: 'utilities', allocatedAmount: 160000, notes: 'Electricity, Water tanker standby' },
    { category: 'staff', allocatedAmount: 120000, notes: 'Housekeeping & estate manager' },
    { category: 'maintenance', allocatedAmount: 50000, notes: 'General upkeep and landscape' },
    { category: 'repair', allocatedAmount: 30000, notes: 'Unscheduled plumbing and electrical' },
    { category: 'AMC', allocatedAmount: 90000, notes: 'Lift, Generator, Fire system AMCs' },
    { category: 'security', allocatedAmount: 185000, notes: 'Security personnel & CCTV upkeep' },
    { category: 'events', allocatedAmount: 25000, notes: 'Ganesh Utsav preparations' },
    { category: 'cleaning', allocatedAmount: 25000, notes: 'Pool and waste sanitization' },
    { category: 'other', allocatedAmount: 15000, notes: 'Stationery and audit fees' },
  ],
  status: 'APPROVED',
  createdBy: 'committee-1',
  createdByName: 'Rajesh Kumar (Treasurer)',
  approvedBy: 'committee-head',
  approvedByName: 'Anil Sharma (President)',
  approvedAt: '2026-08-30T10:00:00Z',
  createdAt: '2026-08-28T09:00:00Z',
  updatedAt: '2026-08-30T10:00:00Z',
};

class SocietyExpenseEngine {
  private getStoredExpenses(): SocietyExpense[] {
    const raw = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(SEED_EXPENSES));
      return SEED_EXPENSES;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse expenses', e);
      return SEED_EXPENSES;
    }
  }

  private saveExpenses(expenses: SocietyExpense[]): void {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
    realtimeService.broadcast('EXPENSE_UPDATED', { count: expenses.length });
  }

  private getStoredBudgets(): Budget[] {
    const raw = localStorage.getItem(BUDGETS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify([SEED_BUDGET]));
      return [SEED_BUDGET];
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse budgets', e);
      return [SEED_BUDGET];
    }
  }

  private saveBudgets(budgets: Budget[]): void {
    localStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(budgets));
    realtimeService.broadcast('BUDGET_UPDATED', { count: budgets.length });
  }

  // --- Expenses Methods ---

  public getExpenses(filter?: ExpenseFilter): SocietyExpense[] {
    let list = this.getStoredExpenses();

    if (filter) {
      if (filter.category && filter.category !== 'ALL') {
        list = list.filter((e) => e.category === filter.category);
      }
      if (filter.status && filter.status !== 'ALL') {
        list = list.filter((e) => e.status === filter.status);
      }
      if (filter.searchQuery && filter.searchQuery.trim() !== '') {
        const q = filter.searchQuery.toLowerCase();
        list = list.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q) ||
            (e.vendorName && e.vendorName.toLowerCase().includes(q)) ||
            (e.invoice?.invoiceNumber && e.invoice.invoiceNumber.toLowerCase().includes(q))
        );
      }
      if (filter.startDate) {
        list = list.filter((e) => e.expenseDate >= filter.startDate!);
      }
      if (filter.endDate) {
        list = list.filter((e) => e.expenseDate <= filter.endDate!);
      }
    }

    return list.sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime());
  }

  public createExpense(
    data: Omit<SocietyExpense, 'id' | 'createdAt' | 'updatedAt'>
  ): SocietyExpense {
    const expenses = this.getStoredExpenses();
    const now = new Date().toISOString();
    const newExpense: SocietyExpense = {
      ...data,
      id: `exp-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    expenses.unshift(newExpense);
    this.saveExpenses(expenses);
    return newExpense;
  }

  public updateExpense(id: string, updates: Partial<SocietyExpense>): SocietyExpense | null {
    const expenses = this.getStoredExpenses();
    const index = expenses.findIndex((e) => e.id === id);
    if (index === -1) return null;

    expenses[index] = {
      ...expenses[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveExpenses(expenses);
    return expenses[index];
  }

  public approveExpense(
    id: string,
    approverId: string,
    approverName: string,
    status: 'APPROVED' | 'REJECTED'
  ): SocietyExpense | null {
    return this.updateExpense(id, {
      status,
      approvedBy: approverId,
      approvedByName: approverName,
      approvedAt: new Date().toISOString(),
    });
  }

  public markExpensePaid(
    id: string,
    paymentRef: string
  ): SocietyExpense | null {
    return this.updateExpense(id, {
      status: 'PAID',
      paidAt: new Date().toISOString(),
      paymentReference: paymentRef,
    });
  }

  public attachInvoice(id: string, invoice: VendorInvoice): SocietyExpense | null {
    return this.updateExpense(id, { invoice });
  }

  public deleteExpense(id: string): boolean {
    const expenses = this.getStoredExpenses();
    const filtered = expenses.filter((e) => e.id !== id);
    if (filtered.length === expenses.length) return false;
    this.saveExpenses(filtered);
    return true;
  }

  // --- Budget Methods ---

  public getBudgets(): Budget[] {
    return this.getStoredBudgets().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getCurrentBudget(month: string = '2026-09'): Budget | undefined {
    return this.getStoredBudgets().find((b) => b.month === month || b.fiscalYear === '2026-2027');
  }

  public saveBudget(budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Budget {
    const budgets = this.getStoredBudgets();
    const now = new Date().toISOString();
    const totalAllocated = budgetData.categories.reduce((acc, c) => acc + (c.allocatedAmount || 0), 0);

    const existingIndex = budgets.findIndex(
      (b) => b.month === budgetData.month && b.period === budgetData.period
    );

    let finalBudget: Budget;

    if (existingIndex !== -1) {
      finalBudget = {
        ...budgets[existingIndex],
        ...budgetData,
        totalAllocated,
        updatedAt: now,
      };
      budgets[existingIndex] = finalBudget;
    } else {
      finalBudget = {
        ...budgetData,
        id: `budget-${Date.now()}`,
        totalAllocated,
        createdAt: now,
        updatedAt: now,
      };
      budgets.unshift(finalBudget);
    }

    this.saveBudgets(budgets);
    return finalBudget;
  }

  public approveBudget(
    id: string,
    approverId: string,
    approverName: string
  ): Budget | null {
    const budgets = this.getStoredBudgets();
    const index = budgets.findIndex((b) => b.id === id);
    if (index === -1) return null;

    budgets[index] = {
      ...budgets[index],
      status: 'APPROVED',
      approvedBy: approverId,
      approvedByName: approverName,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveBudgets(budgets);
    return budgets[index];
  }

  // --- Analytics & Variance Engine ---

  public getExpenseSummary(month: string = '2026-09'): ExpenseSummary {
    const expenses = this.getStoredExpenses();
    const budget = this.getCurrentBudget(month);

    // Calculate actuals per category
    const categoryActuals: Record<ExpenseCategory, number> = {
      utilities: 0,
      staff: 0,
      maintenance: 0,
      repair: 0,
      AMC: 0,
      security: 0,
      events: 0,
      cleaning: 0,
      other: 0,
    };

    let totalActual = 0;

    expenses.forEach((e) => {
      if (e.status !== 'REJECTED') {
        categoryActuals[e.category] = (categoryActuals[e.category] || 0) + e.amount;
        totalActual += e.amount;
      }
    });

    const totalBudget = budget ? budget.totalAllocated : 0;
    const totalVariance = totalBudget - totalActual;
    const isOverBudget = totalVariance < 0;

    // Build Category Variance Breakdown
    const categoryBreakdown = CATEGORIES.map((cat) => {
      const budgetItem = budget?.categories.find((c) => c.category === cat);
      const budgeted = budgetItem ? budgetItem.allocatedAmount : 0;
      const actual = categoryActuals[cat] || 0;
      const variance = budgeted - actual;
      const variancePercentage = budgeted > 0 ? Math.round((variance / budgeted) * 100) : 0;

      return {
        category: cat,
        budgeted,
        actual,
        variance,
        variancePercentage,
      };
    });

    // Monthly Spending trends
    const monthlySpendingMap: Record<string, number> = {};
    expenses.forEach((e) => {
      const monthKey = e.expenseDate.substring(0, 7);
      monthlySpendingMap[monthKey] = (monthlySpendingMap[monthKey] || 0) + e.amount;
    });

    const monthlySpending = Object.entries(monthlySpendingMap)
      .map(([m, amt]) => ({ month: m, amount: amt }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Vendor Spending summary
    const vendorMap: Record<string, { amount: number; count: number }> = {};
    expenses.forEach((e) => {
      const vName = e.vendorName || 'Direct / Internal';
      if (!vendorMap[vName]) {
        vendorMap[vName] = { amount: 0, count: 0 };
      }
      vendorMap[vName].amount += e.amount;
      vendorMap[vName].count += 1;
    });

    const vendorSpending = Object.entries(vendorMap)
      .map(([vName, stat]) => ({ vendorName: vName, amount: stat.amount, count: stat.count }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalBudget,
      totalActual,
      totalVariance,
      isOverBudget,
      categoryBreakdown,
      monthlySpending,
      vendorSpending,
    };
  }
}

export const societyExpenseEngine = new SocietyExpenseEngine();
