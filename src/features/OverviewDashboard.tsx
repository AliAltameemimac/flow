import React from 'react';
import {
  TrendingUp,
  HelpCircle,
  Layers,
  FileCheck2,
  AlertOctagon,
  Clock,
  ArrowRight,
  Plus,
  Coins,
  Receipt,
  ShoppingCart,
  Building,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Users,
  Sun,
} from 'lucide-react';
import { store } from '../services/store';

interface OverviewDashboardProps {
  onNavigate: (view: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigate }) => {
  const analytics = store.getCostAnalytics();
  const curr = store.displayCurrency;

  const fmt = (val: number) => {
    const converted = store.convert(val, 'AED', curr);
    return `${curr} ${Math.round(converted).toLocaleString()}`;
  };

  const openRfis = store.rfis.filter((r) => r.status !== 'CLOSED').length;
  const criticalRfis = store.rfis.filter((r) => r.priority === 'CRITICAL' && r.status !== 'CLOSED').length;
  const openNcrs = store.ncrs.filter((n) => n.status !== 'VERIFIED_CLOSED').length;
  const pendingApprovals = analytics.pendingExpensesCount + analytics.pendingPOsCount;

  const projectReports = store.dailyReports.filter((r) => r.projectId === store.currentProjectId);
  const latestReport = projectReports[0];
  const todayHeadcount = latestReport ? latestReport.totalHeadcount : 0;
  const todayManHours = latestReport ? latestReport.totalManHours : 0;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Hero Welcome & Project Scope */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-mono font-bold text-blue-400">
                {analytics.project.projectCode}
              </span>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                On Schedule • Physical: {analytics.project.progressPercentage}%
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black text-white tracking-tight">
              {analytics.project.projectName}
            </h1>
            <p className="mt-1 text-xs text-slate-400 max-w-2xl leading-relaxed">
              Supervising Consultant: <strong className="text-slate-200">{analytics.project.consultantName}</strong> •
              Client: <strong className="text-slate-200">{analytics.project.clientName}</strong> •
              Location: {analytics.project.location}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('cost-dashboard')}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition"
            >
              <span>Cost & Variance</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate('rfis')}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
            >
              <HelpCircle className="h-4 w-4 text-blue-400" />
              <span>RFIs ({openRfis})</span>
            </button>
            <button
              onClick={() => onNavigate('approvals')}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition"
            >
              <Clock className="h-4 w-4" />
              <span>Approvals ({pendingApprovals})</span>
            </button>
            <button
              onClick={() => onNavigate('daily-reports')}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition"
            >
              <Calendar className="h-4 w-4 text-emerald-400" />
              <span>Daily Site Diary ({todayHeadcount} on site)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Combined Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cost Burn */}
        <div
          onClick={() => onNavigate('cost-dashboard')}
          className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/90 p-4 transition hover:border-slate-700 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Revised Project Budget</span>
            <Coins className="h-4 w-4 text-blue-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-white font-mono">
            {fmt(analytics.totalBudget)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Actual: <strong className="text-amber-400 font-mono">{fmt(analytics.totalActual)}</strong></span>
            <span className="text-emerald-400 font-bold">{analytics.percentConsumed.toFixed(0)}% Burn</span>
          </div>
        </div>

        {/* Project Margin */}
        <div
          onClick={() => onNavigate('cost-dashboard')}
          className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/90 p-4 transition hover:border-slate-700 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Projected Margin</span>
            <TrendingUp className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            {analytics.projectedMarginPercentage.toFixed(1)}%
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>EAC: {fmt(analytics.eac)}</span>
            <span className="text-slate-300 font-mono">Target: 20%</span>
          </div>
        </div>

        {/* Open RFIs */}
        <div
          onClick={() => onNavigate('rfis')}
          className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/90 p-4 transition hover:border-slate-700 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Open Technical RFIs</span>
            <HelpCircle className="h-4 w-4 text-blue-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-white font-mono">
            {openRfis} <span className="text-xs font-normal text-slate-400">Active</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{criticalRfis} Critical High-Priority</span>
            <span className="text-blue-400 font-medium group-hover:underline">View register →</span>
          </div>
        </div>

        {/* Quality Defect / NCRs */}
        <div
          onClick={() => onNavigate('submittals')}
          className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/90 p-4 transition hover:border-slate-700 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Quality NCR Defects</span>
            <AlertOctagon className="h-4 w-4 text-rose-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-rose-400 font-mono">
            {openNcrs} <span className="text-xs font-normal text-slate-400">Pending Action</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{store.submittals.length} Material Submittals</span>
            <span className="text-rose-400 font-medium group-hover:underline">Review QA →</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Cost Summary & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cost & Committed Distribution */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Spend Breakdown & Procurement Commitments
              </h2>
              <p className="text-xs text-slate-400">Phase 1-3 Invariant: Budget == Actual + Committed + Remaining</p>
            </div>
            <button
              onClick={() => onNavigate('cost-dashboard')}
              className="text-xs text-blue-400 font-semibold hover:underline"
            >
              Full Variance Table →
            </button>
          </div>

          {/* Visual Multi-Segment Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-amber-400 font-bold">
                Actual: {fmt(analytics.totalActual)} ({((analytics.totalActual / analytics.totalBudget) * 100).toFixed(0)}%)
              </span>
              <span className="text-indigo-400 font-bold">
                Committed POs: {fmt(analytics.totalCommitted)} ({((analytics.totalCommitted / analytics.totalBudget) * 100).toFixed(0)}%)
              </span>
              <span className="text-emerald-400 font-bold">
                Remaining: {fmt(analytics.remainingBudget)}
              </span>
            </div>

            <div className="h-4 w-full rounded-full bg-slate-800 overflow-hidden flex">
              <div
                className="bg-amber-500 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, (analytics.totalActual / analytics.totalBudget) * 100)}%` }}
                title="Actual Invoiced"
              />
              <div
                className="bg-indigo-500 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, (analytics.totalCommitted / analytics.totalBudget) * 100)}%` }}
                title="Committed POs"
              />
              <div
                className="bg-emerald-600 h-full transition-all duration-500"
                style={{ width: `${Math.max(0, (analytics.remainingBudget / analytics.totalBudget) * 100)}%` }}
                title="Uncommitted Budget"
              />
            </div>
          </div>

          {/* Highlights of WBS Packages */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {analytics.codePerformances.slice(0, 4).map((c) => (
              <div key={c.id} className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="font-bold text-blue-400">{c.code}</span>
                  <span className="text-slate-300 font-medium">AED {c.budgetAmount.toLocaleString()}</span>
                </div>
                <div className="text-slate-200 font-sans truncate">{c.description}</div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span>Actual: AED {c.actual.toLocaleString()}</span>
                  <span className={c.remaining < 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    Rem: AED {c.remaining.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Audit Stream & Approvals Notice */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Site Audit Activity</h2>
            <button
              onClick={() => onNavigate('audit-log')}
              className="text-xs text-blue-400 font-semibold hover:underline"
            >
              Full Log →
            </button>
          </div>

          <div className="space-y-3">
            {store.auditLogs.slice(0, 5).map((aud) => (
              <div key={aud.id} className="rounded-xl bg-slate-950 p-3 border border-slate-800/80 text-xs space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-blue-400 font-mono">{aud.action}</span>
                  <span className="text-slate-500 font-mono">Today</span>
                </div>
                <p className="text-slate-300 leading-snug">{aud.description}</p>
                <div className="text-[10px] text-slate-500 font-medium">{aud.userName} ({aud.userRole})</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
