import { CaseScopedEvent, CaseScopedEventType } from '@dharmaraksha/shared-contracts';
import { Response } from 'express';

export class EventLedgerService {
  private currentCursor: number = 0;
  private ledger: CaseScopedEvent[] = [];
  private activeSubscribers: Map<string, Response[]> = new Map(); // Map<caseId, SSE Responses>

  constructor() {
    // Seed initial event cursor
    this.currentCursor = 100;
  }

  // Atomically persist a state change and append an event to the monotonic ledger
  public async commitEventAtomically<T>(
    caseId: string,
    snapshotVersion: number,
    eventType: CaseScopedEventType,
    payload: T,
    originatingTier: 'main_api' | 'worker' | 'uno_gateway' | 'laptop_web' = 'main_api'
  ): Promise<CaseScopedEvent<T>> {
    this.currentCursor += 1;
    const event: CaseScopedEvent<T> = {
      cursor: this.currentCursor,
      eventId: `evt-${Date.now()}-${this.currentCursor}`,
      eventType,
      caseId,
      snapshotVersion,
      originatingTier,
      timestamp: new Date().toISOString(),
      payload
    };

    // Append to in-memory / persistent ledger atomically
    this.ledger.push(event as CaseScopedEvent);

    // Broadcast immediately to active SSE subscribers for this case
    this.broadcastToSubscribers(caseId, event);

    return event;
  }

  // Retrieve events for a case after a specified cursor (Reconnect / Replay)
  public getEventsAfterCursor(caseId: string, afterCursor: number = 0, limit: number = 100): CaseScopedEvent[] {
    return this.ledger
      .filter((e) => e.caseId === caseId && e.cursor > afterCursor)
      .slice(0, limit);
  }

  // Register an SSE client connection for real-time streaming
  public registerSubscriber(caseId: string, res: Response): void {
    if (!this.activeSubscribers.has(caseId)) {
      this.activeSubscribers.set(caseId, []);
    }
    this.activeSubscribers.get(caseId)!.push(res);

    res.on('close', () => {
      const subs = this.activeSubscribers.get(caseId);
      if (subs) {
        this.activeSubscribers.set(caseId, subs.filter((s) => s !== res));
      }
    });
  }

  private broadcastToSubscribers(caseId: string, event: CaseScopedEvent): void {
    const subs = this.activeSubscribers.get(caseId);
    if (subs && subs.length > 0) {
      const ssePayload = `id: ${event.cursor}\nevent: ${event.eventType}\ndata: ${JSON.stringify(event)}\n\n`;
      subs.forEach((res) => {
        try {
          res.write(ssePayload);
        } catch (err) {
          // Client dropped
        }
      });
    }
  }

  public getCurrentCursor(): number {
    return this.currentCursor;
  }
}

export const eventLedger = new EventLedgerService();

