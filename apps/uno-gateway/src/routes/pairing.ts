/**
 * Pairing routes — Phase 08
 *
 * GET  /api/v1/pair/status       — Safe: gateway pairing status and tunnel connectivity.
 * POST /api/v1/pair/generate     — Operator-only: generate a one-time code + QR payload.
 * POST /api/v1/pair/redeem       — Phone: consume a one-time code; sets HttpOnly session cookie.
 * POST /api/v1/pair/revoke       — Operator-only: revoke a specific pairing by ID.
 * GET  /api/v1/connectivity      — Separated tunnel + main-API health (gate requirement).
 *
 * Security:
 *  - No device key, NGROK_AUTHTOKEN, or provider credential appears in any response.
 *  - Pairing code is stripped from the URL after redemption (redirect on browser, JSON on API).
 *  - Redeem route immediately marks code as used before returning.
 *  - Cookie is HttpOnly, Secure, SameSite=Strict, path-scoped.
 */

import { Router, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { pairingService, PairingError } from '../services/pairing-service.js';
import { tunnelSupervisor } from '../services/tunnel-service.js';
import { requireOperatorKey, PAIRING_COOKIE_NAME } from '../middleware/security-middleware.js';

export const pairingRouter = Router();

// cookie-parser must be applied at gateway level; this is a safety re-use:
pairingRouter.use(cookieParser());

// ─── GET /api/v1/pair/status ─────────────────────────────────────────────────

/**
 * Returns safe pairing and tunnel status.
 * Never includes device key, RFID details, or cookie tokens.
 */
pairingRouter.get('/pair/status', (_req: Request, res: Response) => {
  const pairingStatus = pairingService.getPairingStatus();
  const tunnel = tunnelSupervisor.getStatus();

  res.json({
    kioskId: tunnelSupervisor.getKioskId(),
    tunnelMode: tunnel.mode,
    tunnelStatus: tunnel.status,
    publicHttpsUrl: tunnel.publicHttpsUrl,
    activePairingsCount: pairingStatus.activePairingsCount,
    isCurrentlyBound: pairingStatus.isCurrentlyBound,
    pairingCodeLifetimeMinutes: parseInt(process.env.PAIRING_CODE_LIFETIME_MINUTES || '10', 10),
    phoneSessionLifetimeHours: parseInt(process.env.PHONE_SESSION_LIFETIME_HOURS || '8', 10)
  });
});

// ─── GET /api/v1/connectivity ─────────────────────────────────────────────────

/**
 * Critical gate endpoint: separates tunnel and main-API failure reporting.
 * The UI must display tunnel and main-API failures independently.
 */
pairingRouter.get('/connectivity', (_req: Request, res: Response) => {
  const pairingStatus = pairingService.getPairingStatus();
  const connectivity = tunnelSupervisor.getConnectivityStatus(pairingStatus);

  // Strip any fields that might carry secrets
  const safe = {
    kioskId: connectivity.kioskId,
    tunnel: {
      mode: connectivity.tunnel.mode,
      status: connectivity.tunnel.status,
      publicHttpsUrl: connectivity.tunnel.publicHttpsUrl,
      lastCheckedAt: connectivity.tunnel.lastCheckedAt,
      errorMessage: connectivity.tunnel.errorMessage
    },
    mainApi: {
      status: connectivity.mainApi.status,
      url: connectivity.mainApi.url,
      lastHeartbeatAt: connectivity.mainApi.lastHeartbeatAt,
      errorMessage: connectivity.mainApi.errorMessage
    },
    pairing: {
      activePairingsCount: connectivity.pairing.activePairingsCount,
      isCurrentlyBound: connectivity.pairing.isCurrentlyBound
    },
    overallReady: connectivity.overallReady
  };

  res.json(safe);
});

// ─── POST /api/v1/pair/generate ──────────────────────────────────────────────

/**
 * Operator-only: generate one-time pairing code and QR payload.
 * Requires DHARMARAKSHA-Device-Key header.
 * Returns: { code, qrPayload, expiresAt }  — no permanent secrets.
 */
pairingRouter.post('/pair/generate', requireOperatorKey, (req: Request, res: Response) => {
  const rfidCardUid = req.body?.rfidCardUid as string | undefined;
  const otp = pairingService.generateCode(rfidCardUid);

  res.status(201).json({
    code: otp.code,
    kioskId: otp.kioskId,
    expiresAt: otp.expiresAt,
    isUsed: false,
    qrPayload: otp.qrPayload
    // NOTE: Never add DHARMARAKSHA_DEVICE_API_KEY or NGROK_AUTHTOKEN to this response.
  });
});

// ─── POST /api/v1/pair/redeem ────────────────────────────────────────────────

/**
 * Phone redeems the one-time pairing code.
 * - Code is marked used immediately (single-use, no replay).
 * - HttpOnly Secure SameSite=Strict cookie is set.
 * - Response never includes the cookie token value directly.
 * - Browser clients should be redirected to remove the code from the URL bar.
 */
pairingRouter.post('/pair/redeem', (req: Request, res: Response) => {
  const code = req.body?.code as string | undefined;
  const clientFingerprint = req.body?.clientFingerprint as string | undefined;

  if (!code) {
    res.status(400).json({ error: 'MISSING_CODE', message: 'Pairing code is required.' });
    return;
  }

  try {
    const pairing = pairingService.consumeCode(code, clientFingerprint);

    // Set HttpOnly, Secure, SameSite=Strict session cookie
    const isHttps = req.secure || req.get('X-Forwarded-Proto') === 'https';
    res.cookie(PAIRING_COOKIE_NAME, pairing.cookieToken, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'strict',
      path: '/',
      expires: new Date(pairing.expiresAt)
    });

    res.status(200).json({
      pairingId: pairing.pairingId,
      kioskId: pairing.deviceId,
      pairedAt: pairing.pairedAt,
      expiresAt: pairing.expiresAt,
      // Instruct browser to strip code from URL immediately
      redirectTo: '/kiosk/'
      // NOTE: cookieToken is NOT included here — it is only in the HttpOnly cookie.
    });
  } catch (err) {
    if (err instanceof PairingError) {
      const statusMap: Record<string, number> = {
        CODE_NOT_FOUND: 404,
        CODE_ALREADY_USED: 403,
        CODE_EXPIRED: 403,
        SESSION_ALREADY_BOUND: 409
      };
      res.status(statusMap[err.code] || 400).json({
        error: err.code,
        message: err.message
      });
      return;
    }
    console.error('[pairingRouter] /pair/redeem unexpected error:', err);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to redeem pairing code.' });
  }
});

// ─── POST /api/v1/pair/revoke ────────────────────────────────────────────────

/**
 * Operator-only: revoke a specific pairing by ID.
 * Also used by RFID card return/reissue flow to sever all browser access for a card.
 */
pairingRouter.post('/pair/revoke', requireOperatorKey, (req: Request, res: Response) => {
  const { pairingId, rfidCardUid } = req.body || {};

  if (rfidCardUid) {
    const count = pairingService.revokeAllPairingsForCard(rfidCardUid);
    res.json({ revoked: count, rfidCardUid });
    return;
  }

  if (pairingId) {
    const ok = pairingService.revokePairing(pairingId);
    if (!ok) {
      res.status(404).json({ error: 'PAIRING_NOT_FOUND', message: 'Pairing ID not found or already revoked.' });
      return;
    }
    res.json({ revoked: 1, pairingId });
    return;
  }

  res.status(400).json({ error: 'MISSING_PARAMS', message: 'Provide pairingId or rfidCardUid.' });
});

