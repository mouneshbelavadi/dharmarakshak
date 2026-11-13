import { eventLedger } from '../events/event-ledger.js';
import {
  OriginLabel,
  PresentationMilestone,
  SpecialistVisibleState,
  PresentationCaseView,
  CharacterActivity
} from '@dharmaraksha/shared-contracts';

// Restricted field keys that must NEVER appear in presentation responses
const RESTRICTED_FIELDS = new Set([
  'deviceKey', 'apiKey', 'providerCredential', 'sessionToken',
  'internalPrompt', 'systemPrompt', 'rawLlmResponse', 'debugDiagnostics',
  'developerLog', 'stackTrace', 'envVariable', 'secretConfig'
]);

export class PresentationService {
  /**
   * Returns a sanitized case view for competition evaluators.
   * Server-side filtering: keys, prompts, diagnostics are STRIPPED here, not hidden in UI.
   */
  public getCasePresentation(caseId: string): PresentationCaseView {
    const events = eventLedger.getEventsAfterCursor(caseId, 0, 10000);

    // Build milestones from real events
    const milestones = this.buildMilestonesFromEvents(caseId, events);
    // Build specialist states from real events
    const specialistStates = this.buildSpecialistStatesFromEvents(events);
    // Build messenger state
    const messengerState = this.buildMessengerState(events);
    // Build presiding state
    const presidingState = this.buildPresidingState(events);
    // Build errors
    const errors = this.buildErrors(events);
    // Determine origin from events
    const origin = this.determineOrigin(events);

    return {
      caseId,
      documentSetId: `docset-${caseId}`,
      origin,
      currentSnapshotVersion: 1,
      status: this.determineOverallStatus(events),
      milestones,
      specialistStates,
      messengerState,
      presidingState,
      errors
    };
  }

  public getSpecialistActivityStates(caseId: string): SpecialistVisibleState[] {
    const events = eventLedger.getEventsAfterCursor(caseId, 0, 10000);
    return this.buildSpecialistStatesFromEvents(events);
  }

  public getMilestones(caseId: string): PresentationMilestone[] {
    const events = eventLedger.getEventsAfterCursor(caseId, 0, 10000);
    return this.buildMilestonesFromEvents(caseId, events);
  }

