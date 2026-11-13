import { CaseDocument } from './document.js';
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
  | 'failed';

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
  sessionId?: string;
  sourceType: 'kiosk' | 'laptop_direct';
  title: string;
  status: CaseStatus;
  documents: CaseDocument[];
  benchPackets: Partial<Record<'A' | 'B' | 'C' | 'D' | 'E', BenchPacket>>;
  presidingSummary?: PresidingReviewSummary;
  preferredLanguage: IndianLanguage;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

