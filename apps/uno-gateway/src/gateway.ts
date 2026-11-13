import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { rfidRouter } from './routes/rfid.js';
import { captureRouter } from './routes/capture.js';

export function createGateway() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Mount gateway routes
  app.use('/api/v1', healthRouter);
  app.use('/api/v1', rfidRouter);
  app.use('/api/v1', captureRouter);

  app.get('/', (_req, res) => {
    res.json({
      name: 'DHARMARAKSHA UNO Q Gateway',
      status: 'operational',
      board: 'Arduino UNO Q (Linux Side)',
      health: '/api/v1/health'
    });
  });

  return app;
}

