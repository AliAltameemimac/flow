import React, { useState } from 'react';
import { History, Search, Filter, ShieldCheck, UserCheck, Clock } from 'lucide-react';
import { store } from '../services/store';

export const AuditLogView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filtered = store.auditLogs.filter((l) => {
    const matchesSearch =
      l.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || l.action.includes(actionFilter);
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">Corporate System Audit Trail</h1>
            <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[11px] font-semibold text-blue-400">
              ISO 9001 & Compliance
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Immutable log of commercial approvals, purchase order releases, drawing revisions, and site events.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-400">
          Total Audit Records: <strong className="text-white font-mono">{store.auditLogs.length}</strong>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, description, or actor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Category:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-200"
          >
            <option value="ALL">All Actions</option>
            <option value="COST">Cost Approvals & Actuals</option>
            <option value="PO">Purchase Orders</option>
            <option value="RFI">RFIs</option>
            <option value="DRAWING">Drawings & Revisions</option>
            <option value="PROJECT">Projects</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Description / Audit Detail</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50 transition">
                  <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-blue-400">{log.action}</td>
                  <td className="py-3 px-4 font-sans text-slate-300 font-semibold">{log.entityType}</td>
                  <td className="py-3 px-4 font-sans text-slate-200 max-w-md">{log.description}</td>
                  <td className="py-3 px-4 font-sans text-white font-medium">{log.userName}</td>
                  <td className="py-3 px-4 font-sans">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 font-medium">
                      {log.userRole}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
