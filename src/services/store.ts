import {
  Project,
  CostCode,
  PurchaseOrder,
  Expense,
  Supplier,
  RFI,
  Drawing,
  MaterialSubmittal,
  NCR,
  User,
  Company,
  AuditLog,
  NotificationItem,
  UserRole,
  PayablesAgingGroup,
  DailyFieldReport,
} from '../types';
import {
  SEED_COMPANY,
  SEED_USERS,
  SEED_PROJECTS,
  SEED_SUPPLIERS,
  SEED_COST_CODES,
  SEED_PURCHASE_ORDERS,
  SEED_EXPENSES,
  SEED_RFIS,
  SEED_DRAWINGS,
  SEED_SUBMITTALS,
  SEED_NCRS,
  SEED_AUDIT_LOGS,
  SEED_NOTIFICATIONS,
  SEED_DAILY_REPORTS,
} from '../mock/seedData';

const STORAGE_KEY_PREFIX = 'techflow_v3_';

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
}

// In-memory + LocalStorage central store singleton
class TechFlowStore {
  company: Company;
  users: User[];
  projects: Project[];
  suppliers: Supplier[];
  costCodes: CostCode[];
  purchaseOrders: PurchaseOrder[];
  expenses: Expense[];
  rfis: RFI[];
  drawings: Drawing[];
  submittals: MaterialSubmittal[];
  ncrs: NCR[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  dailyReports: DailyFieldReport[];

  currentProjectId: string;
  currentUser: User;
  displayCurrency: string;

  private listeners: Set<() => void> = new Set();

  constructor() {
    this.company = getStored('company', SEED_COMPANY);
    this.users = getStored('users', SEED_USERS);
    this.projects = getStored('projects', SEED_PROJECTS);
    this.suppliers = getStored('suppliers', SEED_SUPPLIERS);
    this.costCodes = getStored('cost_codes', SEED_COST_CODES);
    this.purchaseOrders = getStored('purchase_orders', SEED_PURCHASE_ORDERS);
    this.expenses = getStored('expenses', SEED_EXPENSES);
    this.rfis = getStored('rfis', SEED_RFIS);
    this.drawings = getStored('drawings', SEED_DRAWINGS);
    this.submittals = getStored('submittals', SEED_SUBMITTALS);
    this.ncrs = getStored('ncrs', SEED_NCRS);
    this.auditLogs = getStored('audit_logs', SEED_AUDIT_LOGS);
    this.notifications = getStored('notifications', SEED_NOTIFICATIONS);
    this.dailyReports = getStored('daily_reports', SEED_DAILY_REPORTS);

    this.currentProjectId = getStored('active_project_id', this.projects[0]?.id || 'proj-1001');
    this.currentUser = getStored('current_user', this.users[0]);
    this.displayCurrency = getStored('display_currency', this.company.baseCurrency || 'AED');
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  resetDemoData() {
    this.company = SEED_COMPANY;
    this.users = SEED_USERS;
    this.projects = SEED_PROJECTS;
    this.suppliers = SEED_SUPPLIERS;
    this.costCodes = SEED_COST_CODES;
    this.purchaseOrders = SEED_PURCHASE_ORDERS;
    this.expenses = SEED_EXPENSES;
    this.rfis = SEED_RFIS;
    this.drawings = SEED_DRAWINGS;
    this.submittals = SEED_SUBMITTALS;
    this.ncrs = SEED_NCRS;
    this.auditLogs = SEED_AUDIT_LOGS;
    this.notifications = SEED_NOTIFICATIONS;
    this.dailyReports = SEED_DAILY_REPORTS;
    this.currentProjectId = SEED_PROJECTS[0].id;
    this.currentUser = SEED_USERS[0];
    this.displayCurrency = SEED_COMPANY.baseCurrency;

    // Clear and re-save
    [
      'company',
      'users',
      'projects',
      'suppliers',
      'cost_codes',
      'purchase_orders',
      'expenses',
      'rfis',
      'drawings',
      'submittals',
      'ncrs',
      'audit_logs',
      'notifications',
      'daily_reports',
      'active_project_id',
      'current_user',
      'display_currency',
    ].forEach((k) => localStorage.removeItem(STORAGE_KEY_PREFIX + k));

    this.notify();
  }

  setCurrentProject(projectId: string) {
    this.currentProjectId = projectId;
    setStored('active_project_id', projectId);
    this.notify();
  }

  setCurrentUserRole(role: UserRole) {
    const matching = this.users.find((u) => u.role === role);
    if (matching) {
      this.currentUser = matching;
    } else {
      this.currentUser = {
        ...this.currentUser,
        role,
        displayName: `${role.replace('_', ' ')} (Simulated)`,
      };
    }
    setStored('current_user', this.currentUser);
    this.notify();
  }

  setDisplayCurrency(curr: string) {
    this.displayCurrency = curr;
    setStored('display_currency', curr);
    this.notify();
  }

  recordAudit(action: string, entityType: string, entityId: string, description: string) {
    const entry: AuditLog = {
      id: `aud-${Date.now()}`,
      companyId: this.company.id,
      projectId: this.currentProjectId,
      userId: this.currentUser.id,
      userName: this.currentUser.displayName,
      userRole: this.currentUser.role,
      action,
      entityType,
      entityId,
      description,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(entry);
    setStored('audit_logs', this.auditLogs);
    this.notify();
  }

  // --- Currency Conversion Helper ---
  // Base is AED. 1 USD = 3.6725 AED; 1 SAR = 0.98 AED; 1 EUR = 4.05 AED
  convert(amount: number, fromCurrency: string = 'AED', toCurrency: string = this.displayCurrency): number {
    if (fromCurrency === toCurrency) return amount;
    const ratesToBaseAED: Record<string, number> = {
      AED: 1,
      USD: 3.6725,
      SAR: 0.979,
      EUR: 4.05,
      GBP: 4.82,
    };

    const fromRate = ratesToBaseAED[fromCurrency] || 1;
    const toRate = ratesToBaseAED[toCurrency] || 1;

    // Convert from -> AED -> toCurrency
    const inAED = amount * fromRate;
    return inAED / toRate;
  }

  // --- Cost Analytics Engine (Phase 1 - 3) ---
  getCostAnalytics(projectId: string = this.currentProjectId) {
    const project = this.projects.find((p) => p.id === projectId) || this.projects[0];
    const codes = this.costCodes.filter((c) => c.projectId === projectId && c.status === 'ACTIVE');
    const projectExpenses = this.expenses.filter((e) => e.projectId === projectId);
    const approvedExpenses = projectExpenses.filter((e) => e.status === 'approved');
    const projectPOs = this.purchaseOrders.filter((po) => po.projectId === projectId);
    const approvedPOs = projectPOs.filter((po) => po.status === 'approved');

    // 1. Total Budget
    const totalBudget = codes.reduce((acc, c) => acc + c.budgetAmount, 0);

    // 2. Total Actual (only approved expenses count towards actual)
    const totalActual = approvedExpenses.reduce((acc, e) => acc + e.baseAmount, 0);

    // 3. Derived Committed Amount
    // For each approved PO line: remaining commitment = line.amount - invoicedAmount, floored at 0
    let totalCommitted = 0;
    const committedByCode: Record<string, number> = {};
    const actualByCode: Record<string, number> = {};

    approvedExpenses.forEach((e) => {
      actualByCode[e.costCodeId] = (actualByCode[e.costCodeId] || 0) + e.baseAmount;
    });

    approvedPOs.forEach((po) => {
      po.lines.forEach((line) => {
        const invoiced = line.invoicedAmount || 0;
        const lineRemainingCommitment = Math.max(0, line.amount - invoiced);
        totalCommitted += lineRemainingCommitment;
        committedByCode[line.costCodeId] =
          (committedByCode[line.costCodeId] || 0) + lineRemainingCommitment;
      });
    });

    // 4. Remaining Budget = Budget - Actual - Committed
    const remainingBudget = totalBudget - totalActual - totalCommitted;
    const percentConsumed = totalBudget > 0 ? ((totalActual + totalCommitted) / totalBudget) * 100 : 0;

    // 5. Estimate at Completion (EAC)
    // Top-down: Actual / (Progress / 100) or sum of lines
    const progress = project.progressPercentage || 50;
    const progressFraction = Math.max(0.05, progress / 100);
    const eac = totalActual / progressFraction;

    // 6. Variance = Budget - EAC (positive means under budget / healthy, negative means cost overrun)
    const variance = totalBudget - eac;

    // 7. Projected Margin
    const contractValue = project.contractValue || totalBudget * 1.25;
    const projectedProfit = contractValue - eac;
    const projectedMarginPercentage = contractValue > 0 ? (projectedProfit / contractValue) * 100 : 0;

    // Cost code performance rows
    const codePerformances = codes.map((c) => {
      const codeActual = actualByCode[c.id] || 0;
      const codeCommitted = committedByCode[c.id] || 0;
      const totalEncumbered = codeActual + codeCommitted;
      const codeRemaining = c.budgetAmount - totalEncumbered;
      const codeConsumedPct = c.budgetAmount > 0 ? (totalEncumbered / c.budgetAmount) * 100 : 0;
      const codeEac = progressFraction > 0 ? codeActual / progressFraction : c.budgetAmount;
      const codeVariance = c.budgetAmount - codeEac;
      const overrunAmount = Math.max(0, totalEncumbered - c.budgetAmount);
      const overrunPercentage = c.budgetAmount > 0 ? (overrunAmount / c.budgetAmount) * 100 : 0;
      const isOverBudget = codeRemaining < 0 || codeVariance < 0;
      const isThresholdAlert = overrunPercentage > 5.0; // Exceeding budget by > 5%

      return {
        ...c,
        actual: codeActual,
        committed: codeCommitted,
        totalEncumbered,
        remaining: codeRemaining,
        consumedPct: codeConsumedPct,
        eac: codeEac,
        variance: codeVariance,
        overrunAmount,
        overrunPercentage,
        isOverBudget,
        isThresholdAlert,
      };
    });

    return {
      project,
      totalBudget,
      totalActual,
      totalCommitted,
      remainingBudget,
      percentConsumed,
      eac,
      variance,
      projectedMarginPercentage,
      codePerformances,
      pendingExpensesCount: projectExpenses.filter((e) => e.status === 'submitted').length,
      pendingPOsCount: projectPOs.filter((po) => po.status === 'submitted').length,
    };
  }

  // --- Purchase Orders Service ---
  createPurchaseOrder(poData: Omit<PurchaseOrder, 'id' | 'companyId' | 'reference' | 'status' | 'createdById' | 'createdByName'>) {
    const nextNum = this.purchaseOrders.length + 1;
    const reference = `PO-2026-${String(nextNum).padStart(3, '0')}`;
    const newPO: PurchaseOrder = {
      ...poData,
      id: `po-${Date.now()}`,
      companyId: this.company.id,
      reference,
      status: 'submitted',
      createdById: this.currentUser.id,
      createdByName: this.currentUser.displayName,
      submittedAt: new Date().toISOString(),
    };

    this.purchaseOrders.unshift(newPO);
    setStored('purchase_orders', this.purchaseOrders);
    this.recordAudit('PO_CREATED', 'PurchaseOrder', newPO.id, `Created ${reference} (${poData.kind}) for ${poData.supplierName} total ${newPO.currency} ${newPO.totalAmount.toLocaleString()}`);
    this.notify();
    return newPO;
  }

  issuePurchaseOrder(poId: string) {
    const po = this.purchaseOrders.find((p) => p.id === poId);
    if (!po) throw new Error('PO not found');
    if (po.createdById === this.currentUser.id && this.currentUser.role !== 'SUPER_ADMIN') {
      throw new Error('Self-approval denied: The person who raised the order cannot issue it.');
    }
    po.status = 'approved';
    po.issuedAt = new Date().toISOString();
    po.issuedById = this.currentUser.id;
    setStored('purchase_orders', this.purchaseOrders);
    this.recordAudit('PO_ISSUED', 'PurchaseOrder', po.id, `Issued ${po.reference} committing ${po.currency} ${po.totalAmount.toLocaleString()}`);
    this.notify();
  }

  rejectPurchaseOrder(poId: string, reason: string) {
    const po = this.purchaseOrders.find((p) => p.id === poId);
    if (!po) throw new Error('PO not found');
    po.status = 'rejected';
    po.rejectionReason = reason;
    setStored('purchase_orders', this.purchaseOrders);
    this.recordAudit('PO_REJECTED', 'PurchaseOrder', po.id, `Rejected ${po.reference}: ${reason}`);
    this.notify();
  }

  cancelPurchaseOrder(poId: string, reason: string) {
    const po = this.purchaseOrders.find((p) => p.id === poId);
    if (!po) throw new Error('PO not found');
    const invoiced = po.lines.reduce((acc, l) => acc + (l.invoicedAmount || 0), 0);
    if (invoiced > 0) {
      throw new Error('Cannot cancel: Order has already been invoiced against. Cannot erase invoiced liabilities.');
    }
    po.status = 'cancelled';
    po.cancellationReason = reason;
    po.cancelledById = this.currentUser.id;
    setStored('purchase_orders', this.purchaseOrders);
    this.recordAudit('PO_CANCELLED', 'PurchaseOrder', po.id, `Cancelled ${po.reference}: ${reason}`);
    this.notify();
  }

  closePurchaseOrder(poId: string) {
    const po = this.purchaseOrders.find((p) => p.id === poId);
    if (!po) throw new Error('PO not found');
    po.status = 'closed';
    po.closedAt = new Date().toISOString();
    setStored('purchase_orders', this.purchaseOrders);
    this.recordAudit('PO_CLOSED', 'PurchaseOrder', po.id, `Closed fully-delivered ${po.reference}`);
    this.notify();
  }

  // --- Expenses & Actual Costs Service ---
  createExpense(expenseData: Omit<Expense, 'id' | 'companyId' | 'reference' | 'status' | 'amountPaid' | 'paymentStatus' | 'enteredById' | 'enteredByName' | 'baseAmount'>) {
    const nextNum = this.expenses.length + 1;
    const reference = expenseData.invoiceNumber || `EXP-${String(nextNum).padStart(3, '0')}`;
    const baseAmount = this.convert(expenseData.amount, expenseData.currency, this.company.baseCurrency);

    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      companyId: this.company.id,
      reference,
      status: 'submitted',
      baseAmount,
      amountPaid: 0,
      paymentStatus: 'unpaid',
      enteredById: this.currentUser.id,
      enteredByName: this.currentUser.displayName,
      submittedAt: new Date().toISOString(),
    };

    this.expenses.unshift(newExpense);
    setStored('expenses', this.expenses);
    this.recordAudit('EXPENSE_SUBMITTED', 'Expense', newExpense.id, `Submitted ${reference} for ${newExpense.currency} ${newExpense.amount.toLocaleString()} against cost code ${newExpense.costCodeCode}`);
    this.notify();
    return newExpense;
  }

  approveExpense(expenseId: string) {
    const expense = this.expenses.find((e) => e.id === expenseId);
    if (!expense) throw new Error('Expense not found');
    if (expense.enteredById === this.currentUser.id && this.currentUser.role !== 'SUPER_ADMIN') {
      throw new Error('Self-approval denied: The person who logged the cost cannot approve it.');
    }
    expense.status = 'approved';
    expense.approvedAt = new Date().toISOString();
    expense.approvedById = this.currentUser.id;
    expense.approvedByName = this.currentUser.displayName;

    // If linked to a purchase order, update the PO line invoiced amount
    if (expense.purchaseOrderId && expense.settlements) {
      const po = this.purchaseOrders.find((p) => p.id === expense.purchaseOrderId);
      if (po) {
        expense.settlements.forEach((s) => {
          const line = po.lines.find((l) => l.id === s.poLineId);
          if (line) {
            line.invoicedAmount = (line.invoicedAmount || 0) + s.amountSettled;
          }
        });
        setStored('purchase_orders', this.purchaseOrders);
      }
    }

    setStored('expenses', this.expenses);
    this.recordAudit('EXPENSE_APPROVED', 'Expense', expense.id, `Approved ${expense.reference} (${expense.currency} ${expense.amount.toLocaleString()})`);
    this.notify();
  }

  rejectExpense(expenseId: string, reason: string) {
    const expense = this.expenses.find((e) => e.id === expenseId);
    if (!expense) throw new Error('Expense not found');
    expense.status = 'rejected';
    expense.rejectionReason = reason;
    setStored('expenses', this.expenses);
    this.recordAudit('EXPENSE_REJECTED', 'Expense', expense.id, `Rejected ${expense.reference}: ${reason}`);
    this.notify();
  }

  recordPayment(expenseId: string, paymentAmount: number, paymentRef: string) {
    const expense = this.expenses.find((e) => e.id === expenseId);
    if (!expense) throw new Error('Expense not found');
    if (expense.status !== 'approved') {
      throw new Error('Only approved expenses can be marked as paid.');
    }

    const newAmountPaid = (expense.amountPaid || 0) + paymentAmount;
    expense.amountPaid = newAmountPaid;
    if (newAmountPaid >= expense.amount) {
      expense.paymentStatus = 'paid';
    } else if (newAmountPaid > 0) {
      expense.paymentStatus = 'partial';
    } else {
      expense.paymentStatus = 'unpaid';
    }
    expense.paidAt = new Date().toISOString();
    expense.paymentReference = paymentRef;

    setStored('expenses', this.expenses);
    this.recordAudit('PAYMENT_RECORDED', 'Expense', expense.id, `Recorded payment of ${expense.currency} ${paymentAmount.toLocaleString()} (Ref: ${paymentRef})`);
    this.notify();
  }

  // --- Payables & Supplier Aging Report ---
  getPayablesAging(asOfDate: Date = new Date('2026-09-27')): PayablesAgingGroup[] {
    const approvedWithSupplier = this.expenses.filter(
      (e) => e.status === 'approved' && e.supplierId && (e.amountPaid || 0) < e.amount
    );

    const supplierMap: Record<string, PayablesAgingGroup> = {};

    approvedWithSupplier.forEach((e) => {
      const sup = this.suppliers.find((s) => s.id === e.supplierId);
      const supplierName = sup ? sup.name : e.supplierName || 'Unknown Supplier';
      const terms = sup ? sup.paymentTermsDays : 30;

      if (!supplierMap[e.supplierId!]) {
        supplierMap[e.supplierId!] = {
          supplierId: e.supplierId!,
          supplierName,
          terms,
          totalOutstanding: 0,
          current: 0,
          days1To30: 0,
          days31To60: 0,
          days61To90: 0,
          days90Plus: 0,
          invoicesCount: 0,
        };
      }

      const outstanding = e.amount - (e.amountPaid || 0);
      const group = supplierMap[e.supplierId!];
      group.totalOutstanding += outstanding;
      group.invoicesCount += 1;

      // Age calculation relative to dueDate (or invoiceDate + terms)
      const due = e.dueDate ? new Date(e.dueDate) : new Date(new Date(e.date).getTime() + terms * 86400000);
      const daysOverdue = Math.floor((asOfDate.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));

      if (daysOverdue <= 0) {
        group.current += outstanding;
      } else if (daysOverdue <= 30) {
        group.days1To30 += outstanding;
      } else if (daysOverdue <= 60) {
        group.days31To60 += outstanding;
      } else if (daysOverdue <= 90) {
        group.days61To90 += outstanding;
      } else {
        group.days90Plus += outstanding;
      }
    });

    return Object.values(supplierMap).sort((a, b) => b.totalOutstanding - a.totalOutstanding);
  }

  // --- BOQ & Cost Codes Import ---
  importCostCodes(newCodes: Omit<CostCode, 'id' | 'companyId' | 'status'>[]) {
    const added: CostCode[] = newCodes.map((c, idx) => ({
      ...c,
      id: `cc-${Date.now()}-${idx}`,
      companyId: this.company.id,
      status: 'ACTIVE',
    }));

    this.costCodes = [...this.costCodes, ...added];
    setStored('cost_codes', this.costCodes);
    this.recordAudit('BOQ_IMPORTED', 'CostCode', this.currentProjectId, `Imported ${added.length} BOQ cost code lines.`);
    this.notify();
  }

  // --- Projects Creation ---
  createProject(projectData: Omit<Project, 'id' | 'companyId'>) {
    const newProj: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      companyId: this.company.id,
    };
    this.projects.push(newProj);
    setStored('projects', this.projects);
    this.setCurrentProject(newProj.id);
    this.recordAudit('PROJECT_CREATED', 'Project', newProj.id, `Created project ${newProj.projectCode}: ${newProj.projectName}`);
    this.notify();
    return newProj;
  }

  // --- Technical Deliverables CRUD ---
  createRFI(rfiData: Omit<RFI, 'id' | 'companyId' | 'projectId' | 'rfiNumber' | 'status' | 'dateRaised' | 'raisedById' | 'raisedByName'>) {
    const nextNum = this.rfis.filter((r) => r.projectId === this.currentProjectId).length + 1;
    const rfiNumber = `RFI-${String(nextNum).padStart(3, '0')}`;
    const newRfi: RFI = {
      ...rfiData,
      id: `rfi-${Date.now()}`,
      companyId: this.company.id,
      projectId: this.currentProjectId,
      rfiNumber,
      status: 'SUBMITTED',
      dateRaised: new Date().toISOString().split('T')[0],
      raisedById: this.currentUser.id,
      raisedByName: this.currentUser.displayName,
    };
    this.rfis.unshift(newRfi);
    setStored('rfis', this.rfis);
    this.recordAudit('RFI_CREATED', 'RFI', newRfi.id, `Raised ${rfiNumber}: ${newRfi.subject}`);
    this.notify();
    return newRfi;
  }

  respondToRFI(rfiId: string, responseText: string) {
    const rfi = this.rfis.find((r) => r.id === rfiId);
    if (!rfi) throw new Error('RFI not found');
    rfi.status = 'RESPONDED';
    rfi.consultantResponse = responseText;
    rfi.responseDate = new Date().toISOString().split('T')[0];
    setStored('rfis', this.rfis);
    this.recordAudit('RFI_RESPONDED', 'RFI', rfi.id, `Consultant responded to ${rfi.rfiNumber}`);
    this.notify();
  }

  closeRFI(rfiId: string) {
    const rfi = this.rfis.find((r) => r.id === rfiId);
    if (!rfi) throw new Error('RFI not found');
    rfi.status = 'CLOSED';
    setStored('rfis', this.rfis);
    this.recordAudit('RFI_CLOSED', 'RFI', rfi.id, `Closed ${rfi.rfiNumber}`);
    this.notify();
  }

  addDrawingRevision(drawingId: string, revisionLabel: string, description: string) {
    const dwg = this.drawings.find((d) => d.id === drawingId);
    if (!dwg) throw new Error('Drawing not found');
    // Supersede existing current
    dwg.revisions.forEach((r) => {
      if (r.status === 'CURRENT') r.status = 'SUPERSEDED';
    });
    const newRev = {
      id: `rev-${Date.now()}`,
      revision: revisionLabel,
      date: new Date().toISOString().split('T')[0],
      author: this.currentUser.displayName,
      description,
      status: 'CURRENT' as const,
    };
    dwg.revisions.unshift(newRev);
    dwg.currentRevision = revisionLabel;
    dwg.updatedAt = new Date().toISOString();
    setStored('drawings', this.drawings);
    this.recordAudit('DRAWING_REVISED', 'Drawing', dwg.id, `Issued ${revisionLabel} for ${dwg.drawingNumber}`);
    this.notify();
  }

  // --- Daily Field Reports Service ---
  createDailyReport(
    reportData: Omit<
      DailyFieldReport,
      | 'id'
      | 'companyId'
      | 'projectId'
      | 'reportNumber'
      | 'status'
      | 'reportedById'
      | 'reportedByName'
      | 'reportedByRole'
      | 'totalHeadcount'
      | 'totalManHours'
      | 'cumulativeSafeManHours'
    >
  ) {
    const projectReports = this.dailyReports.filter((d) => d.projectId === this.currentProjectId);
    const nextSeq = projectReports.length + 90;
    const reportNumber = `DFR-2026-${String(nextSeq).padStart(3, '0')}`;

    const totalHeadcount = reportData.labor.reduce((acc, l) => acc + (l.headcount || 0), 0);
    const totalManHours = reportData.labor.reduce((acc, l) => acc + (l.manHours || (l.headcount * l.hoursWorked) || 0), 0);

    const prevReport = projectReports[0];
    const prevSafe = prevReport ? prevReport.cumulativeSafeManHours : 480000;
    const cumulativeSafeManHours = prevSafe + totalManHours;

    const newReport: DailyFieldReport = {
      ...reportData,
      id: `dfr-${Date.now()}`,
      companyId: this.company.id,
      projectId: this.currentProjectId,
      reportNumber,
      status: 'SUBMITTED',
      totalHeadcount,
      totalManHours,
      cumulativeSafeManHours,
      reportedById: this.currentUser.id,
      reportedByName: this.currentUser.displayName,
      reportedByRole: this.currentUser.role.replace('_', ' '),
    };

    this.dailyReports.unshift(newReport);
    setStored('daily_reports', this.dailyReports);
    this.recordAudit(
      'DAILY_REPORT_SUBMITTED',
      'DailyFieldReport',
      newReport.id,
      `Submitted ${reportNumber} for ${newReport.reportDate}: ${totalHeadcount} workers, ${totalManHours} man-hours`
    );
    this.notify();
    return newReport;
  }

  verifyDailyReport(reportId: string, remarks: string) {
    const report = this.dailyReports.find((r) => r.id === reportId);
    if (!report) throw new Error('Daily Report not found');
    report.status = 'CONSULTANT_VERIFIED';
    report.consultantReviewerName = this.currentUser.displayName;
    report.consultantRemarks = remarks;
    report.verifiedAt = new Date().toISOString();
    setStored('daily_reports', this.dailyReports);
    this.recordAudit('DAILY_REPORT_VERIFIED', 'DailyFieldReport', report.id, `Consultant verified ${report.reportNumber}`);
    this.notify();
  }

  approveDailyReport(reportId: string) {
    const report = this.dailyReports.find((r) => r.id === reportId);
    if (!report) throw new Error('Daily Report not found');
    report.status = 'APPROVED';
    setStored('daily_reports', this.dailyReports);
    this.recordAudit('DAILY_REPORT_APPROVED', 'DailyFieldReport', report.id, `Approved site diary record ${report.reportNumber}`);
    this.notify();
  }
}

export const store = new TechFlowStore();
