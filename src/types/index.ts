// TechFlow Domain Models & Types

export type UserRole =
  | 'SUPER_ADMIN'
  | 'TECHNICAL_MANAGER'
  | 'TECHNICAL_ENGINEER'
  | 'SITE_ENGINEER'
  | 'DOCUMENT_CONTROLLER'
  | 'QA_QC_ENGINEER'
  | 'PROJECT_MANAGER'
  | 'ACCOUNTANT'
  | 'CONSULTANT'
  | 'CLIENT'
  | 'VIEWER';

export interface User {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  companyId: string;
  active: boolean;
  avatarUrl?: string;
  phone?: string;
  lastLoginAt?: string;
}

export interface Company {
  id: string;
  companyId: string;
  name: string;
  legalName: string;
  workspaceCode: string;
  joinEnabled: boolean;
  founderUid: string;
  baseCurrency: string;
  secondaryCurrency: string;
  exchangeRate: number; // e.g. 3.6725 for AED per USD
}

export interface Project {
  id: string;
  companyId: string;
  projectCode: string;
  projectName: string;
  clientName: string;
  consultantName: string;
  contractorName: string;
  location: string;
  contractNumber: string;
  startDate: string;
  plannedCompletionDate: string;
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'PLANNING';
  progressPercentage: number;
  contractValue: number;
  budgetTotal: number;
  currency: string;
}

export interface CostCode {
  id: string;
  companyId: string;
  projectId: string;
  code: string; // e.g. "03-3100"
  description: string;
  category: 'CIVIL' | 'STRUCTURAL' | 'MEP' | 'FINISHES' | 'EQUIPMENT' | 'PRELIMINARIES' | 'SUBCONTRACT';
  unit: string; // m3, ton, m2, ls, etc.
  quantity: number;
  unitRate: number;
  budgetAmount: number;
  currency: string;
  status: 'ACTIVE' | 'ARCHIVED';
  notes?: string;
}

export type POStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'closed' | 'cancelled';
export type POKind = 'purchase' | 'subcontract';

export interface POLineItem {
  id: string;
  costCodeId: string;
  costCodeCode: string;
  description: string;
  quantity: number;
  unit: string;
  unitRate: number;
  amount: number;
  invoicedAmount?: number;
}

export interface PurchaseOrder {
  id: string;
  companyId: string;
  projectId: string;
  reference: string; // PO-2026-001
  kind: POKind;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDate: string;
  currency: string;
  exchangeRate: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: POStatus;
  lines: POLineItem[];
  createdById: string;
  createdByName: string;
  submittedAt?: string;
  issuedAt?: string;
  issuedById?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  cancelledById?: string;
  closedAt?: string;
  notes?: string;
}

export type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface ExpenseSettlement {
  poId: string;
  poLineId: string;
  costCodeId: string;
  amountSettled: number;
}

export interface Expense {
  id: string;
  companyId: string;
  projectId: string;
  reference: string; // EXP-001 or INV-4491
  costCodeId: string;
  costCodeCode: string;
  date: string;
  category: string;
  supplierId?: string;
  supplierName?: string;
  description: string;
  quantity: number;
  unit: string;
  unitRate: number;
  amount: number; // in document currency
  currency: string;
  exchangeRate: number;
  baseAmount: number; // in base company currency
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  status: ExpenseStatus;
  purchaseOrderId?: string;
  settlements?: ExpenseSettlement[];
  amountPaid: number;
  paymentStatus: PaymentStatus;
  paidAt?: string;
  paymentReference?: string;
  enteredById: string;
  enteredByName: string;
  submittedAt?: string;
  approvedById?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  attachments?: string[];
  notes?: string;
}

