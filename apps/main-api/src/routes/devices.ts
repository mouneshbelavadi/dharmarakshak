import { Router, Request, Response } from 'express';
import { authService, requireDeviceAuth } from '../auth/auth-service.js';

export const devicesRouter = Router();

// Heartbeat from UNO Q (requires valid scoped device key)
devicesRouter.post('/devices/heartbeat', requireDeviceAuth, (req: Request, res: Response) => {
  const deviceId = (req as any).deviceId;
  res.json({
    status: 'acknowledged',
    deviceId,
    timestamp: new Date().toISOString(),
    serverTime: Date.now()
  });
});

// Revoke Device Key (Operator/Admin action)
devicesRouter.post('/devices/:id/revoke', (req: Request, res: Response) => {
  const deviceId = req.params.id;
  const success = authService.revokeDeviceKey(deviceId);
  if (!success) {
    return res.status(404).json({ error: 'DEVICE_NOT_FOUND' });
  }
  console.log(`[DHARMARAKSHA-Auth] Scoped key for device ${deviceId} REVOKED.`);
  res.json({ success: true, deviceId, status: 'revoked' });
});

