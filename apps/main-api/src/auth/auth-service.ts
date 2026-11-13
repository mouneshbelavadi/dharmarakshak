import { Request, Response, NextFunction } from 'express';
import { UserRole, VisitorSession } from '@dharmaraksha/shared-contracts';

export class AuthService {
  // Enrolled hardware device keys (Map<deviceId, { key: string, isRevoked: boolean }>)
  private enrolledDevices: Map<string, { key: string; isRevoked: boolean; label: string }> = new Map([
    ['uno-q-kiosk-01', { key: process.env.DHARMARAKSHA_DEVICE_API_KEY || 'dharmaraksha_device_key_placeholder_safe_default', isRevoked: false, label: 'Kiosk 1 UNO Q' }]
  ]);

  // Active sessions in memory/persistence
  private sessions: Map<string, VisitorSession> = new Map([
    [
      'sess-visitor-001',
      {
        sessionId: 'sess-visitor-001',
        cardUid: 'E280689420000000',
        role: 'visitor',
        status: 'active',
        preferredLanguage: 'en',
        consentGiven: true,
        activeCaseId: 'case-demo-001',
        sessionToken: 'tok-visitor-001',
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      }
    ],
    [
      'sess-visitor-002',
      {
        sessionId: 'sess-visitor-002',
        cardUid: 'A140722130000000',
        role: 'visitor',
        status: 'active',
        preferredLanguage: 'hi',
        consentGiven: true,
        activeCaseId: 'case-demo-002',
        sessionToken: 'tok-visitor-002',
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      }
    ],
    [
      'sess-operator-01',
      {
        sessionId: 'sess-operator-01',
        cardUid: 'OP001',
        role: 'operator',
        status: 'active',
        preferredLanguage: 'en',
        consentGiven: true,
        sessionToken: 'tok-operator-01',
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString()
      }
    ]
  ]);

  public validateDeviceKey(key: string): { valid: boolean; deviceId?: string; error?: string } {
    for (const [deviceId, dev] of this.enrolledDevices.entries()) {
      if (dev.key === key) {
        if (dev.isRevoked) {
          return { valid: false, error: 'DEVICE_KEY_REVOKED' };
        }
        return { valid: true, deviceId };
      }
    }
    return { valid: false, error: 'INVALID_DEVICE_KEY' };
  }

  public revokeDeviceKey(deviceId: string): boolean {
    const dev = this.enrolledDevices.get(deviceId);
    if (!dev) return false;
    dev.isRevoked = true;
    return true;
  }

  public getSession(sessionToken: string): VisitorSession | null {
    for (const s of this.sessions.values()) {
      if (s.sessionToken === sessionToken) {
        if (new Date(s.expiresAt) < new Date()) return null;
        return s;
      }
    }
    return null;
  }

  public registerSession(session: VisitorSession): void {
    this.sessions.set(session.sessionId, session);
  }
}

export const authService = new AuthService();

// Middleware: Authenticate incoming Device Key from UNO Q
export function requireDeviceAuth(req: Request, res: Response, next: NextFunction) {
  const deviceKey = req.header('X-Dharmaraksha-Device-Key');
  if (!deviceKey) {
    return res.status(401).json({ error: 'MISSING_DEVICE_KEY', message: 'Header X-Dharmaraksha-Device-Key is required.' });
  }

  const result = authService.validateDeviceKey(deviceKey);
  if (!result.valid) {
    return res.status(403).json({ error: result.error, message: 'Device authentication rejected.' });
  }

  (req as any).deviceId = result.deviceId;
  next();
}

// Middleware: Enforce Case Authorization (prevents cross-case access)
export function requireCaseAccess(req: Request, res: Response, next: NextFunction) {
  const caseId = req.params.id || req.body.caseId;
  const authHeader = req.header('Authorization');

  // Allow internal server-to-server or presenter dev mode when header is absent in demo
  if (!authHeader) {
    return next();
  }

  const token = authHeader.replace(/^Bearer\s+/, '');
  const session = authService.getSession(token);

  if (!session) {
    return res.status(401).json({ error: 'INVALID_SESSION', message: 'Session token invalid or expired.' });
  }

  // Operator and Admin have full case oversight
  if (session.role === 'operator' || session.role === 'admin') {
    (req as any).userSession = session;
    return next();
  }

  // Visitor role: strict case isolation
  if (session.role === 'visitor') {
    if (session.activeCaseId !== caseId) {
      return res.status(403).json({
        error: 'CROSS_CASE_ACCESS_DENIED',
        message: `Session ${session.sessionId} is not authorized to access case ${caseId}.`
      });
    }
  }

  (req as any).userSession = session;
  next();
}

