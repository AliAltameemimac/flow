import React, { useState } from 'react';
import {
  CreditCard,
  Clock,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Building,
  ArrowRight,
  Filter,
  Search,
  X,
  Plus,
} from 'lucide-react';
import { store } from '../services/store';
import { Expense } from '../types';

export const PayablesView: React.FC = () => {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('ALL');
  const [payModalExpense, setPayModalExpense] = useState<Expense | null>(null);
  const [payAmount, setPayAmount] = useState<string>('');
  const [payRef, setPayRef] = useState<string>('CHQ-ADCB-');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const curr = store.displayCurrency;
  const agingGroups = store.getPayablesAging();

  const totalOutstanding = agingGroups.reduce((acc, g) => acc + g.totalOutstanding, 0);
  const totalCurrent = agingGroups.reduce((acc, g) => acc + g.current, 0);
  const total1To30 = agingGroups.reduce((acc, g) => acc + g.days1To30, 0);
  const total31To60 = agingGroups.reduce((acc, g) => acc + g.days31To60, 0);
  const total61To90 = agingGroups.reduce((acc, g) => acc + g.days61To90, 0);
  const total90Plus = agingGroups.reduce((acc, g) => acc + g.days90Plus, 0);

  const openInvoices = store.expenses.filter((e) => {
    const isApproved = e.status === 'approved';
    const hasUnpaid = (e.amountPaid || 0) < e.amount;
    const matchesSup = selectedSupplierId === 'ALL' || e.supplierId === selectedSupplierId;
    return isApproved && hasUnpaid && matchesSup;
  });

  const handleOpenPayModal = (exp: Expense) => {
    const balance = exp.amount - (exp.amountPaid || 0);
    setPayModalExpense(exp);
    setPayAmount(String(balance));
    setPayRef(`WIRE-ENBD-${Math.floor(100000 + Math.random() * 900000)}`);
    setErrorMsg('');
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalExpense) return;
    const num = parseFloat(payAmount) || 0;
    if (num <= 0) {
      setErrorMsg('Payment amount must be greater than zero.');
      return;
    }

    try {
      store.recordPayment(payModalExpense.id, num, payRef);
      setPayModalExpense(null);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Payables & Supplier Ageing Ledger
            </h1>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
              Treasury Cash Flow
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Track committed liabilities, aging debt escalation buckets, and disburse verified supplier payments.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-right">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Open Liabilities</div>
          <div className="font-mono text-xl font-black text-rose-400">
            {curr} {Math.round(store.convert(totalOutstanding, 'AED', curr)).toLocaleString()}
          </div>
        </div>
      </div>

      {/* 5-Bucket Ageing Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-3">
        {/* Current */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current (Not Due)</div>
          <div className="mt-2 text-base sm:text-lg font-black font-mono text-emerald-400">
            {curr} {Math.round(store.convert(totalCurrent, 'AED', curr)).toLocaleString()}
          </div>
          <div className="mt-1 text-[10px] text-slate-500">Within payment terms</div>
        </div>

        {/* 1 - 30 Days */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">1 - 30 Days Past</div>
          <div className="mt-2 text-base sm:text-lg font-black font-mono text-amber-400">
            {curr} {Math.round(store.convert(total1To30, 'AED', curr)).toLocaleString()}
          </div>
          <div className="mt-1 text-[10px] text-slate-500">First reminder notice</div>
        </div>

        {/* 31 - 60 Days */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">31 - 60 Days Past</div>
          <div className="mt-2 text-base sm:text-lg font-black font-mono text-orange-400">
            {curr} {Math.round(store.convert(total31To60, 'AED', curr)).toLocaleString()}
          </div>
          <div className="mt-1 text-[10px] text-slate-500">Second escalation</div>
        </div>

        {/* 61 - 90 Days */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">61 - 90 Days Past</div>
          <div className="mt-2 text-base sm:text-lg font-black font-mono text-rose-400">
            {curr} {Math.round(store.convert(total61To90, 'AED', curr)).toLocaleString()}
          </div>
          <div className="mt-1 text-[10px] text-slate-500">Delivery hold risk</div>
        </div>

        {/* 90+ Days Critical */}
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400">90+ Days Critical</div>
          <div className="mt-2 text-base sm:text-lg font-black font-mono text-rose-500">
            {curr} {Math.round(store.convert(total90Plus, 'AED', curr)).toLocaleString()}
          </div>
          <div className="mt-1 text-[10px] text-rose-300/80">Immediate CFO action</div>
        </div>
      </div>

      {/* Supplier Breakdown Cards */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-md">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
          Vendor Debt Summary by Payment Terms
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {agingGroups.map((g) => (
            <button
              key={g.supplierId}
              onClick={() => setSelectedSupplierId(selectedSupplierId === g.supplierId ? 'ALL' : g.supplierId)}
              className={`rounded-xl p-3.5 text-left border transition ${
                selectedSupplierId === g.supplierId
                  ? 'border-blue-500 bg-blue-950/30'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="font-semibold text-white text-xs truncate max-w-[180px]">{g.supplierName}</div>
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 font-mono">
                  {g.terms}d terms
                </span>
              </div>
              <div className="mt-2 font-mono text-base font-extrabold text-white">
                {curr} {Math.round(store.convert(g.totalOutstanding, 'AED', curr)).toLocaleString()}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>{g.invoicesCount} open invoice(s)</span>
                {g.days90Plus > 0 ? (
                  <span className="text-rose-400 font-bold">Overdue &gt; 90d</span>
                ) : g.days1To30 > 0 ? (
                  <span className="text-amber-400">Overdue &gt; 30d</span>
                ) : (
                  <span className="text-emerald-400">Within terms</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Open Invoices Table & Payment Action */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 p-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white">Unsettled Approved Invoices</h2>
            {selectedSupplierId !== 'ALL' && (
              <button
                onClick={() => setSelectedSupplierId('ALL')}
                className="text-[11px] text-blue-400 underline hover:text-blue-300"
              >
                Clear filter
              </button>
            )}
          </div>
          <span className="text-xs text-slate-400">{openInvoices.length} invoices pending settlement</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Invoice Total</th>
                <th className="py-3 px-4 text-right">Already Paid</th>
                <th className="py-3 px-4 text-right font-bold text-white">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Disburse</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {openInvoices.map((inv) => {
                const balance = inv.amount - (inv.amountPaid || 0);
                const isOverdue = inv.dueDate && new Date(inv.dueDate) < new Date('2026-09-27');

                return (
                  <tr key={inv.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 font-bold text-blue-400">{inv.reference}</td>
                    <td className="py-3 px-4 font-sans text-slate-200">{inv.supplierName}</td>
                    <td className={`py-3 px-4 font-sans ${isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                      {inv.dueDate || 'N/A'} {isOverdue && '(!)'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">{inv.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-emerald-400">{(inv.amountPaid || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-bold text-rose-400">
                      {curr} {Math.round(store.convert(balance, inv.currency, curr)).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 uppercase">
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => handleOpenPayModal(inv)}
                        className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-blue-500"
                      >
                        Record Payment
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {payModalExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Record Invoice Payment</h2>
              </div>
              <button onClick={() => setPayModalExpense(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="mt-4 space-y-3.5 text-xs">
              <div className="rounded-lg bg-slate-800/80 p-3 space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Vendor:</span>
                  <strong className="text-white">{payModalExpense.supplierName}</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Invoice Reference:</span>
                  <span className="font-mono text-blue-400">{payModalExpense.reference}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Invoice Amount:</span>
                  <span className="font-mono text-white">AED {payModalExpense.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-700">
                  <span>Outstanding Balance:</span>
                  <span className="font-mono font-bold text-rose-400">
                    AED {(payModalExpense.amount - (payModalExpense.amountPaid || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium">Disbursement Amount (AED)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium">Bank Instrument / Wire / Cheque Reference</label>
                <input
                  type="text"
                  required
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono"
                />
              </div>

              {errorMsg && (
                <div className="rounded bg-rose-950/50 p-2.5 text-xs text-rose-300 border border-rose-500/30">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPayModalExpense(null)}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 shadow"
                >
                  Confirm & Update Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
