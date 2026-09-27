import React, { useState } from 'react';
import {
  FileCheck2,
  AlertOctagon,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
} from 'lucide-react';
import { store } from '../services/store';
import { MaterialSubmittal, NCR } from '../types';

interface SubmittalsAndQualityProps {
  initialTab?: 'SUBMITTALS' | 'NCRS';
}

export const SubmittalsAndQualityView: React.FC<SubmittalsAndQualityProps> = ({
  initialTab = 'SUBMITTALS',
}) => {
  const [activeTab, setActiveTab] = useState<'SUBMITTALS' | 'NCRS'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [ncrModalOpen, setNcrModalOpen] = useState(false);
  const [submittalModalOpen, setSubmittalModalOpen] = useState(false);

  // New NCR state
  const [ncrTitle, setNcrTitle] = useState('');
  const [ncrLocation, setNcrLocation] = useState('');
  const [ncrDiscipline, setNcrDiscipline] = useState('Civil / Structural');
  const [ncrSeverity, setNcrSeverity] = useState<NCR['severity']>('MAJOR');
  const [ncrRootCause, setNcrRootCause] = useState('');

  // New Submittal state
  const [subName, setSubName] = useState('');
  const [subManufacturer, setSubManufacturer] = useState('');
  const [subSupplier, setSubSupplier] = useState('');
  const [subSpec, setSubSpec] = useState('');
  const [subDiscipline, setSubDiscipline] = useState('Structural');

  const projectSubmittals = store.submittals.filter((s) => s.projectId === store.currentProjectId);
  const projectNcrs = store.ncrs.filter((n) => n.projectId === store.currentProjectId);

  const handleCreateNcr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ncrTitle || !ncrLocation) return;
    const nextNum = projectNcrs.length + 1;
    const ncrNumber = `NCR-2026-${String(nextNum).padStart(3, '0')}`;

    store.ncrs.unshift({
      id: `ncr-${Date.now()}`,
      companyId: store.company.id,
      projectId: store.currentProjectId,
      ncrNumber,
      title: ncrTitle,
      location: ncrLocation,
      discipline: ncrDiscipline,
      severity: ncrSeverity,
      status: 'OPEN',
      raisedDate: new Date().toISOString().split('T')[0],
      rootCause: ncrRootCause,
    });

    store.recordAudit('NCR_RAISED', 'NCR', ncrNumber, `Raised ${ncrNumber}: ${ncrTitle}`);
    setNcrModalOpen(false);
    setNcrTitle('');
    setNcrLocation('');
    setNcrRootCause('');
  };

  const handleCreateSubmittal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName || !subManufacturer) return;
    const nextNum = projectSubmittals.length + 1;
    const submittalNumber = `MAT-${String(nextNum).padStart(3, '0')}`;

    store.submittals.unshift({
      id: `mat-${Date.now()}`,
      companyId: store.company.id,
      projectId: store.currentProjectId,
      submittalNumber,
      materialName: subName,
      manufacturer: subManufacturer,
      supplier: subSupplier,
      specificationReference: subSpec,
      discipline: subDiscipline,
      status: 'SUBMITTED',
      submittedDate: new Date().toISOString().split('T')[0],
      responseDueDate: '2026-10-15',
      revision: 'Rev 0',
    });

    store.recordAudit('SUBMITTAL_LOGGED', 'MaterialSubmittal', submittalNumber, `Logged submittal ${submittalNumber}: ${subName}`);
    setSubmittalModalOpen(false);
    setSubName('');
    setSubManufacturer('');
    setSubSupplier('');
    setSubSpec('');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">Quality, Submittals & NCRs</h1>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
              QA/QC Assurance
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Control sample compliance approvals and manage non-conformance corrective action registers.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs">
          <button
            onClick={() => setActiveTab('SUBMITTALS')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 font-bold transition ${
              activeTab === 'SUBMITTALS' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck2 className="h-4 w-4" />
            <span>Material Submittals ({projectSubmittals.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('NCRS')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 font-bold transition ${
              activeTab === 'NCRS' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertOctagon className="h-4 w-4" />
            <span>Non-Conformance ({projectNcrs.length})</span>
          </button>
        </div>
      </div>

      {/* SUBMITTALS TAB */}
      {activeTab === 'SUBMITTALS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-400">
              Specification sample packages submitted for consultant architectural & structural review.
            </div>
            <button
              onClick={() => setSubmittalModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 shadow"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Log Material Submittal</span>
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase">
                    <th className="py-3 px-4">Submittal #</th>
                    <th className="py-3 px-4">Material / System</th>
                    <th className="py-3 px-4">Manufacturer</th>
                    <th className="py-3 px-4">Specification Ref</th>
                    <th className="py-3 px-4">Discipline</th>
                    <th className="py-3 px-4 text-center">Rev</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {projectSubmittals.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-bold text-blue-400">{sub.submittalNumber}</td>
                      <td className="py-3 px-4 font-sans text-white font-medium max-w-xs truncate">
                        {sub.materialName}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-300">{sub.manufacturer}</td>
                      <td className="py-3 px-4 font-sans text-slate-400">{sub.specificationReference}</td>
                      <td className="py-3 px-4 font-sans text-slate-300">{sub.discipline}</td>
                      <td className="py-3 px-4 text-center text-blue-300">{sub.revision}</td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                            sub.status === 'APPROVED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {sub.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* NCRS TAB */}
      {activeTab === 'NCRS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-400">
              Site non-conformance defects, structural discrepancies, and inspection rejections.
            </div>
            <button
              onClick={() => setNcrModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 shadow"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Raise NCR Defect</span>
            </button>
          </div>

          <div className="space-y-3">
            {projectNcrs.map((ncr) => (
              <div
                key={ncr.id}
                className="rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-slate-700 shadow-sm space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-rose-400">{ncr.ncrNumber}</span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        ncr.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {ncr.severity} Severity
                    </span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 font-mono">
                      Location: {ncr.location}
                    </span>
                  </div>
                  <span className="rounded bg-amber-500/10 text-amber-300 px-2 py-0.5 text-[10px] font-bold uppercase">
                    {ncr.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">{ncr.title}</h3>

                {ncr.rootCause && (
                  <div className="text-xs text-slate-300">
                    <strong className="text-slate-400">Root Cause:</strong> {ncr.rootCause}
                  </div>
                )}

                {ncr.correctiveAction && (
                  <div className="rounded-lg bg-slate-950 p-2.5 text-xs text-emerald-300 border border-slate-800">
                    <strong className="text-slate-400 font-sans">Approved Remedial Action:</strong>{' '}
                    {ncr.correctiveAction}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log NCR Modal */}
      {ncrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Raise Non-Conformance Report (NCR)</h2>
              <button onClick={() => setNcrModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNcr} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Defect Description / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inadequate rebar concrete cover on retaining wall"
                  value={ncrTitle}
                  onChange={(e) => setNcrTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium">Exact Site Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Basement B2, Grid C3-D3"
                    value={ncrLocation}
                    onChange={(e) => setNcrLocation(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Severity Rating</label>
                  <select
                    value={ncrSeverity}
                    onChange={(e) => setNcrSeverity(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  >
                    <option value="CRITICAL">Critical (Safety / Structural integrity)</option>
                    <option value="MAJOR">Major (Rebar / waterproofing deficiency)</option>
                    <option value="MINOR">Minor (Cosmetic / finish defect)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium">Identified Root Cause</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Spacer wheels displaced during heavy vibrator pass..."
                  value={ncrRootCause}
                  onChange={(e) => setNcrRootCause(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setNcrModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-500 shadow"
                >
                  Issue NCR to Contractor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submittal Modal */}
      {submittalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Log Material Submittal (MAT)</h2>
              <button onClick={() => setSubmittalModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmittal} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Material Name & Grade</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. C70 Self-Compacting High-Early Concrete"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium">Manufacturer</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unibeton / Emirates Steel"
                    value={subManufacturer}
                    onChange={(e) => setSubManufacturer(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Supplier / Vendor</label>
                  <input
                    type="text"
                    placeholder="e.g. Authorized Distributor"
                    value={subSupplier}
                    onChange={(e) => setSubSupplier(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium">Discipline</label>
                  <select
                    value={subDiscipline}
                    onChange={(e) => setSubDiscipline(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  >
                    {['Structural', 'Architectural', 'Mechanical', 'Electrical', 'Civil'].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Specification Clause</label>
                  <input
                    type="text"
                    placeholder="e.g. Section 03300 Cast-in-Place"
                    value={subSpec}
                    onChange={(e) => setSubSpec(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSubmittalModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 shadow"
                >
                  Submit for Consultant Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
