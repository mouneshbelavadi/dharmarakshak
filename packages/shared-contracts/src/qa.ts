import { IndianLanguage } from './session.js';
import { EvidenceCitation, LegalAuthorityCitation } from './bench-packet.js';

export type QuestionMode = 'voice' | 'text';

export type QaAnswerStatus =
  | 'completed'
  | 'clarification_requested'
  | 'targeted_review_scheduled'
  | 'absent_from_documents'
  | 'stale_version_rejected';

export type QaSourceStatus = 'preliminary_unreviewed' | 'tribunal_verified';

export interface GroundedSourceAnchor {
  anchorId: string;
  sourceType: 'case_document' | 'statute_corpus' | 'precedent_corpus' | 'tribunal_finding';
  documentId?: string;
  documentTitle?: string;
  versionNumber?: number;
  pageNumber?: number;
  clauseReference?: string;
  excerpt: string;
  authorityReference?: LegalAuthorityCitation;
  isVerified: boolean;
  ocrConfidence?: number;
}

export interface TargetedReviewTask {
  taskId: string;
  runId?: string;
  caseId: string;
  snapshotVersion: number;
  targetSpecialistId: string;
  targetSpecialistName: string;
  benchId: 'A' | 'B' | 'C' | 'D' | 'E';
  questionPrompt: string;
  status: 'pending' | 'running' | 'completed';
  resultFindingId?: string;
  resultAnalysis?: string;
  scheduledAt: string;
  completedAt?: string;
}

export interface GroundedQuestionRequest {
  caseId: string;
  sessionId?: string;
  snapshotVersion?: number;
  questionText: string;
  documentScope?: 'all' | 'specific';
  targetDocumentId?: string;
  languagePreference?: IndianLanguage;
  mode?: QuestionMode;
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
  answerStatus: QaAnswerStatus;
  sourceStatus: QaSourceStatus;
  documentScope: 'all' | 'specific';
  targetDocumentId?: string;
  targetDocumentTitle?: string;
  isAmbiguousScope?: boolean;
  clarificationQuestion?: string;
  sources: GroundedSourceAnchor[];
  isPreliminaryBeforeFullReview: boolean; // Flagged when answered before all 5 benches finish
  missingInformationAcknowledged?: string;
  targetedReviewTask?: TargetedReviewTask;
  uncertaintyWarning?: string;
  isTranslated?: boolean;
  originalLanguageExcerpt?: string;
  latencyMs: number;
  timestamp: string;
}

