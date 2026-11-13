import crypto from 'crypto';
import {
  BenchPacket,
  PacketDeliveryReceipt,
  CaseScopedEvent
} from '@dharmaraksha/shared-contracts';
import {
  getChairForBench,
  MESSENGER
} from '@dharmaraksha/tribunal-definitions';

export interface MilestoneEventLog {
  eventType: string;
  timestamp: string;
  payload: any;
}

export class MessengerService {
  private deliveredPackets: Map<string, PacketDeliveryReceipt> = new Map();
  private emittedMilestones: MilestoneEventLog[] = [];

  /**
   * Messenger delivers a packet to the Presiding Reviewer desk.
   *
   * Guarantees:
   * 1. Deterministic validation: checks chair signature and checksum integrity.
   * 2. Zero rewriting: findings and dissent pass through intact.
   * 3. Deduplication: duplicate delivery returns previous receipt (status='duplicate_ignored').
   * 4. Milestone events: emits transit and delivery events without artificial courier delay.
   */
  public async deliverPacket(
    packet: BenchPacket,
    options?: { simulateTamper?: boolean }
  ): Promise<PacketDeliveryReceipt> {
    const idempotencyKey = `${packet.runId}:${packet.benchId}:v${packet.packetVersion}`;

    // 1. Deduplication check: Duplicate delivery has exactly ONE logical effect
    if (this.deliveredPackets.has(idempotencyKey)) {
      const existingReceipt = this.deliveredPackets.get(idempotencyKey)!;
      return {
        ...existingReceipt,
        status: 'duplicate_ignored',
        isDuplicate: true
      };
    }

    // 2. Deterministic Validation
    const validationErrors: string[] = [];
    const expectedChair = getChairForBench(packet.benchId);

    if (packet.chairId !== expectedChair.id) {
      validationErrors.push(`Invalid chairId '${packet.chairId}' for Bench ${packet.benchId} (expected '${expectedChair.id}').`);
    }

    // Checksum validation
    const checksumPayload = JSON.stringify({
      packetId: packet.packetId,
      runId: packet.runId,
      benchId: packet.benchId,
      chairId: expectedChair.id,
      findings: packet.findings.map(f => ({ id: f.specialistId, title: f.title, summary: f.summary })),
      disagreements: packet.preservedDisagreements
    });
    const computedChecksum = crypto.createHash('sha256').update(checksumPayload).digest('hex');

    if (options?.simulateTamper || packet.packetChecksum !== computedChecksum) {
      validationErrors.push(`Packet checksum mismatch: expected ${computedChecksum}, got ${packet.packetChecksum}.`);
    }

    if (validationErrors.length > 0) {
      const rejectionReceipt: PacketDeliveryReceipt = {
        receiptId: `receipt-reject-${packet.packetId}-${Date.now()}`,
        packetId: packet.packetId,
        benchId: packet.benchId,
        runId: packet.runId,
        chairId: packet.chairId,
        deliveredAt: new Date().toISOString(),
        recipientId: 'PRESIDING_REVIEWER',
        status: 'rejected_invalid',
        isDuplicate: false,
        packetChecksum: packet.packetChecksum,
        validationErrors
      };
      return rejectionReceipt;
    }

    // 3. Emit Safe Milestone Events for 3D Chamber Animation (Non-blocking)
    // "Backend completion must never wait for a walking courier to reach a desk"
    const now = new Date().toISOString();

    this.emitMilestone('bench:packet_ready', {
      packetId: packet.packetId,
      benchId: packet.benchId,
      chairId: packet.chairId,
      runId: packet.runId,
      findingsCount: packet.findings.length,
      disagreementsCount: packet.preservedDisagreements.length
    });

    this.emitMilestone('messenger:transit_started', {
      messengerId: MESSENGER.id,
      packetId: packet.packetId,
      benchId: packet.benchId,
      sourceTable: `bench-${packet.benchId}`,
      destinationPodium: 'PRESIDING_REVIEWER',
      startedAt: now
    });

    this.emitMilestone('messenger:packet_delivered', {
      messengerId: MESSENGER.id,
      packetId: packet.packetId,
      benchId: packet.benchId,
      deliveredAt: now,
      recipient: 'PRESIDING_REVIEWER'
    });

    // 4. Create and Persist Acknowledgment Receipt
    const receipt: PacketDeliveryReceipt = {
      receiptId: `receipt-${packet.packetId}-${Date.now()}`,
      packetId: packet.packetId,
      benchId: packet.benchId,
      runId: packet.runId,
      chairId: packet.chairId,
      deliveredAt: now,
      recipientId: 'PRESIDING_REVIEWER',
      status: 'accepted',
      isDuplicate: false,
      packetChecksum: packet.packetChecksum,
      validationErrors: []
    };

    this.deliveredPackets.set(idempotencyKey, receipt);
    packet.status = 'delivered_to_presiding';

    return receipt;
  }

  private emitMilestone(eventType: string, payload: any): void {
    this.emittedMilestones.push({
      eventType,
      timestamp: new Date().toISOString(),
      payload
    });
  }

  public getEmittedMilestones(): MilestoneEventLog[] {
    return [...this.emittedMilestones];
  }

  public getReceipt(packetId: string): PacketDeliveryReceipt | undefined {
    for (const r of this.deliveredPackets.values()) {
      if (r.packetId === packetId) return r;
    }
    return undefined;
  }

  public clear(): void {
    this.deliveredPackets.clear();
    this.emittedMilestones = [];
  }
}

export const messengerService = new MessengerService();
