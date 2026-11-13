import {
  CardRecord,
  CardAssignment,
  VisitorCardTicket,
  CardLifecycleState,
  VisitorSession,
  CaseRecord
} from '@dharmaraksha/shared-contracts';
import { authService } from '../auth/auth-service.js';
import { casesStore } from '../storage/case-store.js';
import { eventLedger } from '../events/event-ledger.js';

export interface TapResult {
  success: boolean;
  statusCode: number;
  error?: string;
  message: string;
  cardUid?: string;
  debounced?: boolean;
  firstTap?: boolean;
  session?: VisitorSession;
  caseId?: string;
  ticket?: VisitorCardTicket;
  readerMetadata?: {
    source: string;
    isSimulated: boolean;
  };
}

export class RfidSessionService {
  // Enrolled Card Inventory
  private cards: Map<string, CardRecord> = new Map([
    [
      'E280689420000000',
      {
        cardUid: 'E280689420000000',
        technology: 'nfc_mifare',
        state: 'active_session',
        enrolledAt: '2026-11-13T10:00:00.000Z',
        notes: 'Demo Visitor Card 1 (Active Lease Review)'
      }
    ],
    [
      'A140722130000000',
      {
        cardUid: 'A140722130000000',
        technology: 'nfc_mifare',
        state: 'active_session',
        enrolledAt: '2026-11-13T10:05:00.000Z',
        notes: 'Demo Visitor Card 2 (Agricultural Land)'
      }
    ],
    [
      'C309118450000000',
      {
        cardUid: 'C309118450000000',
        technology: 'nfc_mifare',
        state: 'unassigned_inventory',
        enrolledAt: '2026-11-13T10:10:00.000Z',
        notes: 'Spare Kiosk Inventory Card 3'
      }
    ],
    [
      'REV0000000000000',
      {
        cardUid: 'REV0000000000000',
        technology: 'nfc_mifare',
        state: 'revoked_lost',
        enrolledAt: '2026-11-13T09:00:00.000Z',
        notes: 'Permanently Revoked Card'
      }
    ],
    [
      'EXP9999999999999',
      {
        cardUid: 'EXP9999999999999',
        technology: 'nfc_mifare',
        state: 'issued_to_visitor',
        enrolledAt: '2026-11-13T08:00:00.000Z',
        notes: 'Expired Test Card'
      }
    ]
  ]);

  // Card Assignments History
  private assignments: Map<string, CardAssignment> = new Map([
    [
      'asgn-init-001',
      {
        assignmentId: 'asgn-init-001',
        cardUid: 'E280689420000000',
        operatorId: 'op-default',
        visitorSessionId: 'sess-visitor-001',
        caseId: 'case-demo-001',
        assignedAt: '2026-11-13T10:00:00.000Z',
        debounceWindowMs: 3000
      }
    ],
    [
      'asgn-init-002',
      {
        assignmentId: 'asgn-init-002',
        cardUid: 'A140722130000000',
        operatorId: 'op-default',
        visitorSessionId: 'sess-visitor-002',
        caseId: 'case-demo-002',
        assignedAt: '2026-11-13T10:05:00.000Z',
        debounceWindowMs: 3000
      }
    ],
    [
      'asgn-exp-999',
      {
        assignmentId: 'asgn-exp-999',
        cardUid: 'EXP9999999999999',
        operatorId: 'op-default',
        visitorSessionId: 'sess-expired-999',
        caseId: 'case-expired-999',
        assignedAt: '2026-11-13T08:00:00.000Z',
        debounceWindowMs: 3000
      }
    ]
  ]);

  // Active Visitor Tickets
  private tickets: Map<string, VisitorCardTicket> = new Map([
    [
      'tkt-init-001',
      {
        ticketId: 'tkt-init-001',
        cardUid: 'E280689420000000',
        sessionId: 'sess-visitor-001',
        issuedAt: '2026-11-13T10:00:00.000Z',
        expiresAt: new Date(Date.now() + 7200000).toISOString(),
        isActive: true
      }
    ],
    [
      'tkt-exp-999',
      {
        ticketId: 'tkt-exp-999',
        cardUid: 'EXP9999999999999',
        sessionId: 'sess-expired-999',
        issuedAt: '2026-11-13T08:00:00.000Z',
        expiresAt: '2026-11-13T08:30:00.000Z', // Expired in past
        isActive: true
      }
    ]
  ]);

