export type IndianLanguage =
  | 'en' // English
  | 'hi' // Hindi
  | 'kn' // Kannada
  | 'ta' // Tamil
  | 'te' // Telugu
  | 'bn' // Bengali
  | 'mr' // Marathi
  | 'gu' // Gujarati
  | 'ml' // Malayalam
  | 'pa' // Punjabi
  | 'or'; // Odia

export type UserRole = 'visitor' | 'operator' | 'admin' | 'evaluator';

export type SessionStatus =
  | 'card_issued'
  | 'tapped_awaiting_consent'
  | 'active'
  | 'scanning'
  | 'reviewing'
  | 'analyzing'
  | 'qa_ready'
  | 'completed'
  | 'expired'
  | 'revoked';

export interface CardInfo {
  cardUid: string;
  issuedAt: string;
  expiresAt: string;
  operatorId: string;
  isAssigned: boolean;
}

export interface VisitorSession {
  sessionId: string;
  cardUid: string;
  pairingId?: string; // Bound kiosk phone
  role: UserRole;
  status: SessionStatus;
  preferredLanguage: IndianLanguage;
  consentGiven: boolean;
  consentTimestamp?: string;
  activeCaseId?: string;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  sessionToken: string; // Short-lived session token (ephemeral browser cookie/header)
}

export interface SessionAuthContext {
  sessionId: string;
  role: UserRole;
  cardUid?: string;
  caseId?: string;
  expiresAt: string;
}
