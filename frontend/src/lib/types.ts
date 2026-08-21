export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'RECONCILED' | 'FAILED' | 'REFUNDED';

export type MutationStatus =
  | 'SUBMITTED'
  | 'KANUNGO_VERIFICATION'
  | 'AC_LAND_HEARING'
  | 'DCR_PAYMENT_PENDING'
  | 'APPROVED'
  | 'REJECTED';

export interface TaxRecord {
  id: string;
  fiscalYear: string;
  annualDemandBDT: number;
  arrearAmountBDT: number;
  totalDueBDT: number;
  paidAmountBDT: number;
  status: PaymentStatus;
  trxId: string | null;
  paymentMethod: string | null;
  dakhilaNumber: string | null;
  qrCodeUrl: string | null;
  paymentDate: string | null;
}

export interface Mutation {
  id: string;
  caseNumber: string;
  applicantName: string;
  applicantNid: string;
  applicantPhone: string;
  proposedOwner: string;
  status: MutationStatus;
  currentStage: string;
  hearingDate: string | null;
  dcrAmount: number | null;
  remarks: string | null;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  eventType: string;
  title: string;
  description: string;
  actor: string;
  referenceDoc: string | null;
  eventDate: string;
}

export interface Discrepancy {
  id: string;
  mismatchType: string;
  sourceA: string;
  sourceB: string;
  severity: string;
  isResolved: boolean;
  flaggedBy: string;
  createdAt: string;
}

export interface LandDocument {
  id: string;
  docType: string;
  fileName: string;
  fileUrl: string;
  ocrText: string | null;
  uploadedAt: string;
}

export interface Complaint {
  id: string;
  trackingNo: string;
  complainant: string;
  phone: string;
  category: string;
  description: string;
  assignedOffice: string;
  status: string;
  createdAt: string;
}

export interface Parcel {
  id: string;
  division: string;
  district: string;
  upazila: string;
  mouza: string;
  jlNumber: number;
  khatianNo: string;
  dagNo: string;
  holdingNo: string;
  landClass: string;
  areaDecimal: number;
  mappedAreaDecimal?: number;
  currentOwner: string;
  nidNumber: string;
  phone: string;
  email?: string | null;
  geojsonBoundary?: unknown;
  taxRecords?: TaxRecord[];
  mutations?: Mutation[];
  timelineEvents?: TimelineEvent[];
  discrepancies?: Discrepancy[];
  documents?: LandDocument[];
  complaints?: Complaint[];
}

export type Role = 'citizen' | 'officer';

export interface Session {
  name: string;
  nid: string;
  role: Role;
  office?: string;
  parcels: string[];
  signedInAt: string;
}
