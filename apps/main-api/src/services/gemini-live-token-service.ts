import { GeminiLiveSessionToken } from '@dharmaraksha/shared-contracts';
import crypto from 'node:crypto';

export class GeminiLiveTokenService {
  private activeTokens: Map<string, GeminiLiveSessionToken> = new Map();

  /**
   * Issue a short-lived token for optional Gemini Live session mode.
   * Specification S5 requirement: "Gemini Live is an optional alternative conversation mode,
   * not a second assistant speaking simultaneously. Keep only one active speech pipeline."
   */
  public issueLiveSessionToken(caseId: string, sessionId: string): GeminiLiveSessionToken {
    // Generate secure short-lived token
    const token = `live-tok-${crypto.randomBytes(16).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min TTL

    const sessionToken: GeminiLiveSessionToken = {
      token,
      caseId,
      sessionId,
      expiresAt,
      mode: 'gemini_live',
      endpointUrl: process.env.GEMINI_LIVE_ENDPOINT || 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent',
      allowedAudioFormats: ['audio/webm;codecs=opus', 'audio/wav', 'audio/pcm']
    };

    this.activeTokens.set(token, sessionToken);
    return sessionToken;
  }

  /**
   * Validate a live session token and check if it has expired.
   */
  public validateToken(token: string): { valid: boolean; session?: GeminiLiveSessionToken; error?: string } {
    const session = this.activeTokens.get(token);
    if (!session) {
      return { valid: false, error: 'TOKEN_NOT_FOUND' };
    }

    if (new Date(session.expiresAt) < new Date()) {
      this.activeTokens.delete(token);
      return { valid: false, error: 'TOKEN_EXPIRED' };
    }

    return { valid: true, session };
  }

  public revokeToken(token: string): boolean {
    return this.activeTokens.delete(token);
  }
}

export const geminiLiveTokenService = new GeminiLiveTokenService();

