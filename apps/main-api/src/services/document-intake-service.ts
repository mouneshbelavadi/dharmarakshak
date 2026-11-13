import crypto from 'crypto';
import {
  CaseDocument,
  DocumentCategory,
  DocumentPage,
  ImmutableDocumentVersion,
  CaseDocumentSnapshot,
  DiscrepancyComparison
} from '@dharmaraksha/shared-contracts';
import { casesStore } from '../storage/case-store.js';
import { storageService } from '../storage/storage-service.js';
import { eventLedger } from '../events/event-ledger.js';
import { ocrEngine } from './ocr-engine.js';

export interface CreateDocumentInput {
  title: string;
  category: DocumentCategory;
  parentDocumentId?: string;
  sourceChannel?: 'kiosk_overhead_cam' | 'phone_cam' | 'laptop_direct_upload' | 'telegram_bot' | 'google_drive';
  language?: string;
  originalFileName?: string;
  fileType?: 'pdf' | 'image' | 'scanned_pages';
}

export interface AddPageInput {
  pageNumber: number;
  buffer: Buffer;
  rotationDegrees?: number;
  clientChecksum?: string;
  idempotencyKey?: string;
}

export class DocumentIntakeService {
  /**
   * Add a new named document container to a case
   */
  public async createDocument(caseId: string, input: CreateDocumentInput): Promise<CaseDocument> {
    const c = casesStore.get(caseId);
    if (!c) {
      throw new Error(`CASE_NOT_FOUND: Case ${caseId} does not exist.`);
    }

    // Validate parent document if this is an annexure / schedule
    if (input.parentDocumentId) {
      const parent = c.documents.find(d => d.documentId === input.parentDocumentId);
      if (!parent) {
        throw new Error(
          `PARENT_DOCUMENT_NOT_FOUND: Parent document ${input.parentDocumentId} does not exist in case ${caseId}.`
        );
      }
    }

    const documentId = `doc-${crypto.randomBytes(6).toString('hex')}`;
    const newDoc: CaseDocument = {
      documentId,
      caseId,
      title: input.title,
      category: input.category,
      parentDocumentId: input.parentDocumentId,
      currentVersionNumber: 1,
      versions: [],
      pages: [],
      pageCount: 0,
      uploadedAt: new Date().toISOString(),
      sourceChannel: input.sourceChannel || 'laptop_direct_upload',
      languageDetected: input.language || 'en',
      contentHash: '',
      isArchived: false,
      status: 'draft_intake',
      originalFileName: input.originalFileName,
      fileType: input.fileType || 'scanned_pages'
    };

    c.documents.push(newDoc);
    c.updatedAt = new Date().toISOString();

    await eventLedger.commitEventAtomically(caseId, c.currentSnapshotVersion, 'document:created', {
      documentId,
      title: input.title,
      category: input.category,
      parentDocumentId: input.parentDocumentId
    });

    return newDoc;
  }

