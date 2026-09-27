import React, { useState } from 'react';
import {
  HardHat,
  ChevronDown,
  Building2,
  DollarSign,
  Bell,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { store } from '../services/store';
import { UserRole } from '../types';

interface HeaderProps {
  onNavigate: (view: string) => void;
  activeView: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, activeView: _activeView }) => {
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const activeProject = store.projects.find((p) => p.id === store.currentProjectId) || store.projects[0];
  const currentUser = store.currentUser;
  const displayCurrency = store.displayCurrency;
  const unreadNotifs = store.notifications.filter((n) => !n.read).length;

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Full corporate workspace authority' },
    { role: 'ACCOUNTANT', label: 'Accountant (CPA)', desc: 'Owns cost ledger, budgets, POs, payments' },
    { role: 'PROJECT_MANAGER', label: 'Project Manager', desc: 'Project delivery, orders, cost approval' },
    { role: 'TECHNICAL_MANAGER', label: 'Technical Manager', desc: 'Technical office lead, RFIs & drawings' },
    { role: 'SITE_ENGINEER', label: 'Site Engineer', desc: 'Field inspections, logs costs & RFIs' },
    { role: 'QA_QC_ENGINEER', label: 'QA/QC Engineer', desc: 'Submittals, ITPs, RAMS, NCRs' },
    { role: 'CONSULTANT', label: 'Consultant (Dar/KEO)', desc: 'Reviews submittals, RFIs, drawings' },
    { role: 'VIEWER', label: 'Read-Only Viewer', desc: 'Read-only access, no cost or write perms' },
  ];

  const currencies = ['AED', 'USD', 'SAR', 'EUR', 'GBP'];

  const handleReset = () => {
    store.resetDemoData();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2500);
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 backdrop-blur-md lg:px-6">
      {/* Left: Brand + Active Project Selector */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md shadow-blue-500/20">
            <HardHat className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-white text-base">TechFlow</span>
              <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 leading-none">
              Technical Office & Cost Hub
            </p>
          </div>
        </button>

        <div className="hidden h-6 w-px bg-slate-800 sm:block" />

        {/* Project Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProjectMenuOpen(!projectMenuOpen);
              setRoleMenuOpen(false);
              setCurrencyMenuOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 shadow-sm transition hover:border-slate-700 hover:bg-slate-800"
          >
            <Building2 className="h-3.5 w-3.5 text-blue-400" />
            <span className="max-w-[140px] truncate font-semibold sm:max-w-[220px]">
              {activeProject ? `${activeProject.projectCode}: ${activeProject.projectName}` : 'Select Project'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {projectMenuOpen && (
            <div className="absolute left-0 mt-2 w-80 rounded-xl border border-slate-700 bg-slate-800 p-2 shadow-2xl backdrop-blur-lg z-50">
              <div className="px-2 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Active Projects
              </div>
              <div className="space-y-1">
                {store.projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      store.setCurrentProject(proj.id);
                      setProjectMenuOpen(false);
                    }}
                    className={`flex w-full items-start justify-between rounded-lg p-2 text-left text-xs transition ${
                      proj.id === activeProject?.id
                        ? 'bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/30'
                        : 'text-slate-300 hover:bg-slate-700/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-blue-400">{proj.projectCode}</span>
                        <span className="font-medium text-white truncate max-w-[170px]">
                          {proj.projectName}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-400">{proj.location}</div>
                    </div>
                    <div className="text-right">
                      <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] text-emerald-400">
                        {proj.progressPercentage}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* System Error Review & Health Button */}
        <button
          onClick={() => onNavigate('system-health')}
          className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-300 transition hover:bg-amber-500/20 hover:border-amber-500/50"
          title="Review Firebase CLI deploy timeout & system health checks"
        >
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
          <span className="hidden sm:inline">Health & Error Review</span>
          <span className="rounded-full bg-amber-400/20 px-1.5 py-0.2 text-[10px] font-bold">1</span>
        </button>

        {/* Currency Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setCurrencyMenuOpen(!currencyMenuOpen);
              setRoleMenuOpen(false);
              setProjectMenuOpen(false);
            }}
            className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
            <span>{displayCurrency}</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>
          {currencyMenuOpen && (
            <div className="absolute right-0 mt-2 w-36 rounded-xl border border-slate-700 bg-slate-800 p-1.5 shadow-xl z-50">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Display Currency
              </div>
              {currencies.map((curr) => (
                <button
                  key={curr}
                  onClick={() => {
                    store.setDisplayCurrency(curr);
                    setCurrencyMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs transition ${
                    curr === displayCurrency
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{curr}</span>
                  {curr === 'AED' && <span className="text-[10px] opacity-75">(Base)</span>}
                  {curr === 'USD' && <span className="text-[10px] opacity-75">(3.67)</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Role Switcher (Simulate Roles Live) */}
        <div className="relative">
          <button
            onClick={() => {
              setRoleMenuOpen(!roleMenuOpen);
              setProjectMenuOpen(false);
              setCurrencyMenuOpen(false);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-950/40 px-2.5 py-1.5 text-xs font-medium text-indigo-300 transition hover:bg-indigo-900/50"
            title="Switch simulated role to test permission matrices"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden md:inline text-slate-400">Role:</span>
            <span className="font-semibold text-white">
              {currentUser.role.replace('_', ' ')}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-700 bg-slate-800 p-2 shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-2 px-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Role
                </span>
                <span className="text-[10px] text-blue-400 font-mono">Live RBAC Test</span>
              </div>
              <div className="mt-1 space-y-1 max-h-72 overflow-y-auto">
                {rolesList.map((item) => (
                  <button
                    key={item.role}
                    onClick={() => {
                      store.setCurrentUserRole(item.role);
                      setRoleMenuOpen(false);
                    }}
                    className={`flex w-full items-start gap-2.5 rounded-lg p-2 text-left text-xs transition ${
                      currentUser.role === item.role
                        ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40'
                        : 'text-slate-300 hover:bg-slate-700/60'
                    }`}
                  >
                    <div className="mt-0.5">
                      {currentUser.role === item.role ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border border-slate-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{item.label}</div>
                      <div className="text-[11px] text-slate-400">{item.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-800/80 text-slate-300 transition hover:bg-slate-700"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                {unreadNotifs}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-700 bg-slate-800 p-2 shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-slate-700/60 px-2 py-1.5">
                <span className="text-xs font-bold text-white">Notifications</span>
                <span className="text-[10px] text-blue-400 font-medium">Real-time Sync</span>
              </div>
              <div className="divide-y divide-slate-700/40 max-h-64 overflow-y-auto">
                {store.notifications.map((n) => (
                  <div key={n.id} className="p-2 text-xs hover:bg-slate-700/40 rounded transition">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{n.title}</span>
                      <span className="text-[10px] text-slate-500">Today</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-400">{n.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={handleReset}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/80 px-2.5 text-xs text-slate-300 transition hover:border-slate-700 hover:bg-slate-700"
          title="Reset store to clean demo seed state"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${resetSuccess ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
          <span className="hidden xl:inline">{resetSuccess ? 'Reset!' : 'Reset Demo'}</span>
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 font-bold text-white text-xs shadow">
            {currentUser.displayName.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};
