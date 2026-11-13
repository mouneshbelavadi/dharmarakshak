import { Router, Request, Response } from 'express';

export const captureRouter = Router();

// Bounded temporary queue tracking captured pages before forwarding to Main API
interface TemporaryCaptureItem {
  captureId: string;
  timestamp: string;
  status: 'queued' | 'forwarded' | 'failed';
}

const temporaryCaptureQueue: TemporaryCaptureItem[] = [];

captureRouter.get('/capture/queue', (_req: Request, res: Response) => {
  res.json({
    queueLength: temporaryCaptureQueue.length,
    items: temporaryCaptureQueue.slice(-10) // Show last 10 captures
  });
});

captureRouter.post('/capture/trigger', (req: Request, res: Response) => {
  const captureId = `cap-${Date.now()}`;
  const newItem: TemporaryCaptureItem = {
    captureId,
    timestamp: new Date().toISOString(),
    status: 'queued'
  };

  // Enforce bounded queue (maximum 20 items in memory on UNO Q)
  if (temporaryCaptureQueue.length >= 20) {
    temporaryCaptureQueue.shift();
  }
  temporaryCaptureQueue.push(newItem);

  console.log(`[DHARMARAKSHA-Gateway] Capture triggered: ${captureId}`);
  res.json({
    success: true,
    captureId,
    previewUrl: `/api/v1/capture/preview/${captureId}`
  });
});