  /**
   * Ingest a single page into a named document
   */
  public async addPage(caseId: string, documentId: string, input: AddPageInput): Promise<DocumentPage> {
    const c = casesStore.get(caseId);
    if (!c) throw new Error(`CASE_NOT_FOUND: Case ${caseId}`);

    const doc = c.documents.find(d => d.documentId === documentId);
    if (!doc) throw new Error(`DOCUMENT_NOT_FOUND: Document ${documentId}`);

    const rotation = input.rotationDegrees || 0;
    const sha256 = crypto.createHash('sha256').update(input.buffer).digest('hex');

    // Store raw file still
    const ack = await storageService.storePageStill(
      caseId,
      documentId,
      input.pageNumber,
      input.buffer,
      input.clientChecksum,
      input.idempotencyKey
    );

    if (ack.status === 'rejected_corrupt') {
      throw new Error('CHECKSUM_MISMATCH: Page still corrupted during upload.');
    }

    // Check for duplicates without silently deleting:
    // Look across all pages currently in the document
    let continuityStatus: DocumentPage['continuityStatus'] = 'intact';
    let duplicateOfPageNumber: number | undefined;

    const existingPage = doc.pages.find(p => p.sha256Checksum === sha256);
    if (existingPage) {
      continuityStatus = 'duplicate_page';
      duplicateOfPageNumber = existingPage.pageNumber;
    }

    // Run OCR / extraction engine
    const ocrResult = await ocrEngine.processPage(
      doc.documentId,
      doc.title,
      doc.currentVersionNumber,
      input.pageNumber,
      input.buffer,
      doc.originalFileName
    );

    if (continuityStatus === 'intact' && ocrResult.isUncertain) {
      continuityStatus = 'unreadable_blur';
    }

    const pageId = `pg-${documentId}-${input.pageNumber}`;
    const page: DocumentPage = {
      pageId,
      documentId,
      pageNumber: input.pageNumber,
      imageUrl: `/storage/documents/${caseId}/${documentId}/page_${String(input.pageNumber).padStart(3, '0')}.jpg`,
      extractedText: ocrResult.fullText,
      scriptDetected: ocrResult.scriptDetected,
      qualityScore: ocrResult.qualityScore,
      continuityStatus,
      ocrConfidence: ocrResult.ocrConfidence,
      rotationDegrees: rotation,
      sha256Checksum: sha256,
      byteSize: input.buffer.length,
      capturedAt: new Date().toISOString(),
      isUncertain: ocrResult.isUncertain,
      uncertaintyReason: ocrResult.uncertaintyReason,
      needsRecapture: ocrResult.isUncertain,
      duplicateOfPageNumber,
      passages: ocrResult.passages
    };

    // Insert or replace in ordered pages list
    const existingIndex = doc.pages.findIndex(p => p.pageNumber === input.pageNumber);
    if (existingIndex >= 0) {
      doc.pages[existingIndex] = page;
    } else {
      doc.pages.push(page);
    }

    // Maintain stable 1-based sort by pageNumber
    doc.pages.sort((a, b) => a.pageNumber - b.pageNumber);
    doc.pageCount = doc.pages.length;
    doc.contentHash = this.computeDocumentHash(doc.pages);
    c.updatedAt = new Date().toISOString();

    await eventLedger.commitEventAtomically(caseId, c.currentSnapshotVersion, 'document:page_added', {
      documentId,
      pageNumber: input.pageNumber,
      sha256,
      continuityStatus,
      scriptDetected: ocrResult.scriptDetected,
      isUncertain: ocrResult.isUncertain
    });

    return page;
  }

  /**
   * Reorder pages within a document and re-index sequentially (1, 2, 3...)
   */
  public async reorderPages(caseId: string, documentId: string, pageOrder: number[]): Promise<DocumentPage[]> {
    const c = casesStore.get(caseId);
    if (!c) throw new Error(`CASE_NOT_FOUND: Case ${caseId}`);
    const doc = c.documents.find(d => d.documentId === documentId);
    if (!doc) throw new Error(`DOCUMENT_NOT_FOUND: Document ${documentId}`);

    if (pageOrder.length !== doc.pages.length) {
      throw new Error('PAGE_ORDER_MISMATCH: Provided page order length does not match document page count.');
    }

    const reordered: DocumentPage[] = [];
    for (let i = 0; i < pageOrder.length; i++) {
      const targetOriginalPageNum = pageOrder[i];
      const page = doc.pages.find(p => p.pageNumber === targetOriginalPageNum);
      if (!page) {
        throw new Error(`PAGE_NOT_FOUND: Original page ${targetOriginalPageNum} not found in document.`);
      }
      const newPageNumber = i + 1;
      const updatedPage: DocumentPage = {
        ...page,
        pageNumber: newPageNumber,
        pageId: `pg-${documentId}-${newPageNumber}`,
        passages: (page.passages || []).map(psg => ({
          ...psg,
          pageNumber: newPageNumber,
          sourceAnchor: `doc:${documentId}:v${doc.currentVersionNumber}:p${newPageNumber}#${psg.passageId.split('#')[1] || 'para'}`
        }))
      };
      reordered.push(updatedPage);
    }

    doc.pages = reordered;
    doc.contentHash = this.computeDocumentHash(doc.pages);
    c.updatedAt = new Date().toISOString();

    await eventLedger.commitEventAtomically(caseId, c.currentSnapshotVersion, 'document:pages_reordered', {
      documentId,
      newOrder: pageOrder
    });

    return doc.pages;
  }

