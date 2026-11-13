import { CaseRecord } from '@dharmaraksha/shared-contracts';

// Shared in-memory / persistent case store
export const casesStore: Map<string, CaseRecord> = new Map([
  [
    'case-demo-001',
    {
      caseId: 'case-demo-001',
      ownership: {
        caseId: 'case-demo-001',
        creatorSessionId: 'sess-visitor-001',
        creatorRole: 'visitor',
        sourceType: 'laptop_direct',
        authorizedSessionIds: ['sess-visitor-001']
      },
      title: 'Commercial Lease Agreement & Security Deposit Review',
      status: 'draft_intake',
      currentSnapshotVersion: 1,
      preferredLanguage: 'en',
      documents: [],
      benchPackets: {},
      presidingSummary: {
        executiveSummary: 'This preliminary legal review covers the 3-page Commercial Lease Agreement and 1-page Security Deposit Counterfoil.',
        keyObligations: ['Clause 4: Monthly rent of INR 45,000 payable strictly in advance on or before the 5th.'],
        materialRisks: ['Clause 12: Lessor reserves unilateral right to forfeit 100% of deposit upon early termination.'],
        criticalDeadlines: ['Rent Payment: 5th of every month'],
        inconsistenciesIdentified: ['Receipt indicates INR 2,70,000 paid whereas agreement states INR 2,50,000.'],
        questionsForVisitorClarification: ['Can you produce the stamped bank receipt for the additional INR 20,000 difference?'],
        missingDocumentsOrExhibits: ['Annexure A is missing from the scanned folio.'],
        statutoryCoverageLimitations: ['Karnataka Rent Control Act applicability requires local municipal notification confirmation.'],
        certifiedPlainLanguage: true,
        reviewedAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    }
  ],
  [
    'case-demo-002',
    {
      caseId: 'case-demo-002',
      ownership: {
        caseId: 'case-demo-002',
        creatorSessionId: 'sess-visitor-002',
        creatorRole: 'visitor',
        sourceType: 'kiosk',
        authorizedSessionIds: ['sess-visitor-002']
      },
      title: 'Agricultural Land Lease Agreement',
      status: 'documents_submitted',
      currentSnapshotVersion: 1,
      preferredLanguage: 'hi',
      documents: [],
      benchPackets: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
]);