export interface Supplier {
  id: string;
  companyId: string;
  code: string;
  name: string;
  category: string;
  contactName: string;
  email: string;
  phone: string;
  paymentTermsDays: number;
  currency: string;
  taxNumber?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface PayablesAgingGroup {
  supplierId: string;
  supplierName: string;
  terms: number;
  totalOutstanding: number;
  current: number; // not overdue
  days1To30: number;
  days31To60: number;
  days61To90: number;
  days90Plus: number;
  invoicesCount: number;
}

export interface RFI {
  id: string;
  companyId: string;
  projectId: string;
  rfiNumber: string; // RFI-001
  subject: string;
  description: string;
  discipline: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'RESPONDED' | 'CLOSED';
  raisedById: string;
  raisedByName: string;
  assignedToName: string;
  consultantName: string;
  dateRaised: string;
  responseDueDate: string;
  responseDate?: string;
  consultantResponse?: string;
  drawingRef?: string;
  specRef?: string;
}

export interface Drawing {
  id: string;
  companyId: string;
  projectId: string;
  drawingNumber: string; // e.g. "STR-DWG-B01-01"
  title: string;
  discipline: string;
  building: string;
  currentRevision: string;
  status: 'IFC' | 'FOR_REVIEW' | 'APPROVED' | 'SUPERSEDED';
  revisions: DrawingRevision[];
  updatedAt: string;
}

export interface DrawingRevision {
  id: string;
  revision: string; // "Rev 0", "Rev A", etc.
  date: string;
  author: string;
  description: string;
  status: 'CURRENT' | 'SUPERSEDED' | 'PENDING';
  fileUrl?: string;
}

export interface MaterialSubmittal {
  id: string;
  companyId: string;
  projectId: string;
  submittalNumber: string;
  materialName: string;
  manufacturer: string;
  supplier: string;
  specificationReference: string;
  discipline: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'APPROVED_WITH_COMMENTS' | 'REJECTED';
  submittedDate: string;
  responseDueDate: string;
  revision: string;
}

export interface NCR {
  id: string;
  companyId: string;
  projectId: string;
  ncrNumber: string;
  title: string;
  location: string;
  discipline: string;
  severity: 'MINOR' | 'MAJOR' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'CORRECTIVE_ACTION' | 'VERIFIED_CLOSED';
  raisedDate: string;
  rootCause?: string;
  correctiveAction?: string;
  closedDate?: string;
}

export interface AuditLog {
  id: string;
  companyId: string;
  projectId?: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  type: 'RFI' | 'COST_APPROVAL' | 'PO_ISSUED' | 'DRAWING_REVISION' | 'SYSTEM' | 'DAILY_REPORT';
  title: string;
  body: string;
  read: boolean;
  linkTo?: string;
  createdAt: string;
}

export type WeatherCondition =
  | 'SUNNY_CLEAR'
  | 'EXTREME_HEAT'
  | 'WINDY_HIGH_GUSTS'
  | 'SANDSTORM_DUST'
  | 'RAIN_PRECIPITATION'
  | 'HUMID_FOGGY';

export type SiteGroundCondition = 'DRY_STABLE' | 'DEWATERED' | 'MUDDY_SLIPPERY' | 'STANDING_WATER';

export type DelayReason =
  | 'NONE'
  | 'MIDDAY_SUMMER_HEAT_BREAK'
  | 'WIND_CRANE_SAFETY_HOLD'
  | 'CONCRETE_PLANT_CONGESTION'
  | 'DEWATERING_EQUIPMENT_FAULT'
  | 'CONSULTANT_INSPECTION_PENDING'
  | 'UTILITY_POWER_DISRUPTION';

export interface DailyLaborItem {
  id: string;
  trade: string; // e.g. "Steel Fixers", "Carpenters / Shuttering", "MEP Electricians"
  employer: string; // e.g. "Al-Haikl Direct", "Voltas MEP", "Alumco Facade"
  headcount: number;
  hoursWorked: number;
  manHours: number; // headcount * hoursWorked
}

export interface DailyEquipmentItem {
  id: string;
  name: string; // e.g. "Tower Crane TC-01", "Boom Concrete Pump 52m"
  equipmentIdCode: string;
  status: 'OPERATIONAL' | 'STANDBY' | 'MAINTENANCE_BREAKDOWN';
  hoursOperated: number;
  operatorProvided: boolean;
  remarks?: string;
}

export interface DailyWorkActivity {
  id: string;
  locationZone: string; // e.g. "Level 16 Slab Zone B"
  description: string;
  wbsCode?: string;
  quantityExecuted?: number;
  unit?: string;
}

export type DailyReportStatus = 'DRAFT' | 'SUBMITTED' | 'CONSULTANT_VERIFIED' | 'APPROVED';
export type DailyShift = 'DAY_SHIFT' | 'NIGHT_SHIFT' | '24_HOUR_CONTINUOUS_POUR';

export interface DailyFieldReport {
  id: string;
  companyId: string;
  projectId: string;
  reportNumber: string; // DFR-2026-001
  reportDate: string;
  shift: DailyShift;
  status: DailyReportStatus;

  // Weather & Site Conditions
  weatherCondition: WeatherCondition;
  temperatureHighC: number;
  temperatureLowC: number;
  humidityPercentage: number;
  groundConditions: SiteGroundCondition;
  workingHoursStart: string; // "07:00"
  workingHoursEnd: string; // "17:00"
  delayHours: number;
  delayReason: DelayReason;

  // Labor Force
  labor: DailyLaborItem[];
  totalHeadcount: number;
  totalManHours: number;
  cumulativeSafeManHours: number;

  // Equipment on Site
  equipment: DailyEquipmentItem[];

  // Work Accomplishments
  activities: DailyWorkActivity[];

  // Health, Safety, Environment & QA
  safetyToolboxTopic?: string;
  incidentsCount: number;
  incidentDetails?: string;
  consultantInspections: string[];
  deliveriesSummary?: string[];

  // Authorship & Verification
  reportedById: string;
  reportedByName: string;
  reportedByRole: string;
  consultantReviewerName?: string;
  consultantRemarks?: string;
  verifiedAt?: string;
  notes?: string;
}

