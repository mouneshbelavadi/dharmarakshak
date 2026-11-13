import { Router, Request, Response } from 'express';
import { CaseRecord, CaseStatus } from '@dharmaraksha/shared-contracts';
import { requireCaseAccess } from '../auth/auth-service.js';
import { eventLedger } from '../events/event-ledger.js';
import { idempotencyService } from '../idempotency/idempotency-service.js';
import { caseStateMachine } from '../state-machines/case-state-machine.js';
import { casesStore } from '../storage/case-store.js';

export const casesRouter = Router();

// List Cases
casesRouter.get('/cases', (_req: Request, res: Response) => {
  res.json({ cases: Array.from(casesStore.values()) });
});

// Get Specific Case (Protected by requireCaseAccess to prevent cross-case leaks)
casesRouter.get('/cases/:id', requireCaseAccess, (req: Request, res: Response) => {
  const c = casesStore.get(req.params.id);
  if (!c) {
    return res.status(404).json({ error: 'CASE_NOT_FOUND', message: 'Case not found.' });
  }
  res.json(c);
});

// Submit / Transition Case (Idempotent)
casesRouter.post('/cases/:id/submit', requireCaseAccess, async (req: Request, res: Response) => {
  const caseId = req.params.id;
  const idempotencyKey = req.header('X-Idempotency-Key');

  // Idempotency check: duplicate submission within idempotency window returns same result
  if (idempotencyKey) {
    const existing = idempotencyService.get(idempotencyKey);
    if (existing) {
      return res.status(existing.statusCode).json({ ...existing.responsePayload, _idempotentReplay: true });
    }
  }

  const currentCase = casesStore.get(caseId);
  if (!currentCase) {
    return res.status(404).json({ error: 'CASE_NOT_FOUND' });
  }

  const nextStatus: CaseStatus = 'documents_submitted';
  if (!caseStateMachine.canTransition(currentCase.status, nextStatus)) {
    return res.status(400).json({
      error: 'INVALID_STATE_TRANSITION',
      message: `Cannot transition case from ${currentCase.status} to ${nextStatus}.`
    });
  }

  currentCase.status = nextStatus;
  currentCase.updatedAt = new Date().toISOString();

  // Atomically commit state and append event to monotonic ledger
  const event = await eventLedger.commitEventAtomically(
    caseId,
    currentCase.currentSnapshotVersion,
    'case:status_transitioned',
    { previousStatus: 'draft_intake', newStatus: nextStatus }
  );

  const responsePayload = { success: true, case: currentCase, eventCursor: event.cursor };

  if (idempotencyKey) {
    idempotencyService.set(idempotencyKey, idempotencyService.hashRequest(req.body), responsePayload, 200);
  }

  res.status(200).json(responsePayload);
});

// Cancel Case Review
casesRouter.post('/cases/:id/cancel', requireCaseAccess, async (req: Request, res: Response) => {
  const caseId = req.params.id;
  const currentCase = casesStore.get(caseId);
  if (!currentCase) {
    return res.status(404).json({ error: 'CASE_NOT_FOUND' });
  }

  currentCase.status = 'cancelled';
  currentCase.cancelledAt = new Date().toISOString();
  currentCase.cancellationReason = req.body.reason || 'User cancelled review';

  const event = await eventLedger.commitEventAtomically(
    caseId,
    currentCase.currentSnapshotVersion,
    'case:cancelled',
    { cancellationReason: currentCase.cancellationReason }
  );

  res.status(200).json({ success: true, case: currentCase, eventCursor: event.cursor });
});
