/**
 * Phase 18: Activity State Engine
 * Maps persisted backend task state → 3D character animation activity.
 * RULE: Idle breathing is the ONLY default. Work animations ONLY when backend confirms active work.
 */

import { CharacterActivity } from './types.js';

export type BackendTaskPhase =
  | 'unassigned'
  | 'waiting'
  | 'assigned'
  | 'queued'
  | 'reading_evidence'
  | 'checking_source'
  | 'writing_finding'
  | 'discussing'
  | 'contradiction_round'
  | 'sealing_packet'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type MessengerPhase = 'idle' | 'in_transit' | 'delivered' | 'returned';
export type PresidingPhase = 'awaiting_packets' | 'synthesis_active' | 'synthesis_complete' | 'failed';

/**
 * Map a specialist's backend task state to the correct animation activity.
 * NEVER returns a work animation for idle/waiting/completed/failed states.
 */
export function mapTaskStateToActivity(taskPhase: BackendTaskPhase, isChair: boolean = false): CharacterActivity {
  switch (taskPhase) {
    case 'unassigned':
    case 'waiting':
      return 'idle_breathing'; // Harmless ambient only
    case 'assigned':
    case 'queued':
      return 'attentive_listening';
    case 'reading_evidence':
      return 'seated_reading';
    case 'checking_source':
      return 'checking_source';
    case 'writing_finding':
      return 'note_taking';
    case 'discussing':
    case 'contradiction_round':
      return 'discussion_gesture';
    case 'sealing_packet':
      return isChair ? 'packet_handoff' : 'note_taking';
    case 'completed':
    case 'failed':
    case 'cancelled':
      return 'idle_breathing'; // Back to ambient — no fake work
    default:
      return 'idle_breathing';
  }
}

/**
 * Map Messenger delivery state to animation.
 * Locomotion ONLY during confirmed in_transit. Everything else is idle.
 */
export function mapMessengerState(messengerPhase: MessengerPhase): CharacterActivity {
  switch (messengerPhase) {
    case 'in_transit':
      return 'messenger_locomotion';
    case 'idle':
    case 'delivered':
    case 'returned':
    default:
      return 'idle_breathing';
  }
}

/**
 * Map Presiding Reviewer synthesis state to animation.
 */
export function mapPresidingState(presidingPhase: PresidingPhase): CharacterActivity {
  switch (presidingPhase) {
    case 'awaiting_packets':
      return 'attentive_listening';
    case 'synthesis_active':
      return 'seated_reading';
    case 'synthesis_complete':
    case 'failed':
    default:
      return 'idle_breathing';
  }
}

export interface ChamberAnimationState {
  specialistActivities: Map<string, CharacterActivity>;
  messengerActivity: CharacterActivity;
  presidingActivity: CharacterActivity;
}

/**
 * Build complete chamber animation state from backend specialist states.
 * This is the single source of truth for all character animations.
 */
export function buildChamberState(
  specialistStates: Array<{ specialistId: string; activity: string; taskStatus: string }>,
  messengerState: { activity: string; inTransit: boolean },
  presidingState: { activity: string; synthesisStatus: string }
): ChamberAnimationState {
  const specialistActivities = new Map<string, CharacterActivity>();
  const validActivities: CharacterActivity[] = [
    'idle_breathing',
    'attentive_listening',
    'seated_reading',
    'checking_source',
    'note_taking',
    'discussion_gesture',
    'packet_handoff',
    'messenger_locomotion'
  ];

  for (const s of specialistStates) {
    const activity = validActivities.includes(s.activity as CharacterActivity)
      ? (s.activity as CharacterActivity)
      : 'idle_breathing';
    specialistActivities.set(s.specialistId, activity);
  }

  const messengerActivity: CharacterActivity = messengerState.inTransit ? 'messenger_locomotion' : 'idle_breathing';
  const presidingActivity: CharacterActivity =
    presidingState.synthesisStatus === 'in_progress'
      ? 'seated_reading'
      : presidingState.synthesisStatus === 'awaiting'
      ? 'attentive_listening'
      : 'idle_breathing';

  return { specialistActivities, messengerActivity, presidingActivity };
}
