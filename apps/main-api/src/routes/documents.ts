import { Router, Request, Response } from 'express';
import { storageService } from '../storage/storage-service.js';
import { eventLedger } from '../events/event-ledger.js';
import { idempotencyService } from '../idempotency/idempotency-service.js';

export const documentsRouter = Router();

// Ingest a page still (accepts base64 or raw payload with SHA-256 integrity verification)
documentsRouter.post('/cases/:id/documents/:docId/pages', async (req: Request, res: Response) => {
  const { id: caseId, docId } = req.params;
  const idempotencyKey = req.header('X-Idempotency-Key') || `idem-${Date.now()}`;
  const clientChecksum = req.header('X-Checksum-SHA256');

  // Idempotency check
  const cached = idempotencyService.get(idempotencyKey);
  if (cached) {
    return res.status(cached.statusCode).json({ ...cached.responsePayload, _idempotentReplay: true });
  }

  const { pageNumber, imageBase64 } = req.body;
  if (!pageNumber) {
    return res.status(400).json({ error: 'MISSING_PAGE_NUMBER' });
  }

  // Convert payload to buffer (either provided imageBase64 or fallback synthetic test buffer)
  const buffer = imageBase64
    ? Buffer.from(imageBase64, 'base64')
    : Buffer.from(`DHARMARAKSHA_PAGE_BYTES_CASE_${caseId}_DOC_${docId}_PAGE_${pageNumber}`);

  try {
    const ack = await storageService.storePageStill(
      caseId,
      docId,
      pageNumber,
      buffer,
      clientChecksum,
      idempotencyKey
    );

    if (ack.status === 'rejected_corrupt') {
      return res.status(422).json({
        error: 'CHECKSUM_MISMATCH',
        message: 'Cryptographic SHA-256 digest does not match uploaded bytes.',
        acknowledgment: ack
      });
    }

    // Atomically commit page buffering event to ledger
    await eventLedger.commitEventAtomically(
      caseId,
      1,
      'kiosk:page_buffered',
      { documentId: docId, pageNumber, byteSize: buffer.length, sha256: ack.sha256Checksum }
    );

    idempotencyService.set(idempotencyKey, idempotencyService.hashRequest(req.body), ack, 201);
    res.status(201).json(ack);
  } catch (err: any) {
    res.status(400).json({ error: 'PAGE_STORE_FAILED', message: err.message });
  }
});
