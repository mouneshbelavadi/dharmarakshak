import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { casesRouter } from './routes/cases.js';
import { documentsRouter } from './routes/documents.js';
import { eventsRouter } from './routes/events.js';
import { devicesRouter } from './routes/devices.js';
import { sessionsRouter } from './routes/sessions.js';
import { rfidRouter } from './routes/rfid.js';
import { retrievalRouter } from './routes/retrieval.js';
import { qaRouter } from './routes/qa.js';
import { reportsRouter } from './routes/reports.js';

export function createApp() {
  const app = express();

  // Strict CORS: allow explicit local origins (laptop web and phone web)
  app.use(
    cors({
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
      credentials: true
    })
  );

  app.use(express.json({ limit: '25mb' })); // Support page upload payloads

  // Mount API endpoints under /api/v1
  app.use('/api/v1', healthRouter);
  app.use('/api/v1', casesRouter);
  app.use('/api/v1', documentsRouter);
  app.use('/api/v1', eventsRouter);
  app.use('/api/v1', devicesRouter);
  app.use('/api/v1', sessionsRouter);
  app.use('/api/v1', rfidRouter);
  app.use('/api/v1', retrievalRouter);
  app.use('/api/v1', qaRouter);
  app.use('/api/v1', reportsRouter);

  // Root status endpoint
  app.get('/', (_req, res) => {
    res.json({
      name: 'DHARMARAKSHA Main API',
      status: 'operational',
      health: '/api/v1/health'
    });
  });

  return app;
}
