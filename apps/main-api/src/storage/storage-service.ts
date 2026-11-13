import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { UploadAcknowledgment } from '@dharmaraksha/shared-contracts';

export class StorageService {
  private baseDir: string;
  private maxSizeBytes: number = 20 * 1024 * 1024; // 20 MB file limit

  constructor(customDir?: string) {
    this.baseDir = customDir || path.resolve(process.cwd(), 'storage/documents');
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  // Sanitize path component against directory traversal
  private sanitizeKey(key: string): string {
    return key.replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  public async storePageStill(
    caseId: string,
    documentId: string,
    pageNumber: number,
    buffer: Buffer,
    expectedChecksum?: string,
    idempotencyKey: string = `idem-${Date.now()}`
  ): Promise<UploadAcknowledgment> {
    if (buffer.length > this.maxSizeBytes) {
      throw new Error(`File size ${buffer.length} exceeds 20MB limit.`);
    }

    const cleanCaseId = this.sanitizeKey(caseId);
    const cleanDocId = this.sanitizeKey(documentId);
    const actualChecksum = crypto.createHash('sha256').update(buffer).digest('hex');

    if (expectedChecksum && expectedChecksum.toLowerCase() !== actualChecksum.toLowerCase()) {
      return {
        uploadId: `upl-${Date.now()}`,
        documentId: cleanDocId,
        pageId: `pg-${pageNumber}`,
        idempotencyKey,
        sha256Checksum: actualChecksum,
        receivedBytes: buffer.length,
        status: 'rejected_corrupt',
        timestamp: new Date().toISOString()
      };
    }

    const docDir = path.join(this.baseDir, cleanCaseId, cleanDocId);
    if (!fs.existsSync(docDir)) {
      fs.mkdirSync(docDir, { recursive: true });
    }

    const pageFileName = `page_${String(pageNumber).padStart(3, '0')}.jpg`;
    const targetPath = path.join(docDir, pageFileName);
    fs.writeFileSync(targetPath, buffer);

    return {
      uploadId: `upl-${Date.now()}-${cleanDocId}-${pageNumber}`,
      documentId: cleanDocId,
      pageId: `pg-${pageNumber}`,
      idempotencyKey,
      sha256Checksum: actualChecksum,
      receivedBytes: buffer.length,
      status: 'acknowledged_and_stored',
      timestamp: new Date().toISOString()
    };
  }

  public getPagePath(caseId: string, documentId: string, pageNumber: number): string | null {
    const cleanCaseId = this.sanitizeKey(caseId);
    const cleanDocId = this.sanitizeKey(documentId);
    const targetPath = path.join(this.baseDir, cleanCaseId, cleanDocId, `page_${String(pageNumber).padStart(3, '0')}.jpg`);
    return fs.existsSync(targetPath) ? targetPath : null;
  }
}

export const storageService = new StorageService();

