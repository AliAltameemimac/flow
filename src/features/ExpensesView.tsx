import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Building,
  Link,
  X,
  CreditCard,
} from 'lucide-react';
import { store } from '../services/store';
import { Expense, ExpenseStatus } from '../types';

export const ExpensesView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<'DIRECT' | 'PO_INVOICE'>('DIRECT');

  // Form State
  const [costCodeId, setCostCodeId] = useState(store.costCodes[0]?.id || '');
  const [supplierId, setSupplierId] = useState(store.suppliers[0]?.id || '');
  const [poId, setPoId] = useState('');
  const [poLineId, setPoLineId] = useState('');
  const [description, setDescription] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('2026-10-25');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('LS');
  const [unitRate, setUnitRate] = useState('50000');
  const [amount, setAmount] = useState('50000');
  const [errorMsg, setErrorMsg] = useState('');

  const curr = store.displayCurrency;
  const projectExpenses = store.expenses.filter((e) => e.projectId === store.currentProjectId);
  const projectCostCodes = store.costCodes.filter((c) => c.projectId === store.currentProjectId);
  const approvedPOs = store.purchaseOrders.filter(
    (p) => p.projectId === store.currentProjectId && p.status === 'approved'
  );

  const filtered = projectExpenses.filter((e) => {
    const matchesSearch =
      e.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.supplierName && e.supplierName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRateOrQtyChange = (newQty: string, newRate: string) => {
    setQuantity(newQty);
    setUnitRate(newRate);
    const q = parseFloat(newQty) || 0;
    const r = parseFloat(newRate) || 0;
    setAmount(String(q * r));
  };

  const handlePoSelect = (selectedPoId: string) => {
    setPoId(selectedPoId);
    const foundPo = approvedPOs.find((p) => p.id === selectedPoId);
    if (foundPo && foundPo.lines.length > 0) {
      const line = foundPo.lines[0];
      setPoLineId(line.id);
      setCostCodeId(line.costCodeId);
      setSupplierId(foundPo.supplierId);
      setDescription(`Invoice for ${line.description} against ${foundPo.reference}`);
      const remainingLine = Math.max(0, line.amount - (line.invoicedAmount || 0));
      setAmount(String(remainingLine));
      setQuantity('1');
      setUnit(line.unit);
      setUnitRate(String(remainingLine));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cCode = projectCostCodes.find((c) => c.id === costCodeId);
    if (!cCode) return;
    const sup = store.suppliers.find((s) => s.id === supplierId);
    const numAmount = parseFloat(amount) || 0;

    try {
      const settlements =
        mode === 'PO_INVOICE' && poId && poLineId
          ? [
              {
                poId,
                poLineId,
                costCodeId,
                amountSettled: numAmount,
              },
            ]
          : undefined;

      store.createExpense({
        projectId: store.currentProjectId,
        costCodeId,
        costCodeCode: cCode.code,
        date,
        category: cCode.category,
        supplierId: sup?.id,
        supplierName: sup?.name,
        description,
        quantity: parseFloat(quantity) || 1,
        unit,
        unitRate: parseFloat(unitRate) || numAmount,
        amount: numAmount,
        currency: 'AED',
        exchangeRate: 1,
        invoiceNumber,
        invoiceDate: date,
        dueDate,
        purchaseOrderId: mode === 'PO_INVOICE' ? poId : undefined,
        settlements,
      });

      setModalOpen(false);
      setErrorMsg('');
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
              Actual Site Costs & Invoices
            </h1>
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
              Spend Ledger
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Log verified actuals, invoice disbursements against purchase orders, and route for approval.
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
          <span>Log Actual Cost / Invoice</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search reference, invoice #, supplier or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Approval Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="submitted">Submitted (Pending Review)</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Expense List */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase">
                <th className="py-3 px-4">Ref / Inv #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">WBS Code</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Settlement</th>
                <th className="py-3 px-4 text-center">Pay Status</th>
                <th className="py-3 px-4 text-center">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.map((exp) => {
                const isPaid = exp.paymentStatus === 'paid';
                const isApproved = exp.status === 'approved';

                return (
                  <tr key={exp.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 font-bold text-blue-400">
                      <div>{exp.reference}</div>
                      {exp.invoiceNumber && exp.invoiceNumber !== exp.reference && (
                        <div className="text-[10px] text-slate-500 font-normal">Inv: {exp.invoiceNumber}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-sans">{exp.date}</td>
                    <td className="py-3 px-4 text-blue-300 font-bold">{exp.costCodeCode}</td>
                    <td className="py-3 px-4 font-sans text-slate-200 max-w-xs truncate">
                      {exp.description}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-300">
                      {exp.supplierName || 'Direct / Internal'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-white">
                      {curr} {Math.round(store.convert(exp.amount, exp.currency, curr)).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      {exp.purchaseOrderId ? (
                        <span className="inline-flex items-center gap-1 rounded bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                          <Link className="h-3 w-3" /> PO Settled
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Direct Cost</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          isPaid
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : exp.paymentStatus === 'partial'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {exp.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          isApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : exp.status === 'submitted'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {exp.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Cost Entry */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">Log Actual Site Cost or Supplier Invoice</h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mode Selector */}
            <div className="mt-4 flex rounded-lg bg-slate-800 p-1 text-xs">
              <button
                type="button"
                onClick={() => setMode('DIRECT')}
                className={`flex-1 rounded-md py-1.5 font-semibold transition ${
                  mode === 'DIRECT' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Direct Site Expense
              </button>
              <button
                type="button"
                onClick={() => setMode('PO_INVOICE')}
                className={`flex-1 rounded-md py-1.5 font-semibold transition ${
                  mode === 'PO_INVOICE' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Invoice Against Purchase Order
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              {mode === 'PO_INVOICE' && (
                <div className="rounded-lg bg-indigo-950/30 border border-indigo-500/30 p-3 space-y-2">
                  <label className="text-indigo-300 font-bold text-[11px] uppercase">
                    Select Issued Purchase Order
                  </label>
                  <select
                    value={poId}
                    onChange={(e) => handlePoSelect(e.target.value)}
                    required
                    className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  >
                    <option value="">-- Choose active approved PO --</option>
                    {approvedPOs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.reference} - {p.supplierName} (Total: AED {p.totalAmount.toLocaleString()})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400">
                    Approving this invoice will automatically convert the matching commitment into actual spend.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium">Attributed WBS Code</label>
                  <select
                    value={costCodeId}
                    onChange={(e) => setCostCodeId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  >
                    {projectCostCodes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.description.slice(0, 30)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium">Supplier / Vendor</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  >
                    {store.suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium">Description / Scope of Invoice</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ready-mix delivery batch #4401"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium">Vendor Invoice #</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INV-9901"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Due Date for Payment</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-medium">Qty</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={quantity}
                    onChange={(e) => handleRateOrQtyChange(e.target.value, unitRate)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Unit Rate (AED)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={unitRate}
                    onChange={(e) => handleRateOrQtyChange(quantity, e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <span className="text-xs text-slate-400">Total Invoice Amount:</span>
                <span className="font-mono text-base font-extrabold text-amber-400">
                  AED {parseFloat(amount || '0').toLocaleString()}
                </span>
              </div>

              {errorMsg && (
                <div className="rounded bg-rose-950/50 p-2.5 text-xs text-rose-300 border border-rose-500/30">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
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
                  Submit Invoice for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
