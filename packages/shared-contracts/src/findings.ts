import { EvidenceCitation, LegalAuthorityCitation } from './bench-packet.js';

export type FindingSeverity = 'informational' | 'advisory' | 'warning' | 'critical_red_flag';

export interface MaterialFinding {
  findingId: string;
  caseId: string;
  snapshotVersion: number;
  originatingSpecialistId: string;
  originatingBenchId: 'A' | 'B' | 'C' | 'D' | 'E';
  category: string;
  title: string;
  summary: string;
  verbatimExcerpts: EvidenceCitation[];
  authorities: LegalAuthorityCitation[];
  severity: FindingSeverity;
  confidenceScore: number; // 0.0 to 1.0
  isPreservedDisagreement: boolean;
  alternativeViewpoint?: string;
  createdTimestamp: string;
}

export interface DiscrepancyComparison {
  discrepancyId: string;
  caseId: string;
  snapshotVersion: number;
  itemA: {
    documentId: string;
    documentTitle: string;
    pageNumber: number;
    statedValue: string;
  };
  itemB: {
    documentId: string;
    documentTitle: string;
    pageNumber: number;
    statedValue: string;
  };
  discrepancyType: 'amount_conflict' | 'date_inconsistency' | 'party_name_mismatch' | 'missing_annexure_reference';
  explanation: string;
  adversarialSignificance: string;
}

