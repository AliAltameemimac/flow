import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OverviewDashboard } from './features/OverviewDashboard';
import { ProjectsView } from './features/ProjectsView';
import { CostDashboard } from './features/CostDashboard';
import { CostCodesView } from './features/CostCodesView';
import { PurchaseOrdersView } from './features/PurchaseOrdersView';
import { ExpensesView } from './features/ExpensesView';
import { PayablesView } from './features/PayablesView';
import { ApprovalsView } from './features/ApprovalsView';
import { RfiView } from './features/RfiView';
import { DrawingsView } from './features/DrawingsView';
import { SubmittalsAndQualityView } from './features/SubmittalsAndQualityView';
import { DocumentsView } from './features/DocumentsView';
import { AiSpecSearchView } from './features/AiSpecSearchView';
import { QrCodeView } from './features/QrCodeView';
import { AuditLogView } from './features/AuditLogView';
import { SystemHealthView } from './features/SystemHealthView';
import { DailyReportsView } from './features/DailyReportsView';
import { store } from './services/store';

export default function App() {
  const [currentView, setCurrentView] = useState('cost-dashboard');
  const [, setVersion] = useState(0);

  useEffect(() => {
    // Re-render when store mutations occur
    const unsubscribe = store.subscribe(() => {
      setVersion((v) => v + 1);
    });
    return unsubscribe;
  }, []);

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <OverviewDashboard onNavigate={setCurrentView} />;
      case 'projects':
        return <ProjectsView onNavigate={setCurrentView} />;
      case 'cost-dashboard':
        return <CostDashboard onNavigate={setCurrentView} />;
      case 'cost-codes':
        return <CostCodesView />;
      case 'purchase-orders':
        return <PurchaseOrdersView />;
      case 'expenses':
        return <ExpensesView />;
      case 'payables':
        return <PayablesView />;
      case 'approvals':
        return <ApprovalsView />;
      case 'rfis':
        return <RfiView />;
      case 'daily-reports':
        return <DailyReportsView />;
      case 'drawings':
        return <DrawingsView />;
      case 'submittals':
        return <SubmittalsAndQualityView initialTab="SUBMITTALS" />;
      case 'ncrs':
        return <SubmittalsAndQualityView initialTab="NCRS" />;
      case 'documents':
        return <DocumentsView />;
      case 'ai-search':
        return <AiSpecSearchView />;
      case 'qr-codes':
        return <QrCodeView />;
      case 'audit-log':
        return <AuditLogView />;
      case 'system-health':
        return <SystemHealthView />;
      default:
        return <CostDashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header onNavigate={setCurrentView} activeView={currentView} />

      {/* Main Content Layout with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentView={currentView} onNavigate={setCurrentView} />

        <main className="flex-1 overflow-y-auto bg-slate-950/60 pb-16">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
