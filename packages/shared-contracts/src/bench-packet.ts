import { SpecialistStatus } from '@dharmaraksha/tribunal-definitions';

export interface EvidenceCitation {
  documentId: string;
  documentTitle: string;
  pageNumber: number;
  clauseReference?: string;
  verbatimExcerpt: string;
  isVerifiedExcerpt: boolean;
}

export interface LegalAuthorityCitation {
  statuteName?: string;
  sectionNumber?: string;
  judgmentTitle?: string;
  citationId?: string;
  courtName?: string;
  paragraphNumber?: string;
  isVerifiedAuthority: boolean;
}

export interface SpecialistFinding {
  specialistId: string;
  benchId: 'A' | 'B' | 'C' | 'D' | 'E';
  title: string;
  summary: string;
  detail: string;
  citations: EvidenceCitation[];
  authorities?: LegalAuthorityCitation[];
  severity: 'info' | 'advisory' | 'warning' | 'critical';
  confidence: number; // 0.0 to 1.0
  flaggedDiscrepancy?: boolean;
}

export interface DiscrepancyReport {
  id: string;
  type: 'conflicting_amounts' | 'inconsistent_names' | 'timeline_conflict' | 'missing_attachment' | 'contradictory_clauses';
  description: string;
  documentA: { documentId: string; pageNumber: number; value: string };
  documentB: { documentId: string; pageNumber: number; value: string };
  resolved: boolean;
}

export interface BenchPacket {
  benchId: 'A' | 'B' | 'C' | 'D' | 'E';
  chairId: string;
  caseId: string;
  status: 'draft' | 'ready_for_messenger' | 'delivered_to_presiding' | 'rejected_for_rework';
  generatedAt: string;
  findings: SpecialistFinding[];
  discrepancies: DiscrepancyReport[];
  coverageAssessment: {
    coveredPoints: string[];
    unresolvedQuestions: string[];
    missingEvidenceNoted: string[];
  };
  specialistExecutions: Record<string, { status: SpecialistStatus; latencyMs: number; errorMessage?: string }>;
}

