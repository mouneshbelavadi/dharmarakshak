import {
  RetrievalQuery,
  RetrievalResponse,
  EvidenceRetrievalHit,
  LegalAuthorityRetrievalHit,
  MissingSourceLimitation,
  JurisdictionScope
} from '@dharmaraksha/shared-contracts';
import { casesStore } from '../storage/case-store.js';
import { evidenceIndexService } from './evidence-index-service.js';
import { curatedLegalCorpusService } from './curated-legal-corpus.js';

export class SourceRetrievalService {
  /**
   * Execute authorized multi-source retrieval over case evidence and curated Indian legal corpus
   */
  public executeRetrieval(query: RetrievalQuery): RetrievalResponse {
    const c = casesStore.get(query.caseId);
    if (!c) {
      throw new Error(`CASE_NOT_FOUND: Case ${query.caseId} does not exist.`);
    }

    const snapshotVer = query.snapshotVersion || c.currentSnapshotVersion;
    const targetJurisdiction: JurisdictionScope = query.targetJurisdiction || (c.preferredLanguage === 'kn' ? 'karnataka' : 'karnataka');

    // 1. Lexical retrieval over user case document evidence
    const evidenceHits: EvidenceRetrievalHit[] = evidenceIndexService.searchCaseEvidence({
      ...query,
      snapshotVersion: snapshotVer
    });

    // 2. Curated Indian legal authority retrieval
    const authorityHits: LegalAuthorityRetrievalHit[] = [];
    const missingSourceLimitations: MissingSourceLimitation[] = [];

    if (query.includeLegalCorpus !== false) {
      const legalMatches = curatedLegalCorpusService.searchCorpus(query.queryText, {
        includeRepealed: true // retrieve all so we can accurately flag repealed/stale statutes
      });

      for (const source of legalMatches) {
        const evalResult = curatedLegalCorpusService.evaluateApplicability(
          source,
          targetJurisdiction
        );

        const type: 'legal_statute' | 'legal_precedent' =
          source.sourceType === 'precedent' ? 'legal_precedent' : 'legal_statute';

        authorityHits.push({
          sourceType: type,
          authority: source,
          score: 1.0,
          applicabilityStatus: evalResult.status,
          applicabilityNotes: evalResult.notes
        });
      }

      // Check if query is looking for legal provisions that are NOT in the curated corpus
      if (
        authorityHits.length === 0 &&
        /\b(?:act|statute|section|law|precedent|high court|supreme court|ordinance)\b/i.test(query.queryText)
      ) {
        missingSourceLimitations.push({
          limitationId: `lim-law-${Date.now()}`,
          category: 'missing_legal_provision',
          referencedItem: query.queryText,
          reason: 'No verified statutory provision or judgment found in the curated Indian legal corpus for this query.',
          clarificationPromptForUser:
            'The requested legal authority is outside the verified corpus. DHARMARAKSHA does not fabricate unverified statutory citations. Please verify with official India Code gazettes or local counsel.'
        });
      }
    }

    // 3. Inspect case evidence for referenced attachments / annexures that are missing
    for (const doc of c.documents) {
      for (const page of doc.pages) {
        const text = page.reviewedText || page.extractedText || '';
        const annexureMatches = text.match(/\b(?:Annexure|Schedule|Exhibit)\s+[A-Z0-9]+\b/gi) || [];

        for (const match of annexureMatches) {
          const cleanMatch = match.trim();
          const hasMatchingDoc = c.documents.some(
            d => d.title.toLowerCase().includes(cleanMatch.toLowerCase())
          );

          if (!hasMatchingDoc) {
            const alreadyFlagged = missingSourceLimitations.some(
              lim => lim.referencedItem.toLowerCase() === cleanMatch.toLowerCase()
            );
            if (!alreadyFlagged) {
              missingSourceLimitations.push({
                limitationId: `lim-annex-${missingSourceLimitations.length + 1}`,
                category: 'missing_referenced_annexure',
                referencedItem: cleanMatch,
                reason: `${doc.title} (Page ${page.pageNumber}) references '${cleanMatch}', but no matching document or schedule was submitted.`,
                clarificationPromptForUser: `Please upload '${cleanMatch}' referenced in ${doc.title} to enable comprehensive evaluation of obligations and conditions.`
              });
            }
          }
        }
      }
    }

    return {
      caseId: query.caseId,
      snapshotVersion: snapshotVer,
      queryText: query.queryText,
      evidenceHits,
      authorityHits,
      missingSourceLimitations,
      searchMethod: 'lexical_bm25',
      retrievalTimestamp: new Date().toISOString()
    };
  }

  /**
   * Resolve an exact location anchor (evidence or statutory provision)
   */
  public resolveLocationAnchor(caseId: string, anchor: string): {
    found: boolean;
    anchorType: 'case_evidence' | 'legal_statute' | 'legal_precedent';
    title: string;
    locationLabel: string;
    verbatimText: string;
  } | null {
    if (anchor.startsWith('doc:')) {
      // e.g. "doc:doc-lease-01:v1:p2#para-1"
      const parts = anchor.split(':');
      const docId = parts[1];
      const pageNumStr = parts[3]?.split('#')[0]?.replace('p', '');
      const pageNum = parseInt(pageNumStr, 10);

      const c = casesStore.get(caseId);
      if (!c) return null;

      const doc = c.documents.find(d => d.documentId === docId);
      if (!doc) return null;

      const page = doc.pages.find(p => p.pageNumber === pageNum);
      if (!page) return null;

      return {
        found: true,
        anchorType: 'case_evidence',
        title: doc.title,
        locationLabel: `${doc.title} (Page ${pageNum})`,
        verbatimText: page.reviewedText || page.extractedText || ''
      };
    }

    if (anchor.startsWith('statute:') || anchor.startsWith('precedent:')) {
      const source = curatedLegalCorpusService.getSourceByIdOrAnchor(anchor);
      if (!source) return null;

      return {
        found: true,
        anchorType: source.sourceType === 'precedent' ? 'legal_precedent' : 'legal_statute',
        title: source.actOrInstrumentTitle,
        locationLabel: `${source.actOrInstrumentTitle} (${source.sectionOrItemNumber})`,
        verbatimText: source.officialVerbatimText
      };
    }

    return null;
  }
}

export const sourceRetrievalService = new SourceRetrievalService();
