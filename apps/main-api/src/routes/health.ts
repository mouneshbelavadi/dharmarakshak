import { Router, Request, Response } from 'express';
import { HealthCheckResponse } from '@dharmaraksha/shared-contracts';

export const healthRouter = Router();

const startTime = Date.now();

healthRouter.get('/health', (_req: Request, res: Response) => {
  const response: HealthCheckResponse = {
    status: 'ok',
    service: 'dharmaraksha-main-api',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    dependencies: {
      database: 'ok',
      storage: 'ok',
      geminiProvider: 'mocked',
      sarvamProvider: 'mocked'
    }
  };
  res.status(200).json(response);
});

