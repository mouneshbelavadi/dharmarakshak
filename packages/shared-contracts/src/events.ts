export type CaseScopedEventType =
  | 'case:created'
  | 'case:snapshot_frozen'
  | 'case:snapshot_finalized'
  | 'case:status_transitioned'
  | 'case:analysis_started'
  | 'specialist:task_progress'
  | 'bench:packet_ready'
  | 'messenger:transit_started'
  | 'messenger:packet_delivered'
  | 'messenger:transit_handoff'
  | 'presiding:synthesis_started'
  | 'presiding:synthesis_completed'
  | 'presiding:synthesis_ready'
  | 'report:ready_for_review'
  | 'report:publication_blocked'
  | 'case:review_completed'
  | 'case:cancelled'
  | 'document:created'
  | 'document:page_added'
  | 'document:pages_reordered'
  | 'document:page_rotated'
  | 'document:text_corrected'
  | 'document:intake_finished'
  | 'kiosk:document_added'
  | 'kiosk:page_buffered'
  | 'kiosk:card_tapped'
  | 'kiosk:session_reset'
  | 'delivery:dispatched'
  | 'specialist:task_assigned'
  | 'specialist:task_started'
  | 'specialist:reading_evidence'
  | 'specialist:checking_source'
  | 'specialist:writing_finding'
  | 'specialist:discussing'
  | 'specialist:task_completed'
  | 'specialist:task_failed'
  | 'bench:packet_sealed'
  | 'messenger:in_transit'
  | 'case:run_canceled';

export interface CaseScopedEvent<T = unknown> {
  cursor: number; // Monotonically increasing 64-bit integer cursor
  eventId: string;
  eventType: CaseScopedEventType;
  caseId: string;
  snapshotVersion: number;
  originatingTier: 'main_api' | 'worker' | 'uno_gateway' | 'laptop_web';
  timestamp: string;
  payload: T;
}

export interface EventReplayRequest {
  caseId: string;
  afterCursor: number;
  limit?: number;
}

export interface StaleVersionRejection {
  rejected: true;
  reason: 'STALE_SNAPSHOT_VERSION';
  caseId: string;
  requestedVersion: number;
  currentActiveVersion: number;
  message: string;
}

