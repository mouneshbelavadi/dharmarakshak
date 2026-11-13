export type TaskClaimStatus =
  | 'pending'
  | 'claimed'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type TaskFailureCategory =
  | 'rate_limit'
  | 'malformed_output'
  | 'unreadable_page'
  | 'timeout'
  | 'fatal_error'
  | 'cancelled'
  | 'transient_network';

export interface TaskEvidenceReference {
  documentId: string;
  documentTitle: string;
  pageNumber: number;
  clauseReference?: string;
  verbatimQuote: string;
}

export interface SpecialistInitialAssessment {
  specialistId: string;
  roleName: string;
  benchId: 'A' | 'B' | 'C' | 'D' | 'E';
  findingTitle: string;
  summary: string;
  detailedAnalysis: string;
  statutoryOrPrecedentCitation?: string;
  severity: 'informational' | 'advisory' | 'warning' | 'critical_red_flag';
  confidenceScore: number;
  evidenceReferences: TaskEvidenceReference[];
  assessedAt: string;
}

export interface TaskClaim {
  taskId: string;
  runId: string;
  caseId: string;
  snapshotVersion: number;
  specialistId: string;
  benchId: 'A' | 'B' | 'C' | 'D' | 'E';
  stage: 1 | 2 | 3 | 4;
  dependencies: string[]; // Specialist IDs that must be in 'completed' status
  status: TaskClaimStatus;
  claimedByWorker?: string;
  leaseExpiresAt?: string;
  deadlineAt: string;
  attemptCount: number;
  maxRetries: number;
  retryBudgetRemaining: number;
  lastError?: string;
  failureCategory?: TaskFailureCategory;
  acceptedFindingId?: string;
  initialAssessment?: SpecialistInitialAssessment;
  evidenceReferences?: TaskEvidenceReference[];
  contradictionResolution?: {
    resolvedAt: string;
    isPreservedDisagreement: boolean;
    opposingSpecialistId?: string;
    preservedNotes: string;
  };
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface WorkerQuotaConfig {
  globalConcurrencyQuota: number; // Max concurrent tasks across worker daemon
  perCaseConcurrencyQuota: number; // Max concurrent tasks for any single case
  defaultLeaseDurationMs: number; // e.g. 15,000 ms
  heartbeatIntervalMs: number; // e.g. 5,000 ms
  maxRetryBudget: number; // e.g. 2 retries (3 total attempts)
}