  /**
   * Rotate a specific page
   */
  public async rotatePage(
    caseId: string,
    documentId: string,
    pageNumber: number,
    rotationDegrees: number
  ): Promise<DocumentPage> {
    const c = casesStore.get(caseId);
    if (!c) throw new Error(`CASE_NOT_FOUND: Case ${caseId}`);
    const doc = c.documents.find(d => d.documentId === documentId);
    if (!doc) throw new Error(`DOCUMENT_NOT_FOUND: Document ${documentId}`);

    const page = doc.pages.find(p => p.pageNumber === pageNumber);
    if (!page) throw new Error(`PAGE_NOT_FOUND: Page ${pageNumber}`);

    page.rotationDegrees = (rotationDegrees % 360 + 360) % 360;
    c.updatedAt = new Date().toISOString();

    await eventLedger.commitEventAtomically(caseId, c.currentSnapshotVersion, 'document:page_rotated', {
      documentId,
      pageNumber,
      rotationDegrees: page.rotationDegrees
    });

    return page;
  }

  /**
   * Recapture a page with a clean scan to resolve blur/glare
   */
  public async recapturePage(
    caseId: string,
    documentId: string,
    pageNumber: number,
    buffer: Buffer,
    checksum?: string
  ): Promise<DocumentPage> {
    return this.addPage(caseId, documentId, {
      pageNumber,
      buffer,
      clientChecksum: checksum
    });
  }

  /**
   * Reviewer or visitor manual text correction with audit trail
   */
  public async reviewCorrectPageText(
    caseId: string,
    documentId: string,
    pageNumber: number,
    correctedText: string,
    reviewedBy: string
  ): Promise<DocumentPage> {
    const c = casesStore.get(caseId);
    if (!c) throw new Error(`CASE_NOT_FOUND: Case ${caseId}`);
    const doc = c.documents.find(d => d.documentId === documentId);
    if (!doc) throw new Error(`DOCUMENT_NOT_FOUND: Document ${documentId}`);

    const page = doc.pages.find(p => p.pageNumber === pageNumber);
    if (!page) throw new Error(`PAGE_NOT_FOUND: Page ${pageNumber}`);

    const previousText = page.reviewedText || page.extractedText;
    page.reviewedText = correctedText;
    page.reviewedBy = reviewedBy;
    page.reviewedAt = new Date().toISOString();
    page.isUncertain = false;
    page.needsRecapture = false;
    page.continuityStatus = 'intact';

    c.updatedAt = new Date().toISOString();

    await eventLedger.commitEventAtomically(caseId, c.currentSnapshotVersion, 'document:text_corrected', {
      documentId,
      pageNumber,
      reviewedBy,
      characterLength: correctedText.length,
      previousSnippet: previousText?.slice(0, 100)
    });

    return page;
  }

  /**
   * Finish document intake and freeze into an ImmutableDocumentVersion
   */
  public async finishDocument(caseId: string, documentId: string, sessionId: string = 'system'): Promise<ImmutableDocumentVersion> {
    const c = casesStore.get(caseId);
    if (!c) throw new Error(`CASE_NOT_FOUND: Case ${caseId}`);
    const doc = c.documents.find(d => d.documentId === documentId);
    if (!doc) throw new Error(`DOCUMENT_NOT_FOUND: Document ${documentId}`);

    if (doc.pages.length === 0) {
      throw new Error('EMPTY_DOCUMENT: Cannot finish document with 0 pages.');
    }

    // Check page continuity for missing intermediate pages
    const pageNums = doc.pages.map(p => p.pageNumber).sort((a, b) => a - b);
    for (let i = 0; i < pageNums.length; i++) {
      if (pageNums[i] !== i + 1) {
        doc.pages[i].continuityStatus = 'missing_intermediate_page';
      }
    }

    const versionNumber = doc.currentVersionNumber;
    const pageManifest = doc.pages.map(p => p.pageId);
    const manifestHash = crypto
      .createHash('sha256')
      .update(pageManifest.join(':') + ':' + doc.pages.map(p => p.sha256Checksum).join(':'))
      .digest('hex');

    const versionRecord: ImmutableDocumentVersion = {
      versionId: `ver-${documentId}-v${versionNumber}`,
      documentId,
      versionNumber,
      pageCount: doc.pages.length,
      pageManifest,
      manifestHash,
      createdAt: new Date().toISOString(),
      createdBySessionId: sessionId
    };

    doc.versions.push(versionRecord);
    doc.status = 'intake_completed';
    c.updatedAt = new Date().toISOString();

    await eventLedger.commitEventAtomically(caseId, c.currentSnapshotVersion, 'document:intake_finished', {
      documentId,
      versionNumber,
      pageCount: doc.pages.length,
      manifestHash
    });

    return versionRecord;
  }

