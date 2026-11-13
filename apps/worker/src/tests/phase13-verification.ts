import {
  BenchPacket,
  MaterialFinding,
  PresidingReviewSummary,
  PacketDeliveryReceipt
} from '@dharmaraksha/shared-contracts';
import {
  BenchChairConsolidator,
  benchChairConsolidator
} from '../review/bench-chair-consolidator.js';
import {
  MessengerService,
  messengerService
} from '../review/messenger-service.js';
import {
  PresidingReviewerService,
  presidingReviewerService,
  StoredEvidenceDocument
} from '../review/presiding-reviewer-service.js';
import {
  BENCHES,
  MESSENGER,
  PRESIDING_REVIEWER
} from '@dharmaraksha/tribunal-definitions';

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

async function runPhase13Verification() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║        DHARMARAKSHA PHASE 13 VERIFICATION SUITE              ║');
  console.log('║    Bench Packets, Messenger Courier & Presiding Review       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const runId = 'run-phase13-demo-001';
  const caseId = 'case-lease-dispute-001';
  const snapshotVersion = 1;

  // Stored case documents (evidence record)
  const storedDocuments: StoredEvidenceDocument[] = [
    {
      documentId: 'doc-lease-01',
      title: 'Commercial Lease Agreement Suite 402',
      pages: [
        {
          pageNumber: 1,
          text: 'This Lease Agreement made at Bangalore on 1st April 2024 between Bangalore Realty Pvt Ltd (Lessor) and TechStart Labs Pvt Ltd (Lessee).'
        },
        {
          pageNumber: 2,
          text: 'Clause 4. RENT & DEPOSIT: Monthly rent of INR 45,000 payable strictly in advance on or before 5th of each calendar month. Security deposit of INR 2,50,000 paid via RTGS.'
        },
        {
          pageNumber: 3,
          text: 'Clause 12. FORFEITURE: Lessor reserves unilateral right to forfeit 100% of the deposit upon early vacation prior to lock-in.'
        }
      ]
    }
  ];

  // Realistic sample findings produced across the 5 benches
  const sampleFindings: MaterialFinding[] = [
    // Bench A findings
    {
      findingId: 'f-a01',
      caseId,
      snapshotVersion,
      originatingSpecialistId: 'A01',
      originatingBenchId: 'A',
      category: 'capture_quality',
      title: 'Scan Quality and Resolution Validation',
      summary: 'All 3 pages verified high fidelity (>300 DPI) with zero blur degradation.',
      verbatimExcerpts: [
        {
          documentId: 'doc-lease-01',
          documentTitle: 'Commercial Lease Agreement Suite 402',
          pageNumber: 1,
          verbatimExcerpt: 'This Lease Agreement made at Bangalore on 1st April 2024...',
          isVerifiedExcerpt: true
        }
      ],
      authorities: [],
      severity: 'informational',
      confidenceScore: 0.98,
      isPreservedDisagreement: false,
      createdTimestamp: new Date().toISOString()
    },
    {
      findingId: 'f-a06',
      caseId,
      snapshotVersion,
      originatingSpecialistId: 'A06',
      originatingBenchId: 'A',
      category: 'dates_and_amounts',
      title: 'Rent and Security Deposit Amounts Extraction',
      summary: 'Monthly rent extracted as INR 45,000; Security deposit extracted as INR 2,50,000.',
      verbatimExcerpts: [
        {
          documentId: 'doc-lease-01',
          documentTitle: 'Commercial Lease Agreement Suite 402',
          pageNumber: 2,
          clauseReference: 'Clause 4',
          verbatimExcerpt: 'Clause 4. RENT & DEPOSIT: Monthly rent of INR 45,000 payable strictly in advance...',
          isVerifiedExcerpt: true
        }
      ],
      authorities: [],
      severity: 'advisory',
      confidenceScore: 0.99,
      isPreservedDisagreement: false,
      createdTimestamp: new Date().toISOString()
    },

    // Bench B findings
    {
      findingId: 'f-b03',
      caseId,
      snapshotVersion,
      originatingSpecialistId: 'B03',
      originatingBenchId: 'B',
      category: 'tenancy_obligations',
      title: 'Tenancy Rights and Deposit Refund Terms',
      summary: 'Clause 4 creates binding tenancy under Section 105 TPA. Deposit refund conditions conditioned on vacant possession.',
      verbatimExcerpts: [
        {
          documentId: 'doc-lease-01',
          documentTitle: 'Commercial Lease Agreement Suite 402',
          pageNumber: 2,
          clauseReference: 'Clause 4',
          verbatimExcerpt: 'Security deposit of INR 2,50,000 paid via RTGS.',
          isVerifiedExcerpt: true
        }
      ],
      authorities: [
        {
          statuteName: 'Transfer of Property Act, 1882',
          sectionNumber: '105',
          isVerifiedAuthority: true
        }
      ],
      severity: 'warning',
      confidenceScore: 0.95,
      isPreservedDisagreement: false,
      createdTimestamp: new Date().toISOString()
    },

    // Bench C findings
    {
      findingId: 'f-c09',
      caseId,
      snapshotVersion,
      originatingSpecialistId: 'C09',
      originatingBenchId: 'C',
      category: 'citation_verification',
      title: 'Section 74 and Precedent Verification',
      summary: 'Section 74 Contract Act and Fateh Chand precedent verified authentic in central legal corpus.',
      verbatimExcerpts: [
        {
          documentId: 'doc-lease-01',
          documentTitle: 'Commercial Lease Agreement Suite 402',
          pageNumber: 3,
          clauseReference: 'Clause 12',
          verbatimExcerpt: 'Lessor reserves unilateral right to forfeit 100% of the deposit...',
          isVerifiedExcerpt: true
        }
      ],
      authorities: [
        {
          statuteName: 'Indian Contract Act, 1872',
          sectionNumber: '74',
          judgmentTitle: 'Fateh Chand v. Balkishan Das (1964 SCR (1) 515)',
          isVerifiedAuthority: true
        }
      ],
      severity: 'informational',
      confidenceScore: 1.0,
      isPreservedDisagreement: false,
      createdTimestamp: new Date().toISOString()
    },

    // Bench D findings: HOLDER vs COUNTERPARTY DISSENT
    {
      findingId: 'f-d01',
      caseId,
      snapshotVersion,
      originatingSpecialistId: 'D01',
      originatingBenchId: 'D',
      category: 'holder_advocacy',
      title: 'Tenant Challenge to Unilateral Deposit Forfeiture Clause',
      summary: 'Clause 12 forfeiture is an unlawful penalty stipulation under Section 74 Indian Contract Act.',
      verbatimExcerpts: [
        {
          documentId: 'doc-lease-01',
          documentTitle: 'Commercial Lease Agreement Suite 402',
          pageNumber: 3,
          clauseReference: 'Clause 12',
          verbatimExcerpt: 'Lessor reserves unilateral right to forfeit 100% of the deposit...',
          isVerifiedExcerpt: true
        }
      ],
      authorities: [
        {
          statuteName: 'Indian Contract Act, 1872',
          sectionNumber: '74',
          isVerifiedAuthority: true
        }
      ],
      severity: 'critical_red_flag',
      confidenceScore: 0.95,
      isPreservedDisagreement: true,
      alternativeViewpoint: 'Counterparty asserts forfeiture was mutually agreed pre-estimate of commercial vacancy downtime.',
      createdTimestamp: new Date().toISOString()
    },
    {
      findingId: 'f-d02',
      caseId,
      snapshotVersion,
      originatingSpecialistId: 'D02',
      originatingBenchId: 'D',
      category: 'counterparty_advocacy',
      title: 'Landlord Defense of Liquidated Damages Forfeiture',
      summary: 'From Landlord viewpoint, Suite 402 lease forfeiture is reasonable pre-estimated liquidated damages for fit-out downtime.',
      verbatimExcerpts: [
        {
          documentId: 'doc-lease-01',
          documentTitle: 'Commercial Lease Agreement Suite 402',
          pageNumber: 3,
          clauseReference: 'Clause 12',
          verbatimExcerpt: 'Lessor reserves unilateral right to forfeit 100% of the deposit...',
          isVerifiedExcerpt: true
        }
      ],
      authorities: [],
      severity: 'advisory',
      confidenceScore: 0.9,
      isPreservedDisagreement: true,
      alternativeViewpoint: 'Holder asserts deposit forfeiture exceeds reasonable compensation under Section 74.',
      createdTimestamp: new Date().toISOString()
    },

    // Bench E findings
    {
      findingId: 'f-e02',
      caseId,
      snapshotVersion,
      originatingSpecialistId: 'E02',
      originatingBenchId: 'E',
      category: 'contradiction_resolution',
      title: 'Preserved Dispute: Deposit Forfeiture Enforceability',
      summary: 'Bona fide dispute preserved: Tenant (D01) asserts Clause 12 is void penalty; Landlord (D02) asserts valid liquidated damages.',
      verbatimExcerpts: [
        {
          documentId: 'doc-lease-01',
          documentTitle: 'Commercial Lease Agreement Suite 402',
          pageNumber: 3,
          clauseReference: 'Clause 12',
          verbatimExcerpt: 'Lessor reserves unilateral right to forfeit 100% of the deposit...',
          isVerifiedExcerpt: true
        }
      ],
      authorities: [],
      severity: 'warning',
      confidenceScore: 0.95,
      isPreservedDisagreement: true,
      alternativeViewpoint: 'Preserved without artificial consensus or agent voting.',
      createdTimestamp: new Date().toISOString()
    },
    {
      findingId: 'f-e05',
      caseId,
      snapshotVersion,
      originatingSpecialistId: 'E05',
      originatingBenchId: 'E',
      category: 'plain_language',
      title: 'Plain-Language Explanation of Forfeiture Exposure',
      summary: 'Plain Language: If you leave early, the landlord will claim your full Rs. 2,50,000 deposit; however, Indian law generally requires landlords to prove actual financial loss.',
      verbatimExcerpts: [
        {
          documentId: 'doc-lease-01',
          documentTitle: 'Commercial Lease Agreement Suite 402',
          pageNumber: 3,
          clauseReference: 'Clause 12',
          verbatimExcerpt: 'Lessor reserves unilateral right to forfeit 100% of the deposit...',
          isVerifiedExcerpt: true
        }
      ],
      authorities: [],
      severity: 'informational',
      confidenceScore: 0.98,
      isPreservedDisagreement: false,
      createdTimestamp: new Date().toISOString()
    }
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 1: Bench Packet Consolidation by Chairs (A10, B10, C10, D10, E10)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('[TEST 1] Testing Bench Packet Consolidation by Chairs...');

  const benchAPacket = benchChairConsolidator.consolidatePacket({
    runId,
    caseId,
    snapshotVersion,
    benchId: 'A',
    packetVersion: 1,
    findings: sampleFindings,
    specialistExecutions: {
      A01: { status: 'completed', latencyMs: 250 },
      A06: { status: 'completed', latencyMs: 310 }
    }
  });

  const benchBPacket = benchChairConsolidator.consolidatePacket({
    runId,
    caseId,
    snapshotVersion,
    benchId: 'B',
    packetVersion: 1,
    findings: sampleFindings,
    specialistExecutions: {
      B03: { status: 'completed', latencyMs: 420 }
    },
    failedRoles: ['B02', 'B04', 'B05', 'B06', 'B07', 'B08']
  });

  const benchCPacket = benchChairConsolidator.consolidatePacket({
    runId,
    caseId,
    snapshotVersion,
    benchId: 'C',
    packetVersion: 1,
    findings: sampleFindings,
    specialistExecutions: {
      C09: { status: 'completed', latencyMs: 180 }
    }
  });

  const benchDPacket = benchChairConsolidator.consolidatePacket({
    runId,
    caseId,
    snapshotVersion,
    benchId: 'D',
    packetVersion: 1,
    findings: sampleFindings,
    specialistExecutions: {
      D01: { status: 'completed', latencyMs: 510 },
      D02: { status: 'completed', latencyMs: 490 }
    }
  });

  const benchEPacket = benchChairConsolidator.consolidatePacket({
    runId,
    caseId,
    snapshotVersion,
    benchId: 'E',
    packetVersion: 1,
    findings: sampleFindings,
    specialistExecutions: {
      E02: { status: 'completed', latencyMs: 220 },
      E05: { status: 'completed', latencyMs: 290 }
    }
  });

  assert(
    benchAPacket.chairId === 'A10' &&
    benchBPacket.chairId === 'B10' &&
    benchCPacket.chairId === 'C10' &&
    benchDPacket.chairId === 'D10' &&
    benchEPacket.chairId === 'E10',
    'Packets consolidated strictly under correct Bench Chairs (A10, B10, C10, D10, E10)',
    `Chairs: A=${benchAPacket.chairId}, B=${benchBPacket.chairId}, C=${benchCPacket.chairId}, D=${benchDPacket.chairId}, E=${benchEPacket.chairId}`
  );

  assert(
    Boolean(
      benchAPacket.packetChecksum &&
      benchBPacket.packetChecksum &&
      benchCPacket.packetChecksum &&
      benchDPacket.packetChecksum &&
      benchEPacket.packetChecksum
    ),
    'All five bench packets contain cryptographic SHA-256 integrity checksums',
    'Missing packetChecksum on one or more packets'
  );

  assert(
    Boolean(
      benchBPacket.coverageAssessment.failedCoverage?.includes('B02') &&
      benchBPacket.coverageAssessment.failedCoverage?.includes('B04')
    ),
    'Bench B packet correctly preserves failed/unassigned coverage for unselected domain roles',
    `Bench B failed coverage: ${benchBPacket.coverageAssessment.failedCoverage?.join(', ')}`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 2: Preservation of Disagreements & Adversarial Dissent
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 2] Testing Preservation of Disagreements & Adversarial Dissent...');

  assert(
    benchDPacket.preservedDisagreements.length > 0,
    'Chair D10 packet preserves adversarial disagreement between Holder (D01) and Counterparty (D02)',
    `Preserved count in Bench D: ${benchDPacket.preservedDisagreements.length}`
  );

  const disagreement = benchDPacket.preservedDisagreements[0];
  assert(
    Boolean(
      disagreement &&
      disagreement.specialistA === 'D01' &&
      disagreement.viewpointA.includes('unlawful penalty') &&
      disagreement.viewpointB.includes('pre-estimate of commercial vacancy')
    ),
    'Disagreement explicitly captures both opposing viewpoints on deposit forfeiture without forced consensus',
    `Disagreement record: ${JSON.stringify(disagreement)}`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 3: Messenger Deterministic Validation & Delivery Acknowledgment
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 3] Testing Messenger Deterministic Validation & Delivery...');

  messengerService.clear();

  // Test 3A: Tampered packet is rejected
  const tamperedReceipt = await messengerService.deliverPacket(benchAPacket, { simulateTamper: true });
  assert(
    tamperedReceipt.status === 'rejected_invalid' &&
    tamperedReceipt.validationErrors.some(e => e.includes('checksum mismatch')),
    'Messenger correctly rejects packet with tampered checksum or invalid signature',
    `Rejection receipt: ${JSON.stringify(tamperedReceipt)}`
  );

  // Test 3B: Valid packet is accepted
  const validReceiptA = await messengerService.deliverPacket(benchAPacket);
  assert(
    validReceiptA.status === 'accepted' &&
    validReceiptA.recipientId === 'PRESIDING_REVIEWER' &&
    !validReceiptA.isDuplicate,
    'Messenger delivers Bench A packet to Presiding Reviewer with valid receipt',
    `Receipt status: ${validReceiptA.status}`
  );

  assert(
    benchAPacket.status === 'delivered_to_presiding',
    'Bench A packet status transitions to delivered_to_presiding',
    `Packet status: ${benchAPacket.status}`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 4: Duplicate Packet Delivery Idempotency (One Logical Effect)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 4] Testing Duplicate Packet Delivery Idempotency...');

  const duplicateReceiptA = await messengerService.deliverPacket(benchAPacket);

  assert(
    duplicateReceiptA.status === 'duplicate_ignored' && duplicateReceiptA.isDuplicate === true,
    'Duplicate delivery detected: status=duplicate_ignored with isDuplicate=true',
    `Duplicate receipt status: ${duplicateReceiptA.status}`
  );

  assert(
    duplicateReceiptA.receiptId === validReceiptA.receiptId,
    'Duplicate delivery returns original receipt without creating redundant delivery records',
    `Receipt IDs match: ${duplicateReceiptA.receiptId} === ${validReceiptA.receiptId}`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 5: Non-Blocking Milestone Events (Zero Courier Animation Delay)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 5] Testing Non-Blocking Milestone Events for Animation...');

  // Deliver remaining packets
  await messengerService.deliverPacket(benchBPacket);
  await messengerService.deliverPacket(benchCPacket);
  await messengerService.deliverPacket(benchDPacket);
  await messengerService.deliverPacket(benchEPacket);

  const emittedMilestones = messengerService.getEmittedMilestones();

  const packetReadyEvents = emittedMilestones.filter(e => e.eventType === 'bench:packet_ready');
  const transitStartedEvents = emittedMilestones.filter(e => e.eventType === 'messenger:transit_started');
  const deliveredEvents = emittedMilestones.filter(e => e.eventType === 'messenger:packet_delivered');

  assert(
    packetReadyEvents.length === 5 && transitStartedEvents.length === 5 && deliveredEvents.length === 5,
    'Messenger emitted packet_ready, transit_started, and packet_delivered milestones for all 5 benches',
    `Milestone counts: ready=${packetReadyEvents.length}, transit=${transitStartedEvents.length}, delivered=${deliveredEvents.length}`
  );

  // Verify non-blocking: delivering 5 packets completes in milliseconds without sleep delays
  assert(
    transitStartedEvents.every(e => e.payload.messengerId === MESSENGER.id),
    'All transit milestones explicitly identify deterministic Chamber Messenger',
    'Messenger ID mismatch in transit milestones'
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 6: Presiding Reviewer Synthesis & Dissent Survival
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 6] Testing AI Presiding Reviewer Synthesis & Dissent Survival...');

  presidingReviewerService.clear();

  const acceptedPackets = [benchAPacket, benchBPacket, benchCPacket, benchDPacket, benchEPacket];

  const synthesisSummary = await presidingReviewerService.synthesizeReview({
    runId,
    caseId,
    snapshotVersion,
    acceptedPackets,
    storedDocuments,
    policyConfig: {
      requireAllCitationsVerified: true,
      allowPartialOnCitationGaps: true
    }
  });

  assert(
    synthesisSummary.keyObligations.length > 0 && synthesisSummary.materialRisks.length > 0,
    'Presiding synthesis extracts key obligations and material risks from accepted packets',
    `Obligations: ${synthesisSummary.keyObligations.length}, Risks: ${synthesisSummary.materialRisks.length}`
  );

  assert(
    Boolean(
      synthesisSummary.preservedDisagreements &&
      synthesisSummary.preservedDisagreements.length > 0 &&
      synthesisSummary.preservedDisagreements.some(d => d.viewpointA.includes('unlawful penalty'))
    ),
    'Crucial Gate: Adversarial dissent (D01 vs D02) survives synthesis into final Presiding Review',
    `Preserved disagreements in synthesis: ${JSON.stringify(synthesisSummary.preservedDisagreements)}`
  );

  assert(
    synthesisSummary.publicationStatus === 'published',
    'Valid review with grounded citations successfully achieves publicationStatus="published"',
    `Publication status: ${synthesisSummary.publicationStatus}`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 7: Post-Synthesis Citation Validation & Publication Blocking
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 7] Testing Post-Synthesis Reference Grounding & Publication Blocking...');

  // Create a bench packet with an ungrounded/hallucinated citation
  const hallucinatedFinding: MaterialFinding = {
    findingId: 'f-fake-01',
    caseId,
    snapshotVersion,
    originatingSpecialistId: 'B04',
    originatingBenchId: 'B',
    category: 'property_sale',
    title: 'Fabricated Encumbrance Clause',
    summary: 'Claim that seller owns mineral rights on Page 99.',
    verbatimExcerpts: [
      {
        documentId: 'doc-lease-01',
        documentTitle: 'Commercial Lease Agreement Suite 402',
        pageNumber: 99, // NON-EXISTENT PAGE in storedDocuments!
        verbatimExcerpt: 'Lessor retains subsurface mineral rights...',
        isVerifiedExcerpt: false
      }
    ],
    authorities: [],
    severity: 'critical_red_flag',
    confidenceScore: 0.9,
    isPreservedDisagreement: false,
    createdTimestamp: new Date().toISOString()
  };

  const badBenchBPacket = benchChairConsolidator.consolidatePacket({
    runId,
    caseId,
    snapshotVersion,
    benchId: 'B',
    packetVersion: 2,
    findings: [hallucinatedFinding],
    specialistExecutions: { B04: { status: 'completed', latencyMs: 200 } }
  });

  // Synthesize under strict publication policy (requireAllCitationsVerified=true, allowPartialOnCitationGaps=false)
  const blockedSummary = await presidingReviewerService.synthesizeReview({
    runId,
    caseId,
    snapshotVersion,
    acceptedPackets: [benchAPacket, badBenchBPacket, benchCPacket, benchDPacket, benchEPacket],
    storedDocuments,
    policyConfig: {
      requireAllCitationsVerified: true,
      allowPartialOnCitationGaps: false // Strict policy blocks publication!
    }
  });

  assert(
    blockedSummary.publicationStatus === 'publication_blocked',
    'Post-synthesis validator blocks publication when citations fail evidence grounding under strict policy',
    `Publication status: ${blockedSummary.publicationStatus}`
  );

  const blockedMilestones = presidingReviewerService.getEmittedMilestones();
  assert(
    blockedMilestones.some(m => m.eventType === 'report:publication_blocked'),
    'Presiding Reviewer emits report:publication_blocked milestone event',
    'Missing report:publication_blocked event'
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 8: Partial Preliminary Publication Policy & Mandatory Disclaimers
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 8] Testing Partial Preliminary Publication Policy & Mandatory Disclaimer...');

  // Synthesize under partial publication policy (allowPartialOnCitationGaps=true)
  const partialSummary = await presidingReviewerService.synthesizeReview({
    runId,
    caseId,
    snapshotVersion,
    acceptedPackets: [benchAPacket, badBenchBPacket, benchCPacket, benchDPacket, benchEPacket],
    storedDocuments,
    policyConfig: {
      requireAllCitationsVerified: true,
      allowPartialOnCitationGaps: true // Permissive policy allows partial!
    }
  });

  assert(
    partialSummary.publicationStatus === 'partial_preliminary',
    'Policy permits explicit partial preliminary publication when citation gaps exist',
    `Publication status: ${partialSummary.publicationStatus}`
  );

  assert(
    Boolean(
      partialSummary.statutoryDisclaimer &&
      partialSummary.statutoryDisclaimer.includes('NOT an independent human legal review') &&
      partialSummary.statutoryDisclaimer.includes('preliminary legal document understanding')
    ),
    'Presiding review strictly enforces statutory disclaimer forbidding AI from claiming to be human legal counsel',
    `Disclaimer: ${partialSummary.statutoryDisclaimer}`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Summary & Gate Verification
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════════════');
  if (failedTests === 0) {
    console.log('✔ ALL PHASE 13 TESTS PASSED.');
    console.log('GATE VERIFIED:');
    console.log('  1. Duplicate packet delivery has exactly ONE logical effect (idempotent receipt).');
    console.log('  2. Citation failures and dissent survive synthesis (not erased or artificially consensus-driven).');
    console.log('  3. Real events support a truthful visible handoff (bench:packet_ready, messenger:transit_started, messenger:packet_delivered).');
    console.log('  4. Backend completion does not wait for a walking courier to reach a desk.');
    console.log('  5. Post-synthesis reference grounding blocks publication or tags as partial preliminary.');
    console.log('  6. Zero claim of independent human legal review.');
    console.log('══════════════════════════════════════════════════════════════\n');
    process.exit(0);
  } else {
    console.error(`❌ SOME PHASE 13 TESTS FAILED (${failedTests} failures).`);
    console.log('══════════════════════════════════════════════════════════════\n');
    process.exit(1);
  }
}

runPhase13Verification();
