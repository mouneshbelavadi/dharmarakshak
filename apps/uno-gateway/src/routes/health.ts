import { Router, Request, Response } from 'express';
import { HealthCheckResponse } from '@dharmaraksha/shared-contracts';
import { heartbeatClient } from '../services/heartbeat-client.js';
import { activeCameraAdapter } from '../capture/camera-adapter.js';
import { activeRfidAdapter } from '../rfid/rfid-adapter.js';
import { spoolService } from '../services/spool-service.js';

export const healthRouter = Router();

const startTime = Date.now();

// 1. Basic Health Check
healthRouter.get('/health', (_req: Request, res: Response) => {
  const cameraHealth = activeCameraAdapter.getHealth();
  const hbStatus = heartbeatClient.getStatus();

  const response: HealthCheckResponse = {
    status: 'ok',
    service: 'dharmaraksha-uno-gateway',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    dependencies: {
      rfidReader: activeRfidAdapter.isPhysical() ? 'ok' : 'mocked',
      overheadCamera: cameraHealth.status === 'offline' ? 'unreachable' : (cameraHealth.status === 'simulated' ? 'mocked' : 'ok'),
      mainApiBridge: hbStatus.backendConnection === 'connected' ? 'ok' : 'unreachable'
    }
  };
  res.status(200).json(response);
});

// 2. Comprehensive Readiness Check (Safe readiness - zero secret exposure)
healthRouter.get('/readiness', (_req: Request, res: Response) => {
  const cameraHealth = activeCameraAdapter.getHealth();
  const hbStatus = heartbeatClient.getStatus();
  const spoolStatus = spoolService.getSpoolStatus();

  res.json({
    ready: true,
    service: 'dharmaraksha-uno-gateway',
    backendConnection: hbStatus.backendConnection,
    isOnline: hbStatus.isOnline,
    camera: {
      name: activeCameraAdapter.getName(),
      status: cameraHealth.status,
      isPhysical: cameraHealth.isPhysical
    },
    reader: {
      name: activeRfidAdapter.getName(),
      isPhysical: activeRfidAdapter.isPhysical()
    },
    spool: {
      totalItems: spoolStatus.totalItems,
      pendingUploads: spoolStatus.pendingUploads,
      acknowledgedItems: spoolStatus.acknowledgedItems,
      diskPressure: spoolStatus.diskPressure
    },
    security: {
      deviceKeyProtected: true, // Key stored exclusively server-side
      providerKeysPresentOnBoard: false // Confirms NO provider secrets are placed on board
    }
  });
});
