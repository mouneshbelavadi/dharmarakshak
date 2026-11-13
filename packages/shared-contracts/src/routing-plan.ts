export type SpecialistDecisionStatus = 'selected' | 'skipped';

export interface RoleRoutingDecision {
  specialistId: string;
  benchId: 'A' | 'B' | 'C' | 'D' | 'E';
  roleName: string;
  decision: SpecialistDecisionStatus;
  reason: string;
  stage: 1 | 2 | 3 | 4;
  dependencies: string[]; // Specialist IDs that must complete before this role can run
  tablePositionIndex: number;
  timeoutMs: number;
}

export interface RoutingPlanInput {
  caseId: string;
  snapshotVersion: number;
  documentCategories: string[];
  documentTitles: string[];
  jurisdiction?: string;
  hasFactualUncertainty: boolean;
  uncertaintyReasons?: string[];
  questionsRaised?: string[];
}

export interface RoutingPlan {
  planId: string;
  caseId: string;
  snapshotVersion: number;
  documentCategories: string[];
  jurisdiction: string;
  factualUncertaintyDetected: boolean;
  uncertaintyReasons: string[];
  questionsRaised: string[];
  totalSpecialistsConsidered: number; // Always 50
  totalSelected: number;
  totalSkipped: number;
  roleDecisions: Record<string, RoleRoutingDecision>;
  stages: {
    stage1_evidenceGrounding: string[];
    stage2_substantiveObligationsAndSources: string[];
    stage3_adversarialEvaluation: string[];
    stage4_verificationAndSynthesis: string[];
  };
  createdAt: string;
}
