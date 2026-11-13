import { Router, Request, Response } from 'express';
import { eventLedger } from '../events/event-ledger.js';
import { requireCaseAccess } from '../auth/auth-service.js';

export const eventsRouter = Router();

// Replay events after a given cursor (for reconnects and offline catchup)
eventsRouter.get('/cases/:id/events/history', requireCaseAccess, (req: Request, res: Response) => {
  const caseId = req.params.id;
  const afterCursor = req.query.afterCursor ? parseInt(req.query.afterCursor as string, 10) : 0;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;

  const events = eventLedger.getEventsAfterCursor(caseId, afterCursor, limit);
  res.json({
    caseId,
    afterCursor,
    eventsCount: events.length,
    events
  });
});

// SSE Live Stream Endpoint with catch-up replay
eventsRouter.get('/cases/:id/events', requireCaseAccess, (req: Request, res: Response) => {
  const caseId = req.params.id;
  const afterCursor = req.query.afterCursor ? parseInt(req.query.afterCursor as string, 10) : 0;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering on reverse proxies
  res.flushHeaders();

  // If client provided afterCursor, replay missed events first
  if (afterCursor > 0) {
    const missed = eventLedger.getEventsAfterCursor(caseId, afterCursor);
    missed.forEach((evt) => {
      res.write(`id: ${evt.cursor}\nevent: ${evt.eventType}\ndata: ${JSON.stringify(evt)}\n\n`);
    });
  }

  // Register for ongoing real-time event streaming
  eventLedger.registerSubscriber(caseId, res);
});