  /**
   * Finalize an immutable case-document snapshot before analysis.
   * Creating a new snapshot increments the snapshot version and computes a combined fingerprint.
   * Prior answers and reports remain labeled with their source snapshot version.
   */
  public async finalizeSnapshot(caseId: string): Promise<CaseDocumentSnapshot> {
    const c = casesStore.get(caseId);
    if (!c) throw new Error(`CASE_NOT_FOUND: Case ${caseId}`);

    if (c.documents.length === 0) {
      throw new Error('NO_DOCUMENTS: Cannot finalize a snapshot with no documents.');
    }

    // Ensure all completed documents have at least one immutable version
    for (const doc of c.documents) {
      if (doc.versions.length === 0 && doc.pages.length > 0) {
        await this.finishDocument(caseId, doc.documentId);
      }
    }

    const nextSnapshotVersion = c.activeSnapshot ? c.activeSnapshot.snapshotVersion + 1 : 1;
    c.currentSnapshotVersion = nextSnapshotVersion;

    const documentManifest = c.documents.map(d => {
      const latestVer = d.versions[d.versions.length - 1];
      return {
        documentId: d.documentId,
        title: d.title,
        category: d.category,
        parentDocumentId: d.parentDocumentId,
        versionNumber: latestVer ? latestVer.versionNumber : d.currentVersionNumber,
        pageCount: d.pageCount,
        manifestHash: latestVer ? latestVer.manifestHash : d.contentHash
      };
    });

    const totalPageCount = c.documents.reduce((acc, d) => acc + d.pageCount, 0);
    const combinedFingerprint = crypto
      .createHash('sha256')
      .update(
        documentManifest
          .map(m => `${m.documentId}:${m.versionNumber}:${m.manifestHash}`)
          .sort()
          .join('|')
      )
      .digest('hex');

    const snapshot: CaseDocumentSnapshot = {
      snapshotId: `snap-${caseId}-v${nextSnapshotVersion}`,
      caseId,
      snapshotVersion: nextSnapshotVersion,
      documentManifest,
      totalPageCount,
      combinedFingerprint,
      frozenAt: new Date().toISOString()
    };

    c.activeSnapshot = snapshot;
    c.updatedAt = new Date().toISOString();

    await eventLedger.commitEventAtomically(caseId, nextSnapshotVersion, 'case:snapshot_finalized', {
      snapshotId: snapshot.snapshotId,
      snapshotVersion: nextSnapshotVersion,
      totalPageCount,
      combinedFingerprint,
      documentsCount: documentManifest.length
    });

    return snapshot;
  }

