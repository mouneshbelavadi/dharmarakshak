import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { casesRouter } from './routes/cases.js';
import { sessionsRouter } from './routes/sessions.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Mount API endpoints
  app.use('/api/v1', healthRouter);
  app.use('/api/v1', casesRouter);
  app.use('/api/v1', sessionsRouter);

  // Root endpoint
  app.get('/', (_req, res) => {
    res.json({
      name: 'DHARMARAKSHA Main API',
      status: 'operational',
      documentation: '/api/v1/health'
    });
  });

  return app;
}

