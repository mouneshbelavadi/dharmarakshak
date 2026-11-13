import crypto from 'crypto';

export interface IdempotencyRecord {
  key: string;
  requestHash: string;
  responsePayload: any;
  statusCode: number;
  createdAt: string;
  expiresAt: string;
}

export class IdempotencyService {
  private records: Map<string, IdempotencyRecord> = new Map();
  private ttlMs: number = 24 * 60 * 60 * 1000; // 24 hours TTL

  public hashRequest(body: any): string {
    const serialized = typeof body === 'string' ? body : JSON.stringify(body || {});
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  public get(key: string): IdempotencyRecord | null {
    const record = this.records.get(key);
    if (!record) return null;
    if (new Date(record.expiresAt) < new Date()) {
      this.records.delete(key);
      return null;
    }
    return record;
  }

  public set(key: string, requestHash: string, responsePayload: any, statusCode: number = 200): void {
    const record: IdempotencyRecord = {
      key,
      requestHash,
      responsePayload,
      statusCode,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.ttlMs).toISOString()
    };
    this.records.set(key, record);
  }
}

export const idempotencyService = new IdempotencyService();