  // Tap Debounce Ledger (cardUid -> { lastTappedAt: number, sessionId: string, caseId: string })
  private debounceLedger: Map<string, { lastTappedAt: number; sessionId: string; caseId: string }> = new Map();

  /**
   * Enroll a new physical or virtual RFID card UID into system inventory.
   */
  public enrollCard(
    cardUid: string,
    technology: 'nfc_mifare' | 'iso14443a' | 'rfid_13_56mhz' | 'simulated' = 'nfc_mifare',
    notes?: string
  ): CardRecord {
    const normalizedUid = cardUid.trim().toUpperCase();
    const existing = this.cards.get(normalizedUid);
    if (existing) {
      if (notes) existing.notes = notes;
      return existing;
    }

    const card: CardRecord = {
      cardUid: normalizedUid,
      technology,
      state: 'unassigned_inventory',
      enrolledAt: new Date().toISOString(),
      notes
    };
    this.cards.set(normalizedUid, card);
    console.log(`[RfidSessionService] Enrolled card ${normalizedUid} (${technology}) in unassigned inventory.`);
    return card;
  }

  /**
   * Issue an unassigned or returned card to a visitor.
   * Generates a fresh session, clean case, and visitor ticket.
   */
  public issueCard(
    cardUid: string,
    operatorId: string = 'operator-desk-1',
    expiryMinutes: number = 120
  ): { assignment: CardAssignment; ticket: VisitorCardTicket; session: VisitorSession; caseRecord: CaseRecord } {
    const normalizedUid = cardUid.trim().toUpperCase();
    const card = this.cards.get(normalizedUid);

    if (!card) {
      throw new Error(`UNKNOWN_CARD: Card UID ${normalizedUid} is not enrolled in inventory.`);
    }

    if (card.state === 'revoked_lost') {
      throw new Error(`CARD_REVOKED: Card ${normalizedUid} is marked lost or revoked.`);
    }

    if (card.state === 'active_session') {
      throw new Error(`CARD_ALREADY_ACTIVE: Card ${normalizedUid} has an active session. Return card before reissuing.`);
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiryMinutes * 60 * 1000).toISOString();
    const sessionId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const sessionToken = `tok-vis-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const caseId = `case-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const assignmentId = `asgn-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const ticketId = `tkt-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;

    // Create fresh isolated case for this visitor (zero previous data)
    const newCase: CaseRecord = {
      caseId,
      ownership: {
        caseId,
        creatorSessionId: sessionId,
        creatorRole: 'visitor',
        sourceType: 'kiosk',
        authorizedSessionIds: [sessionId]
      },
      title: 'Kiosk Document Review',
      status: 'draft_intake',
      currentSnapshotVersion: 1,
      preferredLanguage: 'en',
      documents: [],
      benchPackets: {},
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    casesStore.set(caseId, newCase);

    // Create fresh isolated VisitorSession (strictly visitor role)
    const newSession: VisitorSession = {
      sessionId,
      cardUid: normalizedUid,
      role: 'visitor',
      status: 'card_issued',
      preferredLanguage: 'en',
      consentGiven: false,
      activeCaseId: caseId,
      sessionToken,
      createdAt: now.toISOString(),
      lastActiveAt: now.toISOString(),
      expiresAt
    };
    authService.registerSession(newSession);

    // Record assignment
    const assignment: CardAssignment = {
      assignmentId,
      cardUid: normalizedUid,
      operatorId,
      visitorSessionId: sessionId,
      caseId,
      assignedAt: now.toISOString(),
      debounceWindowMs: 3000
    };
    this.assignments.set(assignmentId, assignment);

    // Record ticket
    const ticket: VisitorCardTicket = {
      ticketId,
      cardUid: normalizedUid,
      sessionId,
      issuedAt: now.toISOString(),
      expiresAt,
      isActive: true
    };
    this.tickets.set(ticketId, ticket);

    // Transition card lifecycle state
    card.state = 'issued_to_visitor';

    console.log(`[RfidSessionService] Issued card ${normalizedUid} to session ${sessionId} (Case ${caseId}).`);
    return { assignment, ticket, session: newSession, caseRecord: newCase };
  }

  /**
   * Handle incoming normalized RFID tap event from UNO Q gateway or verification harness.
   * Debounces repeated taps within 3,000ms to prevent duplicate sessions or analysis triggers.
   */
  public handleTapEvent(payload: {
    cardUid: string;
    readerSource: 'simulated' | 'physical_usb' | 'physical_mcu_bridge';
    isSimulated: boolean;
    tappedAt?: string;
  }): TapResult {
    const normalizedUid = payload.cardUid.trim().toUpperCase();
    const card = this.cards.get(normalizedUid);

    // 1. Unknown Card check
    if (!card) {
      return {
        success: false,
        statusCode: 404,
        error: 'UNKNOWN_CARD',
        message: `Card UID ${normalizedUid} is not registered in system inventory.`,
        readerMetadata: { source: payload.readerSource, isSimulated: payload.isSimulated }
      };
    }

    // 2. Revoked Card check
    if (card.state === 'revoked_lost') {
      return {
        success: false,
        statusCode: 403,
        error: 'CARD_REVOKED',
        message: `Card UID ${normalizedUid} has been reported lost or revoked.`,
        cardUid: normalizedUid,
        readerMetadata: { source: payload.readerSource, isSimulated: payload.isSimulated }
      };
    }

    const now = Date.now();

    // 3. Debounce Repeated Taps (3,000ms window)
    const existingDebounce = this.debounceLedger.get(normalizedUid);
    if (existingDebounce && now - existingDebounce.lastTappedAt < 3000) {
      const activeSession = this.getSessionById(existingDebounce.sessionId);
      console.log(`[RfidSessionService] Debounced tap for ${normalizedUid} within ${now - existingDebounce.lastTappedAt}ms.`);
      return {
        success: true,
        statusCode: 200,
        debounced: true,
        message: 'Repeated card tap debounced (3000ms window). Preserving current session.',
        cardUid: normalizedUid,
        session: activeSession ?? undefined,
        caseId: existingDebounce.caseId,
        readerMetadata: { source: payload.readerSource, isSimulated: payload.isSimulated }
      };
    }

    // 4. Resolve Active Assignment
    const activeAssignment = this.getActiveAssignment(normalizedUid);
    if (!activeAssignment) {
      if (card.state === 'unassigned_inventory' || card.state === 'returned_cleared') {
        return {
          success: false,
          statusCode: 400,
          error: 'CARD_NOT_ISSUED',
          message: `Card ${normalizedUid} is unassigned. Please have an operator issue this card before tapping.`,
          cardUid: normalizedUid,
          readerMetadata: { source: payload.readerSource, isSimulated: payload.isSimulated }
        };
      }
    }

    // 5. Expiry Check
    const activeTicket = this.getActiveTicket(normalizedUid);
    if (activeTicket && new Date(activeTicket.expiresAt).getTime() < now) {
      return {
        success: false,
        statusCode: 403,
        error: 'CARD_EXPIRED',
        message: `Card ${normalizedUid} session ticket has expired. Please return or reissue card at desk.`,
        cardUid: normalizedUid,
        readerMetadata: { source: payload.readerSource, isSimulated: payload.isSimulated }
      };
    }

    // 6. Valid Tap Processing
    const session = activeAssignment ? this.getSessionById(activeAssignment.visitorSessionId) : undefined;
    const caseId = activeAssignment?.caseId;

    let firstTap = false;
    if (card.state === 'issued_to_visitor') {
      // First tap after issuance activates the session
      card.state = 'active_session';
      firstTap = true;
      if (session) {
        session.status = 'tapped_awaiting_consent';
        session.lastActiveAt = new Date().toISOString();
      }
      if (caseId) {
        eventLedger.commitEventAtomically(caseId, 1, 'kiosk:card_tapped', {
          cardUid: normalizedUid,
          sessionId: session?.sessionId,
          readerSource: payload.readerSource,
          isSimulated: payload.isSimulated
        }, payload.isSimulated ? 'main_api' : 'uno_gateway');
      }
    } else if (card.state === 'active_session' && session) {
      session.lastActiveAt = new Date().toISOString();
    }

    // Record in debounce ledger
    if (session && caseId) {
      this.debounceLedger.set(normalizedUid, {
        lastTappedAt: now,
        sessionId: session.sessionId,
        caseId
      });
    }

    card.lastTappedAt = new Date().toISOString();

    return {
      success: true,
      statusCode: 200,
      debounced: false,
      firstTap,
      message: firstTap ? 'Card session activated successfully.' : 'Card session re-verified.',
      cardUid: normalizedUid,
      session: session ?? undefined,
      caseId,
      ticket: activeTicket || undefined,
      readerMetadata: { source: payload.readerSource, isSimulated: payload.isSimulated }
    };
  }

  /**
   * Return a card: marks assignment returned, completely clears visitor session and purges phone tokens.
   */
  public returnCard(cardUid: string, operatorId: string = 'operator-desk-1'): { success: boolean; cardUid: string; state: CardLifecycleState; message: string } {
    const normalizedUid = cardUid.trim().toUpperCase();
    const card = this.cards.get(normalizedUid);
    if (!card) {
      throw new Error(`UNKNOWN_CARD: Card ${normalizedUid} not found in inventory.`);
    }

    const activeAssignment = this.getActiveAssignment(normalizedUid);
    if (activeAssignment) {
      activeAssignment.returnedAt = new Date().toISOString();
      if (activeAssignment.caseId) {
        eventLedger.commitEventAtomically(activeAssignment.caseId, 1, 'kiosk:session_reset', {
          cardUid: normalizedUid,
          operatorId,
          timestamp: new Date().toISOString()
        }, 'main_api');
      }
    }

    const activeTicket = this.getActiveTicket(normalizedUid);
    if (activeTicket) {
      activeTicket.isActive = false;
    }

    // Completely invalidate session tokens in auth service
    authService.revokeSessionsForCard(normalizedUid);

    // Clear debounce ledger
    this.debounceLedger.delete(normalizedUid);

    // Transition card to returned_cleared (safe for re-issuance to next visitor)
    card.state = 'returned_cleared';
    console.log(`[RfidSessionService] Card ${normalizedUid} returned and cleared. Phone tokens purged.`);

    return {
      success: true,
      cardUid: normalizedUid,
      state: 'returned_cleared',
      message: 'Card returned, session cleared, and phone access revoked.'
    };
  }

  /**
   * Revoke a card (e.g. reported lost or damaged).
   */
  public revokeCard(cardUid: string, reason: string = 'Reported lost/stolen'): { success: boolean; cardUid: string; state: CardLifecycleState } {
    const normalizedUid = cardUid.trim().toUpperCase();
    const card = this.cards.get(normalizedUid);
    if (!card) {
      throw new Error(`UNKNOWN_CARD: Card ${normalizedUid} not found in inventory.`);
    }

    const activeAssignment = this.getActiveAssignment(normalizedUid);
    if (activeAssignment) {
      activeAssignment.revokedAt = new Date().toISOString();
    }

    const activeTicket = this.getActiveTicket(normalizedUid);
    if (activeTicket) {
      activeTicket.isActive = false;
    }

    authService.revokeSessionsForCard(normalizedUid);
    this.debounceLedger.delete(normalizedUid);

    card.state = 'revoked_lost';
    card.notes = card.notes ? `${card.notes} | Revoked: ${reason}` : `Revoked: ${reason}`;

    console.log(`[RfidSessionService] Card ${normalizedUid} revoked: ${reason}`);
    return { success: true, cardUid: normalizedUid, state: 'revoked_lost' };
  }

  public getCard(cardUid: string): CardRecord | null {
    return this.cards.get(cardUid.trim().toUpperCase()) || null;
  }

  public getInventory(): CardRecord[] {
    return Array.from(this.cards.values());
  }

  public getAssignments(): CardAssignment[] {
    return Array.from(this.assignments.values());
  }

  private getActiveAssignment(cardUid: string): CardAssignment | null {
    const list = Array.from(this.assignments.values())
      .filter((a) => a.cardUid === cardUid && !a.returnedAt && !a.revokedAt)
      .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());
    return list.length > 0 ? list[0] : null;
  }

  private getActiveTicket(cardUid: string): VisitorCardTicket | null {
    const list = Array.from(this.tickets.values())
      .filter((t) => t.cardUid === cardUid && t.isActive)
      .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
    return list.length > 0 ? list[0] : null;
  }

  private getSessionById(sessionId: string): VisitorSession | null {
    for (const s of authService.getAllSessions()) {
      if (s.sessionId === sessionId) return s;
    }
    return null;
  }
}

export const rfidSessionService = new RfidSessionService();
