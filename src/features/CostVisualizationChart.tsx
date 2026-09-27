import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  Line,
  Area,
  Cell,
} from 'recharts';
import { store } from '../services/store';
import {
  BarChart3,
  Layers,
  TrendingDown,
  DollarSign,
  PieChart,
  ArrowUpRight,
  Info,
} from 'lucide-react';

interface CostVisualizationChartProps {
  analytics: ReturnType<typeof store.getCostAnalytics>;
}

export const CostVisualizationChart: React.FC<CostVisualizationChartProps> = ({ analytics }) => {
  const [chartView, setChartView] = useState<'CATEGORY_BREAKDOWN' | 'OVERALL_STATUS'>('CATEGORY_BREAKDOWN');
  const curr = store.displayCurrency;

  const toCurr = (val: number) => Math.round(store.convert(val, 'AED', curr));

  // 1. Overall Status Data
  const overallData = [
    {
      name: 'Budget Baseline',
      amount: toCurr(analytics.totalBudget),
      fill: '#3b82f6', // blue-500
      type: 'Estimated Baseline',
    },
    {
      name: 'Actual Invoiced',
      amount: toCurr(analytics.totalActual),
      fill: '#f59e0b', // amber-500
      type: 'Approved Spend',
    },
    {
      name: 'Committed Orders',
      amount: toCurr(analytics.totalCommitted),
      fill: '#6366f1', // indigo-500
      type: 'Open Encumbrances',
    },
    {
      name: 'Estimate at Completion (EAC)',
      amount: toCurr(analytics.eac),
      fill: analytics.variance >= 0 ? '#10b981' : '#f43f5e', // emerald-500 or rose-500
      type: 'Projected Final Cost',
    },
  ];

  // 2. Category Breakdown Data (Civil, Structural, MEP, etc.)
  const categoryMap: Record<
    string,
    { category: string; budget: number; actual: number; committed: number }
  > = {};

  analytics.codePerformances.forEach((code) => {
    if (!categoryMap[code.category]) {
      categoryMap[code.category] = {
        category: code.category,
        budget: 0,
        actual: 0,
        committed: 0,
      };
    }
    categoryMap[code.category].budget += code.budgetAmount;
    categoryMap[code.category].actual += code.actual;
    categoryMap[code.category].committed += code.committed;
  });

  const categoryData = Object.values(categoryMap).map((cat) => ({
    category: cat.category,
    'Budget (Estimated)': toCurr(cat.budget),
    'Actual Cost': toCurr(cat.actual),
    'Committed (POs)': toCurr(cat.committed),
    'Unencumbered Remaining': Math.max(0, toCurr(cat.budget - cat.actual - cat.committed)),
  }));

  // Custom Formatter Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-md text-xs font-mono">
          <div className="font-bold text-white font-sans border-b border-slate-800 pb-1.5 mb-2">
            {label}
          </div>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-300 font-sans">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: entry.color || entry.fill }}
                  />
                  {entry.name}:
                </span>
                <span className="font-bold text-white">
                  {curr} {Number(entry.value).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              <span>Budget Status Visualization</span>
            </h2>
            <span className="rounded bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-300 font-mono">
              Recharts Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time visual comparison of Estimated Budget vs. Actual Invoiced vs. Committed Purchase Orders.
          </p>
        </div>

        {/* Chart View Toggle */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setChartView('CATEGORY_BREAKDOWN')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
              chartView === 'CATEGORY_BREAKDOWN'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>WBS Package Breakdown</span>
          </button>
          <button
            onClick={() => setChartView('OVERALL_STATUS')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
              chartView === 'OVERALL_STATUS'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Overall Cost Totals</span>
          </button>
        </div>
      </div>

      {/* Primary Recharts Visualization */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartView === 'CATEGORY_BREAKDOWN' ? (
            <BarChart
              data={categoryData}
              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="category"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false}
                tickFormatter={(val) =>
                  val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${(val / 1000).toFixed(0)}k`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              />
              <Bar
                dataKey="Budget (Estimated)"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="Actual Cost"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="Committed (POs)"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          ) : (
            <BarChart
              data={overallData}
              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 500 }}
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false}
                tickFormatter={(val) =>
                  val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${(val / 1000).toFixed(0)}k`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={64}>
                {overallData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend & Real-Time Callout Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800 text-xs">
        <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] text-slate-400 block font-sans">Revised Budget</span>
            <strong className="text-white font-mono">{curr} {toCurr(analytics.totalBudget).toLocaleString()}</strong>
          </div>
        </div>

        <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-amber-500 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] text-slate-400 block font-sans">Actual Invoiced</span>
            <strong className="text-amber-400 font-mono">{curr} {toCurr(analytics.totalActual).toLocaleString()}</strong>
          </div>
        </div>

        <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-indigo-500 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] text-slate-400 block font-sans">Committed POs</span>
            <strong className="text-indigo-400 font-mono">{curr} {toCurr(analytics.totalCommitted).toLocaleString()}</strong>
          </div>
        </div>

        <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] text-slate-400 block font-sans">Remaining Budget</span>
            <strong className="text-emerald-400 font-mono">{curr} {toCurr(analytics.remainingBudget).toLocaleString()}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
