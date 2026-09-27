import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Upload,
  Download,
  Search,
  CheckCircle2,
  X,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { store } from '../services/store';
import { CostCode } from '../types';

export const CostCodesView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // New Cost Code Form State
  const [code, setCode] = useState('');
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState<CostCode['category']>('CIVIL');
  const [unit, setUnit] = useState('m3');
  const [qty, setQty] = useState('');
  const [rate, setRate] = useState('');

  // BOQ CSV Import State
  const [csvText, setCsvText] = useState(
    `03-3400, Precast Hollowcore Slabs (250mm thk), STRUCTURAL, m2, 14000, 220
07-2000, Extruded Polystyrene Thermal Roof Insulation (50mm), CIVIL, m2, 3500, 85
09-3000, Acoustic Gypsum Ceiling Tiles with Aluminum Grid, FINISHES, m2, 8500, 145`
  );
  const [parsedRows, setParsedRows] = useState<any[]>([]);

  const curr = store.displayCurrency;
  const projectCodes = store.costCodes.filter((c) => c.projectId === store.currentProjectId);

  const filtered = projectCodes.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCat === 'ALL' || c.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handleAddCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !desc) return;
    const quantity = parseFloat(qty) || 1;
    const unitRate = parseFloat(rate) || 0;
    const budgetAmount = quantity * unitRate;

    store.costCodes.push({
      id: `cc-${Date.now()}`,
      companyId: store.company.id,
      projectId: store.currentProjectId,
      code,
      description: desc,
      category: cat,
      unit,
      quantity,
      unitRate,
      budgetAmount,
      currency: 'AED',
      status: 'ACTIVE',
    });

    store.recordAudit('COST_CODE_ADDED', 'CostCode', code, `Added WBS line ${code}: ${desc}`);
    setAddModalOpen(false);
    setCode('');
    setDesc('');
    setQty('');
    setRate('');
  };

  const handleParseCsv = () => {
    const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
    const parsed = lines.map((line, idx) => {
      const parts = line.split(',').map((p) => p.trim());
      const pCode = parts[0] || `BOQ-${idx + 1}`;
      const pDesc = parts[1] || 'Unspecified item';
      const pCat = (parts[2]?.toUpperCase() as any) || 'CIVIL';
      const pUnit = parts[3] || 'LS';
      const pQty = parseFloat(parts[4]) || 1;
      const pRate = parseFloat(parts[5]) || 0;
      return {
        code: pCode,
        description: pDesc,
        category: pCat,
        unit: pUnit,
        quantity: pQty,
        unitRate: pRate,
        budgetAmount: pQty * pRate,
        currency: 'AED',
      };
    });
    setParsedRows(parsed);
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) handleParseCsv();
    store.importCostCodes(
      parsedRows.length > 0
        ? parsedRows
        : [
            {
              projectId: store.currentProjectId,
              code: '03-3400',
              description: 'Precast Hollowcore Slabs (250mm thk)',
              category: 'STRUCTURAL',
              unit: 'm2',
              quantity: 14000,
              unitRate: 220,
              budgetAmount: 14000 * 220,
              currency: 'AED',
            },
          ]
    );
    setImportModalOpen(false);
    setParsedRows([]);
  };

  const handleExportCsv = () => {
    const headers = 'Code,Description,Category,Unit,Quantity,UnitRate,BudgetAmount,Currency\n';
    const rows = projectCodes
      .map(
        (c) =>
          `"${c.code}","${c.description}","${c.category}","${c.unit}",${c.quantity},${c.unitRate},${c.budgetAmount},${c.currency}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BOQ-CostCodes-${store.currentProjectId}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Budget & WBS Cost Codes Register
            </h1>
            <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[11px] font-semibold text-blue-400">
              Bill of Quantities
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Define work breakdown structures, units of measurement, bill rates, and revised budget baselines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setImportModalOpen(true);
              handleParseCsv();
            }}
            className="flex items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-950/40 px-3 py-2 text-xs font-semibold text-blue-300 transition hover:bg-blue-900/50"
          >
            <Upload className="h-3.5 w-3.5 text-blue-400" />
            <span>Import BOQ (CSV)</span>
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-500/30 transition hover:bg-blue-500"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add WBS Code</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search cost code or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Category:</span>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
          >
            {['ALL', 'CIVIL', 'STRUCTURAL', 'MEP', 'FINISHES', 'PRELIMINARIES', 'SUBCONTRACT'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase">
                <th className="py-3 px-4">WBS Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Qty</th>
                <th className="py-3 px-4 text-center">Unit</th>
                <th className="py-3 px-4 text-right">Unit Rate (AED)</th>
                <th className="py-3 px-4 text-right">Budget Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/50 transition">
                  <td className="py-3 px-4 font-bold text-blue-400">{c.code}</td>
                  <td className="py-3 px-4 font-sans">
                    <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] text-slate-300 font-medium">
                      {c.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-200 font-medium">{c.description}</td>
                  <td className="py-3 px-4 text-right text-slate-300">{c.quantity.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center font-sans text-slate-400">{c.unit}</td>
                  <td className="py-3 px-4 text-right text-slate-300">{c.unitRate.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-400">
                    {curr} {Math.round(store.convert(c.budgetAmount, 'AED', curr)).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400 font-semibold">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOQ CSV Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-400" />
                <h2 className="text-base font-bold text-white">Import Bill of Quantities (BOQ)</h2>
              </div>
              <button
                onClick={() => setImportModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-slate-300">
                Paste your comma-separated values (CSV) in the format:{' '}
                <code className="text-blue-400 bg-slate-800 px-1 py-0.5 rounded font-mono">
                  Code, Description, Category, Unit, Quantity, UnitRate
                </code>
              </p>

              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                rows={4}
                className="w-full font-mono text-xs rounded-lg border border-slate-700 bg-slate-950 p-3 text-emerald-400 focus:border-blue-500 focus:outline-none"
              />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleParseCsv}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                >
                  Re-parse Input
                </button>
                <span className="text-xs text-slate-400">
                  {parsedRows.length} item(s) ready for import
                </span>
              </div>

              {/* Preview Table */}
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2 max-h-48 overflow-y-auto">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 pb-1">
                      <th className="p-1">Code</th>
                      <th className="p-1">Description</th>
                      <th className="p-1">Cat</th>
                      <th className="p-1 text-right">Qty</th>
                      <th className="p-1 text-right">Rate</th>
                      <th className="p-1 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {parsedRows.map((r, i) => (
                      <tr key={i} className="text-slate-300">
                        <td className="p-1 text-blue-400 font-bold">{r.code}</td>
                        <td className="p-1 font-sans truncate max-w-xs">{r.description}</td>
                        <td className="p-1 font-sans">{r.category}</td>
                        <td className="p-1 text-right">{r.quantity}</td>
                        <td className="p-1 text-right">{r.unitRate}</td>
                        <td className="p-1 text-right text-emerald-400 font-bold">
                          AED {r.budgetAmount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Import {parsedRows.length} Items into WBS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add WBS Code Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Add New WBS Budget Line</h2>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddCode} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Cost Code (CSI / WBS)</label>
                <input
                  type="text"
                  placeholder="e.g. 03-3100"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Raft Concrete C60 Pour"
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium">Category</label>
                  <select
                    value={cat}
                    onChange={(e) => setCat(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  >
                    {['CIVIL', 'STRUCTURAL', 'MEP', 'FINISHES', 'PRELIMINARIES', 'SUBCONTRACT'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Unit</label>
                  <input
                    type="text"
                    placeholder="m3, Ton, LS, m2"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium">Quantity</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="1000"
                    required
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Unit Rate (AED)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="450"
                    required
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 text-right">
                <span className="text-[11px] text-slate-400">Total Calculated Budget: </span>
                <span className="font-mono text-sm font-bold text-emerald-400">
                  AED {((parseFloat(qty) || 0) * (parseFloat(rate) || 0)).toLocaleString()}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-1.5 font-semibold text-white hover:bg-blue-500"
                >
                  Save WBS Line
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
