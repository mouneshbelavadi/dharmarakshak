import { CaseStatus } from '@dharmaraksha/shared-contracts';

export class CaseStateMachine {
  private allowedTransitions: Record<CaseStatus, CaseStatus[]> = {
    draft_intake: ['documents_submitted', 'cancelled', 'failed'],
    documents_submitted: ['evidence_analysis_in_progress', 'cancelled', 'failed'],
    evidence_analysis_in_progress: ['obligations_and_sources_in_progress', 'cancelled', 'failed'],
    obligations_and_sources_in_progress: ['risk_and_verification_in_progress', 'cancelled', 'failed'],
    risk_and_verification_in_progress: ['messenger_handoff', 'cancelled', 'failed'],
    messenger_handoff: ['presiding_synthesis', 'cancelled', 'failed'],
    presiding_synthesis: ['review_complete', 'partial_review_with_gaps', 'cancelled', 'failed'],
    review_complete: ['draft_intake'], // Re-opening for addendum
    partial_review_with_gaps: ['draft_intake'],
    cancelled: [],
    failed: ['draft_intake']
  };

  public canTransition(current: CaseStatus, next: CaseStatus): boolean {
    const validNextStates = this.allowedTransitions[current] || [];
    return validNextStates.includes(next);
  }
}

export const caseStateMachine = new CaseStateMachine();

