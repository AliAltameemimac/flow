import React, { useState } from 'react';
import {
  Building,
  Plus,
  Search,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  X,
  ArrowRight,
} from 'lucide-react';
import { store } from '../services/store';
import { Project } from '../types';

interface ProjectsViewProps {
  onNavigate: (view: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onNavigate }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('P-1004');
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [consultant, setConsultant] = useState('');
  const [location, setLocation] = useState('Dubai, UAE');
  const [contractNumber, setContractNumber] = useState('CTR-2026-');
  const [contractValue, setContractValue] = useState('75000000');
  const [budgetTotal, setBudgetTotal] = useState('62000000');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [plannedDate, setPlannedDate] = useState('2027-12-31');

  const curr = store.displayCurrency;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    store.createProject({
      projectCode: code,
      projectName: name,
      clientName: client || 'Private Developer',
      consultantName: consultant || 'Lead Engineering Consultant',
      contractorName: store.company.name,
      location,
      contractNumber,
      startDate,
      plannedCompletionDate: plannedDate,
      status: 'PLANNING',
      progressPercentage: 0,
      contractValue: parseFloat(contractValue) || 10000000,
      budgetTotal: parseFloat(budgetTotal) || 8000000,
      currency: 'AED',
    });

    setModalOpen(false);
    onNavigate('cost-dashboard');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">Active Projects Portfolio</h1>
            <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[11px] font-semibold text-blue-400">
              Corporate Portfolio
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Select an active project to scope the technical registers, budget codes, and site deliverables.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {store.projects.map((proj) => {
          const isSelected = proj.id === store.currentProjectId;

          return (
            <div
              key={proj.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition shadow-lg ${
                isSelected
                  ? 'border-blue-500/60 bg-blue-950/20 ring-1 ring-blue-500/30'
                  : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {proj.projectCode}
                  </span>
                  <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold">
                    {proj.status}
                  </span>
                </div>

                <h3 className="mt-2.5 text-base font-bold text-white line-clamp-1">{proj.projectName}</h3>
                <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                  <span className="truncate">{proj.location}</span>
                </div>

                <div className="mt-4 space-y-2 border-t border-slate-800 pt-3 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Client:</span>
                    <strong className="text-white truncate max-w-[170px]">{proj.clientName}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Consultant:</span>
                    <strong className="text-white truncate max-w-[170px]">{proj.consultantName}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Contract Value:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {curr} {Math.round(store.convert(proj.contractValue, proj.currency, curr)).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Physical Progress</span>
                    <span className="font-mono font-bold text-emerald-400">{proj.progressPercentage}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500"
                      style={{ width: `${proj.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Contract: {proj.contractNumber}</span>
                <button
                  onClick={() => {
                    store.setCurrentProject(proj.id);
                    onNavigate('cost-dashboard');
                  }}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span>{isSelected ? 'Active Project' : 'Select'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Create New Construction Project</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium">Project Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Contract Ref #</label>
                  <input
                    type="text"
                    required
                    value={contractNumber}
                    onChange={(e) => setContractNumber(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium">Project Name & Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Palm Jumeirah Residential Tower (3B+G+45F)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium">Employer / Client</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Meraas / Nakheel"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Supervising Consultant</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Atkins / Parsons"
                    value={consultant}
                    onChange={(e) => setConsultant(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium">Contract Sum (AED)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={contractValue}
                    onChange={(e) => setContractValue(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Baselined Target Budget (AED)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={budgetTotal}
                    onChange={(e) => setBudgetTotal(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Planned Completion Date</label>
                  <input
                    type="date"
                    required
                    value={plannedDate}
                    onChange={(e) => setPlannedDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  />
                </div>
              </div>

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
                  Create & Launch Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
