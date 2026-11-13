import { Router, Request, Response } from 'express';
import { captureManager } from '../services/capture-manager.js';
import { spoolService } from '../services/spool-service.js';
import { activeCameraAdapter } from '../capture/camera-adapter.js';

export const captureRouter = Router();

// 1. Camera Hardware Health
captureRouter.get('/capture/camera-health', (_req: Request, res: Response) => {
  res.json({
    camera: activeCameraAdapter.getHealth(),
    adapterName: activeCameraAdapter.getName()
  });
});

// 2. Bounded Viewfinder Preview Frame (rate-limited, mobile-friendly JPEG)
captureRouter.get('/capture/preview', async (req: Request, res: Response) => {
  try {
    const frame = await captureManager.getPreviewFrame();
    if (req.query.format === 'json') {
      return res.json({
        mimeType: frame.mimeType,
        width: frame.width,
        height: frame.height,
        imageBase64: frame.buffer.toString('base64')
      });
    }

    res.set({
      'Content-Type': 'image/jpeg',
      'Content-Length': frame.buffer.length.toString(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Preview-Resolution': `${frame.width}x${frame.height}`
    });
    res.end(frame.buffer);
  } catch (err: any) {
    res.status(500).json({ error: 'PREVIEW_FAILED', message: err.message });
  }
});

// 3. Trigger Board-Connected UVC Document Camera Capture
captureRouter.post('/capture/page', async (req: Request, res: Response) => {
  const { caseId, documentId, pageNumber, rotation = 0 } = req.body;

  if (!caseId || !documentId || typeof pageNumber !== 'number') {
    return res.status(400).json({
      error: 'MISSING_PARAMETERS',
      message: 'caseId, documentId, and pageNumber are required.'
    });
  }

  try {
    const result = await captureManager.capturePage(caseId, documentId, pageNumber, rotation);
    const statusCode = result.acknowledged ? 201 : 202; // 201 Created or 202 Accepted (spooled for retry)
    res.status(statusCode).json(result);
  } catch (err: any) {
    if (err.message.startsWith('SPOOL_DISK_PRESSURE')) {
      return res.status(507).json({ error: 'SPOOL_DISK_PRESSURE', message: err.message });
    }
    res.status(500).json({ error: 'CAPTURE_FAILED', message: err.message });
  }
});

// 4. Explicit Phone-Camera Fallback (opening URL never accesses board USB camera)
captureRouter.post('/capture/phone-fallback', async (req: Request, res: Response) => {
  const { caseId, documentId, pageNumber, pageImageBase64, rotation = 0 } = req.body;

  if (!caseId || !documentId || typeof pageNumber !== 'number' || !pageImageBase64) {
    return res.status(400).json({
      error: 'MISSING_PARAMETERS',
      message: 'caseId, documentId, pageNumber, and pageImageBase64 are required.'
    });
  }

  try {
    const buffer = Buffer.from(pageImageBase64, 'base64');
    const result = await captureManager.ingestPhoneCameraFallback(
      caseId,
      documentId,
      pageNumber,
      buffer,
      rotation
    );
    const statusCode = result.acknowledged ? 201 : 202;
    res.status(statusCode).json({
      ...result,
      source: 'phone_camera_fallback'
    });
  } catch (err: any) {
    if (err.message.startsWith('SPOOL_DISK_PRESSURE')) {
      return res.status(507).json({ error: 'SPOOL_DISK_PRESSURE', message: err.message });
    }
    res.status(500).json({ error: 'FALLBACK_CAPTURE_FAILED', message: err.message });
  }
});

// 5. Bounded Spool Status & Disk Pressure
captureRouter.get('/capture/spool-status', (_req: Request, res: Response) => {
  res.json({ spool: spoolService.getSpoolStatus() });
});

// 6. Manual or Automated Retry of Pending Spool Uploads
captureRouter.post('/capture/retry', async (_req: Request, res: Response) => {
  try {
    const outcome = await captureManager.retryPendingUploads();
    res.json({ success: true, ...outcome });
  } catch (err: any) {
    res.status(500).json({ error: 'RETRY_FAILED', message: err.message });
  }
});

// 7. Cleanup Acknowledged Captures from Local Spool
captureRouter.post('/capture/cleanup', (_req: Request, res: Response) => {
  const evicted = spoolService.cleanupAcknowledged();
  res.json({ success: true, evictedFiles: evicted });
});
