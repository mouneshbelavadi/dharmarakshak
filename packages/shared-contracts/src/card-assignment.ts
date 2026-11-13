export type CardLifecycleState =
  | 'unassigned_inventory'
  | 'issued_to_visitor'
  | 'active_session'
  | 'returned_cleared'
  | 'revoked_lost';

export interface CardRecord {
  cardUid: string; // Hex string from reader
  technology: 'nfc_mifare' | 'iso14443a' | 'rfid_13_56mhz' | 'simulated';
  state: CardLifecycleState;
  enrolledAt: string;
  lastTappedAt?: string;
  notes?: string;
}

export interface CardAssignment {
  assignmentId: string;
  cardUid: string;
  operatorId: string;
  visitorSessionId: string;
  caseId?: string;
  assignedAt: string;
  returnedAt?: string;
  revokedAt?: string;
  debounceWindowMs: number; // e.g. 3000ms debounce
}

export interface VisitorCardTicket {
  ticketId: string;
  cardUid: string;
  sessionId: string;
  issuedAt: string;
  expiresAt: string;
  isActive: boolean;
}

