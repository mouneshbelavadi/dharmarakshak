/**
 * PairingService — Phase 08
 *
 * Manages operator-approved, expiring one-time pairing codes and phone sessions.
 *
 * Security rules enforced here:
 *  - Each code is single-use; replay is rejected immediately.
 *  - A code is marked used before the PairedPhone record is returned.
 *  - No permanent device secrets or provider credentials appear in any code or QR payload.
 *  - A second phone may not claim an active pairing (concurrent takeover prevention).
 *  - Card return/reissue calls revokeAllPairingsForCard() to sever all browser access.
 *  - Pairing lifetime is independent of visitor session lifetime.
 */

import { createHash, randomBytes } from 'crypto';
import { OneTimePairingCode, PairedPhone } from '@dharmaraksha/shared-contracts';
import { tunnelSupervisor } from './tunnel-service.js';

// ─── In-process stores (replace with Postgres in a hosted deployment) ───────

interface StoredCode extends OneTimePairingCode {
  createdAt: string;
  rfidCardUid?: string; // bound RFID card when code was generated
}

interface StoredPairing extends PairedPhone {
  rfidCardUid?: string;      // the card UID this pairing is bound to
  rfidSessionId?: string;    // the RFID session ID
  cookieToken: string;       // the value stored in the HttpOnly cookie
}

const codeStore = new Map<string, StoredCode>();
const pairingStore = new Map<string, StoredPairing>();
// cookie token → pairingId (secondary index for fast session lookup)
const cookieIndex = new Map<string, string>();

// ─── Configuration ───────────────────────────────────────────────────────────

const CODE_LIFETIME_MINUTES = parseInt(process.env.PAIRING_CODE_LIFETIME_MINUTES || '10', 10);
const SESSION_LIFETIME_HOURS = parseInt(process.env.PHONE_SESSION_LIFETIME_HOURS || '8', 10);

// ─── Helper ──────────────────────────────────────────────────────────────────

function generateId(prefix: string): string {
  return `${prefix}-${randomBytes(8).toString('hex')}`;
}

function generateCookieToken(): string {
  return randomBytes(32).toString('hex');
}

function formatCode(raw: string): string {
  // 6 uppercase alphanumeric chars, displayed as "DK-XXXX" style
  const chars = raw.toUpperCase().slice(0, 6);
  return `DK-${chars}`;
}

function isoNow(): string {
  return new Date().toISOString();
}

// ─── PairingService ──────────────────────────────────────────────────────────

export class PairingService {
  /**
   * Operator-only: generate a new one-time pairing code and QR payload.
   * The URL contains only the ephemeral code — no device key, no provider secrets.
   */
  public generateCode(rfidCardUid?: string): OneTimePairingCode {
    const rawCode = randomBytes(3).toString('hex'); // 6 hex chars
    const code = formatCode(rawCode);
    const kioskId = tunnelSupervisor.getKioskId();
    const publicUrl = tunnelSupervisor.getPublicHttpsUrl();
    const expiresAt = new Date(Date.now() + CODE_LIFETIME_MINUTES * 60 * 1000).toISOString();

    // The QR payload is a URL the phone opens. It must NOT contain the device API key,
    // any RFID secret, or any reusable credential. The code is single-use and short-lived.
    const qrPayload = `${publicUrl}/api/v1/pair/redeem?code=${encodeURIComponent(code)}&kiosk=${encodeURIComponent(kioskId)}`;

    const stored: StoredCode = {
      code,
      kioskId,
      expiresAt,
      isUsed: false,
      qrPayload,
      createdAt: isoNow(),
      rfidCardUid
    };

    codeStore.set(code, stored);

    // Auto-cleanup old codes from memory
    this._cleanupExpiredCodes();

    return { code, kioskId, expiresAt, isUsed: false, qrPayload };
  }

  /**
   * Phone redeems a one-time code. Returns the pairing record (including cookieToken)
   * or throws a typed error.
   *
   * Concurrent takeover prevention: if an active pairing already exists for the same
   * RFID card UID, redemption is rejected.
   */
  public consumeCode(
    code: string,
    clientFingerprint?: string
  ): StoredPairing {
    const stored = codeStore.get(code);

    if (!stored) {
      throw new PairingError('CODE_NOT_FOUND', 'Pairing code not found or already cleaned up.');
    }
    if (stored.isUsed) {
      throw new PairingError('CODE_ALREADY_USED', 'This pairing code has already been used.');
    }
    if (new Date(stored.expiresAt) < new Date()) {
      codeStore.delete(code);
      throw new PairingError('CODE_EXPIRED', 'This pairing code has expired.');
    }

    // Prevent a second phone claiming an already-active session for the same card
    if (stored.rfidCardUid) {
      const existingPairing = this._findActivePairingForCard(stored.rfidCardUid);
      if (existingPairing) {
        throw new PairingError(
          'SESSION_ALREADY_BOUND',
          'Another phone is already paired for this visitor session. Return the card to start a new session.'
        );
      }
    }

    // Mark code used immediately — single-use, cannot be replayed
    stored.isUsed = true;
    codeStore.set(code, stored);

    const pairingId = generateId('pair');
    const cookieToken = generateCookieToken();
    const expiresAt = new Date(Date.now() + SESSION_LIFETIME_HOURS * 60 * 60 * 1000).toISOString();

    const pairing: StoredPairing = {
      pairingId,
      deviceId: stored.kioskId,
      pairingCode: code,
      clientFingerprint,
      pairedAt: isoNow(),
      expiresAt,
      lastSeenAt: isoNow(),
      isActive: true,
      rfidCardUid: stored.rfidCardUid,
      cookieToken
    };

    pairingStore.set(pairingId, pairing);
    cookieIndex.set(cookieToken, pairingId);

    console.log(`[PairingService] Phone paired: ${pairingId}, card=${stored.rfidCardUid || 'unbound'}`);
    return pairing;
  }

