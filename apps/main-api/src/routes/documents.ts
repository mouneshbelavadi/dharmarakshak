import { Router, Request, Response } from 'express';
import { casesStore } from '../storage/case-store.js';
import { idempotencyService } from '../idempotency/idempotency-service.js';
import { documentIntakeService } from '../services/document-intake-service.js';
import { DocumentCategory } from '@dharmaraksha/shared-contracts';

export const documentsRouter = Router();

// 1. Add Document (Create a new named document container)
documentsRouter.post('/cases/:id/documents', async (req: Request, res: Response) => {
  const caseId = req.params.id;
  const { title, category, parentDocumentId, sourceChannel, language, originalFileName, fileType } = req.body;

  if (!title || !category) {
    return res.status(400).json({ error: 'MISSING_FIELDS', message: 'title and category are required.' });
  }

  try {
    const doc = await documentIntakeService.createDocument(caseId, {
      title,
      category: category as DocumentCategory,
      parentDocumentId,
      sourceChannel,
      language,
      originalFileName,
      fileType
    });
    res.status(201).json({ success: true, document: doc });
  } catch (err: any) {
    res.status(400).json({ error: 'CREATE_DOCUMENT_FAILED', message: err.message });
  }
});

// 2. Review All Documents in a Case
documentsRouter.get('/cases/:id/documents', (req: Request, res: Response) => {
  const caseId = req.params.id;
  const c = casesStore.get(caseId);
  if (!c) {
    return res.status(404).json({ error: 'CASE_NOT_FOUND', message: `Case ${caseId} not found.` });
  }

  const totalPages = c.documents.reduce((acc, d) => acc + d.pageCount, 0);
  res.json({
    caseId,
    totalDocuments: c.documents.length,
    totalPages,
    documents: c.documents
  });
});

// 3. Get Specific Document
documentsRouter.get('/cases/:id/documents/:docId', (req: Request, res: Response) => {
  const { id: caseId, docId } = req.params;
  const c = casesStore.get(caseId);
  if (!c) {
    return res.status(404).json({ error: 'CASE_NOT_FOUND' });
  }

  const doc = c.documents.find(d => d.documentId === docId);
  if (!doc) {
    return res.status(404).json({ error: 'DOCUMENT_NOT_FOUND' });
  }

  res.json({ document: doc });
});

// 4. Ingest Page Still (Page-by-page intake with OCR, script detection, and duplicate preservation)
documentsRouter.post('/cases/:id/documents/:docId/pages', async (req: Request, res: Response) => {
  const { id: caseId, docId } = req.params;
  const idempotencyKey = req.header('X-Idempotency-Key') || `idem-${Date.now()}`;
  const clientChecksum = req.header('X-Checksum-SHA256');

  // Idempotency check
  const cached = idempotencyService.get(idempotencyKey);
  if (cached) {
    return res.status(cached.statusCode).json({ ...cached.responsePayload, _idempotentReplay: true });
  }

  const { pageNumber, imageBase64, textContent, rotationDegrees = 0 } = req.body;
  if (!pageNumber || typeof pageNumber !== 'number') {
    return res.status(400).json({ error: 'MISSING_PAGE_NUMBER', message: 'pageNumber is required as a number.' });
  }

  // Ensure case exists
  let c = casesStore.get(caseId);
  if (!c) {
    return res.status(404).json({ error: 'CASE_NOT_FOUND', message: `Case ${caseId} does not exist.` });
  }

  // Auto-create document if it doesn't exist yet (ensures backwards-compatibility for simple page posts)
  let doc = c.documents.find(d => d.documentId === docId);
  if (!doc) {
    doc = await documentIntakeService.createDocument(caseId, {
      title: `Document ${docId}`,
      category: 'unknown_uncategorized'
    });
  }

  // Convert payload to buffer
  let buffer: Buffer;
  if (textContent) {
    buffer = Buffer.from(textContent, 'utf-8');
  } else if (imageBase64) {
    buffer = Buffer.from(imageBase64, 'base64');
  } else {
    buffer = Buffer.from(`DHARMARAKSHA_PAGE_BYTES_CASE_${caseId}_DOC_${docId}_PAGE_${pageNumber}`, 'utf-8');
  }

  try {
    const page = await documentIntakeService.addPage(caseId, doc.documentId, {
      pageNumber,
      buffer,
      rotationDegrees,
      clientChecksum,
      idempotencyKey
    });

    const responsePayload = {
      success: true,
      page,
      acknowledgment: {
        uploadId: `upl-${Date.now()}-${doc.documentId}-${pageNumber}`,
        documentId: doc.documentId,
        pageId: page.pageId,
        idempotencyKey,
        sha256Checksum: page.sha256Checksum,
        receivedBytes: page.byteSize,
        status: 'acknowledged_and_stored',
        timestamp: page.capturedAt
      }
    };

    idempotencyService.set(idempotencyKey, idempotencyService.hashRequest(req.body), responsePayload, 201);
    res.status(201).json(responsePayload);
  } catch (err: any) {
    res.status(400).json({ error: 'PAGE_STORE_FAILED', message: err.message });
  }
});

