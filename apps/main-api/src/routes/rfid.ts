import { Router, Request, Response } from 'express';
import { rfidSessionService } from '../services/rfid-session-service.js';

export const rfidRouter = Router();

// 1. Process Normalized RFID Tap Event (called by UNO Q gateway or simulator)
rfidRouter.post('/rfid/tap-event', (req: Request, res: Response) => {
  const { cardUid, readerSource = 'simulated', isSimulated = true } = req.body;

  if (!cardUid) {
    return res.status(400).json({ error: 'MISSING_CARD_UID', message: 'Field cardUid is required.' });
  }

  const result = rfidSessionService.handleTapEvent({
    cardUid,
    readerSource,
    isSimulated
  });

  return res.status(result.statusCode).json(result);
});

// 2. Enroll a New Card into Inventory (Operator desk action)
rfidRouter.post('/cards/enroll', (req: Request, res: Response) => {
  const { cardUid, technology = 'nfc_mifare', notes } = req.body;

  if (!cardUid) {
    return res.status(400).json({ error: 'MISSING_CARD_UID', message: 'Field cardUid is required.' });
  }

  try {
    const card = rfidSessionService.enrollCard(cardUid, technology, notes);
    return res.status(201).json({ success: true, card });
  } catch (err: any) {
    return res.status(400).json({ error: 'ENROLL_FAILED', message: err.message });
  }
});

// 3. Issue Card to Visitor (Operator desk action)
rfidRouter.post('/cards/issue', (req: Request, res: Response) => {
  const { cardUid, operatorId = 'operator-desk-1', expiryMinutes = 120 } = req.body;

  if (!cardUid) {
    return res.status(400).json({ error: 'MISSING_CARD_UID', message: 'Field cardUid is required.' });
  }

  try {
    const issuance = rfidSessionService.issueCard(cardUid, operatorId, expiryMinutes);
    return res.status(200).json({ success: true, ...issuance });
  } catch (err: any) {
    const isNotFound = err.message.startsWith('UNKNOWN_CARD');
    const statusCode = isNotFound ? 404 : 400;
    return res.status(statusCode).json({ error: 'ISSUE_FAILED', message: err.message });
  }
});

// 4. Return Card (Ends session and purges phone tokens)
rfidRouter.post('/cards/:cardUid/return', (req: Request, res: Response) => {
  const { cardUid } = req.params;
  const { operatorId = 'operator-desk-1' } = req.body;

  try {
    const result = rfidSessionService.returnCard(cardUid, operatorId);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: 'RETURN_FAILED', message: err.message });
  }
});

// 5. Revoke Lost/Damaged Card
rfidRouter.post('/cards/:cardUid/revoke', (req: Request, res: Response) => {
  const { cardUid } = req.params;
  const { reason = 'Reported lost/stolen' } = req.body;

  try {
    const result = rfidSessionService.revokeCard(cardUid, reason);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: 'REVOKE_FAILED', message: err.message });
  }
});

// 6. List Card Inventory (Operator oversight)
rfidRouter.get('/cards', (_req: Request, res: Response) => {
  const inventory = rfidSessionService.getInventory();
  const assignments = rfidSessionService.getAssignments();
  res.json({ cards: inventory, assignments });
});

// 7. Get Card Details
rfidRouter.get('/cards/:cardUid', (req: Request, res: Response) => {
  const card = rfidSessionService.getCard(req.params.cardUid);
  if (!card) {
    return res.status(404).json({ error: 'CARD_NOT_FOUND', message: 'Card not found in inventory.' });
  }
  res.json({ card });
});