  /** Strip any restricted field from an arbitrary payload object */
  public static sanitizePayload(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map((item) => PresentationService.sanitizePayload(item));

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (RESTRICTED_FIELDS.has(key)) continue; // Server-side strip
      sanitized[key] = PresentationService.sanitizePayload(value);
    }
    return sanitized;
  }

  private determineOrigin(events: any[]): OriginLabel {
    const kioskEvent = events.find(
      (e) => e.eventType === 'kiosk:document_added' || e.eventType === 'kiosk:card_tapped'
    );
    return kioskEvent ? 'kiosk_capture' : 'laptop_upload';
  }

  private determineOverallStatus(events: any[]): string {
    const types = events.map((e) => e.eventType);
    if (types.includes('case:cancelled') || types.includes('case:run_canceled')) return 'cancelled';
    if (types.includes('presiding:synthesis_completed') || types.includes('presiding:synthesis_ready')) return 'review_complete';
    if (types.includes('presiding:synthesis_started')) return 'synthesis_in_progress';
    if (types.some((t: string) => t.startsWith('specialist:'))) return 'analysis_in_progress';
    if (types.includes('case:analysis_started')) return 'analysis_started';
    if (types.includes('case:snapshot_frozen')) return 'snapshot_frozen';
    return 'created';
  }

  private buildMilestonesFromEvents(caseId: string, events: any[]): PresentationMilestone[] {
    const milestones: PresentationMilestone[] = [];
    const origin = this.determineOrigin(events);
    const docSetId = `docset-${caseId}`;

    // Map real event types to milestones
    const milestoneMap: Array<{ eventType: string; name: string; description: string }> = [
      { eventType: 'case:created', name: 'Case Created', description: 'New case file opened' },
      { eventType: 'document:intake_finished', name: 'Document Intake Complete', description: 'All documents received and verified' },
      { eventType: 'case:snapshot_frozen', name: 'Snapshot Frozen', description: 'Evidence snapshot immutably sealed' },
      { eventType: 'case:analysis_started', name: 'Analysis Started', description: 'Tribunal benches have begun deliberation' },
      { eventType: 'bench:packet_sealed', name: 'Bench Packet Sealed', description: 'Bench findings consolidated into versioned packet' },
      { eventType: 'bench:packet_ready', name: 'Bench Packet Ready', description: 'Bench findings ready for messenger delivery' },
      { eventType: 'messenger:packet_delivered', name: 'Packet Delivered', description: 'Messenger delivered packet to Presiding Reviewer' },
      { eventType: 'presiding:synthesis_started', name: 'Synthesis Started', description: 'Presiding Reviewer began synthesizing accepted packets' },
      { eventType: 'presiding:synthesis_completed', name: 'Synthesis Complete', description: 'Final preliminary findings produced' },
      { eventType: 'report:ready_for_review', name: 'Report Ready', description: 'PDF report generated from validated findings' }
    ];

    for (const mm of milestoneMap) {
      const matchingEvents = events.filter((e) => e.eventType === mm.eventType);
      if (matchingEvents.length > 0) {
        for (const evt of matchingEvents) {
          milestones.push({
            milestoneId: evt.eventId,
            caseId,
            documentSetId: docSetId,
            origin,
            name: mm.name,
            description: mm.description,
            timestamp: evt.timestamp,
            status: 'completed'
          });
        }
      }
    }

    return milestones.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  private buildSpecialistStatesFromEvents(events: any[]): SpecialistVisibleState[] {
    const stateMap = new Map<string, SpecialistVisibleState>();

    for (const evt of events) {
      const payload = evt.payload as any;
      if (!payload?.specialistId) continue;

      const specId = payload.specialistId as string;
      const benchId = (payload.benchId || specId.charAt(0)) as 'A' | 'B' | 'C' | 'D' | 'E';

      let activity: CharacterActivity = 'idle_breathing';
      let taskStatus: 'idle' | 'assigned' | 'active' | 'completed' | 'failed' | 'cancelled' = 'idle';

      switch (evt.eventType) {
        case 'specialist:task_assigned':
          activity = 'attentive_listening';
          taskStatus = 'assigned';
          break;
        case 'specialist:task_started':
          activity = 'attentive_listening';
          taskStatus = 'active';
          break;
        case 'specialist:reading_evidence':
          activity = 'seated_reading';
          taskStatus = 'active';
          break;
        case 'specialist:checking_source':
          activity = 'checking_source';
          taskStatus = 'active';
          break;
        case 'specialist:writing_finding':
          activity = 'note_taking';
          taskStatus = 'active';
          break;
        case 'specialist:discussing':
          activity = 'discussion_gesture';
          taskStatus = 'active';
          break;
        case 'specialist:task_completed':
          activity = 'idle_breathing';
          taskStatus = 'completed';
          break;
        case 'specialist:task_failed':
          activity = 'idle_breathing';
          taskStatus = 'failed';
          break;
        case 'specialist:task_progress':
          activity = 'attentive_listening';
          taskStatus = 'active';
          break;
      }

      stateMap.set(specId, {
        specialistId: specId,
        benchId,
        activity,
        taskStatus,
        lastUpdated: evt.timestamp
      });
    }

    // Handle case cancellation — reset all to idle
    const cancelled = events.some(
      (e) => e.eventType === 'case:cancelled' || e.eventType === 'case:run_canceled'
    );
    if (cancelled) {
      for (const state of stateMap.values()) {
        state.activity = 'idle_breathing';
        state.taskStatus = 'cancelled';
      }
    }

    return Array.from(stateMap.values());
  }

  private buildMessengerState(events: any[]): {
    activity: CharacterActivity;
    inTransit: boolean;
    sourceBenchId?: string;
    lastUpdated: string;
  } {
    const now = new Date().toISOString();
    let inTransit = false;
    let activity: CharacterActivity = 'idle_breathing';
    let sourceBenchId: string | undefined;

    for (const evt of events) {
      if (evt.eventType === 'messenger:transit_started' || evt.eventType === 'messenger:in_transit') {
        inTransit = true;
        activity = 'messenger_locomotion';
        sourceBenchId = (evt.payload as any)?.sourceBenchId;
      }
      if (evt.eventType === 'messenger:packet_delivered' || evt.eventType === 'messenger:transit_handoff') {
        inTransit = false;
        activity = 'idle_breathing';
      }
    }

    // Cancelled resets
    if (events.some((e) => e.eventType === 'case:cancelled' || e.eventType === 'case:run_canceled')) {
      inTransit = false;
      activity = 'idle_breathing';
    }

    return { activity, inTransit, sourceBenchId, lastUpdated: now };
  }

  private buildPresidingState(events: any[]): {
    activity: CharacterActivity;
    synthesisStatus: 'awaiting' | 'in_progress' | 'completed' | 'failed';
    lastUpdated: string;
  } {
    const now = new Date().toISOString();
    let activity: CharacterActivity = 'idle_breathing';
    let synthesisStatus: 'awaiting' | 'in_progress' | 'completed' | 'failed' = 'awaiting';

    for (const evt of events) {
      if (evt.eventType === 'presiding:synthesis_started') {
        activity = 'seated_reading';
        synthesisStatus = 'in_progress';
      }
      if (evt.eventType === 'presiding:synthesis_completed' || evt.eventType === 'presiding:synthesis_ready') {
        activity = 'idle_breathing';
        synthesisStatus = 'completed';
      }
    }

    if (events.some((e) => e.eventType === 'case:cancelled' || e.eventType === 'case:run_canceled')) {
      activity = 'idle_breathing';
      synthesisStatus = 'awaiting';
    }

    return { activity, synthesisStatus, lastUpdated: now };
  }

  private buildErrors(events: any[]): Array<{
    benchId?: string;
    specialistId?: string;
    message: string;
    timestamp: string;
  }> {
    return events
      .filter(
        (e) => e.eventType === 'specialist:task_failed' || e.eventType === 'report:publication_blocked'
      )
      .map((e) => ({
        benchId: (e.payload as any)?.benchId,
        specialistId: (e.payload as any)?.specialistId,
        message: (e.payload as any)?.error || (e.payload as any)?.reason || 'Task failed',
        timestamp: e.timestamp
      }));
  }
}

export const presentationService = new PresentationService();
