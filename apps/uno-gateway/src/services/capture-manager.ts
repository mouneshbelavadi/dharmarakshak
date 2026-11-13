import { activeCameraAdapter, FrameResult } from '../capture/camera-adapter.js';
import { spoolService, SpoolItem } from './spool-service.js';

export interface CaptureResult {
  success: boolean;
  captureId: string;
  acknowledged: boolean;
  sha256: string;
  byteSize: number;
  rotation: number;
  acknowledgment?: any;
  error?: string;
  status: 'acknowledged' | 'queued_for_retry';
}

export class CaptureManager {
  private mainApiUrlOverride: string | null = null;
  private deviceApiKeyOverride: string | null = null;

  public getMainApiUrl(): string {
    return this.mainApiUrlOverride || process.env.MAIN_API_URL || 'http://localhost:4000';
  }

  public setMainApiUrl(url: string | null): void {
    this.mainApiUrlOverride = url;
  }

  public getDeviceApiKey(): string {
    return this.deviceApiKeyOverride || process.env.DHARMARAKSHA_DEVICE_API_KEY || 'dharmaraksha_device_key_placeholder_safe_default';
  }

  public setDeviceApiKey(key: string | null): void {
    this.deviceApiKeyOverride = key;
  }

  /**
   * Generates a rate-limited preview frame for the phone browser viewfinder.
   */
  public async getPreviewFrame(): Promise<FrameResult> {
    return activeCameraAdapter.getPreviewFrame({ maxWidth: 640, maxHeight: 480 });
  }

  /**
   * Captures a full-resolution page from the board UVC document camera,
   * spools it locally, and reliably uploads it to the central Main API.
   */
  public async capturePage(
    caseId: string,
    documentId: string,
    pageNumber: number,
    rotation: number = 0
  ): Promise<CaptureResult> {
    // 1. Capture full still via native camera owner
    const still = await activeCameraAdapter.captureStill({ rotation });

    // 2. Spool locally before network transmission (guarantees survival across interruptions)
    const spooledItem = await spoolService.spoolCapture(
      caseId,
      documentId,
      pageNumber,
      still.buffer,
      rotation
    );

    // 3. Attempt immediate transmission to Main API
    const uploadOutcome = await this.uploadToMainApi(spooledItem, still.buffer);

    return {
      success: true,
      captureId: spooledItem.captureId,
      acknowledged: uploadOutcome.acknowledged,
      sha256: spooledItem.sha256Checksum,
      byteSize: spooledItem.byteSize,
      rotation,
      acknowledgment: uploadOutcome.acknowledgment,
      error: uploadOutcome.error,
      status: uploadOutcome.acknowledged ? 'acknowledged' : 'queued_for_retry'
    };
  }

  /**
   * Ingests a client-side still captured via the Phone Camera Fallback.
   */
  public async ingestPhoneCameraFallback(
    caseId: string,
    documentId: string,
    pageNumber: number,
    buffer: Buffer,
    rotation: number = 0
  ): Promise<CaptureResult> {
    const spooledItem = await spoolService.spoolCapture(
      caseId,
      documentId,
      pageNumber,
      buffer,
      rotation
    );

    const uploadOutcome = await this.uploadToMainApi(spooledItem, buffer);

    return {
      success: true,
      captureId: spooledItem.captureId,
      acknowledged: uploadOutcome.acknowledged,
      sha256: spooledItem.sha256Checksum,
      byteSize: spooledItem.byteSize,
      rotation,
      acknowledgment: uploadOutcome.acknowledgment,
      error: uploadOutcome.error,
      status: uploadOutcome.acknowledged ? 'acknowledged' : 'queued_for_retry'
    };
  }

  /**
   * Retries all pending/failed spooled captures to recover from temporary network interruptions.
   * Uses stable page identities (caseId, documentId, pageNumber, sha256).
   */
  public async retryPendingUploads(): Promise<{ attempted: number; successful: number; remaining: number }> {
    const pending = spoolService.getPendingUploads();
    let successful = 0;

    for (const item of pending) {
      const buffer = await spoolService.getCaptureBuffer(item.captureId);
      if (!buffer) continue;

      const outcome = await this.uploadToMainApi(item, buffer);
      if (outcome.acknowledged) {
        successful++;
      }
    }

    const remaining = spoolService.getPendingUploads().length;
    console.log(`[CaptureManager] Retry complete: ${successful}/${pending.length} recovered. ${remaining} remaining.`);
    return { attempted: pending.length, successful, remaining };
  }

  /**
   * Upload payload to Main API with X-Dharmaraksha-Device-Key authentication.
   */
  private async uploadToMainApi(
    item: SpoolItem,
    buffer: Buffer
  ): Promise<{ acknowledged: boolean; acknowledgment?: any; error?: string }> {
    try {
      const endpoint = `${this.getMainApiUrl()}/api/v1/cases/${item.caseId}/documents/${item.documentId}/pages`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Dharmaraksha-Device-Key': this.getDeviceApiKey()
        },
        body: JSON.stringify({
          pageNumber: item.pageNumber,
          pageImageBase64: buffer.toString('base64'),
          sha256: item.sha256Checksum,
          rotation: item.rotation
        })
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as any;
        const msg = errorData.message || `Server returned HTTP ${response.status}`;
        spoolService.markFailed(item.captureId, msg);
        return { acknowledged: false, error: msg };
      }

      const ack = (await response.json()) as any;
      spoolService.markAcknowledged(item.captureId, ack.storageUri || `storage://${item.caseId}/${item.documentId}/p${item.pageNumber}`);
      return { acknowledged: true, acknowledgment: ack };
    } catch (networkErr: any) {
      spoolService.markFailed(item.captureId, networkErr.message);
      return { acknowledged: false, error: `Network error: ${networkErr.message}` };
    }
  }
}

export const captureManager = new CaptureManager();
