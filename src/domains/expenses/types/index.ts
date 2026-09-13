export type ExpenseCategory =
  | 'utilities'
  | 'staff'
  | 'maintenance'
  | 'repair'
  | 'AMC'
  | 'security'
  | 'events'
  | 'cleaning'
  | 'other';

export type ExpenseStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PAID';

export type BudgetStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REVISED';

export interface VendorInvoice {
  id: string;
  invoiceNumber: string;
  vendorId?: string;
  vendorName: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  taxAmount?: number;
  documentUrl?: string;
  notes?: string;
}

export interface SocietyExpense {
  id: string;
  societyId: string;
  title: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  vendorName?: string;
  vendorId?: string;
  invoice?: VendorInvoice;
  status: ExpenseStatus;
  createdBy: string;
  createdByName: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  paidAt?: string;
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategoryItem {
  category: ExpenseCategory;
  allocatedAmount: number;
  notes?: string;
}

export interface Budget {
  id: string;
  societyId: string;
  title: string;
  fiscalYear: string; // e.g. "2026-2027"
  period: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  month?: string; // e.g. "2026-09"
  totalAllocated: number;
  categories: BudgetCategoryItem[];
  status: BudgetStatus;
  createdBy: string;
  createdByName: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseVarianceItem {
  category: ExpenseCategory;
  budgeted: number;
  actual: number;
  variance: number; // budgeted - actual (positive = under budget, negative = over budget)
  variancePercentage: number;
}

export interface ExpenseSummary {
  totalBudget: number;
  totalActual: number;
  totalVariance: number;
  isOverBudget: boolean;
  categoryBreakdown: ExpenseVarianceItem[];
  monthlySpending: { month: string; amount: number }[];
  vendorSpending: { vendorName: string; amount: number; count: number }[];
}

export interface ExpenseFilter {
  category?: ExpenseCategory | 'ALL';
  status?: ExpenseStatus | 'ALL';
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
}
