export type CharacterActivity =
  | 'idle_breathing'
  | 'attentive_listening'
  | 'seated_reading'
  | 'checking_source'
  | 'note_taking'
  | 'discussion_gesture'
  | 'packet_handoff'
  | 'messenger_locomotion';

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

export interface ActivityStateMap {
  specialists: Map<string, CharacterActivity>;
  messenger: CharacterActivity;
  presiding: CharacterActivity;
}
