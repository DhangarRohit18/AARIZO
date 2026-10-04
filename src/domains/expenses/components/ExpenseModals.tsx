import React from 'react';
import { IndianRupee, Layers, Calendar, User } from 'lucide-react';
import type { ExpenseCategory, VendorInvoice } from '../types';
import { FileUpload } from '../../../components/ui/FileUpload';
import { Modal } from '../../../components/ui/Modal';

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
      {/* MODAL 1: CREATE EXPENSE */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Record New Society Expense"
        subtitle="Log operational overheads, vendor dues, and society repairs"
        maxWidth="540px"
      >
        <form onSubmit={handleCreateExpense} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Title / Expense Purpose <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. MSEDCL Electricity Bill / Lift AMC"
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176B91]/20 focus:border-[#176B91] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Layers size={12} className="text-[#176B91]" /> Category
              </label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 capitalize"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <IndianRupee size={12} className="text-[#176B91]" /> Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={expenseAmount || ''}
                onChange={(e) => setExpenseAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar size={12} className="text-[#176B91]" /> Expense Date
              </label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <User size={12} className="text-[#176B91]" /> Vendor Name
              </label>
              <input
                type="text"
                placeholder="e.g. Otis Elevators"
                value={expenseVendor}
                onChange={(e) => setExpenseVendor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Notes</label>
            <textarea
              rows={2}
              value={expenseDesc}
              onChange={(e) => setExpenseDesc(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
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
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
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

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsExpenseModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#083B56] hover:bg-[#176B91] text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Submit Expense Record
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: INVOICE PREVIEW */}
      {activeInvoice && (
        <Modal
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          title="Vendor Invoice Details"
          subtitle={`Verified invoice #${activeInvoice.invoiceNumber}`}
          maxWidth="460px"
        >
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
        </Modal>
      )}

      {/* MODAL 3: CONFIGURE MONTHLY BUDGET ALLOCATIONS (GENERALIZED & FIXED) */}
      <Modal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        title="Configure Monthly Budget Allocations"
        subtitle="Set category spending limits approved by the management committee"
        maxWidth="540px"
      >
        <form onSubmit={handleSaveBudget} className="space-y-4">
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50/50 p-1">
            {budgetCategories.map((catItem, idx) => (
              <div key={catItem.category} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#176B91]" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    {catItem.category}
                  </span>
                </div>

                <div className="relative w-40 sm:w-48">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={catItem.allocatedAmount}
                    onChange={(e) => {
                      const copy = [...budgetCategories];
                      copy[idx].allocatedAmount = Number(e.target.value);
                      setBudgetCategories(copy);
                    }}
                    className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-right text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#176B91]/20 focus:border-[#176B91] transition-all"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Total Budget Summary Card */}
          <div className="flex justify-between items-center px-4 py-3 bg-[#EAF6FC] border border-[#DCE8EF] rounded-xl font-bold text-sm">
            <span className="text-slate-700">Total Monthly Budget:</span>
            <span className="text-[#083B56] text-base">
              {formatCurrency(budgetCategories.reduce((a, b) => a + Number(b.allocatedAmount || 0), 0))}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsBudgetModalOpen(false)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#083B56] hover:bg-[#176B91] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Save & Approve Budget
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
