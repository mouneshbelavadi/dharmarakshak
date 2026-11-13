import { SpecialistStatus, BenchStatus } from '@dharmaraksha/tribunal-definitions';

export type AnalysisRunStatus =
  | 'queued'
  | 'running'
  | 'interrupted'
  | 'completed'
  | 'completed_with_gaps'
  | 'cancelled'
  | 'failed';

export interface RouterDecision {
  runId: string;
  caseId: string;
  snapshotVersion: number;
  activatedBenchIds: Array<'A' | 'B' | 'C' | 'D' | 'E'>;
  assignedSpecialistIds: string[];
  omittedSpecialistIds: string[];
  rationale: string;
  decidedAt: string;
}

export interface SpecialistTaskExecution {
  taskId: string;
  runId: string;
  specialistId: string;
  benchId: 'A' | 'B' | 'C' | 'D' | 'E';
  status: SpecialistStatus;
  startedAt?: string;
  completedAt?: string;
  latencyMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  findingsCount: number;
  errorMessage?: string;
}

export interface AnalysisRun {
  runId: string;
  caseId: string;
  snapshotVersion: number; // Bound strictly to an immutable case-document snapshot
  status: AnalysisRunStatus;
  routerDecision: RouterDecision;
  tasks: Record<string, SpecialistTaskExecution>;
  startedAt: string;
  completedAt?: string;
  abortedAt?: string;
  abortReason?: string;
}

