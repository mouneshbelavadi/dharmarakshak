import { IndianLanguage } from './session.js';
import { EvidenceCitation, LegalAuthorityCitation } from './bench-packet.js';

export type QuestionMode = 'voice' | 'text';

export interface GroundedSourceAnchor {
  anchorId: string;
  sourceType: 'case_document' | 'statute_corpus' | 'precedent_corpus';
  documentId?: string;
  documentTitle?: string;
  pageNumber?: number;
  clauseReference?: string;
  excerpt: string;
  authorityReference?: LegalAuthorityCitation;
}

export interface QuestionAnswerTurn {
  turnId: string;
  caseId: string;
  snapshotVersion: number;
  sessionId: string;
  mode: QuestionMode;
  language: IndianLanguage;
  questionText: string;
  questionAudioUrl?: string; // Captured voice if STT was used
  answerText: string;
  answerAudioUrl?: string; // Synthesized speech if TTS was generated
  sources: GroundedSourceAnchor[];
  isPreliminaryBeforeFullReview: boolean; // Flagged when answered before all 5 benches finish
  missingInformationAcknowledged?: string;
  latencyMs: number;
  timestamp: string;
}

