import React from 'react';
import {
  LayoutDashboard,
  Building,
  TrendingDown,
  Coins,
  FileSpreadsheet,
  ShoppingCart,
  Receipt,
  CheckSquare,
  HelpCircle,
  Layers,
  FileCheck2,
  AlertOctagon,
  Sparkles,
  QrCode,
  History,
  Activity,
  CreditCard,
  FileText,
  ClipboardList,
} from 'lucide-react';
import { store } from '../services/store';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const pendingExpenses = store.expenses.filter((e) => e.status === 'submitted').length;
  const pendingPOs = store.purchaseOrders.filter((po) => po.status === 'submitted').length;
  const totalPendingApprovals = pendingExpenses + pendingPOs;
  const openRfis = store.rfis.filter((r) => r.status !== 'CLOSED').length;
  const openNcrs = store.ncrs.filter((n) => n.status !== 'VERIFIED_CLOSED').length;

  const navGroups = [
    {
      title: 'CORE & PORTFOLIO',
      items: [
        { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
        { id: 'projects', label: 'Projects Register', icon: Building, badge: String(store.projects.length) },
      ],
    },
    {
      title: 'COST CONTROL & WBS (PHASES 1-3)',
      items: [
        { id: 'cost-dashboard', label: 'Cost & Margin Dashboard', icon: TrendingDown, highlight: true },
        { id: 'cost-codes', label: 'Budget & WBS Codes (BOQ)', icon: FileSpreadsheet },
        { id: 'purchase-orders', label: 'Purchase Orders & Commitments', icon: ShoppingCart, badge: store.purchaseOrders.length ? String(store.purchaseOrders.length) : undefined },
        { id: 'expenses', label: 'Actual Site Costs & Invoices', icon: Receipt },
        { id: 'payables', label: 'Payables & Supplier Ageing', icon: CreditCard, badge: 'Ageing' },
        {
          id: 'approvals',
          label: 'Approvals Queue',
          icon: CheckSquare,
          badge: totalPendingApprovals > 0 ? String(totalPendingApprovals) : undefined,
          badgeColor: 'bg-amber-500 text-slate-950 font-bold',
        },
      ],
    },
    {
      title: 'TECHNICAL OFFICE & QUALITY',
      items: [
        {
          id: 'daily-reports',
          label: 'Daily Field Reports',
          icon: ClipboardList,
          badge: `${store.dailyReports.length} DFR`,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        },
        {
          id: 'rfis',
          label: 'RFI Register',
          icon: HelpCircle,
          badge: openRfis > 0 ? `${openRfis} Open` : undefined,
          badgeColor: 'bg-blue-600/30 text-blue-300 border border-blue-500/30',
        },
        { id: 'drawings', label: 'Drawings & Revisions', icon: Layers, badge: String(store.drawings.length) },
        { id: 'submittals', label: 'Material Submittals', icon: FileCheck2 },
        {
          id: 'ncrs',
          label: 'Non-Conformance (NCRs)',
          icon: AlertOctagon,
          badge: openNcrs > 0 ? `${openNcrs} Open` : undefined,
          badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
        },
        { id: 'documents', label: 'Documents & Transmittals', icon: FileText },
      ],
    },
    {
      title: 'FIELD SYNC & DIAGNOSTICS',
      items: [
        { id: 'ai-search', label: 'AI Specification Assistant', icon: Sparkles, badge: 'Gemini' },
        { id: 'qr-codes', label: 'QR Code Field Sync', icon: QrCode },
        { id: 'audit-log', label: 'System Audit Trail', icon: History },
        {
          id: 'system-health',
          label: 'Error Review & Diagnostics',
          icon: Activity,
          badge: 'Fixed',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        },
      ],
    },
  ];

  return (
    <aside className="flex flex-col w-64 border-r border-slate-800 bg-slate-900/95 p-3 shrink-0 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <div className="px-2 pb-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/20'
                        : item.highlight
                        ? 'text-blue-300 hover:bg-slate-800 hover:text-white'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`h-4 w-4 shrink-0 transition ${
                          isActive
                            ? 'text-white'
                            : item.highlight
                            ? 'text-blue-400 group-hover:text-blue-300'
                            : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`ml-1 shrink-0 rounded px-1.5 py-0.5 text-[10px] ${
                          item.badgeColor || (isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400')
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Workspace Tag */}
      <div className="mt-auto pt-4 border-t border-slate-800/60">
        <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800 text-slate-400 text-[11px]">
          <div className="flex items-center justify-between text-slate-300">
            <span className="font-semibold text-white truncate">{store.company.name}</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
            <span>Workspace Code:</span>
            <span className="font-mono text-blue-400 font-semibold">{store.company.workspaceCode}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
