import React, { useState } from 'react';
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  X,
  Send,
} from 'lucide-react';
import { store } from '../services/store';
import { RFI } from '../types';

export const RfiView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [respondRfi, setRespondRfi] = useState<RFI | null>(null);
  const [responseText, setResponseText] = useState('');

  // RFI Form
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [discipline, setDiscipline] = useState('Structural');
  const [priority, setPriority] = useState<RFI['priority']>('HIGH');
  const [drawingRef, setDrawingRef] = useState('');
  const [specRef, setSpecRef] = useState('');
  const [assignedToName, setAssignedToName] = useState('Dr. Nader Khoury (Dar Consult)');
  const [consultantName, setConsultantName] = useState('Dar Al-Handasah Consultants');
  const [responseDueDate, setResponseDueDate] = useState('2026-10-05');

  const projectRfis = store.rfis.filter((r) => r.projectId === store.currentProjectId);

  const filtered = projectRfis.filter((r) => {
    const matchesSearch =
      r.rfiNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.discipline.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateRfi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    store.createRFI({
      subject,
      description,
      discipline,
      priority,
      assignedToName,
      consultantName,
      responseDueDate,
      drawingRef,
      specRef,
    });

    setModalOpen(false);
    setSubject('');
    setDescription('');
    setDrawingRef('');
    setSpecRef('');
  };

  const handleSendResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondRfi || !responseText) return;
    store.respondToRFI(respondRfi.id, responseText);
    setRespondRfi(null);
    setResponseText('');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">Requests For Information (RFIs)</h1>
            <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[11px] font-semibold text-blue-400">
              Technical Office & Site Sync
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Formally clarify drawing discrepancies, site coordination clashes, and specification conflicts with the consultant.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Raise New RFI</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search RFI number, subject, or discipline..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted (Pending)</option>
            <option value="UNDER_REVIEW">Under Consultant Review</option>
            <option value="RESPONDED">Responded by Consultant</option>
            <option value="CLOSED">Closed & Verified</option>
          </select>
        </div>
      </div>

      {/* RFI Cards */}
      <div className="space-y-3">
        {filtered.map((rfi) => {
          const isClosed = rfi.status === 'CLOSED';
          const isResponded = rfi.status === 'RESPONDED';

          return (
            <div
              key={rfi.id}
              className="rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-slate-700 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-blue-400">{rfi.rfiNumber}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        rfi.priority === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : rfi.priority === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {rfi.priority} Priority
                    </span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 font-medium">
                      {rfi.discipline}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        isClosed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isResponded
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {rfi.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="mt-1 text-sm font-bold text-white">{rfi.subject}</h3>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {!isResponded && !isClosed && (
                    <button
                      onClick={() => setRespondRfi(rfi)}
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-indigo-500"
                    >
                      Record Response
                    </button>
                  )}
                  {isResponded && !isClosed && (
                    <button
                      onClick={() => store.closeRFI(rfi.id)}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-500"
                    >
                      Verify & Close RFI
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{rfi.description}</p>

              {/* References & Consultant Response Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500">References & Routing</div>
                  <div className="text-slate-300">
                    Drawing Ref: <strong className="text-white">{rfi.drawingRef || 'None cited'}</strong>
                  </div>
                  <div className="text-slate-300">
                    Spec Clause: <strong className="text-white">{rfi.specRef || 'General Spec'}</strong>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Raised by {rfi.raisedByName} on {rfi.dateRaised} • Due {rfi.responseDueDate}
                  </div>
                </div>

                <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Consultant Determination</div>
                  {rfi.consultantResponse ? (
                    <div className="text-emerald-300 text-xs">
                      {rfi.consultantResponse}
                      <div className="mt-1 text-[10px] text-slate-500 font-mono">
                        Responded on {rfi.responseDate}
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 italic text-[11px]">
                      Awaiting official response from {rfi.consultantName}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Raise RFI Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Raise Request For Information (RFI)</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRfi} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Subject / Inquiry Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tendon Profile and Sleeve Clashes at L16"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium">Discipline</label>
                  <select
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  >
                    {['Structural', 'Architectural', 'Mechanical', 'Electrical', 'Geotechnical', 'Civil'].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  >
                    <option value="CRITICAL">Critical (Immediate stop)</option>
                    <option value="HIGH">High (Impacts pour schedule)</option>
                    <option value="MEDIUM">Medium (Normal review)</option>
                    <option value="LOW">Low (Information only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium">Detailed Technical Query & Proposal</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the discrepancy and propose contractor resolution..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium">Drawing Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. STR-DWG-L16-04 Rev B"
                    value={drawingRef}
                    onChange={(e) => setDrawingRef(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Specification Clause</label>
                  <input
                    type="text"
                    placeholder="e.g. Section 03380 PT"
                    value={specRef}
                    onChange={(e) => setSpecRef(e.target.value)}
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
                  Submit RFI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {respondRfi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Consultant Determination: {respondRfi.rfiNumber}</h2>
              <button onClick={() => setRespondRfi(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSendResponse} className="mt-4 space-y-3 text-xs">
              <div className="rounded bg-slate-800/80 p-2.5 text-slate-300">
                <strong>Subject:</strong> {respondRfi.subject}
              </div>

              <div>
                <label className="text-slate-300 font-medium">Consultant Official Instruction / Resolution</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter official architectural / engineering determination..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRespondRfi(null)}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500 shadow"
                >
                  Dispatch Response to Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
