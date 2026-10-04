import React from 'react';
import { XCircle } from 'lucide-react';
import type { ExpenseCategory, VendorInvoice } from '../types';
import { FileUpload } from '../../../components/ui/FileUpload';

interface ExpenseModalsProps {
  isExpenseModalOpen: boolean;
  setIsExpenseModalOpen: (open: boolean) => void;
  handleCreateExpense: (e: React.FormEvent) => void;
  expenseTitle: string;
  setExpenseTitle: (v: string) => void;
  expenseCategory: ExpenseCategory;
  setExpenseCategory: (v: any) => void;
  expenseAmount: number;
  setExpenseAmount: (v: number) => void;
  expenseDate: string;
  setExpenseDate: (v: string) => void;
  expenseVendor: string;
  setExpenseVendor: (v: string) => void;
  expenseDesc: string;
  setExpenseDesc: (v: string) => void;
  expenseHasInvoice: boolean;
  setExpenseHasInvoice: (v: boolean) => void;
  invoiceNumber: string;
  setInvoiceNumber: (v: string) => void;
  invoiceDocUrl: string;
  setInvoiceDocUrl: (v: string) => void;

  isInvoiceModalOpen: boolean;
  setIsInvoiceModalOpen: (open: boolean) => void;
  activeInvoice: VendorInvoice | null;
  formatCurrency: (amount: number) => string;

  isBudgetModalOpen: boolean;
  setIsBudgetModalOpen: (open: boolean) => void;
  budgetCategories: { category: ExpenseCategory; allocatedAmount: number }[];
  setBudgetCategories: React.Dispatch<React.SetStateAction<{ category: ExpenseCategory; allocatedAmount: number }[]>>;
  handleSaveBudget: (e: React.FormEvent) => void;
}

export const ExpenseModals: React.FC<ExpenseModalsProps> = ({
  isExpenseModalOpen,
  setIsExpenseModalOpen,
  handleCreateExpense,
  expenseTitle,
  setExpenseTitle,
  expenseCategory,
  setExpenseCategory,
  expenseAmount,
  setExpenseAmount,
  expenseDate,
  setExpenseDate,
  expenseVendor,
  setExpenseVendor,
  expenseDesc,
  setExpenseDesc,
  expenseHasInvoice,
  setExpenseHasInvoice,
  invoiceNumber,
  setInvoiceNumber,
  invoiceDocUrl,
  setInvoiceDocUrl,

  isInvoiceModalOpen,
  setIsInvoiceModalOpen,
  activeInvoice,
  formatCurrency,

  isBudgetModalOpen,
  setIsBudgetModalOpen,
  budgetCategories,
  setBudgetCategories,
  handleSaveBudget,
}) => {
  return (
    <>
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

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasInvoice"
                    checked={expenseHasInvoice}
                    onChange={(e) => setExpenseHasInvoice(e.target.checked)}
                    className="rounded text-[#083B56]"
                  />
                  <label htmlFor="hasInvoice" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Attach Vendor Tax Invoice
                  </label>
                </div>

                {expenseHasInvoice && (
                  <div className="space-y-2 pt-2 border-t">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Tax Invoice Number</label>
                      <input
                        type="text"
                        placeholder="e.g. INV-2026-09-8812"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Upload Receipt / Tax Invoice</label>
                      <FileUpload
                        category="receipts"
                        label="Snap Photo or Upload Receipt (PDF / Image)"
                        accept="image/*,application/pdf"
                        currentUrl={invoiceDocUrl}
                        onUploadSuccess={(url) => setInvoiceDocUrl(url)}
                        onRemove={() => setInvoiceDocUrl('')}
                      />
                    </div>
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
                  className="px-4 py-2 bg-[#083B56] hover:bg-[#176B91] text-white text-xs font-semibold rounded-xl shadow-sm"
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
                <span className="font-bold text-[#083B56] text-sm">{formatCurrency(activeInvoice.amount)}</span>
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
                <span className="text-[#083B56]">
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
                  className="px-4 py-2 bg-[#083B56] hover:bg-[#176B91] text-white text-xs font-semibold rounded-xl shadow-sm"
                >
                  Save & Approve Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
