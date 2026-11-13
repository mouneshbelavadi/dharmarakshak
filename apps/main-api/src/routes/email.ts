import { Router, Request, Response } from 'express';
import { requireCaseAccess } from '../auth/auth-service.js';
import { gmailService } from '../services/gmail-service.js';

export const emailRouter = Router();

// GET /api/v1/email/status — Check Gmail SMTP configuration status
emailRouter.get('/email/status', (_req: Request, res: Response) => {
  const config = gmailService.getConfigState();
  res.status(200).json({ success: true, config });
});

// POST /api/v1/cases/:id/email/send — Send legal report via Gmail
emailRouter.post('/cases/:id/email/send', requireCaseAccess, async (req: Request, res: Response) => {
  const caseId = req.params.id;
  const { recipientEmail, reportVersion = 1, reportFormat = 'pdf_attachment', consentConfirmed = false } = req.body;

  try {
    const job = await gmailService.sendReportEmail({
      caseId,
      recipientEmail,
      reportVersion,
      reportFormat,
      consentConfirmed
    });
    res.status(200).json({ success: true, job });
  } catch (err: any) {
    res.status(400).json({ error: 'EMAIL_SEND_FAILED', message: err.message });
  }
});

// POST /api/v1/email/test-connection — Verify SMTP connection
emailRouter.post('/email/test-connection', async (_req: Request, res: Response) => {
  try {
    const result = await gmailService.testConnection();
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'CONNECTION_TEST_FAILED', message: err.message });
  }
});
