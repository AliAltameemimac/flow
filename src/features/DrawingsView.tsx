import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Upload,
  History,
  FileCheck,
  X,
  FileText,
} from 'lucide-react';
import { store } from '../services/store';
import { Drawing } from '../types';

export const DrawingsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState('ALL');
  const [selectedDrawing, setSelectedDrawing] = useState<Drawing | null>(null);
  const [revModalDwg, setRevModalDwg] = useState<Drawing | null>(null);
  const [newRevLabel, setNewRevLabel] = useState('Rev C');
  const [revDesc, setRevDesc] = useState('');

  const projectDrawings = store.drawings.filter((d) => d.projectId === store.currentProjectId);

  const filtered = projectDrawings.filter((d) => {
    const matchesSearch =
      d.drawingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDisc = disciplineFilter === 'ALL' || d.discipline === disciplineFilter;
    return matchesSearch && matchesDisc;
  });

  const handleIssueRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revModalDwg || !newRevLabel || !revDesc) return;
    store.addDrawingRevision(revModalDwg.id, newRevLabel, revDesc);
    setRevModalDwg(null);
    setNewRevLabel('');
    setRevDesc('');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">Drawings & Revision Control Register</h1>
            <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[11px] font-semibold text-indigo-400">
              Immutable Document Control
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Control IFC sheets, manage revision chains, and guarantee site engineers build from current issues only.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-400">
            Total Sheets: <strong className="text-white font-mono">{projectDrawings.length}</strong>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search drawing number or sheet title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Discipline:</span>
          <select
            value={disciplineFilter}
            onChange={(e) => setDisciplineFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-200"
          >
            <option value="ALL">All Disciplines</option>
            <option value="Structural">Structural</option>
            <option value="Architectural">Architectural</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Electrical">Electrical</option>
          </select>
        </div>
      </div>

      {/* Drawings Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase">
                <th className="py-3 px-4">Drawing Number</th>
                <th className="py-3 px-4">Sheet Title</th>
                <th className="py-3 px-4">Discipline</th>
                <th className="py-3 px-4">Building Zone</th>
                <th className="py-3 px-4 text-center">Active Rev</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">History</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.map((dwg) => (
                <tr key={dwg.id} className="hover:bg-slate-800/50 transition">
                  <td className="py-3 px-4 font-bold text-blue-400">{dwg.drawingNumber}</td>
                  <td className="py-3 px-4 font-sans text-slate-200 font-medium max-w-sm truncate">
                    {dwg.title}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-300">{dwg.discipline}</td>
                  <td className="py-3 px-4 font-sans text-slate-400">{dwg.building}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="rounded bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 border border-blue-500/30">
                      {dwg.currentRevision}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        dwg.status === 'APPROVED' || dwg.status === 'IFC'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {dwg.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    <button
                      onClick={() => setSelectedDrawing(dwg)}
                      className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:text-white hover:bg-slate-700"
                    >
                      <History className="h-3 w-3 text-slate-400" />
                      <span>{dwg.revisions.length} revs</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right font-sans">
                    <button
                      onClick={() => {
                        setRevModalDwg(dwg);
                        setNewRevLabel(`Rev ${String.fromCharCode(dwg.currentRevision.charCodeAt(4) + 1 || 65)}`);
                      }}
                      className="rounded bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow hover:bg-blue-500"
                    >
                      Issue New Rev
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revision History Drawer Modal */}
      {selectedDrawing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-blue-400">
                    {selectedDrawing.drawingNumber}
                  </span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 font-mono">
                    Current: {selectedDrawing.currentRevision}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1">{selectedDrawing.title}</h3>
              </div>
              <button onClick={() => setSelectedDrawing(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Revision Chain (Immutable Audit History)
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {selectedDrawing.revisions.map((rev) => (
                  <div
                    key={rev.id}
                    className={`rounded-xl p-3 border text-xs transition ${
                      rev.status === 'CURRENT'
                        ? 'border-blue-500/40 bg-blue-950/20'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{rev.revision}</span>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                            rev.status === 'CURRENT'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {rev.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">{rev.date}</span>
                    </div>
                    <p className="mt-1 text-slate-300 font-sans">{rev.description}</p>
                    <div className="mt-1.5 text-[10px] text-slate-500">Issued by: {rev.author}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex justify-end border-t border-slate-800 pt-3">
              <button
                onClick={() => setSelectedDrawing(null)}
                className="rounded-lg border border-slate-700 px-4 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Revision Modal */}
      {revModalDwg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">
                Issue Revision: {revModalDwg.drawingNumber}
              </h2>
              <button onClick={() => setRevModalDwg(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleIssueRevision} className="mt-4 space-y-3 text-xs">
              <p className="text-slate-300">
                Issuing a new revision updates the active sheet on site and flags the previous revision as SUPERSEDED.
              </p>

              <div>
                <label className="text-slate-300 font-medium">New Revision Tag</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rev C"
                  value={newRevLabel}
                  onChange={(e) => setNewRevLabel(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium">Reason for Revision & Revision Cloud Summary</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Tendon anchor zone rebar detailing added per RFI-001 clarification..."
                  value={revDesc}
                  onChange={(e) => setRevDesc(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRevModalDwg(null)}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 shadow"
                >
                  Publish & Supersede Old Rev
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