// 5. Reorder Pages within a Document
documentsRouter.post('/cases/:id/documents/:docId/pages/reorder', async (req: Request, res: Response) => {
  const { id: caseId, docId } = req.params;
  const { newOrder } = req.body;

  if (!Array.isArray(newOrder)) {
    return res.status(400).json({ error: 'INVALID_ORDER', message: 'newOrder must be an array of page numbers.' });
  }

  try {
    const pages = await documentIntakeService.reorderPages(caseId, docId, newOrder);
    res.json({ success: true, pages });
  } catch (err: any) {
    res.status(400).json({ error: 'REORDER_FAILED', message: err.message });
  }
});

// 6. Rotate Page
documentsRouter.post('/cases/:id/documents/:docId/pages/:pageNum/rotate', async (req: Request, res: Response) => {
  const { id: caseId, docId, pageNum } = req.params;
  const { rotationDegrees = 90 } = req.body;

  try {
    const page = await documentIntakeService.rotatePage(caseId, docId, parseInt(pageNum, 10), rotationDegrees);
    res.json({ success: true, page });
  } catch (err: any) {
    res.status(400).json({ error: 'ROTATE_FAILED', message: err.message });
  }
});

// 7. Recapture Page (Upload clean scan to resolve blur/glare)
documentsRouter.post('/cases/:id/documents/:docId/pages/:pageNum/recapture', async (req: Request, res: Response) => {
  const { id: caseId, docId, pageNum } = req.params;
  const { imageBase64, textContent, checksum } = req.body;

  let buffer: Buffer;
  if (textContent) {
    buffer = Buffer.from(textContent, 'utf-8');
  } else if (imageBase64) {
    buffer = Buffer.from(imageBase64, 'base64');
  } else {
    buffer = Buffer.from(`DHARMARAKSHA_RECAPTURED_CASE_${caseId}_DOC_${docId}_PAGE_${pageNum}`, 'utf-8');
  }

  try {
    const page = await documentIntakeService.recapturePage(
      caseId,
      docId,
      parseInt(pageNum, 10),
      buffer,
      checksum
    );
    res.json({ success: true, page });
  } catch (err: any) {
    res.status(400).json({ error: 'RECAPTURE_FAILED', message: err.message });
  }
});

// 8. Review & Correct Text (Audit trail preserved)
documentsRouter.post('/cases/:id/documents/:docId/pages/:pageNum/correct-text', async (req: Request, res: Response) => {
  const { id: caseId, docId, pageNum } = req.params;
  const { correctedText, reviewedBy = 'reviewer' } = req.body;

  if (!correctedText) {
    return res.status(400).json({ error: 'MISSING_TEXT', message: 'correctedText is required.' });
  }

  try {
    const page = await documentIntakeService.reviewCorrectPageText(
      caseId,
      docId,
      parseInt(pageNum, 10),
      correctedText,
      reviewedBy
    );
    res.json({ success: true, page });
  } catch (err: any) {
    res.status(400).json({ error: 'CORRECT_TEXT_FAILED', message: err.message });
  }
});

// 9. Finish Document (Creates an immutable version)
documentsRouter.post('/cases/:id/documents/:docId/finish', async (req: Request, res: Response) => {
  const { id: caseId, docId } = req.params;
  const { sessionId } = req.body || {};

  try {
    const version = await documentIntakeService.finishDocument(caseId, docId, sessionId);
    res.json({ success: true, version });
  } catch (err: any) {
    res.status(400).json({ error: 'FINISH_DOCUMENT_FAILED', message: err.message });
  }
});

// 10. Finalize Immutable Case-Document Snapshot
documentsRouter.post('/cases/:id/snapshots/finalize', async (req: Request, res: Response) => {
  const caseId = req.params.id;

  try {
    const snapshot = await documentIntakeService.finalizeSnapshot(caseId);
    res.json({ success: true, snapshot });
  } catch (err: any) {
    res.status(400).json({ error: 'SNAPSHOT_FINALIZE_FAILED', message: err.message });
  }
});

// 11. Get Current Active Snapshot
documentsRouter.get('/cases/:id/snapshots/current', (req: Request, res: Response) => {
  const caseId = req.params.id;
  const c = casesStore.get(caseId);
  if (!c) {
    return res.status(404).json({ error: 'CASE_NOT_FOUND' });
  }

  res.json({ snapshot: c.activeSnapshot || null });
});

// 12. Cross-Document Discrepancies
documentsRouter.get('/cases/:id/discrepancies', (req: Request, res: Response) => {
  const caseId = req.params.id;
  const discrepancies = documentIntakeService.detectCrossDocumentDiscrepancies(caseId);
  res.json({ caseId, count: discrepancies.length, discrepancies });
});
