import { Router, Request, Response } from 'express';
import { sourceRetrievalService } from '../services/source-retrieval-service.js';
import { curatedLegalCorpusService } from '../services/curated-legal-corpus.js';
import { casesStore } from '../storage/case-store.js';
import { JurisdictionScope } from '@dharmaraksha/shared-contracts';

export const retrievalRouter = Router();

// 1. Execute Authorized Retrieval Query over Case Documents & Legal Corpus
retrievalRouter.post('/cases/:id/retrieval/query', (req: Request, res: Response) => {
  const caseId = req.params.id;
  const {
    queryText,
    snapshotVersion,
    documentScope = 'all_documents',
    targetDocumentId,
    includeLegalCorpus = true,
    targetJurisdiction
  } = req.body;

  if (!queryText || typeof queryText !== 'string') {
    return res.status(400).json({ error: 'MISSING_QUERY', message: 'queryText is required.' });
  }

  // Authorization check
  const c = casesStore.get(caseId);
  if (!c) {
    return res.status(404).json({ error: 'CASE_NOT_FOUND', message: `Case ${caseId} not found.` });
  }

  try {
    const response = sourceRetrievalService.executeRetrieval({
      caseId,
      snapshotVersion,
      queryText,
      documentScope,
      targetDocumentId,
      includeLegalCorpus,
      targetJurisdiction: targetJurisdiction as JurisdictionScope
    });

    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: 'RETRIEVAL_FAILED', message: err.message });
  }
});

// 2. Resolve Exact Location Anchor (Evidence or Statute)
retrievalRouter.get('/cases/:id/retrieval/resolve-anchor', (req: Request, res: Response) => {
  const caseId = req.params.id;
  const anchor = req.query.anchor as string;

  if (!anchor) {
    return res.status(400).json({ error: 'MISSING_ANCHOR', message: 'anchor query param is required.' });
  }

  const resolved = sourceRetrievalService.resolveLocationAnchor(caseId, anchor);
  if (!resolved) {
    return res.status(404).json({ error: 'ANCHOR_NOT_FOUND', message: `Location anchor ${anchor} could not be resolved.` });
  }

  res.json({ success: true, ...resolved });
});

// 3. Browse / Search Curated Indian Legal Corpus
retrievalRouter.get('/retrieval/legal-corpus', (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const jurisdiction = req.query.jurisdiction as JurisdictionScope | undefined;
  const category = req.query.category as string | undefined;

  const results = curatedLegalCorpusService.searchCorpus(query, {
    jurisdiction,
    category,
    includeRepealed: req.query.includeRepealed === 'true'
  });

  res.json({
    totalCount: results.length,
    results
  });
});

// 4. Get Specific Curated Legal Source by ID or ShortCode
retrievalRouter.get('/retrieval/legal-corpus/:sourceId', (req: Request, res: Response) => {
  const source = curatedLegalCorpusService.getSourceByIdOrAnchor(req.params.sourceId);
  if (!source) {
    return res.status(404).json({ error: 'LEGAL_SOURCE_NOT_FOUND', message: `Source ${req.params.sourceId} not found in curated corpus.` });
  }

  res.json({ success: true, source });
});
