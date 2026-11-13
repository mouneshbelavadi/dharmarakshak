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

export interface PreservedDisagreement {
  disagreementId: string;
  clauseReference?: string;
  specialistA: string;
  viewpointA: string;
  specialistB: string;
  viewpointB: string;
  preservationRationale: string;
}

export interface BenchPacket {
  packetId: string;
  runId: string;
  snapshotVersion: number;
  packetVersion: number;
  benchId: 'A' | 'B' | 'C' | 'D' | 'E';
  chairId: string;
  caseId: string;
  status: 'draft' | 'packet_ready' | 'ready_for_messenger' | 'delivered_to_presiding' | 'rejected_for_rework';
  generatedAt: string;
  packetChecksum: string;
  findings: SpecialistFinding[];
  discrepancies: DiscrepancyReport[];
  preservedDisagreements: PreservedDisagreement[];
  coverageAssessment: {
    coveredPoints: string[];
    unresolvedQuestions: string[];
    missingEvidenceNoted: string[];
    failedCoverage?: string[];
  };
  specialistExecutions: Record<string, { status: SpecialistStatus; latencyMs: number; errorMessage?: string }>;
}

export interface PacketDeliveryReceipt {
  receiptId: string;
  packetId: string;
  benchId: 'A' | 'B' | 'C' | 'D' | 'E';
  runId: string;
  chairId: string;
  deliveredAt: string;
  recipientId: 'PRESIDING_REVIEWER';
  status: 'accepted' | 'duplicate_ignored' | 'rejected_invalid';
  isDuplicate: boolean;
  packetChecksum: string;
  validationErrors: string[];
}

