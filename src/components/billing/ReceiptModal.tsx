import React from 'react';
import { Printer, X, CheckCircle, Shield, FileText } from 'lucide-react';
import type { SocietyInvoice, PaymentTransaction } from '../../types/billing';

interface ReceiptModalProps {
  invoice: SocietyInvoice;
  transaction?: PaymentTransaction;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ invoice, transaction, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-4 md:p-6 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-150">
        {/* Actions Bar */}
        <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Official Payment Receipt & Tax Invoice
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" /> Print / PDF Receipt
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Card Body */}
        <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-6">
          {/* Header Branding */}
          <div className="flex items-start justify-between border-b pb-4 border-slate-200 dark:border-slate-700">
            <div>
              <div className="flex items-center gap-2 font-black text-lg text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                <Shield className="w-6 h-6" /> Grand Vista Towers RWA
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Plot 14, Sector 5, Palm Beach Rd, Navi Mumbai 400706
              </div>
              <div className="text-xs text-slate-500">Reg No: RWA/MH/2022/88190</div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-full border border-emerald-300 dark:border-emerald-700">
                RECEIPT ISSUED
              </span>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">
                Date: {transaction?.paymentDate || new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Meta Details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Billed To Resident:</span>
              <div className="font-bold text-slate-900 dark:text-white mt-0.5">{invoice.residentName}</div>
              <div className="text-slate-600 dark:text-slate-400">Flat Code: {invoice.flatCode}</div>
            </div>
            <div className="text-right">
              <span className="text-slate-500 font-medium">Invoice Reference:</span>
              <div className="font-bold text-slate-900 dark:text-white mt-0.5">{invoice.invoiceNumber}</div>
              <div className="text-slate-600 dark:text-slate-400">
                Txn ID: {transaction?.transactionId || 'N/A'}
              </div>
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-x-auto">
<table className="w-full text-left text-xs">
              <thead className="bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-2.5">Component</th>
                  <th className="p-2.5">Description</th>
                  <th className="p-2.5 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {invoice.lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="p-2.5 font-semibold text-indigo-600 dark:text-indigo-400">{item.component}</td>
                    <td className="p-2.5">{item.description}</td>
                    <td className="p-2.5 text-right font-medium">₹{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex flex-col items-end space-y-1.5 text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between w-48 text-slate-600 dark:text-slate-400">
              <span>Total Billed:</span>
              <span>₹{invoice.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between w-48 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              <span>Paid Amount:</span>
              <span>₹{invoice.paidAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between w-48 text-rose-600 dark:text-rose-400 font-semibold">
              <span>Balance Remaining:</span>
              <span>₹{invoice.outstandingBalance.toLocaleString()}</span>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="text-[11px] text-slate-500 border-t border-slate-200 dark:border-slate-700 pt-3 flex items-center justify-between">
            <div className="flex items-center gap-1 text-emerald-600 font-semibold">
              <CheckCircle className="w-4 h-4" /> Payment verified by Gateway Adapter
            </div>
            <div>Computer generated receipt — no signature required.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