  /**
   * Detect cross-document discrepancies (conflicting dates, amounts, missing attachments)
   * between agreements, receipts, and annexures.
   */
  public detectCrossDocumentDiscrepancies(caseId: string): DiscrepancyComparison[] {
    const c = casesStore.get(caseId);
    if (!c) return [];

    const discrepancies: DiscrepancyComparison[] = [];
    const snapshotVer = c.currentSnapshotVersion;

    // 1. Gather all dates and amounts per document/page
    const docDateEntries: Array<{ docId: string; docTitle: string; pageNum: number; date: string }> = [];
    const docAmountEntries: Array<{ docId: string; docTitle: string; pageNum: number; amount: string; numericValue?: number }> = [];

    for (const doc of c.documents) {
      for (const page of doc.pages) {
        const text = page.reviewedText || page.extractedText || '';
        const dates = ocrEngine.detectDates(text);
        for (const d of dates) {
          docDateEntries.push({ docId: doc.documentId, docTitle: doc.title, pageNum: page.pageNumber, date: d });
        }
        const amounts = ocrEngine.detectAmounts(text);
        for (const a of amounts) {
          const num = parseFloat(a.replace(/[^\d.]/g, ''));
          docAmountEntries.push({ docId: doc.documentId, docTitle: doc.title, pageNum: page.pageNumber, amount: a, numericValue: num });
        }
      }
    }

    // Check for conflicting dates across distinct documents
    for (let i = 0; i < docDateEntries.length; i++) {
      for (let j = i + 1; j < docDateEntries.length; j++) {
        const a = docDateEntries[i];
        const b = docDateEntries[j];
        if (a.docId !== b.docId && a.date !== b.date) {
          // Check if both relate to commencement or execution
          discrepancies.push({
            discrepancyId: `disc-date-${discrepancies.length + 1}`,
            caseId,
            snapshotVersion: snapshotVer,
            itemA: {
              documentId: a.docId,
              documentTitle: a.docTitle,
              pageNumber: a.pageNum,
              statedValue: a.date
            },
            itemB: {
              documentId: b.docId,
              documentTitle: b.docTitle,
              pageNumber: b.pageNum,
              statedValue: b.date
            },
            discrepancyType: 'date_inconsistency',
            explanation: `Date discrepancy detected: ${a.docTitle} (Page ${a.pageNum}) states '${a.date}', whereas ${b.docTitle} (Page ${b.pageNum}) states '${b.date}'.`,
            adversarialSignificance: 'Conflicting dates may create ambiguity regarding effective commencement, limitation periods, or payment schedule timelines.'
          });
        }
      }
    }

    // Check for conflicting monetary amounts across distinct documents
    for (let i = 0; i < docAmountEntries.length; i++) {
      for (let j = i + 1; j < docAmountEntries.length; j++) {
        const a = docAmountEntries[i];
        const b = docAmountEntries[j];
        if (a.docId !== b.docId && a.numericValue && b.numericValue && a.numericValue !== b.numericValue) {
          discrepancies.push({
            discrepancyId: `disc-amt-${discrepancies.length + 1}`,
            caseId,
            snapshotVersion: snapshotVer,
            itemA: {
              documentId: a.docId,
              documentTitle: a.docTitle,
              pageNumber: a.pageNum,
              statedValue: a.amount
            },
            itemB: {
              documentId: b.docId,
              documentTitle: b.docTitle,
              pageNumber: b.pageNum,
              statedValue: b.amount
            },
            discrepancyType: 'amount_conflict',
            explanation: `Monetary amount mismatch: ${a.docTitle} (Page ${a.pageNum}) mentions '${a.amount}', while ${b.docTitle} (Page ${b.pageNum}) mentions '${b.amount}'.`,
            adversarialSignificance: 'Financial variance between contractual agreement and payment receipts must be accounted for by supplementary receipts or deposit adjustments.'
          });
        }
      }
    }

    // Check for missing annexure references
    for (const doc of c.documents) {
      for (const page of doc.pages) {
        const text = page.reviewedText || page.extractedText || '';
        const annexureMatches = text.match(/Annexure\s+[A-Z0-9]+/gi) || [];
        for (const match of annexureMatches) {
          const hasUploadedAnnexure = c.documents.some(
            d => d.title.toLowerCase().includes(match.toLowerCase()) || d.parentDocumentId === doc.documentId
          );
          if (!hasUploadedAnnexure) {
            discrepancies.push({
              discrepancyId: `disc-annex-${discrepancies.length + 1}`,
              caseId,
              snapshotVersion: snapshotVer,
              itemA: {
                documentId: doc.documentId,
                documentTitle: doc.title,
                pageNumber: page.pageNumber,
                statedValue: match
              },
              itemB: {
                documentId: 'missing',
                documentTitle: 'Unattached Exhibit',
                pageNumber: 0,
                statedValue: 'Not uploaded'
              },
              discrepancyType: 'missing_annexure_reference',
              explanation: `${doc.title} references '${match}', but no matching document or schedule is attached.`,
              adversarialSignificance: 'Missing referenced annexures may hinder complete evaluation of terms, inventory, or specifications.'
            });
          }
        }
      }
    }

    return discrepancies;
  }

  private computeDocumentHash(pages: DocumentPage[]): string {
    return crypto
      .createHash('sha256')
      .update(pages.map(p => `${p.pageNumber}:${p.sha256Checksum}`).join(','))
      .digest('hex');
  }
}

export const documentIntakeService = new DocumentIntakeService();

