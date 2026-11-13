import { Router, Request, Response } from 'express';
import { requireCaseAccess } from '../auth/auth-service.js';
import { qaTurnService } from '../services/qa-turn-service.js';

export const qaRouter = Router();

// Ask a grounded question across one or all documents in a case
qaRouter.post('/cases/:id/qa/ask', requireCaseAccess, async (req: Request, res: Response) => {
  const caseId = req.params.id;
  const {
    questionText,
    documentScope,
    targetDocumentId,
    snapshotVersion,
    languagePreference,
    mode
  } = req.body;

  if (!questionText || typeof questionText !== 'string' || questionText.trim().length === 0) {
    return res.status(400).json({
      error: 'MISSING_QUESTION_TEXT',
      message: 'Question text is required.'
    });
  }

  try {
    const sessionId = (req as any).sessionId || 'sess-default';
    const turn = await qaTurnService.processQuestion(
      {
        caseId,
        questionText: questionText.trim(),
        documentScope,
        targetDocumentId,
        snapshotVersion,
        languagePreference,
        mode
      },
      sessionId
    );

    res.status(200).json({ success: true, turn });
  } catch (err: any) {
    if (err.message?.includes('FORBIDDEN_CASE_ACCESS')) {
      return res.status(403).json({ error: 'FORBIDDEN', message: err.message });
    }
    if (err.message?.includes('CASE_NOT_FOUND')) {
      return res.status(404).json({ error: 'CASE_NOT_FOUND', message: err.message });
    }
    res.status(500).json({ error: 'QA_PROCESSING_ERROR', message: err.message });
  }
});

// List all Q&A turns for a case
qaRouter.get('/cases/:id/qa/turns', requireCaseAccess, (req: Request, res: Response) => {
  const caseId = req.params.id;
  const turns = qaTurnService.getTurnsForCase(caseId);
  res.status(200).json({ success: true, caseId, turns });
});

// Inspect a targeted review task status
qaRouter.get('/cases/:id/qa/targeted-tasks/:taskId', requireCaseAccess, (req: Request, res: Response) => {
  const taskId = req.params.taskId;
  const task = qaTurnService.getTargetedTask(taskId);
  if (!task) {
    return res.status(404).json({ error: 'TASK_NOT_FOUND', message: `Targeted task ${taskId} not found.` });
  }
  res.status(200).json({ success: true, task });
});
