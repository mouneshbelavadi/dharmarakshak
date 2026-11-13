import { DocumentCategory } from './document.js';

export type LegalSourceType = 'statute' | 'rule' | 'notification' | 'precedent';

export type JurisdictionScope =
  | 'union_of_india'
  | 'karnataka'
  | 'maharashtra'
  | 'delhi'
  | 'tamil_nadu'
  | 'telangana';

export interface CuratedLegalSource {
  sourceId: string;
  sourceType: LegalSourceType;
  shortCode: string;
  actOrInstrumentTitle: string;
  sectionOrItemNumber: string;
  jurisdiction: JurisdictionScope;
  effectiveDate: string;
  repealedDate?: string;
  lastReviewedDate: string;
  officialVerbatimText: string;
  provisionsSummary: string;
  isVerifiedAuthority: boolean;
  sourceLocationAnchor: string;
  applicableDocumentCategories: DocumentCategory[];
  tags: string[];
}

export interface EvidenceChunk {
  chunkId: string;
  caseId: string;
  snapshotVersion: number;
  documentId: string;
  documentTitle: string;
  parentDocumentId?: string;
  pageNumber: number;
  clauseReference?: string;
  text: string;
  sourceAnchor: string;
  scriptDetected?: string;
  containsDates?: string[];
  containsAmounts?: string[];
  containsNegation?: boolean;
  isTable?: boolean;
}

export interface RetrievalQuery {
  caseId: string;
  snapshotVersion?: number;
  queryText: string;
  documentScope?: 'all_documents' | 'single_document';
  targetDocumentId?: string;
  includeLegalCorpus?: boolean;
  targetJurisdiction?: JurisdictionScope;
  maxResults?: number;
}

export interface EvidenceRetrievalHit {
  sourceType: 'case_evidence';
  chunk: EvidenceChunk;
  score: number;
  matchReason: string;
}

export interface LegalAuthorityRetrievalHit {
  sourceType: 'legal_statute' | 'legal_precedent';
  authority: CuratedLegalSource;
  score: number;
  applicabilityStatus: 'verified_applicable' | 'wrong_jurisdiction' | 'stale_or_repealed' | 'uncertain_applicability';
  applicabilityNotes: string;
}

export interface MissingSourceLimitation {
  limitationId: string;
  category: 'missing_referenced_annexure' | 'missing_legal_provision' | 'unverified_statute' | 'out_of_jurisdiction';
  referencedItem: string;
  reason: string;
  clarificationPromptForUser: string;
}

export interface RetrievalResponse {
  caseId: string;
  snapshotVersion: number;
  queryText: string;
  evidenceHits: EvidenceRetrievalHit[];
  authorityHits: LegalAuthorityRetrievalHit[];
  missingSourceLimitations: MissingSourceLimitation[];
  searchMethod: 'lexical_bm25' | 'hybrid_semantic';
  retrievalTimestamp: string;
}

