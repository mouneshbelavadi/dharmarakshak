import { Router, Request, Response } from 'express';
import { requireCaseAccess } from '../auth/auth-service.js';
import { driveService } from '../services/drive-service.js';

export const driveRouter = Router();

// GET /api/v1/drive/auth-url — Generate Google OAuth consent URL
driveRouter.get('/drive/auth-url', (_req: Request, res: Response) => {
  const result = driveService.generateAuthUrl();
  res.status(200).json({ success: true, ...result });
});

// POST /api/v1/drive/callback — Exchange authorization code
driveRouter.post('/drive/callback', async (req: Request, res: Response) => {
  const { code, state } = req.body;
  try {
    const authState = await driveService.handleCallback(code, state);
    res.status(200).json({ success: true, authState });
  } catch (err: any) {
    res.status(400).json({ error: 'OAUTH_CALLBACK_FAILED', message: err.message });
  }
});

// GET /api/v1/drive/status — Check Google Drive connection state
driveRouter.get('/drive/status', (_req: Request, res: Response) => {
  const authState = driveService.getAuthState();
  res.status(200).json({ success: true, authState });
});

// POST /api/v1/drive/disconnect — Disconnect Google Drive
driveRouter.post('/drive/disconnect', (_req: Request, res: Response) => {
  driveService.disconnect();
  res.status(200).json({ success: true, message: 'Google Drive disconnected.' });
});

// GET /api/v1/drive/files — List selectable Drive files for intake
driveRouter.get('/drive/files', async (_req: Request, res: Response) => {
  try {
    const files = await driveService.listFiles();
    res.status(200).json({ success: true, files });
  } catch (err: any) {
    res.status(403).json({ error: 'LIST_FILES_FAILED', message: err.message });
  }
});

// POST /api/v1/cases/:id/drive/import — Import file into case
driveRouter.post('/cases/:id/drive/import', requireCaseAccess, async (req: Request, res: Response) => {
  const caseId = req.params.id;
  const { fileId, fileName, mimeType, fileSize } = req.body;

  try {
    const result = await driveService.importFile({
      caseId,
      fileId,
      fileName,
      mimeType,
      fileSize
    });
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'DRIVE_IMPORT_FAILED', message: err.message });
  }
});

// POST /api/v1/cases/:id/drive/export — Export report privately to Drive
driveRouter.post('/cases/:id/drive/export', requireCaseAccess, async (req: Request, res: Response) => {
  const caseId = req.params.id;
  const { reportType = 'pdf' } = req.body;

  try {
    const job = await driveService.exportReport(caseId, reportType);
    res.status(200).json({ success: true, job });
  } catch (err: any) {
    res.status(500).json({ error: 'DRIVE_EXPORT_FAILED', message: err.message });
  }
});
