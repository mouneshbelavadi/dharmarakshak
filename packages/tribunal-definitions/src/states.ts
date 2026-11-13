export type SpecialistStatus =
  | 'idle'
  | 'queued'
  | 'active'
  | 'completed'
  | 'flagged_discrepancy'
  | 'unassigned'
  | 'failed';

export type BenchStatus =
  | 'idle'
  | 'in_progress'
  | 'packet_ready'
  | 'delivered'
  | 'completed'
  | 'partial_warning';

export type ActivityType =
  | 'listening'
  | 'reading'
  | 'checking_evidence'
  | 'note_taking'
  | 'discussion_gesture'
  | 'handing_over_packet'
  | 'idle_seated';

