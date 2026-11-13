/**
 * Security middleware — Phase 08
 *
 * requirePairedPhone  — validates the dharmaraksha-pairing-id cookie against pairingService.
 * csrfOriginCheck     — validates the Origin header matches the configured public HTTPS URL or LAN origin.
 * requireOperatorKey  — validates the DHARMARAKSHA-Device-Key header (operator-only endpoints).
 *
 * None of these middleware read or emit provider credentials or device keys to the caller.
 */

import { Request, Response, NextFunction } from 'express';
import { pairingService } from '../services/pairing-service.js';
import { tunnelSupervisor } from '../services/tunnel-service.js';

// ─── Cookie name ──────────────────────────────────────────────────────────────

export const PAIRING_COOKIE_NAME = 'dhr_pair';

// ─── requirePairedPhone ───────────────────────────────────────────────────────

/**
 * Requires the request to carry a valid pairing cookie.
 * On failure returns 401 UNPAIRED_BROWSER — no details that aid enumeration.
 */
export function requirePairedPhone(req: Request, res: Response, next: NextFunction): void {
  const cookieToken = req.cookies?.[PAIRING_COOKIE_NAME];

  if (!cookieToken) {
    res.status(401).json({ error: 'UNPAIRED_BROWSER', message: 'No pairing session found. Please pair with the kiosk first.' });
    return;
  }

  const pairing = pairingService.validateCookieToken(cookieToken);
  if (!pairing) {
    // Clear stale cookie
    res.clearCookie(PAIRING_COOKIE_NAME, { path: '/' });
    res.status(401).json({ error: 'UNPAIRED_BROWSER', message: 'Pairing session expired or revoked. Please tap your card and pair again.' });
    return;
  }

  // Attach pairing info for downstream handlers
  (req as any).pairingId = pairing.pairingId;
  (req as any).pairingRfidCardUid = pairing.rfidCardUid;
  (req as any).pairingRfidSessionId = pairing.rfidSessionId;

  next();
}

// ─── csrfOriginCheck ─────────────────────────────────────────────────────────

/**
 * Validates the Origin header matches the tunnel's public HTTPS URL
 * or the configured LAN HTTPS origin.
 *
 * Rejects cross-origin requests from unknown origins with 403 ORIGIN_MISMATCH.
 * GET /api/v1/pair/status and /api/v1/health are intentionally exempt.
 */
export function csrfOriginCheck(req: Request, res: Response, next: NextFunction): void {
  const origin = req.get('Origin');

  // Browsers always send Origin on cross-origin XHR/fetch and on same-origin form POSTs.
  // If absent (e.g. server-to-server call from UNO Q itself), pass through.
  if (!origin) {
    next();
    return;
  }

  const allowedOrigins = getAllowedOrigins();

  if (!allowedOrigins.includes(origin)) {
    res.status(403).json({
      error: 'ORIGIN_MISMATCH',
      message: 'Request origin is not permitted for this endpoint.',
      allowedOrigins: allowedOrigins.map(o => o.replace(/\/\/.*@/, '//<redacted>@')) // sanitise any user-info
    });
    return;
  }

  next();
}

// ─── requireOperatorKey ───────────────────────────────────────────────────────

/**
 * Validates the DHARMARAKSHA-Device-Key header.
 * Used for operator-only endpoints such as pairing code generation and pairing revocation.
 *
 * The key itself is NEVER echoed back in any response body.
 */
export function requireOperatorKey(req: Request, res: Response, next: NextFunction): void {
  const provided = req.get('DHARMARAKSHA-Device-Key') || req.get('x-dharmaraksha-device-key');
  const expected = process.env.DHARMARAKSHA_DEVICE_API_KEY;

  if (!expected) {
    // Misconfigured board — refuse operator actions until fixed
    res.status(503).json({ error: 'DEVICE_KEY_NOT_CONFIGURED', message: 'Gateway device key not configured.' });
    return;
  }

  if (!provided || provided !== expected) {
    res.status(401).json({ error: 'INVALID_OPERATOR_KEY', message: 'Invalid or missing operator device key.' });
    return;
  }

  next();
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function getAllowedOrigins(): string[] {
  const origins: string[] = [];

  // Primary: ngrok public HTTPS URL (or mock URL in test mode)
  const tunnelOrigin = tunnelSupervisor.getStatus().expectedOrigin;
  if (tunnelOrigin) origins.push(tunnelOrigin);

  // LAN HTTPS alternative
  const lanIp = process.env.ALLOWED_LAPTOP_LAN_IP;
  const lanPort = process.env.GATEWAY_PORT || '5000';
  if (lanIp) {
    origins.push(`https://${lanIp}:${lanPort}`);
    origins.push(`https://${lanIp}`);
  }

  // Explicit override list (comma-separated) for integration tests
  const extra = process.env.EXTRA_ALLOWED_ORIGINS;
  if (extra) {
    origins.push(...extra.split(',').map(o => o.trim()).filter(Boolean));
  }

  return [...new Set(origins)]; // deduplicate
}

export { getAllowedOrigins };
