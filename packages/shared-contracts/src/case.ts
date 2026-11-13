import { CaseDocument, ImmutableDocumentVersion } from './document.js';
import { BenchPacket } from './bench-packet.js';
import { IndianLanguage } from './session.js';

export type CaseStatus =
  | 'draft_intake'
  | 'documents_submitted'
  | 'evidence_analysis_in_progress'
  | 'obligations_and_sources_in_progress'
  | 'risk_and_verification_in_progress'
  | 'messenger_handoff'
  | 'presiding_synthesis'
  | 'review_complete'
  | 'partial_review_with_gaps'
  | 'cancelled'
  | 'failed';

export interface CaseOwnership {
  caseId: string;
  creatorSessionId: string;
  creatorRole: 'visitor' | 'operator' | 'admin';
  assignedCardUid?: string;
  sourceType: 'kiosk' | 'laptop_direct';
  authorizedSessionIds: string[];
}

export interface CaseDocumentSnapshot {
  snapshotId: string;
  caseId: string;
  snapshotVersion: number; // Monotonically increments whenever documents or pages change
  documentManifest: Array<{
    documentId: string;
    title: string;
    category: string;
    parentDocumentId?: string;
    versionNumber: number;
    pageCount: number;
    manifestHash: string;
  }>;
  totalPageCount: number;
  combinedFingerprint: string;
  frozenAt: string;
}

export interface PresidingReviewSummary {
  executiveSummary: string;
  keyObligations: string[];
  materialRisks: string[];
  criticalDeadlines: string[];
  inconsistenciesIdentified: string[];
  questionsForVisitorClarification: string[];
  missingDocumentsOrExhibits: string[];
  statutoryCoverageLimitations: string[];
  certifiedPlainLanguage: boolean;
  reviewedAt: string;
}

export interface CaseRecord {
  caseId: string;
  ownership: CaseOwnership;
  title: string;
  status: CaseStatus;
  currentSnapshotVersion: number;
  activeSnapshot?: CaseDocumentSnapshot;
  documents: CaseDocument[];
  benchPackets: Partial<Record<'A' | 'B' | 'C' | 'D' | 'E', BenchPacket>>;
  presidingSummary?: PresidingReviewSummary;
  preferredLanguage: IndianLanguage;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}
