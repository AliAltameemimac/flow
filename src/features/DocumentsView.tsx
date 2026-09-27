import React, { useState } from 'react';
import { FileText, Send, Download, Search, CheckCircle2, Clock, Plus, Layers } from 'lucide-react';
import { store } from '../services/store';

export const DocumentsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const sampleTransmittals = [
    {
      id: 'dt-1',
      number: 'TR-2026-088',
      date: '2026-09-20',
      subject: 'Issue of Coordinated Level 16 Structural & PT Drawings for Construction (IFC)',
      recipient: 'KEO International & Voltas MEP',
      docsCount: 6,
      status: 'TRANSMITTED',
    },
    {
      id: 'dt-2',
      number: 'TR-2026-087',
      date: '2026-09-15',
      subject: 'Submission of Method Statement & RAMS for High-Early Concrete Pour (Zone B2)',
      recipient: 'Dar Al-Handasah Consultant',
      docsCount: 3,
      status: 'APPROVED',
    },
    {
      id: 'dt-3',
      number: 'TR-2026-086',
      date: '2026-09-08',
      subject: 'Curtain Wall Structural Silicone Test Certificates & Third-Party Lab Reports',
      recipient: 'Dubai Municipality & Consultant',
      docsCount: 4,
      status: 'TRANSMITTED',
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">Document Control & Transmittals</h1>
            <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[11px] font-semibold text-blue-400">
              Official Distribution
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Formal engineering transmittals, method statements, and inspection test plan (ITP) archives.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-md">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-sm font-bold text-white">Document Transmittal Register</h2>
          <span className="text-xs text-slate-400">{sampleTransmittals.length} transmittals recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase font-mono">
                <th className="py-3 px-4">Transmittal #</th>
                <th className="py-3 px-4">Date Issued</th>
                <th className="py-3 px-4">Subject / Package Description</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4 text-center">Docs</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {sampleTransmittals.map((tr) => (
                <tr key={tr.id} className="hover:bg-slate-800/50 transition">
                  <td className="py-3 px-4 font-bold text-blue-400">{tr.number}</td>
                  <td className="py-3 px-4 text-slate-400 font-sans">{tr.date}</td>
                  <td className="py-3 px-4 font-sans text-slate-200 font-medium max-w-md">{tr.subject}</td>
                  <td className="py-3 px-4 font-sans text-slate-300">{tr.recipient}</td>
                  <td className="py-3 px-4 text-center text-slate-300">{tr.docsCount} sheets</td>
                  <td className="py-3 px-4 text-center font-sans">
                    <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                      {tr.status}
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
