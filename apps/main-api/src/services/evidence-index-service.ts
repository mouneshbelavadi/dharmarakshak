import { EvidenceChunk, EvidenceRetrievalHit, RetrievalQuery } from '@dharmaraksha/shared-contracts';
import { casesStore } from '../storage/case-store.js';

export class EvidenceIndexService {
  /**
   * Build indexed evidence chunks from a case's current active snapshot
   */
  public getCaseChunks(caseId: string, snapshotVersion?: number): EvidenceChunk[] {
    const c = casesStore.get(caseId);
    if (!c) return [];

    const targetVer = snapshotVersion || c.currentSnapshotVersion;
    const chunks: EvidenceChunk[] = [];

    for (const doc of c.documents) {
      for (const page of doc.pages) {
        // If passages are already segmented, use them
        if (page.passages && page.passages.length > 0) {
          for (let idx = 0; idx < page.passages.length; idx++) {
            const p = page.passages[idx];
            chunks.push({
              chunkId: `chk-${doc.documentId}-p${page.pageNumber}-${idx + 1}`,
              caseId,
              snapshotVersion: targetVer,
              documentId: doc.documentId,
              documentTitle: doc.title,
              parentDocumentId: doc.parentDocumentId,
              pageNumber: page.pageNumber,
              clauseReference: this.extractClauseReference(p.text),
              text: p.text,
              sourceAnchor: p.sourceAnchor || `doc:${doc.documentId}:v${targetVer}:p${page.pageNumber}#para-${idx + 1}`,
              scriptDetected: p.scriptDetected || page.scriptDetected,
              containsDates: p.containsDate,
              containsAmounts: p.containsAmount,
              containsNegation: p.containsNegation,
              isTable: p.isTable
            });
          }
        } else {
          // Fallback: segment full text into paragraph chunks
          const text = page.reviewedText || page.extractedText || '';
          const paras = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

          paras.forEach((para, idx) => {
            chunks.push({
              chunkId: `chk-${doc.documentId}-p${page.pageNumber}-${idx + 1}`,
              caseId,
              snapshotVersion: targetVer,
              documentId: doc.documentId,
              documentTitle: doc.title,
              parentDocumentId: doc.parentDocumentId,
              pageNumber: page.pageNumber,
              clauseReference: this.extractClauseReference(para),
              text: para,
              sourceAnchor: `doc:${doc.documentId}:v${targetVer}:p${page.pageNumber}#para-${idx + 1}`,
              scriptDetected: page.scriptDetected,
              containsNegation: /\b(?:shall not|neither|nor|no refund|prohibited)\b/i.test(para)
            });
          });
        }
      }
    }

    return chunks;
  }

  /**
   * Lexical search (BM25 algorithm with phrase and legal-entity boosting)
   */
  public searchCaseEvidence(query: RetrievalQuery): EvidenceRetrievalHit[] {
    const chunks = this.getCaseChunks(query.caseId, query.snapshotVersion);

    if (chunks.length === 0) return [];

    // Filter by single document scope if requested
    const targetChunks =
      query.documentScope === 'single_document' && query.targetDocumentId
        ? chunks.filter(c => c.documentId === query.targetDocumentId)
        : chunks;

    const queryTokens = this.tokenize(query.queryText);
    if (queryTokens.length === 0) return [];

    const totalDocs = targetChunks.length;
    const avgDocLength = targetChunks.reduce((sum, c) => sum + this.tokenize(c.text).length, 0) / totalDocs;

    // Calculate document frequencies for IDF
    const docFreq = new Map<string, number>();
    for (const token of queryTokens) {
      let count = 0;
      for (const chunk of targetChunks) {
        if (this.tokenize(chunk.text).includes(token)) {
          count++;
        }
      }
      docFreq.set(token, count);
    }

    const hits: EvidenceRetrievalHit[] = [];
    const k1 = 1.5;
    const b = 0.75;
    const lowerQuery = query.queryText.toLowerCase();

    for (const chunk of targetChunks) {
      const chunkTokens = this.tokenize(chunk.text);
      const docLength = chunkTokens.length;
      let bm25Score = 0;

      for (const token of queryTokens) {
        const df = docFreq.get(token) || 0;
        const idf = Math.log(1 + (totalDocs - df + 0.5) / (df + 0.5));
        const tf = chunkTokens.filter(t => t === token).length;

        if (tf > 0) {
          const numerator = tf * (k1 + 1);
          const denominator = tf + k1 * (1 - b + (b * docLength) / avgDocLength);
          bm25Score += idf * (numerator / denominator);
        }
      }

      // Bonus for exact phrase match
      if (lowerQuery.length > 4 && chunk.text.toLowerCase().includes(lowerQuery)) {
        bm25Score += 2.5;
      }

      // Bonus for matching clause numbers
      if (/\b(?:clause|section|article)\s*\d+/i.test(query.queryText)) {
        const clauseMatch = query.queryText.match(/\b(?:clause|section|article)\s*\d+/i)?.[0];
        if (clauseMatch && chunk.text.toLowerCase().includes(clauseMatch.toLowerCase())) {
          bm25Score += 3.0;
        }
      }

      if (bm25Score > 0.05) {
        hits.push({
          sourceType: 'case_evidence',
          chunk,
          score: Math.min(Number(bm25Score.toFixed(3)), 10.0),
          matchReason: `BM25 lexical match (score: ${bm25Score.toFixed(2)}) on ${chunk.documentTitle} Page ${chunk.pageNumber}`
        });
      }
    }

    // Sort descending by score
    hits.sort((a, b) => b.score - a.score);

    const limit = query.maxResults || 10;
    return hits.slice(0, limit);
  }

  /**
   * Helper to tokenize and normalize text
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter(t => t.length > 1 && !STOP_WORDS.has(t));
  }

  private extractClauseReference(text: string): string | undefined {
    const match = text.match(/^\s*(?:(?:Clause|Section|Article|Point)\s*)?(\d+(?:\.\d+)?)\s*[:.-]/i);
    return match ? `Clause ${match[1]}` : undefined;
  }
}

const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of', 'with', 'by', 'as', 'it'
]);

export const evidenceIndexService = new EvidenceIndexService();
