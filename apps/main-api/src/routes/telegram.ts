import { Router, Request, Response } from 'express';
import { requireCaseAccess } from '../auth/auth-service.js';
import { telegramService } from '../services/telegram-service.js';
import { TelegramUpdate } from '@dharmaraksha/shared-contracts';

export const telegramRouter = Router();

// POST /api/v1/telegram/link/generate — Generate 6-digit short-lived link code
telegramRouter.post('/cases/:id/telegram/link', requireCaseAccess, (req: Request, res: Response) => {
  const caseId = req.params.id;
  const sessionId = (req as any).userSession?.sessionId || 'sess-anonymous';
  const language = req.body.language || 'en';

  try {
    const { code, expiresAt } = telegramService.generateVerificationCode(caseId, sessionId, language);
    res.status(200).json({
      success: true,
      caseId,
      verificationCode: code,
      expiresAt,
      instruction: `Open Telegram, search for our bot and type: /link ${code}`
    });
  } catch (err: any) {
    res.status(500).json({ error: 'CODE_GEN_FAILED', message: err.message });
  }
});

// GET /api/v1/telegram/binding/:caseId — Check binding status
telegramRouter.get('/cases/:id/telegram/binding', requireCaseAccess, (req: Request, res: Response) => {
  const caseId = req.params.id;
  const binding = telegramService.getBinding(caseId);

  res.status(200).json({
    success: true,
    caseId,
    isLinked: Boolean(binding && binding.status === 'active'),
    binding: binding ? {
      chatId: binding.chatId,
      status: binding.status,
      languagePreference: binding.languagePreference,
      verifiedAt: binding.verifiedAt
    } : null
  });
});

// POST /api/v1/telegram/webhook — Secure webhook receiver with secret validation
telegramRouter.post('/telegram/webhook', async (req: Request, res: Response) => {
  const secretHeader = req.header('X-Telegram-Bot-Api-Secret-Token');
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (expectedSecret && secretHeader !== expectedSecret) {
    return res.status(403).json({ error: 'INVALID_WEBHOOK_SECRET', message: 'Webhook signature rejected.' });
  }

  const update = req.body as TelegramUpdate;
  if (!update || !update.updateId) {
    return res.status(400).json({ error: 'INVALID_UPDATE', message: 'Update payload missing updateId.' });
  }

  try {
    const result = await telegramService.processUpdate(update);
    res.status(200).json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: 'UPDATE_PROCESSING_FAILED', message: err.message });
  }
});

// POST /api/v1/telegram/deliver-report — Explicitly request report delivery to linked Telegram
telegramRouter.post('/cases/:id/telegram/deliver', requireCaseAccess, async (req: Request, res: Response) => {
  const caseId = req.params.id;
  const { reportType = 'summary' } = req.body;

  try {
    const job = await telegramService.deliverReport(caseId, reportType);
    res.status(200).json({ success: true, job });
  } catch (err: any) {
    res.status(500).json({ error: 'DELIVERY_FAILED', message: err.message });
  }
});

