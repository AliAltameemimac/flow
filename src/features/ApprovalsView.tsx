import React, { useState } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Receipt,
  ShoppingCart,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldAlert,
  X,
} from 'lucide-react';
import { store } from '../services/store';
import { Expense, PurchaseOrder } from '../types';

export const ApprovalsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'EXPENSES' | 'POS'>('EXPENSES');
  const [rejectItem, setRejectItem] = useState<{ id: string; type: 'EXPENSE' | 'PO'; ref: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('Incomplete delivery note attachment');
  const [actionSuccess, setActionSuccess] = useState('');

  const curr = store.displayCurrency;
  const pendingExpenses = store.expenses.filter((e) => e.status === 'submitted');
  const pendingPOs = store.purchaseOrders.filter((po) => po.status === 'submitted');

  const handleApproveExpense = (exp: Expense) => {
    try {
      store.approveExpense(exp.id);
      setActionSuccess(`Approved ${exp.reference}`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleApprovePO = (po: PurchaseOrder) => {
    try {
      store.issuePurchaseOrder(po.id);
      setActionSuccess(`Issued ${po.reference}`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleConfirmReject = () => {
    if (!rejectItem || !rejectReason.trim()) return;
    try {
      if (rejectItem.type === 'EXPENSE') {
        store.rejectExpense(rejectItem.id, rejectReason);
      } else {
        store.rejectPurchaseOrder(rejectItem.id, rejectReason);
      }
      setRejectItem(null);
      setRejectReason('');
      setActionSuccess(`Rejected ${rejectItem.ref}`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">Commercial Approvals Queue</h1>
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
              Segregated Governance
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Enforces strict two-person authorization. Authors cannot approve their own expenses or issue their own POs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs">
          <button
            onClick={() => setActiveTab('EXPENSES')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 font-bold transition ${
              activeTab === 'EXPENSES'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="h-4 w-4" />
            <span>Actual Costs ({pendingExpenses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('POS')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 font-bold transition ${
              activeTab === 'POS'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Purchase Orders ({pendingPOs.length})</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-400 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* EXPENSES QUEUE */}
      {activeTab === 'EXPENSES' && (
        <div className="space-y-4">
          {pendingExpenses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500/50" />
              <h3 className="mt-3 text-sm font-bold text-white">Expense Approvals Clear</h3>
              <p className="mt-1 text-xs text-slate-500">There are no pending actual costs awaiting review.</p>
            </div>
          ) : (
            pendingExpenses.map((exp) => {
              const isAuthor = exp.enteredById === store.currentUser.id;
              const costCode = store.costCodes.find((c) => c.id === exp.costCodeId);
              const budgetAmount = costCode ? costCode.budgetAmount : 0;

              return (
                <div
                  key={exp.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-extrabold text-white">{exp.reference}</span>
                        <span className="rounded bg-blue-500/20 text-blue-300 font-mono text-[11px] px-2 py-0.5 font-bold">
                          {exp.costCodeCode}
                        </span>
                        <span className="rounded bg-amber-500/10 text-amber-300 text-[10px] px-2 py-0.5 font-bold uppercase">
                          Pending Approval
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-300">{exp.description}</p>
                      <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-4">
                        <span>Submitted by: <strong className="text-white">{exp.enteredByName}</strong></span>
                        <span>Date: {exp.date}</span>
                        <span>Vendor: <strong className="text-white">{exp.supplierName || 'Internal'}</strong></span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Claim Amount</div>
                      <div className="font-mono text-xl font-black text-amber-400">
                        {curr} {Math.round(store.convert(exp.amount, exp.currency, curr)).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">AED {exp.amount.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Budget Impact Preview */}
                  <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-semibold text-slate-300 uppercase text-[10px] tracking-wider">
                        Budget Allocation Impact on Package ({exp.costCodeCode})
                      </span>
                      <span>Total Budget: AED {budgetAmount.toLocaleString()}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                      <div className="bg-slate-900 p-2 rounded border border-slate-800/80">
                        <div className="text-[10px] text-slate-500 font-sans">Current Actuals</div>
                        <div className="font-bold text-slate-300">
                          AED {(budgetAmount * 0.45).toLocaleString()}
                        </div>
                      </div>

                      <div className="bg-slate-900 p-2 rounded border border-amber-500/30">
                        <div className="text-[10px] text-amber-400 font-sans">Adding This Cost</div>
                        <div className="font-bold text-amber-300">+ AED {exp.amount.toLocaleString()}</div>
                      </div>

                      <div className="bg-slate-900 p-2 rounded border border-emerald-500/30">
                        <div className="text-[10px] text-emerald-400 font-sans">Remaining After Approval</div>
                        <div className="font-bold text-emerald-300">
                          AED {Math.max(0, budgetAmount * 0.55 - exp.amount).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Governance Check */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                    {isAuthor && store.currentUser.role !== 'SUPER_ADMIN' ? (
                      <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                        <ShieldAlert className="h-4 w-4 shrink-0" />
                        <span>
                          Self-approval blocked: You submitted this cost. A different authorized approver must sign off.
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Authorized to approve spend on this project.</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() =>
                          setRejectItem({ id: exp.id, type: 'EXPENSE', ref: exp.reference })
                        }
                        className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApproveExpense(exp)}
                        disabled={isAuthor && store.currentUser.role !== 'SUPER_ADMIN'}
                        className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Approve & Post to Actuals
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* POS QUEUE */}
      {activeTab === 'POS' && (
        <div className="space-y-4">
          {pendingPOs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500/50" />
              <h3 className="mt-3 text-sm font-bold text-white">Purchase Order Approvals Clear</h3>
              <p className="mt-1 text-xs text-slate-500">There are no pending purchase orders awaiting issue.</p>
            </div>
          ) : (
            pendingPOs.map((po) => {
              const isAuthor = po.createdById === store.currentUser.id;

              return (
                <div
                  key={po.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-extrabold text-white">{po.reference}</span>
                        <span className="rounded bg-purple-500/20 text-purple-300 font-semibold text-[11px] px-2 py-0.5 uppercase">
                          {po.kind}
                        </span>
                        <span className="rounded bg-amber-500/10 text-amber-300 text-[10px] px-2 py-0.5 font-bold uppercase">
                          Pending Issue
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-300">Vendor: {po.supplierName}</p>
                      <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-4">
                        <span>Raised by: <strong className="text-white">{po.createdByName}</strong></span>
                        <span>Date: {po.orderDate}</span>
                        <span>Expected On-Site: {po.expectedDate}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total Commitment</div>
                      <div className="font-mono text-xl font-black text-indigo-400">
                        {curr} {Math.round(store.convert(po.totalAmount, po.currency, curr)).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">AED {po.totalAmount.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* PO Lines */}
                  <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="text-[10px] text-slate-400 border-b border-slate-800 pb-1">
                          <th className="p-1">WBS Code</th>
                          <th className="p-1 font-sans">Scope</th>
                          <th className="p-1 text-right">Qty</th>
                          <th className="p-1 text-right">Rate</th>
                          <th className="p-1 text-right font-bold text-white">Line Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40 text-slate-300">
                        {po.lines.map((l) => (
                          <tr key={l.id}>
                            <td className="p-1 text-blue-400 font-bold">{l.costCodeCode}</td>
                            <td className="p-1 font-sans">{l.description}</td>
                            <td className="p-1 text-right">{l.quantity} {l.unit}</td>
                            <td className="p-1 text-right">{l.unitRate}</td>
                            <td className="p-1 text-right font-bold text-white">
                              AED {l.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Actions / Governance Check */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                    {isAuthor && store.currentUser.role !== 'SUPER_ADMIN' ? (
                      <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                        <ShieldAlert className="h-4 w-4 shrink-0" />
                        <span>
                          Self-issue blocked: An order is a commitment of company funds. A second reviewer must authorize it.
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Issuing this order will officially encumber {po.currency} {po.subtotal.toLocaleString()} across budget lines.</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() =>
                          setRejectItem({ id: po.id, type: 'PO', ref: po.reference })
                        }
                        className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprovePO(po)}
                        disabled={isAuthor && store.currentUser.role !== 'SUPER_ADMIN'}
                        className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Issue Order & Encumber Budget
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Reject Modal */}
      {rejectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Reject {rejectItem.ref}</h2>
              <button onClick={() => setRejectItem(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <p className="text-slate-300">
                Please provide the justification for returning this item to the author.
              </p>

              <div>
                <label className="text-slate-300 font-medium">Rejection Reason</label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRejectItem(null)}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="rounded-lg bg-rose-600 px-4 py-1.5 font-semibold text-white hover:bg-rose-500"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
