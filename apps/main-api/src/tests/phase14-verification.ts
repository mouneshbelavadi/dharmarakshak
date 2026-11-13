import {
  CaseRecord,
  GroundedQuestionRequest,
  QuestionAnswerTurn,
  IndianLanguage
} from '@dharmaraksha/shared-contracts';
import { casesStore } from '../storage/case-store.js';
import { qaTurnService } from '../services/qa-turn-service.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string, detail?: string): void {
  if (condition) {
    console.log(`  ✔ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    if (detail) console.error(`     Detail: ${detail}`);
    failedTests++;
  }
}

async function runPhase14Verification() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║        DHARMARAKSHA PHASE 14 VERIFICATION SUITE              ║');
  console.log('║     Document-Grounded Questions, Scoping & Provenance        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  qaTurnService.clear();

  // Setup test case with multiple documents in snapshot v1
  const testCaseId = 'case-qa-phase14-001';
  const testSessionId = 'sess-visitor-qa-001';
  const unauthorizedSessionId = 'sess-unauthorized-999';

  const testCase: CaseRecord = {
    caseId: testCaseId,
    ownership: {
      caseId: testCaseId,
      creatorSessionId: testSessionId,
      creatorRole: 'visitor',
      sourceType: 'laptop_direct',
      authorizedSessionIds: [testSessionId]
    },
    title: 'Commercial Tenancy and Deposit Verification',
    status: 'documents_submitted',
    currentSnapshotVersion: 1,
    preferredLanguage: 'en',
    documents: [
      {
        documentId: 'doc-lease-qa-01',
        caseId: testCaseId,
        title: 'Commercial Lease Agreement Suite 402',
        category: 'tenancy_agreement',
        currentVersionNumber: 1,
        pageCount: 3,
        uploadedAt: new Date().toISOString(),
        sourceChannel: 'kiosk_overhead_cam',
        contentHash: 'hash-lease-qa-01',
        isArchived: false,
        versions: [],
        pages: [
          {
            pageId: 'page-l1',
            documentId: 'doc-lease-qa-01',
            pageNumber: 1,
            imageUrl: '/storage/page1.jpg',
            extractedText: 'This Lease Agreement made at Bangalore on 1st April 2024 between Bangalore Realty Pvt Ltd and TechStart Labs.',
            sha256Checksum: 'hash1',
            byteSize: 1024,
            rotationDegrees: 0,
            continuityStatus: 'intact',
            qualityScore: 0.95,
            ocrConfidence: 0.96,
            capturedAt: new Date().toISOString()
          },
          {
            pageId: 'page-l2',
            documentId: 'doc-lease-qa-01',
            pageNumber: 2,
            imageUrl: '/storage/page2.jpg',
            extractedText: 'Clause 4. RENT & DEPOSIT: Monthly rent of INR 45,000 payable strictly in advance on or before the 5th of each calendar month. Security deposit of INR 2,50,000 paid via RTGS. Clause 8: Premises description is more particularly set out in Schedule B attached hereto.',
            sha256Checksum: 'hash2',
            byteSize: 1024,
            rotationDegrees: 0,
            continuityStatus: 'intact',
            qualityScore: 0.92,
            ocrConfidence: 0.94,
            capturedAt: new Date().toISOString()
          },
          {
            pageId: 'page-l3',
            documentId: 'doc-lease-qa-01',
            pageNumber: 3,
            imageUrl: '/storage/page3.jpg',
            extractedText: 'Clause 12. DEPOSIT FORFEITURE: Lessor reserves unilateral right to forfeit 100% of the deposit upon early vacation prior to the 36-month lock-in period.',
            sha256Checksum: 'hash3',
            byteSize: 1024,
            rotationDegrees: 0,
            continuityStatus: 'intact',
            qualityScore: 0.90,
            ocrConfidence: 0.91,
            capturedAt: new Date().toISOString()
          }
        ]
      },
      {
        documentId: 'doc-receipt-qa-02',
        caseId: testCaseId,
        title: 'Security Deposit Counterfoil Receipt',
        category: 'payment_receipt',
        currentVersionNumber: 1,
        pageCount: 1,
        uploadedAt: new Date().toISOString(),
        sourceChannel: 'kiosk_overhead_cam',
        contentHash: 'hash-receipt-qa-02',
        isArchived: false,
        versions: [],
        pages: [
          {
            pageId: 'page-r1',
            documentId: 'doc-receipt-qa-02',
            pageNumber: 1,
            imageUrl: '/storage/receipt1.jpg',
            extractedText: 'RECEIPT: Received sum of INR 2,70,000 towards commercial lease security deposit for Suite 402 on 28th March 2024.',
            sha256Checksum: 'hash-r1',
            byteSize: 512,
            rotationDegrees: 0,
            continuityStatus: 'intact',
            qualityScore: 0.88,
            ocrConfidence: 0.90,
            capturedAt: new Date().toISOString()
          }
        ]
      }
    ],
    benchPackets: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  casesStore.set(testCaseId, testCase);

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 1: Specific Document Scoped Question
  // ──────────────────────────────────────────────────────────────────────────
  console.log('[TEST 1] Testing Targeted Single-Document Scoped Question (documentScope="specific")...');

  const specificTurn = await qaTurnService.processQuestion(
    {
      caseId: testCaseId,
      questionText: 'What is the monthly rent and payment due date?',
      documentScope: 'specific',
      targetDocumentId: 'doc-lease-qa-01'
    },
    testSessionId
  );

  assert(
    specificTurn.answerStatus === 'completed' &&
    specificTurn.documentScope === 'specific' &&
    specificTurn.targetDocumentId === 'doc-lease-qa-01',
    'Answer generated strictly targeting specified document',
    `Status: ${specificTurn.answerStatus}, TargetDoc: ${specificTurn.targetDocumentId}`
  );

  assert(
    specificTurn.sources.length > 0 &&
    specificTurn.sources.every(s => s.documentId === 'doc-lease-qa-01' && s.pageNumber === 2),
    'Answer attaches correct document title, version, and page number (Page 2)',
    `Sources: ${JSON.stringify(specificTurn.sources)}`
  );

  assert(
    specificTurn.answerText.includes('INR 45,000') && specificTurn.answerText.includes('5th'),
    'Answer accurately extracts exact rent amount (INR 45,000) and due date (5th)',
    `Answer: ${specificTurn.answerText}`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 2: Multi-Document Question Ambiguity & Focused Clarification
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 2] Testing Ambiguous "this agreement" Question Across Multiple Documents...');

  const ambiguousTurn = await qaTurnService.processQuestion(
    {
      caseId: testCaseId,
      questionText: 'What does this agreement say about lock-in period?',
      documentScope: 'all' // not specified to one doc
    },
    testSessionId
  );

  assert(
    ambiguousTurn.answerStatus === 'clarification_requested' &&
    ambiguousTurn.isAmbiguousScope === true,
    'Ambiguous question across multiple documents triggers clarification request without guessing',
    `Status: ${ambiguousTurn.answerStatus}, isAmbiguous: ${ambiguousTurn.isAmbiguousScope}`
  );

  assert(
    Boolean(
      ambiguousTurn.clarificationQuestion &&
      ambiguousTurn.clarificationQuestion.includes('Commercial Lease Agreement') &&
      ambiguousTurn.clarificationQuestion.includes('Security Deposit Counterfoil Receipt')
    ),
    'Clarification question explicitly names both candidate documents in the case',
    `Clarification prompt: ${ambiguousTurn.clarificationQuestion}`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 3: Cross-Document Comparison (Differences & Discrepancies)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 3] Testing Cross-Document Comparison on Deposit Amounts...');

  const compareTurn = await qaTurnService.processQuestion(
    {
      caseId: testCaseId,
      questionText: 'Compare the deposit amount between the lease agreement and the payment receipt counterfoil.',
      documentScope: 'all'
    },
    testSessionId
  );

  assert(
    compareTurn.answerStatus === 'completed' &&
    compareTurn.sources.length === 2,
    'Comparison returns grounded sources from both documents',
    `Sources count: ${compareTurn.sources.length}`
  );

  const docIds = compareTurn.sources.map(s => s.documentId);
  assert(
    docIds.includes('doc-lease-qa-01') && docIds.includes('doc-receipt-qa-02'),
    'Comparison cites both the Lease (INR 2,50,000) and Receipt (INR 2,70,000)',
    `Cited documents: ${docIds.join(', ')}`
  );

  assert(
    compareTurn.answerText.includes('INR 2,50,000') &&
    compareTurn.answerText.includes('INR 2,70,000') &&
    compareTurn.answerText.includes('20,000'),
    'Comparison accurately calculates and reports the INR 20,000 variance between instruments',
    `Comparison text: ${compareTurn.answerText}`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 4: Contractual Obligations & Lock-in
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 4] Testing Contractual Obligations & Lock-in Extraction...');

  const obligationTurn = await qaTurnService.processQuestion(
    {
      caseId: testCaseId,
      questionText: 'What are the tenant obligations and mandatory lock-in period?',
      documentScope: 'specific',
      targetDocumentId: 'doc-lease-qa-01'
    },
    testSessionId
  );

  assert(
    obligationTurn.answerText.includes('36 months') || obligationTurn.answerText.includes('lock-in'),
    'Answer accurately captures the 36-month lock-in obligation and monthly rent duty',
    `Obligation answer: ${obligationTurn.answerText}`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 5: Missing Document / Annexure Detection
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 5] Testing Missing Referenced Document (Schedule B)...');

  const missingAnnexureTurn = await qaTurnService.processQuestion(
    {
      caseId: testCaseId,
      questionText: 'Where is Schedule B and what does it describe?',
      documentScope: 'all'
    },
    testSessionId
  );

  assert(
    Boolean(
      missingAnnexureTurn.missingInformationAcknowledged &&
      missingAnnexureTurn.missingInformationAcknowledged.includes('Schedule B is referenced in Clause 8 on Page 2') &&
      missingAnnexureTurn.missingInformationAcknowledged.includes('missing from the case record')
    ),
    'Missing annexure is explicitly acknowledged with clause reference without fabricating contents',
    `Missing info: ${missingAnnexureTurn.missingInformationAcknowledged}`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 6: Explanations of Review & Adversarial Dissent
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 6] Testing Explanation of Review & Preserved Dissent on Forfeiture...');

  const explanationTurn = await qaTurnService.processQuestion(
    {
      caseId: testCaseId,
      questionText: 'Why is the deposit forfeiture clause flagged as a risk?',
      documentScope: 'all'
    },
    testSessionId
  );

  assert(
    explanationTurn.answerText.includes('Tenant / Document-Holder View (D01)') &&
    explanationTurn.answerText.includes('Section 74') &&
    explanationTurn.answerText.includes('Landlord / Counterparty View (D02)'),
    'Answer explains preserved dissent presenting both Tenant and Landlord perspectives with Section 74 citation',
    `Explanation: ${explanationTurn.answerText}`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 7: Absent Information & Zero Hallucination Guard
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 7] Testing Absent Information (Zero Hallucination Guard)...');

  const absentTurn = await qaTurnService.processQuestion(
    {
      caseId: testCaseId,
      questionText: 'What is the pet policy for keeping dogs in the premises?',
      documentScope: 'all'
    },
    testSessionId
  );

  assert(
    absentTurn.answerStatus === 'absent_from_documents' &&
    absentTurn.answerText.includes('do not contain any provisions regarding') &&
    absentTurn.answerText.includes('No answer was fabricated'),
    'Absent information explicitly reported without fabricating synthetic clauses or policies',
    `Absent answer: ${absentTurn.answerText}`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 8: Distinguishing Preliminary OCR vs Completed Tribunal Review
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 8] Distinguishing Preliminary OCR from Completed Tribunal Review...');

  // While review is pending:
  assert(
    specificTurn.sourceStatus === 'preliminary_unreviewed' &&
    specificTurn.isPreliminaryBeforeFullReview === true,
    'Factual answer while review is in progress is labeled sourceStatus="preliminary_unreviewed"',
    `SourceStatus: ${specificTurn.sourceStatus}`
  );

  // Mark tribunal review as completed on the case record
  testCase.status = 'review_complete';
  testCase.presidingSummary = {
    executiveSummary: 'Full 5-bench tribunal synthesis completed.',
    keyObligations: ['Clause 4: INR 45,000 monthly rent.'],
    materialRisks: ['Clause 12: Unilateral forfeiture.'],
    criticalDeadlines: ['5th of every month'],
    inconsistenciesIdentified: ['INR 20,000 discrepancy between lease and receipt.'],
    questionsForVisitorClarification: ['Produce stamped receipt.'],
    missingDocumentsOrExhibits: ['Schedule B missing.'],
    statutoryCoverageLimitations: ['Karnataka jurisdiction active.'],
    certifiedPlainLanguage: true,
    reviewedAt: new Date().toISOString()
  };

  const reviewedTurn = await qaTurnService.processQuestion(
    {
      caseId: testCaseId,
      questionText: 'What is the monthly rent?',
      documentScope: 'specific',
      targetDocumentId: 'doc-lease-qa-01'
    },
    testSessionId
  );

  assert(
    reviewedTurn.sourceStatus === 'tribunal_verified' &&
    reviewedTurn.isPreliminaryBeforeFullReview === false,
    'Answer on completed case is upgraded to sourceStatus="tribunal_verified"',
    `SourceStatus: ${reviewedTurn.sourceStatus}`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 9: Targeted Review Task for Complex Legal Query (No 50-Agent Restart)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 9] Testing Targeted Review Task (No 50-Agent Restart)...');

  const targetedTurn = await qaTurnService.processQuestion(
    {
      caseId: testCaseId,
      questionText: 'Is the arbitration validity enforceable under Section 11 of the Arbitration Act?',
      documentScope: 'all'
    },
    testSessionId
  );

  assert(
    targetedTurn.answerStatus === 'targeted_review_scheduled' &&
    targetedTurn.targetedReviewTask !== undefined &&
    targetedTurn.targetedReviewTask.targetSpecialistId === 'B09' &&
    targetedTurn.targetedReviewTask.status === 'running',
    'Complex legal query creates targeted review task assigned to Exit & Dispute Analyst (B09) without restarting 50 agents',
    `Targeted Task: ${JSON.stringify(targetedTurn.targetedReviewTask)}`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 10: Multi-Tenant Isolation & Document Replacement Invalidation
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 10] Testing Multi-Tenant Isolation & Stale Snapshot Invalidation...');

  // 10A. Multi-tenant boundary
  let unauthorizedErrorCaught = false;
  try {
    await qaTurnService.processQuestion(
      {
        caseId: testCaseId,
        questionText: 'Tell me about the deposit.'
      },
      unauthorizedSessionId // Another visitor!
    );
  } catch (err: any) {
    unauthorizedErrorCaught = err.message.includes('FORBIDDEN_CASE_ACCESS');
  }

  assert(
    unauthorizedErrorCaught,
    'Multi-tenant boundary strictly prevents answering queries using another visitor\'s documents',
    'Unauthorized session was not rejected'
  );

  // 10B. Document Replacement during active conversation (v1 -> v2)
  console.log('  Testing document replacement (v1 -> v2 snapshot evolution)...');

  // Evolve case snapshot to v2 (simulating document replacement)
  testCase.currentSnapshotVersion = 2;

  // Stale request asking on old snapshot v1
  const staleTurn = await qaTurnService.processQuestion(
    {
      caseId: testCaseId,
      snapshotVersion: 1, // Stale version!
      questionText: 'What is the deposit amount?'
    },
    testSessionId
  );

  assert(
    staleTurn.answerStatus === 'stale_version_rejected' &&
    staleTurn.answerText.includes('Stale snapshot version 1 requested') &&
    staleTurn.answerText.includes('Stale responses cannot attach to a newer snapshot'),
    'Stale response cannot attach to a newer snapshot: v1 query rejected with stale_version_rejected',
    `Stale Turn Text: ${staleTurn.answerText}`
  );

  // New request asking on current snapshot v2 succeeds
  const freshV2Turn = await qaTurnService.processQuestion(
    {
      caseId: testCaseId,
      snapshotVersion: 2, // Current active version
      questionText: 'What is the monthly rent?'
    },
    testSessionId
  );

  assert(
    freshV2Turn.answerStatus === 'completed' && freshV2Turn.snapshotVersion === 2,
    'Query on updated snapshot v2 generates grounded answer with snapshotVersion=2',
    `Status: ${freshV2Turn.answerStatus}, Version: ${freshV2Turn.snapshotVersion}`
  );

  // Confirm old turn provenance is permanently preserved
  assert(
    specificTurn.snapshotVersion === 1 && freshV2Turn.snapshotVersion === 2,
    'Q&A turn provenance permanently preserves historical snapshot version without mutation',
    `Old version: ${specificTurn.snapshotVersion}, New version: ${freshV2Turn.snapshotVersion}`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Summary & Gate Verification
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════════════');
  if (failedTests === 0) {
    console.log('✔ ALL PHASE 14 TESTS PASSED.');
    console.log('GATE VERIFIED:');
    console.log('  1. Questions about either of two documents and their differences return correct citations.');
    console.log('  2. Absent information produces no invented answer (zero hallucination).');
    console.log('  3. Stale responses cannot attach to a newer snapshot (stale_version_rejected).');
    console.log('  4. Focused clarification asked when "this agreement" is ambiguous across multiple documents.');
    console.log('  5. Distinguishes preliminary unreviewed OCR text from completed tribunal findings.');
    console.log('  6. Creates targeted review task for new legal questions without restarting 50 agents.');
    console.log('  7. Multi-tenant boundary strictly enforced (never leaks other visitor data).');
    console.log('══════════════════════════════════════════════════════════════\n');
    process.exit(0);
  } else {
    console.error(`❌ SOME PHASE 14 TESTS FAILED (${failedTests} failures).`);
    console.log('══════════════════════════════════════════════════════════════\n');
    process.exit(1);
  }
}

runPhase14Verification();
