import { Router, Request, Response } from 'express';
import { VisitorSession, SessionStatus } from '@dharmaraksha/shared-contracts';

export const sessionsRouter = Router();

const placeholderSessions: Map<string, VisitorSession> = new Map([
  [
    'sess-001',
    {
      sessionId: 'sess-001',
      cardUid: 'E280689420000000',
      role: 'visitor',
      status: 'active' as SessionStatus,
      preferredLanguage: 'kn',
      consentGiven: true,
      activeCaseId: 'case-demo-001',
      sessionToken: 'tok-ephemeral-visitor-001',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    }
  ]
]);

sessionsRouter.get('/sessions', (_req: Request, res: Response) => {
  res.json({ sessions: Array.from(placeholderSessions.values()) });
});

sessionsRouter.get('/sessions/:id', (req: Request, res: Response) => {
  const session = placeholderSessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json(session);
});
