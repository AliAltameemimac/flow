import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Layers,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { store } from '../services/store';
import { PurchaseOrder, POLineItem, POKind } from '../types';

export const PurchaseOrdersView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [kindFilter, setKindFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelModalPoId, setCancelModalPoId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [supplierId, setSupplierId] = useState(store.suppliers[0]?.id || '');
  const [kind, setKind] = useState<POKind>('purchase');
  const [expectedDate, setExpectedDate] = useState('2026-10-15');
  const [notes, setNotes] = useState('');

  // Line items
  const [lines, setLines] = useState<Omit<POLineItem, 'id'>[]>([
    {
      costCodeId: store.costCodes[0]?.id || '',
      costCodeCode: store.costCodes[0]?.code || '',
      description: 'Supply of certified construction materials',
      quantity: 100,
      unit: 'Ton',
      unitRate: 3200,
      amount: 320000,
    },
  ]);

  const curr = store.displayCurrency;
  const projectPOs = store.purchaseOrders.filter((po) => po.projectId === store.currentProjectId);
  const projectCostCodes = store.costCodes.filter((c) => c.projectId === store.currentProjectId);

  const filtered = projectPOs.filter((po) => {
    const matchesSearch =
      po.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || po.status === statusFilter;
    const matchesKind = kindFilter === 'ALL' || po.kind === kindFilter;
    return matchesSearch && matchesStatus && matchesKind;
  });

  const handleAddLine = () => {
    const defaultCode = projectCostCodes[0] || { id: 'cc-default', code: '00-0000' };
    setLines([
      ...lines,
      {
        costCodeId: defaultCode.id,
        costCodeCode: defaultCode.code,
        description: '',
        quantity: 1,
        unit: 'LS',
        unitRate: 10000,
        amount: 10000,
      },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== idx));
  };

  const handleLineChange = (idx: number, field: string, value: any) => {
    const updated = [...lines];
    const current = { ...updated[idx], [field]: value };

    if (field === 'costCodeId') {
      const found = projectCostCodes.find((c) => c.id === value);
      if (found) current.costCodeCode = found.code;
    }
    if (field === 'quantity' || field === 'unitRate') {
      const q = field === 'quantity' ? parseFloat(value) || 0 : current.quantity;
      const r = field === 'unitRate' ? parseFloat(value) || 0 : current.unitRate;
      current.amount = q * r;
    }

    updated[idx] = current;
    setLines(updated);
  };

  const calculateSubtotal = () => lines.reduce((acc, l) => acc + (l.amount || 0), 0);
  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.05; // 5% VAT UAE standard
  const total = subtotal + tax;

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = store.suppliers.find((s) => s.id === supplierId);
    if (!sup) return;

    try {
      store.createPurchaseOrder({
        projectId: store.currentProjectId,
        kind,
        supplierId: sup.id,
        supplierName: sup.name,
        orderDate: new Date().toISOString().split('T')[0],
        expectedDate,
        currency: 'AED',
        exchangeRate: 1,
        subtotal,
        taxAmount: tax,
        totalAmount: total,
        lines: lines.map((l, i) => ({ ...l, id: `pol-${Date.now()}-${i}` })),
        notes,
      });

      setModalOpen(false);
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleIssue = (poId: string) => {
    try {
      store.issuePurchaseOrder(poId);
      setErrorMsg('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleConfirmCancel = () => {
    if (!cancelModalPoId || !cancelReason.trim()) return;
    try {
      store.cancelPurchaseOrder(cancelModalPoId, cancelReason);
      setCancelModalPoId(null);
      setCancelReason('');
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
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Purchase Orders & Subcontracts
            </h1>
            <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[11px] font-semibold text-indigo-400">
              Budget Commitments
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Encumber budget lines, track commitments before invoicing, and enforce two-person authorization.
          </p>
        </div>

        <button
          onClick={() => {
            setModalOpen(true);
            setErrorMsg('');
          }}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-500/30 transition hover:bg-blue-500"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Raise Purchase Order / Subcontract</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search PO reference or supplier name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Type:</span>
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-200"
            >
              <option value="ALL">All Types</option>
              <option value="purchase">Materials / Purchase</option>
              <option value="subcontract">Subcontract Works</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-200"
            >
              <option value="ALL">All Statuses</option>
              <option value="submitted">Pending Issue (Submitted)</option>
              <option value="approved">Approved & Active</option>
              <option value="closed">Closed (Invoiced)</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* PO Cards / Table */}
      <div className="space-y-3">
        {filtered.map((po) => {
          const isApproved = po.status === 'approved';
          const isSubmitted = po.status === 'submitted';
          const invoicedTotal = po.lines.reduce((acc, l) => acc + (l.invoicedAmount || 0), 0);
          const remainingCommitment = Math.max(0, po.subtotal - invoicedTotal);
          const isAuthor = po.createdById === store.currentUser.id;

          return (
            <div
              key={po.id}
              className="rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-slate-700 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-xs font-bold">
                    PO
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white">{po.reference}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                          po.kind === 'subcontract'
                            ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                            : 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {po.kind}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          po.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : po.status === 'submitted'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : po.status === 'cancelled'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {po.status}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-300 mt-0.5">
                      Supplier: <strong className="text-white">{po.supplierName}</strong> • Date: {po.orderDate}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Total Commitment</div>
                    <div className="font-mono text-base font-extrabold text-white">
                      {curr} {Math.round(store.convert(po.totalAmount, po.currency, curr)).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Incl. 5% VAT ({curr} {Math.round(store.convert(po.taxAmount, po.currency, curr)).toLocaleString()})
                    </div>
                  </div>

                  {/* Actions based on role & status */}
                  <div className="flex items-center gap-1.5">
                    {isSubmitted && (
                      <button
                        onClick={() => handleIssue(po.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold shadow transition ${
                          isAuthor && store.currentUser.role !== 'SUPER_ADMIN'
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500'
                        }`}
                        title={
                          isAuthor && store.currentUser.role !== 'SUPER_ADMIN'
                            ? 'Self-approval denied: An approver other than the author must issue this commitment.'
                            : 'Issue and encumber budget'
                        }
                      >
                        Issue Order
                      </button>
                    )}

                    {isApproved && remainingCommitment > 0 && (
                      <button
                        onClick={() => setCancelModalPoId(po.id)}
                        className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20"
                      >
                        Cancel
                      </button>
                    )}

                    {isApproved && remainingCommitment === 0 && (
                      <button
                        onClick={() => store.closePurchaseOrder(po.id)}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700"
                      >
                        Mark Closed
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Lines Breakdown */}
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-[10px] text-slate-400 border-b border-slate-800/60 pb-1">
                      <th className="py-1 px-2 font-bold uppercase">WBS Code</th>
                      <th className="py-1 px-2 font-bold uppercase font-sans">Scope / Item</th>
                      <th className="py-1 px-2 text-right">Qty</th>
                      <th className="py-1 px-2 text-center font-sans">Unit</th>
                      <th className="py-1 px-2 text-right">Unit Rate</th>
                      <th className="py-1 px-2 text-right">Line Amount</th>
                      <th className="py-1 px-2 text-right">Invoiced to Date</th>
                      <th className="py-1 px-2 text-right text-indigo-400 font-bold">Open Commitment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {po.lines.map((l) => {
                      const inv = l.invoicedAmount || 0;
                      const open = Math.max(0, l.amount - inv);
                      return (
                        <tr key={l.id}>
                          <td className="py-1.5 px-2 font-bold text-blue-400">{l.costCodeCode}</td>
                          <td className="py-1.5 px-2 font-sans text-slate-200 truncate max-w-xs">
                            {l.description}
                          </td>
                          <td className="py-1.5 px-2 text-right">{l.quantity.toLocaleString()}</td>
                          <td className="py-1.5 px-2 text-center font-sans text-slate-400">{l.unit}</td>
                          <td className="py-1.5 px-2 text-right">{l.unitRate.toLocaleString()}</td>
                          <td className="py-1.5 px-2 text-right font-medium text-white">
                            {l.amount.toLocaleString()}
                          </td>
                          <td className="py-1.5 px-2 text-right text-amber-400">{inv.toLocaleString()}</td>
                          <td className="py-1.5 px-2 text-right font-bold text-indigo-400">
                            {open.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Status Note or Reason */}
              {po.cancellationReason && (
                <div className="mt-2.5 rounded bg-rose-950/40 border border-rose-500/20 p-2 text-xs text-rose-300">
                  <strong>Cancellation Reason:</strong> {po.cancellationReason}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Raise PO Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">
                  Raise Purchase Order or Subcontract Commitment
                </h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-medium">Commitment Type</label>
                  <select
                    value={kind}
                    onChange={(e) => setKind(e.target.value as POKind)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  >
                    <option value="purchase">Material Purchase Order</option>
                    <option value="subcontract">Subcontract Agreement</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium">Vendor / Supplier</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  >
                    {store.suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium">Expected on Site Date</label>
                  <input
                    type="date"
                    required
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Line Items Section */}
              <div className="border border-slate-800 rounded-xl p-3 bg-slate-950/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Order Bill Lines (Attributed to WBS Budget Codes)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-xs text-blue-400 font-semibold hover:bg-slate-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Line Item</span>
                  </button>
                </div>

                {lines.map((l, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center rounded-lg bg-slate-900 p-2.5 border border-slate-800"
                  >
                    <div className="sm:col-span-3">
                      <label className="text-[10px] text-slate-400">WBS Code</label>
                      <select
                        value={l.costCodeId}
                        onChange={(e) => handleLineChange(idx, 'costCodeId', e.target.value)}
                        className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white"
                      >
                        {projectCostCodes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.code} - {c.description.slice(0, 24)}...
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[10px] text-slate-400">Description</label>
                      <input
                        type="text"
                        placeholder="Item detail"
                        value={l.description}
                        onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                        className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-400">Qty</label>
                      <input
                        type="number"
                        step="any"
                        value={l.quantity}
                        onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                        className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-400">Unit Rate (AED)</label>
                      <input
                        type="number"
                        step="any"
                        value={l.unitRate}
                        onChange={(e) => handleLineChange(idx, 'unitRate', e.target.value)}
                        className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-between pt-3 sm:pt-0">
                      <div>
                        <div className="text-[10px] text-slate-400">Total</div>
                        <div className="font-mono font-bold text-white">{l.amount.toLocaleString()}</div>
                      </div>
                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Subtotal & Total Preview */}
                <div className="flex justify-end gap-6 text-right pt-2 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400">Subtotal: </span>
                    <span className="font-mono text-white font-bold">AED {subtotal.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">VAT (5%): </span>
                    <span className="font-mono text-white font-bold">AED {tax.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Total Amount: </span>
                    <span className="font-mono text-emerald-400 font-extrabold text-sm">
                      AED {total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium">Notes & Mill Inspection Requirements</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Mill test certificates, warranty terms, delivery access rules"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-white"
                />
              </div>

              {errorMsg && (
                <div className="rounded bg-rose-950/50 p-2.5 text-xs text-rose-300 border border-rose-500/30">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 shadow"
                >
                  Submit for Authorization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelModalPoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Cancel Purchase Order</h2>
              <button onClick={() => setCancelModalPoId(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <p className="text-slate-300">
                Cancelling this order releases all unbilled commitment amounts back into the project budget.
                A written justification is required for the audit record.
              </p>

              <div>
                <label className="text-slate-300 font-medium">Cancellation Reason (min 4 chars)</label>
                <textarea
                  rows={3}
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Scope revised, supplier cancelled delivery, package rescinded..."
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCancelModalPoId(null)}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300"
                >
                  Abort
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={cancelReason.trim().length < 4}
                  className="rounded-lg bg-rose-600 px-4 py-1.5 font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
