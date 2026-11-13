import { Router, Request, Response } from 'express';
import { CaseRecord, CaseStatus } from '@dharmaraksha/shared-contracts';

export const casesRouter = Router();

// In-memory placeholder store for initial development baseline
const placeholderCases: Map<string, CaseRecord> = new Map([
  [
    'case-demo-001',
    {
      caseId: 'case-demo-001',
      ownership: {
        caseId: 'case-demo-001',
        creatorSessionId: 'sess-001',
        creatorRole: 'visitor',
        sourceType: 'laptop_direct',
        authorizedSessionIds: ['sess-001']
      },
      title: 'Commercial Lease Agreement & Security Deposit Review',
      status: 'review_complete' as CaseStatus,
      currentSnapshotVersion: 1,
      preferredLanguage: 'en',
      documents: [],
      benchPackets: {},
      presidingSummary: {
        executiveSummary: 'Initial sample case loaded for baseline verification.',
        keyObligations: ['Clause 4: Monthly rent payable by 5th of each calendar month.'],
        materialRisks: ['Clause 12: Unilateral forfeiture of 6 months deposit upon early termination.'],
        criticalDeadlines: ['30 days advance written notice required prior to lease renewal.'],
        inconsistenciesIdentified: ['Receipt indicates INR 2,50,000 paid whereas agreement states INR 2,00,000.'],
        questionsForVisitorClarification: ['Do you possess the bank counterfoil for the initial token deposit?'],
        missingDocumentsOrExhibits: ['Annexure B (Inventory schedule) referenced in Section 2 is missing.'],
        statutoryCoverageLimitations: ['Karnataka Rent Control Act applicability requires physical court registration confirmation.'],
        certifiedPlainLanguage: true,
        reviewedAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    }
  ]
]);

casesRouter.get('/cases', (_req: Request, res: Response) => {
  res.json({ cases: Array.from(placeholderCases.values()) });
});

casesRouter.get('/cases/:id', (req: Request, res: Response) => {
  const c = placeholderCases.get(req.params.id);
  if (!c) {
    return res.status(404).json({ error: 'Case not found' });
  }
  res.json(c);
});
