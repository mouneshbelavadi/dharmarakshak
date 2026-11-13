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
  status: SessionStatus;
  preferredLanguage: IndianLanguage;
  consentGiven: boolean;
  activeCaseId?: string;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
}

