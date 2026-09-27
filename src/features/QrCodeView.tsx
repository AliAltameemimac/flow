import React, { useState } from 'react';
import {
  QrCode,
  Download,
  Building,
  Layers,
  MapPin,
  CheckCircle2,
  Printer,
  Copy,
} from 'lucide-react';
import { store } from '../services/store';

export const QrCodeView: React.FC = () => {
  const [tagType, setTagType] = useState<'DRAWING' | 'LOCATION' | 'EQUIPMENT'>('DRAWING');
  const [selectedDrawingId, setSelectedDrawingId] = useState(store.drawings[0]?.id || '');
  const [locationLabel, setLocationLabel] = useState('Basement 2 - Pour Zone B2-04 (Grid D3-F8)');
  const [equipmentLabel, setEquipmentLabel] = useState('Tower Crane TC-01 (Liebherr 280 EC-H)');
  const [copied, setCopied] = useState(false);

  const selectedDwg = store.drawings.find((d) => d.id === selectedDrawingId) || store.drawings[0];

  const getEncodedPayload = () => {
    if (tagType === 'DRAWING') {
      return `TECHFLOW://DRAWING/${selectedDwg.drawingNumber}?rev=${selectedDwg.currentRevision}&proj=${store.currentProjectId}&verified=${new Date().toISOString()}`;
    } else if (tagType === 'LOCATION') {
      return `TECHFLOW://LOCATION/${encodeURIComponent(locationLabel)}?proj=${store.currentProjectId}`;
    } else {
      return `TECHFLOW://EQUIPMENT/${encodeURIComponent(equipmentLabel)}?proj=${store.currentProjectId}`;
    }
  };

  const payload = getEncodedPayload();

  const handleCopy = () => {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">QR Code Field Tag Generator</h1>
            <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[11px] font-semibold text-blue-400">
              Site Inspection Sync
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Generate print-ready site tags for rebar cages, structural pour locations, and IFC drawing verification.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Configuration Form */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Tag Type & Payload Data
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'DRAWING', label: 'IFC Drawing', icon: Layers },
              { id: 'LOCATION', label: 'Pour Zone', icon: MapPin },
              { id: 'EQUIPMENT', label: 'Plant/Equip', icon: Building },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTagType(t.id as any)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition ${
                    tagType === t.id
                      ? 'border-blue-500 bg-blue-950/40 text-white'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 mb-1 text-blue-400" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {tagType === 'DRAWING' && (
            <div>
              <label className="text-xs text-slate-300 font-medium">Select Drawing Sheet</label>
              <select
                value={selectedDrawingId}
                onChange={(e) => setSelectedDrawingId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white"
              >
                {store.drawings.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.drawingNumber} - {d.title.slice(0, 30)} ({d.currentRevision})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-500">
                Scanning this QR in the field confirms whether the printed drawing is the latest active revision.
              </p>
            </div>
          )}

          {tagType === 'LOCATION' && (
            <div>
              <label className="text-xs text-slate-300 font-medium">Location / Pour Zone Tag</label>
              <input
                type="text"
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white"
              />
            </div>
          )}

          {tagType === 'EQUIPMENT' && (
            <div>
              <label className="text-xs text-slate-300 font-medium">Equipment Identifier</label>
              <input
                type="text"
                value={equipmentLabel}
                onChange={(e) => setEquipmentLabel(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white"
              />
            </div>
          )}

          <div className="pt-2 border-t border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium mb-1">Encoded Payload:</div>
            <div className="font-mono text-[10px] bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-blue-300 break-all">
              {payload}
            </div>
          </div>
        </div>

        {/* Right: Print Card Preview */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="rounded-2xl bg-white p-6 shadow-2xl text-slate-900 max-w-[280px] w-full border-4 border-slate-800">
            <div className="border-b-2 border-slate-900 pb-2 mb-3">
              <div className="font-extrabold text-sm tracking-tight uppercase text-blue-700">TechFlow Pro</div>
              <div className="text-[10px] font-bold text-slate-700 uppercase">Site Compliance Tag</div>
            </div>

            {/* QR Pattern Representation */}
            <div className="mx-auto my-3 h-40 w-40 border-2 border-slate-900 p-2 flex flex-col items-center justify-center bg-slate-50 rounded">
              <QrCode className="h-32 w-32 text-slate-900" />
            </div>

            <div className="text-left font-mono text-[10px] text-slate-800 space-y-0.5 border-t-2 border-slate-900 pt-2">
              <div className="font-bold text-xs truncate">
                {tagType === 'DRAWING' ? selectedDwg.drawingNumber : tagType === 'LOCATION' ? 'POUR ZONE' : 'EQUIPMENT'}
              </div>
              <div className="text-slate-600 truncate">
                {tagType === 'DRAWING' ? selectedDwg.currentRevision : locationLabel}
              </div>
              <div className="text-[9px] text-slate-500">Scan to verify against TechFlow</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>{copied ? 'Copied URI!' : 'Copy URI'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Sticker</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
