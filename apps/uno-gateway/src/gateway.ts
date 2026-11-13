import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { healthRouter } from './routes/health.js';
import { rfidRouter } from './routes/rfid.js';
import { captureRouter } from './routes/capture.js';

export function createGateway() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '25mb' })); // Support full-resolution page stills

  // Mount gateway routes under /api/v1
  app.use('/api/v1', healthRouter);
  app.use('/api/v1', rfidRouter);
  app.use('/api/v1', captureRouter);

  // Serve static phone UI assets when built
  const phoneWebDist = path.resolve(process.env.PHONE_WEB_DIST || '../phone-web/dist');
  if (fs.existsSync(phoneWebDist)) {
    app.use('/kiosk', express.static(phoneWebDist));
  }

  // Root gateway status endpoint (safe: zero secrets)
  app.get('/', (_req, res) => {
    res.json({
      name: 'DHARMARAKSHA UNO Q Gateway',
      status: 'operational',
      board: 'Arduino UNO Q (Linux Side)',
      health: '/api/v1/health',
      readiness: '/api/v1/readiness',
      cameraHealth: '/api/v1/capture/camera-health',
      spoolStatus: '/api/v1/capture/spool-status'
    });
  });

  return app;
}
