import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface SpoolItem {
  captureId: string;
  caseId: string;
  documentId: string;
  pageNumber: number;
  rotation: number;
  filePath: string;
  sha256Checksum: string;
  byteSize: number;
  capturedAt: string;
  uploadStatus: 'spooled' | 'forwarding' | 'acknowledged' | 'failed';
  retryCount: number;
  acknowledgedAt?: string;
  durableStorageUri?: string;
  lastError?: string;
}

export interface SpoolStatus {
  totalItems: number;
  pendingUploads: number;
  acknowledgedItems: number;
  totalBytes: number;
  maxItems: number;
  diskPressure: boolean;
  spoolDirectory: string;
}

export class SpoolService {
  private spoolDir: string;
  private maxItems: number = 20; // Bounded limit: max 20 pages spooled
  private maxBytes: number = 50 * 1024 * 1024; // 50 MB bounded storage on UNO Q
  private items: Map<string, SpoolItem> = new Map();

  constructor(spoolDir: string = './storage/uno_spool') {
    this.spoolDir = path.resolve(spoolDir);
    if (!fs.existsSync(this.spoolDir)) {
      fs.mkdirSync(this.spoolDir, { recursive: true });
    }
  }

  /**
   * Spools a newly captured page still to bounded local disk.
   * Performs disk pressure checks, auto-cleans acknowledged items, and enforces limits.
   */
  public async spoolCapture(
    caseId: string,
    documentId: string,
    pageNumber: number,
    buffer: Buffer,
    rotation: number = 0
  ): Promise<SpoolItem> {
    // 1. Check disk pressure & clean acknowledged items
    if (this.items.size >= this.maxItems) {
      this.cleanupAcknowledged();
    }

    // 2. Enforce hard spool limit if still under pressure
    const unacknowledgedCount = Array.from(this.items.values()).filter(
      (i) => i.uploadStatus !== 'acknowledged'
    ).length;

    if (unacknowledgedCount >= this.maxItems) {
      throw new Error(
        `SPOOL_DISK_PRESSURE: Temporary spool capacity reached (${this.maxItems} unacknowledged captures). ` +
        `Waiting for network transfer to Main API before accepting new captures.`
      );
    }

    const captureId = `cap-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const filename = `${caseId}_${documentId}_p${pageNumber}_${captureId}.jpg`;
    const filePath = path.join(this.spoolDir, filename);

    // Compute cryptographic SHA-256 digest
    const hash = crypto.createHash('sha256');
    hash.update(buffer);
    const sha256Checksum = hash.digest('hex');

    // Write file to local disk
    await fs.promises.writeFile(filePath, buffer);

    const spoolItem: SpoolItem = {
      captureId,
      caseId,
      documentId,
      pageNumber,
      rotation,
      filePath,
      sha256Checksum,
      byteSize: buffer.length,
      capturedAt: new Date().toISOString(),
      uploadStatus: 'spooled',
      retryCount: 0
    };

    this.items.set(captureId, spoolItem);
    console.log(`[SpoolService] Spooled capture ${captureId} (${buffer.length} bytes, SHA-256: ${sha256Checksum.substring(0, 12)}...)`);
    return spoolItem;
  }

  /**
   * Marks a spooled item as durably acknowledged by the central backend.
   */
  public markAcknowledged(captureId: string, durableStorageUri: string): boolean {
    const item = this.items.get(captureId);
    if (!item) return false;

    item.uploadStatus = 'acknowledged';
    item.acknowledgedAt = new Date().toISOString();
    item.durableStorageUri = durableStorageUri;
    item.lastError = undefined;

    console.log(`[SpoolService] Capture ${captureId} acknowledged by Main API -> ${durableStorageUri}`);
    return true;
  }

  /**
   * Marks an upload attempt as failed, incrementing retry count.
   */
  public markFailed(captureId: string, errorMessage: string): boolean {
    const item = this.items.get(captureId);
    if (!item) return false;

    item.uploadStatus = 'failed';
    item.retryCount += 1;
    item.lastError = errorMessage;

    console.warn(`[SpoolService] Capture ${captureId} upload failed (retry ${item.retryCount}): ${errorMessage}`);
    return true;
  }

  /**
   * Cleans up acknowledged captures from local disk to prevent storage leaks.
   */
  public cleanupAcknowledged(): number {
    let cleaned = 0;
    for (const [id, item] of this.items.entries()) {
      if (item.uploadStatus === 'acknowledged') {
        try {
          if (fs.existsSync(item.filePath)) {
            fs.unlinkSync(item.filePath);
          }
          this.items.delete(id);
          cleaned++;
        } catch (err: any) {
          console.error(`[SpoolService] Failed to clean up acknowledged file ${item.filePath}:`, err.message);
        }
      }
    }
    if (cleaned > 0) {
      console.log(`[SpoolService] Evicted and cleaned ${cleaned} acknowledged capture files.`);
    }
    return cleaned;
  }

  /**
   * Returns all pending captures that need to be uploaded to Main API.
   */
  public getPendingUploads(): SpoolItem[] {
    return Array.from(this.items.values()).filter(
      (i) => i.uploadStatus === 'spooled' || i.uploadStatus === 'failed'
    );
  }

  public getItem(captureId: string): SpoolItem | null {
    return this.items.get(captureId) || null;
  }

  public getSpoolStatus(): SpoolStatus {
    const all = Array.from(this.items.values());
    const pending = all.filter((i) => i.uploadStatus !== 'acknowledged').length;
    const ack = all.filter((i) => i.uploadStatus === 'acknowledged').length;
    const totalBytes = all.reduce((sum, i) => sum + i.byteSize, 0);

    return {
      totalItems: all.length,
      pendingUploads: pending,
      acknowledgedItems: ack,
      totalBytes,
      maxItems: this.maxItems,
      diskPressure: pending >= this.maxItems || totalBytes >= this.maxBytes,
      spoolDirectory: this.spoolDir
    };
  }

  /**
   * Read raw buffer for a spooled capture.
   */
  public async getCaptureBuffer(captureId: string): Promise<Buffer | null> {
    const item = this.items.get(captureId);
    if (!item || !fs.existsSync(item.filePath)) return null;
    return fs.promises.readFile(item.filePath);
  }
}

export const spoolService = new SpoolService();

