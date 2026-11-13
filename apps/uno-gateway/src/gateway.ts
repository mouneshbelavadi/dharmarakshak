/**
 * UNO Q Gateway — Phase 08
 *
 * Changes from Phase 07:
 *  - Strict CORS: only tunnel public HTTPS URL and configured LAN origin allowed.
 *  - Trust proxy enabled for ngrok forwarded headers.
 *  - Cookie parser added.
 *  - Pairing routes mounted.
 *  - Security middleware (CSRF/origin check, requirePairedPhone) applied to protected routes.
 *  - Heartbeat started on gateway creation.
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { healthRouter } from './routes/health.js';
import { rfidRouter } from './routes/rfid.js';
import { captureRouter } from './routes/capture.js';
import { audioRouter } from './routes/audio.js';
import { pairingRouter } from './routes/pairing.js';
import { csrfOriginCheck, requirePairedPhone } from './middleware/security-middleware.js';
import { tunnelSupervisor } from './services/tunnel-service.js';
import { heartbeatClient } from './services/heartbeat-client.js';

export function createGateway() {
  const app = express();

  // Trust the first proxy (ngrok, or LAN reverse proxy).
  // Required so req.secure reflects the original HTTPS connection.
  app.set('trust proxy', 1);

  // ─── CORS: strict allowlist ─────────────────────────────────────────────────
  // Computed dynamically so endpoint changes after restart are picked up.
  const getCorsOrigins = (): string[] => {
    const origins: string[] = [];

    const tunnelOrigin = tunnelSupervisor.getStatus().expectedOrigin;
    if (tunnelOrigin) origins.push(tunnelOrigin);

    const lanIp = process.env.ALLOWED_LAPTOP_LAN_IP;
    const lanPort = process.env.GATEWAY_PORT || '5000';
    if (lanIp) {
      origins.push(`https://${lanIp}:${lanPort}`);
      origins.push(`https://${lanIp}`);
    }

    const extra = process.env.EXTRA_ALLOWED_ORIGINS;
    if (extra) {
      origins.push(...extra.split(',').map(o => o.trim()).filter(Boolean));
    }

    return [...new Set(origins)];
  };

  app.use(cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no Origin header)
      if (!origin) return callback(null, true);
      const allowed = getCorsOrigins();
      if (allowed.includes(origin)) {
        callback(null, true);
      } else {
        // Return a structured error so the error handler can respond with JSON
        const err = new Error('CORS_ORIGIN_REJECTED') as any;
        err.status = 403;
        err.corsRejected = true;
        callback(err);
      }
    },
    credentials: true  // Required for cookie exchange
  }));

  app.use(cookieParser());
  app.use(express.json({ limit: '25mb' })); // Support full-resolution page stills

  // ─── Public routes (no pairing required) ───────────────────────────────────
  // Health, readiness, pairing status, connectivity, and pair redeem are publicly accessible
  // so the phone can reach them before it has a session cookie.
  app.use('/api/v1', healthRouter);
  app.use('/api/v1', pairingRouter);  // includes /pair/status, /connectivity, /pair/redeem

  // ─── Origin check for all further API calls ─────────────────────────────────
  app.use('/api/v1', csrfOriginCheck);

  // ─── Protected routes (pairing session required) ───────────────────────────
  // Routes self-declare their own sub-paths (/rfid/..., /capture/...) under /api/v1
  app.use('/api/v1', requirePairedPhone, rfidRouter);
  app.use('/api/v1', requirePairedPhone, captureRouter);
  app.use('/api/v1', requirePairedPhone, audioRouter);

  // ─── Serve static phone UI assets ──────────────────────────────────────────
  const phoneWebDist = path.resolve(process.env.PHONE_WEB_DIST || '../phone-web/dist');
  if (fs.existsSync(phoneWebDist)) {
    app.use('/kiosk', express.static(phoneWebDist));
  }

  // ─── Root gateway status endpoint (safe: zero secrets) ─────────────────────
  app.get('/', (_req, res) => {
    res.json({
      name: 'DHARMARAKSHA UNO Q Gateway',
      status: 'operational',
      board: 'Arduino UNO Q (Linux Side)',
      health: '/api/v1/health',
      readiness: '/api/v1/readiness',
      connectivity: '/api/v1/connectivity',
      pairStatus: '/api/v1/pair/status',
      cameraHealth: '/api/v1/capture/camera-health',
      spoolStatus: '/api/v1/capture/spool-status'
    });
  });

  // ─── Start heartbeat to main API ───────────────────────────────────────────
  heartbeatClient.start(15_000);

  // ─── Global error handler ──────────────────────────────────────────────────
  // Converts unhandled middleware errors (e.g. CORS rejected) into JSON responses.
  app.use((err: any, _req: any, res: any, _next: any) => {
    if (err?.corsRejected || (err?.message && err.message.startsWith('CORS'))) {
      res.status(403).json({ error: 'ORIGIN_MISMATCH', message: 'Request origin is not permitted.' });
      return;
    }
    console.error('[Gateway] Unhandled error:', err?.message || err);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Internal gateway error.' });
  });

  return app;
}
