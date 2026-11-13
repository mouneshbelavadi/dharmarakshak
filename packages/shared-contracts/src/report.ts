import { IndianLanguage } from './session.js';
import { MaterialFinding, DiscrepancyComparison } from './findings.js';
import { PresidingReviewSummary } from './case.js';
import { DocumentCategory } from './document.js';
import { GroundedSourceAnchor } from './qa.js';

export type ReportGenerationStatus = 'queued' | 'rendering' | 'ready' | 'failed';
export type ReportType = 'full_verified' | 'partial_analysis';

export interface ReportDocumentInventoryItem {
  documentId: string;
  title: string;
  category: DocumentCategory;
  pageCount: number;
  language: IndianLanguage;
  sha256PreHash: string;
  isAnnexure: boolean;
  parentDocumentId?: string;
  version: number;
}

export interface ReportObligationItem {
  obligationId: string;
  title: string;
  category: string;
  verbatimClause: string;
  sourceAnchor: GroundedSourceAnchor;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'advisory';
}

export interface ReportDissentItem {
  contradictionId: string;
  topic: string;
  holderPerspective: string;
  counterpartyPerspective: string;
  statutoryReference?: string;
  impactAssessment: string;
}

export interface ReportUnresolvedQuestion {
  questionId: string;
  targetParty: 'visitor' | 'legal_counsel' | 'counterparty';
  questionText: string;
  reason: string;
  missingDocumentRef?: string;
}

export interface ReportCoverageSummary {
  totalSpecialistsAssigned: number;
  totalSpecialistsSkipped: number;
  assignedRoles: string[];
  skippedRoles: string[];
  failedRoles: string[];
  unresolvedGaps: string[];
}

export interface CaseReport {
  reportId: string;
  caseId: string;
  snapshotVersion: number;
  reportType: ReportType;
  status: ReportGenerationStatus;
  reportLanguage: IndianLanguage;
  generatedAt: string;
  documentInventory: ReportDocumentInventoryItem[];
  reviewedScope: {
    mode: 'all' | 'specific';
    documentIds: string[];
  };
  executiveSummary: string;
  materialObligations: ReportObligationItem[];
  adversarialDissents: ReportDissentItem[];
  unresolvedQuestions: ReportUnresolvedQuestion[];
  coverage: ReportCoverageSummary;
  evidenceReferences: GroundedSourceAnchor[];
  pdfStoragePath: string;
  pdfFileSizeBytes: number;
  pdfSha256: string;
  downloadUrl: string;
  statutoryDisclaimer: string;
}

export interface SpokenSummaryPayload {
  caseId: string;
  snapshotVersion: number;
  language: IndianLanguage;
  spokenText: string;
  bulletPoints: string[];
  estimatedDurationSeconds: number;
}

export interface ReportDeliveryRequest {
  channel: 'telegram' | 'drive' | 'gmail';
  destination: string;
}

export interface ReportDeliveryResult {
  channel: 'telegram' | 'drive' | 'gmail';
  status: 'delivered' | 'failed_or_unconfigured';
  destination: string;
  timestamp: string;
  details: string;
}

export interface ReportSnapshot {
  reportId: string;
  caseId: string;
  snapshotVersion: number;
  reportLanguage: IndianLanguage;
  generatedAt: string;
  presidingSummary: PresidingReviewSummary;
  findings: MaterialFinding[];
  discrepancies: DiscrepancyComparison[];
  documentTitlesReviewed: string[];
  totalPageCountReviewed: number;
  pdfStoragePath?: string;
  pdfFileSizeBytes?: number;
  sha256Hash?: string;
  statutoryDisclaimerText: string;
}

export const OFFICIAL_LEGAL_ASSISTANCE_DISCLAIMER =
  'DHARMARAKSHA provides preliminary AI-assisted legal document understanding and review based strictly on submitted pages. Its analysis, findings, and 3D tribunal chamber metaphor do not constitute a binding legal judgment, verified personal legal identity, certified title search, or a warranty that a contract is enforceable or safe to sign. Consult a licensed advocate in your jurisdiction for certified legal counsel.';
