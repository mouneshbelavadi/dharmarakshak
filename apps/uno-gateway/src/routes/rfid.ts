import { Router, Request, Response } from 'express';
import { activeRfidAdapter, RfidTapPayload } from '../rfid/rfid-adapter.js';

export const rfidRouter = Router();

const MAIN_API_URL = process.env.MAIN_API_URL || 'http://localhost:4000';
const DEVICE_KEY = process.env.DHARMARAKSHA_DEVICE_API_KEY || 'dharmaraksha_device_key_placeholder_safe_default';

// 1. Reader Hardware Status (accurately distinguishes physical verification from simulation)
rfidRouter.get('/rfid/reader-status', (_req: Request, res: Response) => {
  res.json({
    adapterName: activeRfidAdapter.getName(),
    isPhysical: activeRfidAdapter.isPhysical(),
    isSimulated: !activeRfidAdapter.isPhysical(),
    hardwareValidated: activeRfidAdapter.isPhysical(),
    devicePath: process.env.RFID_DEVICE_PATH || '/dev/ttyACM0'
  });
});

// 2. Polled or read by the kiosk phone interface
rfidRouter.get('/rfid/latest-tap', async (_req: Request, res: Response) => {
  const tap = await activeRfidAdapter.readLatestTap();
  res.json({
    tap,
    reader: {
      name: activeRfidAdapter.getName(),
      isPhysical: activeRfidAdapter.isPhysical()
    }
  });
});

// 3. Simulated tap action (explicitly allowed only on Simulated adapter)
rfidRouter.post('/rfid/simulate-tap', async (req: Request, res: Response) => {
  const { cardUid } = req.body;
  if (!cardUid) {
    return res.status(400).json({ error: 'MISSING_CARD_UID', message: 'Field cardUid is required.' });
  }

  try {
    const tap = await activeRfidAdapter.simulateTap(cardUid);
    console.log(`[DHARMARAKSHA-Gateway] Simulated tap: ${tap.cardUid}`);

    // Try forwarding to Main API
    try {
      await fetch(`${MAIN_API_URL}/api/v1/rfid/tap-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Dharmaraksha-Device-Key': DEVICE_KEY
        },
        body: JSON.stringify(tap)
      });
    } catch (_forwardErr) {
      // Offline / standalone fallback
    }

    return res.json({ success: true, tap });
  } catch (err: any) {
    return res.status(400).json({ error: 'SIMULATION_REJECTED', message: err.message });
  }
});

// 4. Normalized Tap Event Handler (called by hardware reader or MCU bridge)
rfidRouter.post('/rfid/tap-event', async (req: Request, res: Response) => {
  const { cardUid } = req.body;
  if (!cardUid) {
    return res.status(400).json({ error: 'MISSING_CARD_UID', message: 'Missing cardUid in tap event payload' });
  }

  let normalizedTap: RfidTapPayload;

  if (activeRfidAdapter.isPhysical()) {
    (activeRfidAdapter as any).setHardwareTap(cardUid);
    normalizedTap = (await activeRfidAdapter.readLatestTap())!;
  } else {
    normalizedTap = await activeRfidAdapter.simulateTap(cardUid);
  }

  console.log(`[DHARMARAKSHA-Gateway] RFID Card tapped: ${cardUid} via ${normalizedTap.readerSource}`);

  // Forward to Main API
  let apiResponse = null;
  try {
    const mainRes = await fetch(`${MAIN_API_URL}/api/v1/rfid/tap-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Dharmaraksha-Device-Key': DEVICE_KEY
      },
      body: JSON.stringify(normalizedTap)
    });
    apiResponse = await mainRes.json();
  } catch (_err) {
    // Standalone fallback
  }

  res.json({
    success: true,
    tap: normalizedTap,
    backendResolution: apiResponse
  });
});
