import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  DollarSign,
  PieChart,
  Layers,
  ArrowUpRight,
  Filter,
  Search,
  FileSpreadsheet,
  Plus,
  SlidersHorizontal,
  BellRing,
} from 'lucide-react';
import { store } from '../services/store';
import { CostVisualizationChart } from './CostVisualizationChart';

interface CostDashboardProps {
  onNavigate: (view: string) => void;
}

export const CostDashboard: React.FC<CostDashboardProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [alertThreshold, setAlertThreshold] = useState<number>(5.0); // 5% default threshold as requested
  const [onlyShowThresholdAlerts, setOnlyShowThresholdAlerts] = useState<boolean>(false);

  const analytics = store.getCostAnalytics();
  const curr = store.displayCurrency;

  const fmt = (val: number) => {
    const converted = store.convert(val, 'AED', curr);
    return `${curr} ${Math.round(converted).toLocaleString()}`;
  };

  const categories = ['ALL', 'CIVIL', 'STRUCTURAL', 'MEP', 'FINISHES', 'PRELIMINARIES', 'SUBCONTRACT'];

  // Identify all cost codes exceeding budget by > alertThreshold (default 5%)
  const codesExceedingThreshold = analytics.codePerformances.filter(
    (c) => (c.overrunPercentage || 0) > alertThreshold
  );

  const filteredPerformances = analytics.codePerformances.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || c.category === selectedCategory;
    const matchesThresholdFilter = !onlyShowThresholdAlerts || (c.overrunPercentage || 0) > alertThreshold;
    return matchesSearch && matchesCat && matchesThresholdFilter;
  });

  const overBudgetCodes = analytics.codePerformances.filter((c) => c.isOverBudget);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Cost Control & Budget Dashboard
            </h1>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
              Live Reconciliation
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Project: <strong className="text-slate-200">{analytics.project.projectName}</strong> •
            Contract Value: <span className="font-mono text-blue-400">{fmt(analytics.project.contractValue)}</span> •
            Progress: <strong className="text-emerald-400">{analytics.project.progressPercentage}%</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('cost-codes')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-blue-400" />
            <span>Manage WBS / BOQ</span>
          </button>
          <button
            onClick={() => onNavigate('expenses')}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-500/30 transition hover:bg-blue-500"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Log Actual Cost</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (Phase 1-3 Metrics) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {/* Total Budget */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Revised Budget</span>
            <DollarSign className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 text-lg sm:text-2xl font-black text-white font-mono">
            {fmt(analytics.totalBudget)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>{analytics.codePerformances.length} Active WBS Lines</span>
            <span className="text-slate-300 font-medium">100% Baselined</span>
          </div>
        </div>

        {/* Actual Spend */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Actual Spend</span>
            <TrendingDown className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-lg sm:text-2xl font-black text-amber-400 font-mono">
            {fmt(analytics.totalActual)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Approved Invoices Only</span>
            <span className="font-semibold text-amber-300">
              {((analytics.totalActual / (analytics.totalBudget || 1)) * 100).toFixed(1)}% of Budget
            </span>
          </div>
        </div>

        {/* Committed Encumbrance */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Committed (Open POs)</span>
            <Layers className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-lg sm:text-2xl font-black text-indigo-400 font-mono">
            {fmt(analytics.totalCommitted)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Derived from Issued POs</span>
            <span className="text-indigo-300 font-medium">
              {((analytics.totalCommitted / (analytics.totalBudget || 1)) * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Remaining Uncommitted */}
        <div
          className={`rounded-xl border p-4 shadow-sm ${
            analytics.remainingBudget >= 0
              ? 'border-emerald-500/30 bg-emerald-950/20'
              : 'border-rose-500/40 bg-rose-950/20'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-300">
            <span>Remaining Budget</span>
            <CheckCircle2
              className={`h-4 w-4 ${analytics.remainingBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
            />
          </div>
          <div
            className={`mt-2 text-lg sm:text-2xl font-black font-mono ${
              analytics.remainingBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {fmt(analytics.remainingBudget)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Budget - Actual - Committed</span>
            <span
              className={`font-semibold ${
                analytics.remainingBudget >= 0 ? 'text-emerald-300' : 'text-rose-300'
              }`}
            >
              {(100 - analytics.percentConsumed).toFixed(1)}% unencumbered
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Performance Bars: Forecast, EAC & Margin */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* EAC & Variance Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Estimate At Completion (EAC)
              </h3>
              <p className="text-[11px] text-slate-500">Actual ÷ Progress (Top-down)</p>
            </div>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-300">Projected Final Cost:</span>
              <span className="font-mono text-lg font-bold text-white">{fmt(analytics.eac)}</span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-300">Variance at Completion (VAC):</span>
              <span
                className={`font-mono text-sm font-extrabold ${
                  analytics.variance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {analytics.variance >= 0 ? '+' : ''}
                {fmt(analytics.variance)}
              </span>
            </div>

            <div className="rounded-lg bg-slate-800/80 p-2.5 text-[11px] text-slate-400">
              {analytics.variance >= 0 ? (
                <span className="text-emerald-400 font-medium">
                  Project is performing within total cost parameters. Favorable variance.
                </span>
              ) : (
                <span className="text-rose-400 font-medium">
                  Warning: Projected cost exceeds total budget. High burn rate on early packages.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profitability & Margin Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Projected Profit & Margin
              </h3>
              <p className="text-[11px] text-slate-500">Contract Value − EAC</p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <PieChart className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Projected Margin %:</span>
              <span
                className={`font-mono text-2xl font-black ${
                  analytics.projectedMarginPercentage >= 15
                    ? 'text-emerald-400'
                    : analytics.projectedMarginPercentage > 0
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {analytics.projectedMarginPercentage.toFixed(1)}%
              </span>
            </div>

            {/* Visual Margin Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0% Breakeven</span>
                <span>Target: 20%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    analytics.projectedMarginPercentage >= 15
                      ? 'bg-emerald-500'
                      : analytics.projectedMarginPercentage > 0
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, analytics.projectedMarginPercentage * 2.5))}%` }}
                />
              </div>
            </div>

            <div className="flex items-baseline justify-between text-xs pt-1">
              <span className="text-slate-400">Projected Gross Profit:</span>
              <span className="font-mono font-bold text-white">
                {fmt(analytics.project.contractValue - analytics.eac)}
              </span>
            </div>
          </div>
        </div>

        {/* Budget Health & Warnings */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Variance Watchlist & Alerts
              </h3>
              <p className="text-[11px] text-slate-500">
                Threshold: <span className="text-rose-400 font-semibold">&gt; {alertThreshold}% Budget Overrun</span>
              </p>
            </div>
            <div className={`rounded-lg p-2 ${codesExceedingThreshold.length > 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-amber-500/10 text-amber-400'}`}>
              <AlertTriangle className={`h-4 w-4 ${codesExceedingThreshold.length > 0 ? 'animate-pulse' : ''}`} />
            </div>
          </div>

          <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-1">
            {codesExceedingThreshold.length > 0 ? (
              codesExceedingThreshold.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-lg bg-rose-950/30 p-2 text-xs border border-rose-500/40 text-rose-300"
                >
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-400 fill-rose-500/20 shrink-0 animate-pulse" />
                    <span className="font-mono text-white font-bold">{c.code}</span>
                    <span className="text-slate-300 truncate font-sans text-[11px]">{c.description}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-[11px] font-extrabold text-rose-400 block">
                      +{c.overrunPercentage.toFixed(1)}% ({fmt(c.overrunAmount)})
                    </span>
                    <span className="text-[9px] uppercase font-bold text-rose-400/80">Threshold Alert</span>
                  </div>
                </div>
              ))
            ) : overBudgetCodes.length > 0 ? (
              overBudgetCodes.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-lg bg-slate-800/80 p-2 text-xs border border-amber-500/20"
                >
                  <div className="truncate pr-2">
                    <span className="font-mono text-blue-400 mr-1.5">{c.code}</span>
                    <span className="text-slate-200 truncate">{c.description}</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-amber-400 shrink-0">
                    Over by {fmt(Math.abs(c.remaining))} (+{c.overrunPercentage.toFixed(1)}%)
                  </span>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-xs text-emerald-400">
                ✓ All cost code packages are currently tracking within baseline allowances.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recharts Data Visualization Component: Budget (Estimated) vs. Actual vs. Committed */}
      <CostVisualizationChart analytics={analytics} />

      {/* Cost Code Variance Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">WBS Cost Code Performance Register</h2>
              <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                {filteredPerformances.length} lines shown
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Line-by-line budget vs. actual spend, derived purchase commitments, and variance.
            </p>
          </div>

          {/* Filter & Search Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search code or desc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-40 sm:w-56 rounded-lg border border-slate-700 bg-slate-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Alert Threshold Control & Banner Feature */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <SlidersHorizontal className="h-3.5 w-3.5 text-rose-400" />
              <span>Alert Threshold:</span>
            </div>

            {/* Threshold Quick Presets */}
            <div className="flex items-center gap-1">
              {[0, 3, 5, 10].map((t) => (
                <button
                  key={t}
                  onClick={() => setAlertThreshold(t)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono transition ${
                    alertThreshold === t
                      ? 'bg-rose-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  &gt;{t}%{t === 5 ? ' (Req)' : ''}
                </button>
              ))}
            </div>

            {/* Custom Threshold Input */}
            <div className="flex items-center gap-1 text-[11px] text-slate-400 ml-1">
              <span>Custom:</span>
              <input
                type="number"
                step="0.5"
                min="0"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(parseFloat(e.target.value) || 0)}
                className="w-14 rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-xs text-rose-400 font-mono text-center font-bold"
              />
              <span>%</span>
            </div>

            <div className="h-4 w-px bg-slate-800 hidden sm:block" />

            {/* Active Threshold Alert Counter */}
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1 ${
                codesExceedingThreshold.length > 0
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              <AlertTriangle className="h-3 w-3" />
              <span>
                {codesExceedingThreshold.length > 0
                  ? `${codesExceedingThreshold.length} Code(s) Exceeding >${alertThreshold}%`
                  : `0 Codes Exceeding >${alertThreshold}%`}
              </span>
            </span>
          </div>

          {/* Quick Filter Toggle Button */}
          <button
            onClick={() => setOnlyShowThresholdAlerts(!onlyShowThresholdAlerts)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              onlyShowThresholdAlerts
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-900/40'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <AlertTriangle className={`h-3.5 w-3.5 ${onlyShowThresholdAlerts ? 'text-white' : 'text-rose-400'}`} />
            <span>{onlyShowThresholdAlerts ? 'Showing All Cost Codes' : `Filter Only >${alertThreshold}% Overruns`}</span>
          </button>
        </div>

        {/* The Register Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                <th className="py-2.5 px-3">Code / WBS</th>
                <th className="py-2.5 px-3">Package Description</th>
                <th className="py-2.5 px-3 text-right">Budget</th>
                <th className="py-2.5 px-3 text-right">Actual Invoiced</th>
                <th className="py-2.5 px-3 text-right">Committed (POs)</th>
                <th className="py-2.5 px-3 text-right">Remaining</th>
                <th className="py-2.5 px-3 text-center">Burn %</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredPerformances.map((c) => {
                const isOver = c.remaining < 0;
                const isThresholdExceeded = (c.overrunPercentage || 0) > alertThreshold;

                return (
                  <tr
                    key={c.id}
                    className={`transition ${
                      isThresholdExceeded
                        ? 'bg-rose-950/25 border-l-4 border-l-rose-500 hover:bg-rose-950/35'
                        : isOver
                        ? 'bg-rose-950/10 hover:bg-slate-800/40'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-semibold">
                      <div className="flex items-center gap-1.5">
                        {isThresholdExceeded ? (
                          <>
                            <div className="relative group/warn cursor-help">
                              <AlertTriangle className="h-4 w-4 text-rose-400 fill-rose-500/20 animate-pulse shrink-0" />
                              <div className="absolute left-0 bottom-full mb-1 hidden group-hover/warn:block w-52 rounded-lg bg-slate-950 border border-slate-700 p-2 text-[10px] text-white shadow-xl z-50 font-sans">
                                <strong className="text-rose-400 block font-bold">Alert Threshold Exceeded</strong>
                                Cost code exceeds baseline by +{(c.overrunPercentage || 0).toFixed(1)}% (Threshold: {alertThreshold}%). Overrun: {fmt(c.overrunAmount)}.
                              </div>
                            </div>
                            <span className="text-rose-300 font-bold">{c.code}</span>
                            <span className="rounded bg-rose-500/20 text-rose-300 text-[9px] font-extrabold px-1.5 py-0.2 border border-rose-500/40 shrink-0 font-sans">
                              &gt;{alertThreshold}% ALERT
                            </span>
                          </>
                        ) : (
                          <span className="text-blue-400">{c.code}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-200 max-w-xs truncate">
                      {c.description}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-100">
                      {fmt(c.budgetAmount)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-amber-400 font-semibold">
                      {fmt(c.actual)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-indigo-400">
                      {fmt(c.committed)}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        isOver ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {fmt(c.remaining)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center gap-1.5 justify-center font-sans">
                        <div className="h-1.5 w-12 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isThresholdExceeded
                                ? 'bg-rose-500 animate-pulse'
                                : c.consumedPct > 100
                                ? 'bg-rose-500'
                                : c.consumedPct > 85
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, c.consumedPct)}%` }}
                          />
                        </div>
                        <span className={`text-[10px] ${isThresholdExceeded ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                          {c.consumedPct.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      {isThresholdExceeded ? (
                        <span className="inline-flex items-center gap-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/60 px-2 py-0.5 text-[10px] font-extrabold shadow-sm shadow-rose-900/50">
                          <AlertTriangle className="h-3 w-3 text-rose-400 shrink-0" />
                          <span>OVERRUN +{(c.overrunPercentage || 0).toFixed(1)}%</span>
                        </span>
                      ) : (
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold ${
                            isOver
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : c.consumedPct > 85
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {isOver ? 'OVERRUN' : c.consumedPct > 85 ? 'WATCHLIST' : 'HEALTHY'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
