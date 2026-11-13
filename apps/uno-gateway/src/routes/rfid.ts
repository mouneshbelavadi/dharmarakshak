import { Router, Request, Response } from 'express';

export const rfidRouter = Router();

let latestTap: { cardUid: string; tappedAt: string } | null = {
  cardUid: 'E280689420000000',
  tappedAt: new Date().toISOString()
};

// Polled or listened to by the kiosk phone interface
rfidRouter.get('/rfid/latest-tap', (_req: Request, res: Response) => {
  res.json({ tap: latestTap });
});

// Invoked by the UNO Q microcontroller bridge or USB RFID reader daemon
rfidRouter.post('/rfid/tap-event', (req: Request, res: Response) => {
  const { cardUid } = req.body;
  if (!cardUid) {
    return res.status(400).json({ error: 'Missing cardUid in tap event payload' });
  }

  latestTap = {
    cardUid,
    tappedAt: new Date().toISOString()
  };

  console.log(`[DHARMARAKSHA-Gateway] RFID Card tapped: ${cardUid}`);
  res.json({ success: true, tap: latestTap });
});

