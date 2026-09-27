import React, { useState } from 'react';
import {
  Calendar,
  Users,
  Sun,
  CloudSun,
  Wind,
  CloudRain,
  Flame,
  Clock,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Truck,
  HardHat,
  ShieldCheck,
  Building,
  Printer,
  X,
  Trash2,
  ChevronRight,
  Eye,
  Check,
  Wrench,
} from 'lucide-react';
import { store } from '../services/store';
import {
  DailyFieldReport,
  DailyLaborItem,
  DailyEquipmentItem,
  DailyWorkActivity,
  WeatherCondition,
  SiteGroundCondition,
  DelayReason,
  DailyShift,
} from '../types';

export const DailyReportsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedReport, setSelectedReport] = useState<DailyFieldReport | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [verifyModalReport, setVerifyModalReport] = useState<DailyFieldReport | null>(null);
  const [consultantRemarks, setConsultantRemarks] = useState('Works inspected on site and verified compliant with approved drawings and method statements.');

  // Form State for New DFR
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState<DailyShift>('DAY_SHIFT');
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>('SUNNY_CLEAR');
  const [temperatureHighC, setTemperatureHighC] = useState('38');
  const [temperatureLowC, setTemperatureLowC] = useState('27');
  const [humidityPercentage, setHumidityPercentage] = useState('60');
  const [groundConditions, setGroundConditions] = useState<SiteGroundCondition>('DRY_STABLE');
  const [workingHoursStart, setWorkingHoursStart] = useState('06:30');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('17:00');
  const [delayHours, setDelayHours] = useState('0');
  const [delayReason, setDelayReason] = useState<DelayReason>('NONE');

  // Dynamic Labor Items
  const [laborItems, setLaborItems] = useState<Omit<DailyLaborItem, 'id'>[]>([
    {
      trade: 'Steel Fixers & Rebar Benders',
      employer: 'Al-Haikl Direct Workforce',
      headcount: 28,
      hoursWorked: 8.0,
      manHours: 224,
    },
    {
      trade: 'Carpenters & Formwork Riggers',
      employer: 'Al-Haikl Direct Workforce',
      headcount: 22,
      hoursWorked: 8.0,
      manHours: 176,
    },
    {
      trade: 'Concrete Placement Gang',
      employer: 'Al-Haikl Direct Workforce',
      headcount: 14,
      hoursWorked: 8.0,
      manHours: 112,
    },
    {
      trade: 'MEP Electrical & Piping Techs',
      employer: 'Voltas Electro-Mechanical',
      headcount: 12,
      hoursWorked: 8.0,
      manHours: 96,
    },
  ]);

  // Dynamic Equipment Items
  const [equipmentItems, setEquipmentItems] = useState<Omit<DailyEquipmentItem, 'id'>[]>([
    {
      name: 'Tower Crane TC-01',
      equipmentIdCode: 'TC-01',
      status: 'OPERATIONAL',
      hoursOperated: 8.0,
      operatorProvided: true,
      remarks: 'Rebar lifting to upper deck',
    },
    {
      name: 'Mobile Concrete Pump 52m',
      equipmentIdCode: 'PUMP-52M',
      status: 'OPERATIONAL',
      hoursOperated: 6.0,
      operatorProvided: true,
      remarks: 'Column pour',
    },
  ]);

  // Work Accomplishments
  const [activities, setActivities] = useState<Omit<DailyWorkActivity, 'id'>[]>([
    {
      locationZone: 'Main Tower - Level 16 Slab Zone B',
      description: 'Fixed and tied rebar reinforcement for transfer slab',
      wbsCode: '03-3200',
      quantityExecuted: 38,
      unit: 'Ton',
    },
  ]);

  // HSE & QA
  const [safetyTalk, setSafetyTalk] = useState('Hydration & working at leading slab edge tie-off protocols');
  const [inspectionsText, setInspectionsText] = useState('Level 16 rebar inspection passed by consultant');
  const [deliveriesText, setDeliveriesText] = useState('3x transit mixer deliveries (Unibeton C70, 108 m³)');
  const [generalNotes, setGeneralNotes] = useState('Pours executed smoothly without slump loss.');

  const projectReports = store.dailyReports.filter((r) => r.projectId === store.currentProjectId);

  const filtered = projectReports.filter((r) => {
    const matchesSearch =
      r.reportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reportDate.includes(searchTerm) ||
      r.reportedByName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate top metrics from latest report
  const latestReport = projectReports[0];
  const totalSiteWorkersToday = latestReport ? latestReport.totalHeadcount : 0;
  const totalManHoursToday = latestReport ? latestReport.totalManHours : 0;
  const safeHours = latestReport ? latestReport.cumulativeSafeManHours : 485000;
  const activeEquipCount = latestReport ? latestReport.equipment.filter((e) => e.status === 'OPERATIONAL').length : 0;

  // Labor Row Management
  const handleAddLabor = () => {
    setLaborItems([
      ...laborItems,
      {
        trade: 'General Helpers & Cleaners',
        employer: 'Al-Haikl Direct Workforce',
        headcount: 10,
        hoursWorked: 8.0,
        manHours: 80,
      },
    ]);
  };

  const handleUpdateLabor = (idx: number, field: string, val: any) => {
    const updated = [...laborItems];
    const item = { ...updated[idx], [field]: val };
    if (field === 'headcount' || field === 'hoursWorked') {
      const h = field === 'headcount' ? parseFloat(val) || 0 : item.headcount;
      const hrs = field === 'hoursWorked' ? parseFloat(val) || 0 : item.hoursWorked;
      item.manHours = h * hrs;
    }
    updated[idx] = item;
    setLaborItems(updated);
  };

  const handleRemoveLabor = (idx: number) => {
    if (laborItems.length <= 1) return;
    setLaborItems(laborItems.filter((_, i) => i !== idx));
  };

  // Equipment Row Management
  const handleAddEquipment = () => {
    setEquipmentItems([
      ...equipmentItems,
      {
        name: 'Cat Generator 500kVA',
        equipmentIdCode: 'GEN-500',
        status: 'OPERATIONAL',
        hoursOperated: 8.0,
        operatorProvided: false,
      },
    ]);
  };

  const handleUpdateEquipment = (idx: number, field: string, val: any) => {
    const updated = [...equipmentItems];
    updated[idx] = { ...updated[idx], [field]: val };
    setEquipmentItems(updated);
  };

  const handleRemoveEquipment = (idx: number) => {
    if (equipmentItems.length <= 1) return;
    setEquipmentItems(equipmentItems.filter((_, i) => i !== idx));
  };

  // Activity Row Management
  const handleAddActivity = () => {
    setActivities([
      ...activities,
      {
        locationZone: 'Podium Level P1',
        description: 'MEP pipe rough-ins and conduit placement',
        wbsCode: '16-1000',
      },
    ]);
  };

  const handleUpdateActivity = (idx: number, field: string, val: any) => {
    const updated = [...activities];
    updated[idx] = { ...updated[idx], [field]: val };
    setActivities(updated);
  };

  const handleRemoveActivity = (idx: number) => {
    if (activities.length <= 1) return;
    setActivities(activities.filter((_, i) => i !== idx));
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();

    store.createDailyReport({
      reportDate,
      shift,
      weatherCondition,
      temperatureHighC: parseFloat(temperatureHighC) || 35,
      temperatureLowC: parseFloat(temperatureLowC) || 26,
      humidityPercentage: parseFloat(humidityPercentage) || 60,
      groundConditions,
      workingHoursStart,
      workingHoursEnd,
      delayHours: parseFloat(delayHours) || 0,
      delayReason,
      labor: laborItems.map((l, i) => ({ ...l, id: `lab-new-${i}` })),
      equipment: equipmentItems.map((eq, i) => ({ ...eq, id: `eq-new-${i}` })),
      activities: activities.map((act, i) => ({ ...act, id: `act-new-${i}` })),
      safetyToolboxTopic: safetyTalk,
      incidentsCount: 0,
      incidentDetails: 'Zero LTI recorded. Normal shift operations.',
      consultantInspections: inspectionsText ? [inspectionsText] : [],
      deliveriesSummary: deliveriesText ? [deliveriesText] : [],
      notes: generalNotes,
    });

    setCreateModalOpen(false);
  };

  const handleConfirmVerify = () => {
    if (!verifyModalReport) return;
    store.verifyDailyReport(verifyModalReport.id, consultantRemarks);
    setVerifyModalReport(null);
  };

  const getWeatherIcon = (cond: WeatherCondition) => {
    switch (cond) {
      case 'SUNNY_CLEAR':
        return <Sun className="h-4 w-4 text-amber-400" />;
      case 'EXTREME_HEAT':
        return <Flame className="h-4 w-4 text-rose-500 animate-pulse" />;
      case 'WINDY_HIGH_GUSTS':
        return <Wind className="h-4 w-4 text-cyan-400" />;
      case 'RAIN_PRECIPITATION':
        return <CloudRain className="h-4 w-4 text-blue-400" />;
      case 'HUMID_FOGGY':
        return <CloudSun className="h-4 w-4 text-amber-300" />;
      default:
        return <Sun className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">Daily Field Reports (Site Diary)</h1>
            <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[11px] font-semibold text-blue-400">
              Site Operations & Manpower
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Record daily labor force headcount, equipment operating hours, weather stoppages, and executed work progress.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-500/30 transition hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          <span>New Daily Field Report</span>
        </button>
      </div>

      {/* Top Field Operational Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {/* Manpower On Site */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Today's Total Workforce</span>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">
            {totalSiteWorkersToday}{' '}
            <span className="text-xs font-normal text-slate-400 font-sans">Workers on Site</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Direct & Subcontractors</span>
            <span className="text-blue-300 font-semibold">{totalManHoursToday} Man-Hours</span>
          </div>
        </div>

        {/* LTI Free Safe Hours */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>HSE Safe Man-Hours</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400 font-mono">
            {safeHours.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Lost Time Incidents (LTI)</span>
            <span className="font-bold text-emerald-300">0 Incidents (Safe)</span>
          </div>
        </div>

        {/* Heavy Plant Operating */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Active Plant & Machinery</span>
            <Wrench className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">
            {activeEquipCount}{' '}
            <span className="text-xs font-normal text-slate-400 font-sans">Heavy Units</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Tower Cranes, Pumps, Gensets</span>
            <span className="text-emerald-400 font-medium">100% Operational</span>
          </div>
        </div>

        {/* Weather & Site Stoppage */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Weather & Stoppages</span>
            {latestReport ? getWeatherIcon(latestReport.weatherCondition) : <Sun className="h-4 w-4 text-amber-400" />}
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-white font-mono">
            {latestReport ? `${latestReport.temperatureHighC}°C` : '38°C'}
            <span className="text-xs font-normal text-slate-400 ml-2 font-sans">
              {latestReport?.weatherCondition.replace('_', ' ')}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              {latestReport?.delayHours ? `${latestReport.delayHours}h Delay` : 'Normal Hours'}
            </span>
            <span className="text-amber-400 truncate max-w-[130px]">
              {latestReport?.delayReason !== 'NONE' ? latestReport?.delayReason.replace(/_/g, ' ') : 'Zero Delay'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search report #, date, or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Review Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-200"
          >
            <option value="ALL">All Reports</option>
            <option value="SUBMITTED">Submitted (Pending Review)</option>
            <option value="CONSULTANT_VERIFIED">Consultant Verified</option>
            <option value="APPROVED">Project Manager Approved</option>
          </select>
        </div>
      </div>

      {/* Reports Register Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase">
                <th className="py-3 px-4">Report Ref</th>
                <th className="py-3 px-4">Date / Shift</th>
                <th className="py-3 px-4">Weather & Temp</th>
                <th className="py-3 px-4 text-right">Workforce</th>
                <th className="py-3 px-4 text-right">Man-Hours</th>
                <th className="py-3 px-4 text-center">Equipment</th>
                <th className="py-3 px-4">Reported By</th>
                <th className="py-3 px-4 text-center">Verification</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.map((rep) => {
                const isVerified = rep.status === 'CONSULTANT_VERIFIED';
                const isApproved = rep.status === 'APPROVED';

                return (
                  <tr key={rep.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 font-bold text-blue-400">{rep.reportNumber}</td>
                    <td className="py-3 px-4 font-sans text-slate-200">
                      <div>{rep.reportDate}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">{rep.shift.replace('_', ' ')}</div>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-300">
                      <div className="flex items-center gap-1.5">
                        {getWeatherIcon(rep.weatherCondition)}
                        <span>{rep.temperatureHighC}°C / {rep.temperatureLowC}°C</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {rep.delayHours > 0 ? (
                          <span className="text-amber-400 font-semibold">{rep.delayHours}h Break ({rep.delayReason.replace(/_/g, ' ')})</span>
                        ) : (
                          'Normal Full Day'
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-white">
                      {rep.totalHeadcount} <span className="text-[10px] font-normal text-slate-400 font-sans">workers</span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-400">
                      {rep.totalManHours} hrs
                    </td>
                    <td className="py-3 px-4 text-center font-sans text-slate-300">
                      <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px]">
                        {rep.equipment.length} units
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-200">
                      <div>{rep.reportedByName}</div>
                      <div className="text-[10px] text-slate-500">{rep.reportedByRole}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          isApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isVerified
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {rep.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedReport(rep)}
                          className="rounded bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 text-xs font-semibold flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View Diary</span>
                        </button>
                        {rep.status === 'SUBMITTED' && (
                          <button
                            onClick={() => setVerifyModalReport(rep)}
                            className="rounded bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 text-xs font-semibold flex items-center gap-1 shadow"
                          >
                            <Check className="h-3 w-3" />
                            <span>Consultant Verify</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW DAILY FIELD REPORT MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" />
                <h2 className="text-base font-bold text-white">Record Daily Field Report (Site Diary)</h2>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="mt-4 space-y-5 text-xs">
              {/* SECTION 1: General & Environmental Parameters */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sun className="h-4 w-4" />
                  <span>1. General Date & Environmental Site Conditions</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-slate-300 font-medium">Report Date</label>
                    <input
                      type="date"
                      required
                      value={reportDate}
                      onChange={(e) => setReportDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium">Shift</label>
                    <select
                      value={shift}
                      onChange={(e) => setShift(e.target.value as any)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white"
                    >
                      <option value="DAY_SHIFT">Day Shift (06:30 - 17:00)</option>
                      <option value="NIGHT_SHIFT">Night Shift (18:00 - 04:00)</option>
                      <option value="24_HOUR_CONTINUOUS_POUR">24-Hour Continuous Concrete Pour</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium">Weather Condition</label>
                    <select
                      value={weatherCondition}
                      onChange={(e) => setWeatherCondition(e.target.value as any)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white"
                    >
                      <option value="SUNNY_CLEAR">Sunny & Clear</option>
                      <option value="EXTREME_HEAT">Extreme Heat (38°C - 45°C)</option>
                      <option value="WINDY_HIGH_GUSTS">High Wind (&gt;35 kts Crane Hold)</option>
                      <option value="SANDSTORM_DUST">Sandstorm / Low Visibility</option>
                      <option value="RAIN_PRECIPITATION">Rain / Wet Conditions</option>
                      <option value="HUMID_FOGGY">High Humidity / Morning Fog</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium">Ground Conditions</label>
                    <select
                      value={groundConditions}
                      onChange={(e) => setGroundConditions(e.target.value as any)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white"
                    >
                      <option value="DRY_STABLE">Dry & Stable</option>
                      <option value="DEWATERED">Continuous Dewatered</option>
                      <option value="MUDDY_SLIPPERY">Muddy / Slippery</option>
                      <option value="STANDING_WATER">Standing Water / Infiltration</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <label className="text-slate-400 font-medium">Max Temp (°C)</label>
                    <input
                      type="number"
                      required
                      value={temperatureHighC}
                      onChange={(e) => setTemperatureHighC(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium">Min Temp (°C)</label>
                    <input
                      type="number"
                      required
                      value={temperatureLowC}
                      onChange={(e) => setTemperatureLowC(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium">Delay Hours Lost</label>
                    <input
                      type="number"
                      step="0.5"
                      value={delayHours}
                      onChange={(e) => setDelayHours(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium">Reason for Delay</label>
                    <select
                      value={delayReason}
                      onChange={(e) => setDelayReason(e.target.value as any)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white"
                    >
                      <option value="NONE">None (Full Operations)</option>
                      <option value="MIDDAY_SUMMER_HEAT_BREAK">Midday Summer Heat Break (12:30-15:00)</option>
                      <option value="WIND_CRANE_SAFETY_HOLD">Wind Crane Safety Hold</option>
                      <option value="CONCRETE_PLANT_CONGESTION">Ready-Mix Plant Logistics</option>
                      <option value="DEWATERING_EQUIPMENT_FAULT">Dewatering Pump Stoppage</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Daily Labor Force Breakdown */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>2. Daily Labor Force Headcount & Man-Hours</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddLabor}
                    className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-xs text-blue-400 font-semibold hover:bg-slate-700"
                  >
                    <Plus className="h-3 w-3" /> Add Trade Row
                  </button>
                </div>

                <div className="space-y-2">
                  {laborItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center rounded-lg bg-slate-900 p-2.5 border border-slate-800"
                    >
                      <div className="sm:col-span-4">
                        <label className="text-[10px] text-slate-400">Trade / Craft</label>
                        <input
                          type="text"
                          required
                          value={item.trade}
                          onChange={(e) => handleUpdateLabor(idx, 'trade', e.target.value)}
                          className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-slate-400">Employer / Subcontractor</label>
                        <input
                          type="text"
                          required
                          value={item.employer}
                          onChange={(e) => handleUpdateLabor(idx, 'employer', e.target.value)}
                          className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400">Headcount</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.headcount}
                          onChange={(e) => handleUpdateLabor(idx, 'headcount', e.target.value)}
                          className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label className="text-[10px] text-slate-400">Hours</label>
                        <input
                          type="number"
                          step="0.5"
                          required
                          value={item.hoursWorked}
                          onChange={(e) => handleUpdateLabor(idx, 'hoursWorked', e.target.value)}
                          className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-center justify-between pt-2 sm:pt-0">
                        <div>
                          <div className="text-[10px] text-slate-400">Man-Hours</div>
                          <div className="font-mono font-bold text-emerald-400">{item.manHours}</div>
                        </div>
                        {laborItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLabor(idx)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-6 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <span>
                    Total Workers: <strong className="text-white font-mono">{laborItems.reduce((a, b) => a + (b.headcount || 0), 0)}</strong>
                  </span>
                  <span>
                    Total Man-Hours: <strong className="text-emerald-400 font-mono">{laborItems.reduce((a, b) => a + (b.manHours || 0), 0)} hrs</strong>
                  </span>
                </div>
              </div>

              {/* SECTION 3: Heavy Equipment & Machinery */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="h-4 w-4" />
                    <span>3. Heavy Equipment & Machinery Operation</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddEquipment}
                    className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-xs text-blue-400 font-semibold hover:bg-slate-700"
                  >
                    <Plus className="h-3 w-3" /> Add Plant
                  </button>
                </div>

                <div className="space-y-2">
                  {equipmentItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center rounded-lg bg-slate-900 p-2.5 border border-slate-800"
                    >
                      <div className="sm:col-span-4">
                        <label className="text-[10px] text-slate-400">Equipment Name</label>
                        <input
                          type="text"
                          required
                          value={item.name}
                          onChange={(e) => handleUpdateEquipment(idx, 'name', e.target.value)}
                          className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400">ID / Tag</label>
                        <input
                          type="text"
                          required
                          value={item.equipmentIdCode}
                          onChange={(e) => handleUpdateEquipment(idx, 'equipmentIdCode', e.target.value)}
                          className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-slate-400">Status</label>
                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateEquipment(idx, 'status', e.target.value)}
                          className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white"
                        >
                          <option value="OPERATIONAL">Operational</option>
                          <option value="STANDBY">Standby</option>
                          <option value="MAINTENANCE_BREAKDOWN">Breakdown / Maintenance</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400">Hours Run</label>
                        <input
                          type="number"
                          step="0.5"
                          value={item.hoursOperated}
                          onChange={(e) => handleUpdateEquipment(idx, 'hoursOperated', parseFloat(e.target.value) || 0)}
                          className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>

                      <div className="sm:col-span-1 text-right pt-3 sm:pt-0">
                        {equipmentItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveEquipment(idx)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4: Work Accomplishments */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>4. Work Activities Executed Today (Zone & Quantities)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddActivity}
                    className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-xs text-blue-400 font-semibold hover:bg-slate-700"
                  >
                    <Plus className="h-3 w-3" /> Add Activity
                  </button>
                </div>

                <div className="space-y-2">
                  {activities.map((act, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center rounded-lg bg-slate-900 p-2.5 border border-slate-800"
                    >
                      <div className="sm:col-span-4">
                        <label className="text-[10px] text-slate-400">Location / Floor / Zone</label>
                        <input
                          type="text"
                          required
                          value={act.locationZone}
                          onChange={(e) => handleUpdateActivity(idx, 'locationZone', e.target.value)}
                          className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="text-[10px] text-slate-400">Detailed Scope Description</label>
                        <input
                          type="text"
                          required
                          value={act.description}
                          onChange={(e) => handleUpdateActivity(idx, 'description', e.target.value)}
                          className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400">WBS Code</label>
                        <select
                          value={act.wbsCode || ''}
                          onChange={(e) => handleUpdateActivity(idx, 'wbsCode', e.target.value)}
                          className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white"
                        >
                          <option value="">None</option>
                          {store.costCodes
                            .filter((c) => c.projectId === store.currentProjectId)
                            .map((c) => (
                              <option key={c.id} value={c.code}>
                                {c.code}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="sm:col-span-1">
                        <label className="text-[10px] text-slate-400">Qty</label>
                        <input
                          type="number"
                          step="any"
                          value={act.quantityExecuted || ''}
                          onChange={(e) => handleUpdateActivity(idx, 'quantityExecuted', parseFloat(e.target.value) || 0)}
                          className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>

                      <div className="sm:col-span-1 text-right pt-3 sm:pt-0">
                        {activities.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveActivity(idx)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 5: Safety, QA Inspections & Material Deliveries */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  <span>5. Health & Safety, Inspections & Deliveries</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-medium">Safety Toolbox Talk Given</label>
                    <input
                      type="text"
                      value={safetyTalk}
                      onChange={(e) => setSafetyTalk(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium">Consultant QA/QC Inspections Held</label>
                    <input
                      type="text"
                      value={inspectionsText}
                      onChange={(e) => setInspectionsText(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-medium">Material Deliveries Received on Site</label>
                    <input
                      type="text"
                      value={deliveriesText}
                      onChange={(e) => setDeliveriesText(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium">General Field Diary Notes</label>
                    <input
                      type="text"
                      value={generalNotes}
                      onChange={(e) => setGeneralNotes(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-500/20"
                >
                  Submit Daily Field Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL SITE DIARY DETAIL VIEW MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-4xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl max-h-[92vh] overflow-y-auto space-y-5 text-xs">
            {/* Header / Report Print Styling */}
            <div className="flex items-start justify-between border-b-2 border-slate-700 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-extrabold text-blue-400">
                    {selectedReport.reportNumber}
                  </span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 font-bold uppercase font-mono text-slate-300 text-[10px]">
                    {selectedReport.shift.replace('_', ' ')}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                      selectedReport.status === 'APPROVED' || selectedReport.status === 'CONSULTANT_VERIFIED'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {selectedReport.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">Official Contractor Daily Site Diary</h2>
                <div className="text-[11px] text-slate-400">
                  Project: <strong className="text-white">{store.projects.find((p) => p.id === selectedReport.projectId)?.projectName}</strong> • Date: <strong className="text-white font-mono">{selectedReport.reportDate}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white"
                  title="Print official site diary"
                >
                  <Printer className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Environmental & Weather */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="text-[11px] font-bold uppercase text-slate-400 mb-2">Weather & Site Operating Conditions</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">Weather Condition</span>
                  <span className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                    {getWeatherIcon(selectedReport.weatherCondition)}
                    {selectedReport.weatherCondition.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">Temperature & Humidity</span>
                  <span className="font-bold text-white mt-0.5 block">
                    {selectedReport.temperatureHighC}°C / {selectedReport.temperatureLowC}°C ({selectedReport.humidityPercentage}%)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">Ground Conditions</span>
                  <span className="font-bold text-slate-300 mt-0.5 block">
                    {selectedReport.groundConditions.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">Delay / Stoppages</span>
                  <span className="font-bold text-amber-400 mt-0.5 block">
                    {selectedReport.delayHours > 0 ? `${selectedReport.delayHours}h (${selectedReport.delayReason.replace(/_/g, ' ')})` : 'Zero delay'}
                  </span>
                </div>
              </div>
            </div>

            {/* Labor Force Breakdown */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-400">
                <span>Workforce Attendance Register</span>
                <span className="text-white font-mono">
                  {selectedReport.totalHeadcount} workers ({selectedReport.totalManHours} man-hours)
                </span>
              </div>
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-[10px] text-slate-500 border-b border-slate-800 pb-1">
                    <th className="py-1">Trade / Craft</th>
                    <th className="py-1">Employer / Subcontractor</th>
                    <th className="py-1 text-right">Headcount</th>
                    <th className="py-1 text-right">Hours</th>
                    <th className="py-1 text-right text-emerald-400">Total Man-Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {selectedReport.labor.map((l) => (
                    <tr key={l.id}>
                      <td className="py-1.5 font-sans font-medium text-white">{l.trade}</td>
                      <td className="py-1.5 font-sans text-slate-400">{l.employer}</td>
                      <td className="py-1.5 text-right font-bold text-white">{l.headcount}</td>
                      <td className="py-1.5 text-right text-slate-400">{l.hoursWorked}h</td>
                      <td className="py-1.5 text-right font-bold text-emerald-400">{l.manHours} hrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Equipment Breakdown */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <div className="text-[11px] font-bold uppercase text-slate-400">Heavy Plant & Machinery Log</div>
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-[10px] text-slate-500 border-b border-slate-800 pb-1">
                    <th className="py-1">Equipment Name</th>
                    <th className="py-1">Tag #</th>
                    <th className="py-1">Status</th>
                    <th className="py-1 text-right">Hours Run</th>
                    <th className="py-1">Duty Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {selectedReport.equipment.map((eq) => (
                    <tr key={eq.id}>
                      <td className="py-1.5 font-sans font-medium text-white">{eq.name}</td>
                      <td className="py-1.5 text-blue-400 font-bold">{eq.equipmentIdCode}</td>
                      <td className="py-1.5 font-sans">
                        <span className="rounded bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 text-[10px] font-bold">
                          {eq.status}
                        </span>
                      </td>
                      <td className="py-1.5 text-right">{eq.hoursOperated}h</td>
                      <td className="py-1.5 font-sans text-slate-400">{eq.remarks || 'Normal operations'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Work Progress Accomplished */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <div className="text-[11px] font-bold uppercase text-slate-400">Executed Work Activities</div>
              <div className="space-y-2">
                {selectedReport.activities.map((act) => (
                  <div key={act.id} className="rounded-lg bg-slate-900 p-2.5 border border-slate-800 space-y-1">
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="font-bold text-white font-sans">{act.locationZone}</span>
                      {act.wbsCode && <span className="text-blue-400 font-bold">WBS: {act.wbsCode}</span>}
                    </div>
                    <p className="text-slate-300 font-sans text-xs">{act.description}</p>
                    {act.quantityExecuted && (
                      <div className="text-[11px] text-emerald-400 font-mono font-bold">
                        Executed: {act.quantityExecuted} {act.unit}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Safety, Quality & Endorsements */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
              <div className="text-[11px] font-bold uppercase text-slate-400">Quality, HSE & Consultant Review</div>
              <div className="space-y-1.5">
                <div className="text-slate-300">
                  <strong className="text-slate-400">Safety Briefing:</strong> {selectedReport.safetyToolboxTopic || 'Site safety review'}
                </div>
                <div className="text-slate-300">
                  <strong className="text-slate-400">Incidents:</strong> {selectedReport.incidentsCount} Incidents (LTI-Free)
                </div>
                {selectedReport.consultantInspections.length > 0 && (
                  <div className="text-slate-300">
                    <strong className="text-slate-400">Inspections:</strong> {selectedReport.consultantInspections.join('; ')}
                  </div>
                )}
                {selectedReport.consultantRemarks && (
                  <div className="rounded bg-blue-950/40 p-2.5 border border-blue-500/30 text-blue-300 text-xs mt-2">
                    <strong>Consultant Verification Remarks:</strong> {selectedReport.consultantRemarks}
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">
                      Endorsed by {selectedReport.consultantReviewerName} on {selectedReport.verifiedAt?.split('T')[0]}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sign-off footer */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              <div>
                Reported by: <strong className="text-white">{selectedReport.reportedByName}</strong> ({selectedReport.reportedByRole})
              </div>
              <div className="text-right">
                TechFlow Digital Stamp • Safe Hours: <strong className="text-emerald-400 font-mono">{selectedReport.cumulativeSafeManHours.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VERIFY MODAL */}
      {verifyModalReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Consultant Daily Verification</h2>
              <button onClick={() => setVerifyModalReport(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <p className="text-slate-300">
                You are verifying the contractor's daily site diary {verifyModalReport.reportNumber} for{' '}
                <strong className="text-white">{verifyModalReport.reportDate}</strong>.
              </p>

              <div>
                <label className="text-slate-300 font-medium">Consultant Verification Remarks</label>
                <textarea
                  rows={3}
                  value={consultantRemarks}
                  onChange={(e) => setConsultantRemarks(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setVerifyModalReport(null)}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmVerify}
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 font-semibold text-white hover:bg-indigo-500 shadow"
                >
                  Sign & Endorse Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