  /**
   * Bind an active pairing to an RFID session (called after tap event).
   */
  public bindTapToPhone(pairingId: string, rfidSessionId: string, rfidCardUid?: string): boolean {
    const pairing = pairingStore.get(pairingId);
    if (!pairing || !pairing.isActive) return false;

    pairing.rfidSessionId = rfidSessionId;
    if (rfidCardUid) pairing.rfidCardUid = rfidCardUid;
    pairing.lastSeenAt = isoNow();
    pairingStore.set(pairingId, pairing);
    return true;
  }

  /**
   * Validate a cookie token from the phone browser. Updates lastSeenAt.
   * Returns the pairing record or null if invalid/expired.
   */
  public validateCookieToken(cookieToken: string): StoredPairing | null {
    const pairingId = cookieIndex.get(cookieToken);
    if (!pairingId) return null;

    const pairing = pairingStore.get(pairingId);
    if (!pairing) return null;
    if (!pairing.isActive) return null;
    if (new Date(pairing.expiresAt) < new Date()) {
      this._deactivatePairing(pairing);
      return null;
    }

    pairing.lastSeenAt = isoNow();
    return pairing;
  }

  /**
   * Revoke a specific pairing by ID (operator-initiated).
   */
  public revokePairing(pairingId: string): boolean {
    const pairing = pairingStore.get(pairingId);
    if (!pairing) return false;
    this._deactivatePairing(pairing);
    console.log(`[PairingService] Pairing revoked: ${pairingId}`);
    return true;
  }

  /**
   * Revoke all active pairings for a card UID.
   * Called by RFID service on card return or reissue to sever all browser access.
   */
  public revokeAllPairingsForCard(rfidCardUid: string): number {
    let count = 0;
    for (const pairing of pairingStore.values()) {
      if (pairing.isActive && pairing.rfidCardUid === rfidCardUid) {
        this._deactivatePairing(pairing);
        count++;
      }
    }
    if (count > 0) {
      console.log(`[PairingService] Revoked ${count} pairing(s) for card ${rfidCardUid}`);
    }
    return count;
  }

  /**
   * Summary of active pairings — safe to include in connectivity status.
   * Never includes cookie tokens, card UIDs, or session details.
   */
  public getPairingStatus(): { activePairingsCount: number; isCurrentlyBound: boolean; activePairingId?: string } {
    let count = 0;
    let activePairingId: string | undefined;

    for (const pairing of pairingStore.values()) {
      if (pairing.isActive && new Date(pairing.expiresAt) >= new Date()) {
        count++;
        if (!activePairingId) activePairingId = pairing.pairingId;
      }
    }

    return {
      activePairingsCount: count,
      isCurrentlyBound: count > 0,
      activePairingId: count > 0 ? activePairingId : undefined
    };
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private _deactivatePairing(pairing: StoredPairing): void {
    pairing.isActive = false;
    cookieIndex.delete(pairing.cookieToken);
    pairingStore.set(pairing.pairingId, pairing);
  }

  private _findActivePairingForCard(rfidCardUid: string): StoredPairing | undefined {
    for (const pairing of pairingStore.values()) {
      if (
        pairing.isActive &&
        pairing.rfidCardUid === rfidCardUid &&
        new Date(pairing.expiresAt) >= new Date()
      ) {
        return pairing;
      }
    }
    return undefined;
  }

  private _cleanupExpiredCodes(): void {
    const now = new Date();
    for (const [code, stored] of codeStore.entries()) {
      if (stored.isUsed || new Date(stored.expiresAt) < now) {
        codeStore.delete(code);
      }
    }
  }
}

// ─── Typed error ─────────────────────────────────────────────────────────────

export class PairingError extends Error {
  constructor(
    public readonly code:
      | 'CODE_NOT_FOUND'
      | 'CODE_ALREADY_USED'
      | 'CODE_EXPIRED'
      | 'SESSION_ALREADY_BOUND',
    message: string
  ) {
    super(message);
    this.name = 'PairingError';
  }
}

// ─── Singleton ───────────────────────────────────────────────────────────────

export const pairingService = new PairingService();

