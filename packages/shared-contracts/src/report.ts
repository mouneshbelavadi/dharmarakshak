import { IndianLanguage } from './session.js';
import { MaterialFinding, DiscrepancyComparison } from './findings.js';
import { PresidingReviewSummary } from './case.js';

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

