import { Router, Request, Response } from 'express';
import { requireCaseAccess } from '../auth/auth-service.js';
import { presentationService, PresentationService } from '../services/presentation-service.js';

export const presentationRouter = Router();

// GET /api/v1/cases/:id/presentation — Sanitized evaluator view
presentationRouter.get('/cases/:id/presentation', requireCaseAccess, (req: Request, res: Response) => {
  const caseId = req.params.id;
  try {
    const view = presentationService.getCasePresentation(caseId);
    // Double-check: strip any restricted field that might have leaked
    const sanitized = PresentationService.sanitizePayload(view);
    res.json(sanitized);
  } catch (err: any) {
    res.status(500).json({ error: 'PRESENTATION_ERROR', message: err.message });
  }
});

// GET /api/v1/cases/:id/presentation/milestones — Milestone timeline
presentationRouter.get('/cases/:id/presentation/milestones', requireCaseAccess, (req: Request, res: Response) => {
  const caseId = req.params.id;
  try {
    const milestones = presentationService.getMilestones(caseId);
    res.json({ caseId, milestones });
  } catch (err: any) {
    res.status(500).json({ error: 'MILESTONE_ERROR', message: err.message });
  }
});

// GET /api/v1/cases/:id/specialist-states — Current specialist activity map
presentationRouter.get('/cases/:id/specialist-states', requireCaseAccess, (req: Request, res: Response) => {
  const caseId = req.params.id;
  try {
    const states = presentationService.getSpecialistActivityStates(caseId);
    res.json({ caseId, states });
  } catch (err: any) {
    res.status(500).json({ error: 'STATE_ERROR', message: err.message });
  }
});
