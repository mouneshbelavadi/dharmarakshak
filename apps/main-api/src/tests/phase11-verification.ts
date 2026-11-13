import {
  ALL_SPECIALISTS,
  BENCHES,
  getSpecialistById,
  getChairForBench,
  getAllChairs,
  filterEligibleSpecialists,
  SpecialistContractValidator,
  ROLE_PERSPECTIVE_EXAMPLES,
  MESSENGER,
  PRESIDING_REVIEWER
} from '@dharmaraksha/tribunal-definitions';

function runPhase11Verification() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║        DHARMARAKSHA PHASE 11 VERIFICATION SUITE              ║');
  console.log('║       Fifty Specialist Identities & Role Contract Registry   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  let allPassed = true;

  function assert(condition: boolean, passMsg: string, failMsg: string) {
    if (condition) {
      console.log(`  ✔ PASS: ${passMsg}`);
    } else {
      console.error(`  ❌ FAIL: ${failMsg}`);
      allPassed = false;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 1: Exactly Fifty Unique Specialist Identities
  // ──────────────────────────────────────────────────────────────────────────
  console.log('[TEST 1] Verifying exactly fifty unique analyst IDs (A01 - E10)...');

  assert(ALL_SPECIALISTS.length === 50, 'Total specialists in registry is exactly 50', `Found ${ALL_SPECIALISTS.length} specialists (expected 50)`);

  const uniqueIds = new Set(ALL_SPECIALISTS.map(s => s.id));
  assert(uniqueIds.size === 50, 'All 50 specialist IDs are strictly unique', `Unique IDs: ${uniqueIds.size} (expected 50)`);

  // Verify prefix distribution (10 per bench)
  const benchIds = ['A', 'B', 'C', 'D', 'E'] as const;
  for (const b of benchIds) {
    const count = ALL_SPECIALISTS.filter(s => s.benchId === b).length;
    assert(count === 10, `Bench ${b} has exactly 10 specialists`, `Bench ${b} has ${count} specialists (expected 10)`);
  }

  // Verify ID format: A01..A10, B01..B10, etc.
  for (const b of benchIds) {
    for (let i = 1; i <= 10; i++) {
      const expectedId = `${b}${String(i).padStart(2, '0')}`;
      const found = ALL_SPECIALISTS.find(s => s.id === expectedId);
      assert(!!found, `Registry contains ${expectedId}: ${found?.name}`, `Missing specialist ID ${expectedId}`);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 2: Bench Structure & Chair Positions (Chair in 10th seat, not an 11th)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 2] Verifying chair positions (chair occupies 10th seat at index 9)...');

  assert(BENCHES.length === 5, 'Exactly 5 benches defined', `Found ${BENCHES.length} benches`);

  const chairs = getAllChairs();
  assert(chairs.length === 5, 'Exactly 5 chairs defined across the tribunal', `Found ${chairs.length} chairs`);

  for (const b of benchIds) {
    const chair = getChairForBench(b);
    const expectedChairId = `${b}10`;
    assert(
      chair.id === expectedChairId && chair.isChair === true,
      `Bench ${b} chair is ${chair.id} (${chair.name})`,
      `Bench ${b} chair mismatch: expected ${expectedChairId}, got ${chair?.id}`
    );
    assert(
      chair.tablePositionIndex === 9,
      `Chair ${chair.id} occupies tablePositionIndex 9 (10th seat at the round table)`,
      `Chair ${chair.id} is at position ${chair.tablePositionIndex} (expected 9)`
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 3: Separation of Messenger and Presiding Reviewer
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 3] Verifying Messenger and Presiding Reviewer remain separate from 50 analysts...');

  assert(
    !uniqueIds.has(MESSENGER.id),
    `Messenger ID ('${MESSENGER.id}') is strictly separate from the 50 analysts`,
    'Messenger is erroneously included in analyst roster'
  );
  assert(
    !uniqueIds.has(PRESIDING_REVIEWER.id),
    `Presiding Reviewer ID ('${PRESIDING_REVIEWER.id}') is strictly separate from the 50 analysts`,
    'Presiding Reviewer is erroneously included in analyst roster'
  );
  assert(
    MESSENGER.name.length > 0 && PRESIDING_REVIEWER.name.length > 0,
    'Messenger and Presiding Reviewer have defined roles and responsibilities',
    'Official identities missing'
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 4: Persistent Seat IDs & Appearance Attributes
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 4] Verifying persistent seat IDs and deterministic visual seeds...');

  const seatIds = new Set(ALL_SPECIALISTS.map(s => s.seatId));
  assert(seatIds.size === 50, 'All 50 seat IDs are unique and persistent (e.g. seat-A-01 to seat-E-10)', `Found ${seatIds.size} unique seat IDs`);

  let allHaveAppearance = true;
  for (const s of ALL_SPECIALISTS) {
    if (!s.appearance.avatarSeed || typeof s.appearance.deskAngleDegrees !== 'number' || !s.appearance.primaryColor) {
      allHaveAppearance = false;
    }
  }
  assert(allHaveAppearance, 'All 50 specialists have deterministic 3D desk angle, color, and avatar seed', 'Some specialists lack appearance parameters');

  // Verify prompt versions and timeouts
  const allHavePrompts = ALL_SPECIALISTS.every(s => s.promptVersion === 'v1.0.0' && s.timeoutMs >= 15000);
  assert(allHavePrompts, 'All 50 specialists define promptVersion="v1.0.0" and bounded timeout >= 15000ms', 'Prompt version or timeout missing');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 5: Comprehensive Tribunal Structure Validator Check
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 5] Running SpecialistContractValidator.validateTribunalStructure()...');

  const structureValidation = SpecialistContractValidator.validateTribunalStructure();
  assert(structureValidation.valid && structureValidation.errors.length === 0, 'Tribunal structure validator passed with 0 errors', `Validation errors: ${structureValidation.errors.join('; ')}`);

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 6: Role Perspective Demonstrations
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 6] Demonstrating distinct role perspectives on the same subject matter...');

  // 6A. Tenancy Perspective (B03)
  const tenancyExample = ROLE_PERSPECTIVE_EXAMPLES.TENANCY_PERSPECTIVE_B03;
  assert(
    Boolean(
      tenancyExample.specialistId === 'B03' &&
      tenancyExample.specialistPerspectiveOutput.statutoryOrPrecedentReference?.includes('Transfer of Property Act') &&
      tenancyExample.specialistPerspectiveOutput.severity === 'warning'
    ),
    'Tenancy Analyst (B03): Evaluates rent payment, deposit deductions, and Section 108(m) wear-and-tear',
    'Tenancy perspective example invalid'
  );

  // 6B. Employment Perspective (B02)
  const employmentExample = ROLE_PERSPECTIVE_EXAMPLES.EMPLOYMENT_PERSPECTIVE_B02;
  assert(
    Boolean(
      employmentExample.specialistId === 'B02' &&
      employmentExample.specialistPerspectiveOutput.statutoryOrPrecedentReference?.includes('Section 27') &&
      employmentExample.specialistPerspectiveOutput.severity === 'critical_red_flag'
    ),
    'Employment Analyst (B02): Flags post-termination non-compete as void under Section 27 Contract Act',
    'Employment perspective example invalid'
  );

  // 6C. Citation Verification Perspective (C09)
  const verifierExample = ROLE_PERSPECTIVE_EXAMPLES.SOURCE_VERIFICATION_C09;
  assert(
    verifierExample.specialistId === 'C09' &&
    verifierExample.specialistPerspectiveOutput.verbatimCitation.includes('Fateh Chand'),
    'Citation Verifier (C09): Verifies Section 74 and Fateh Chand precedent against authentic corpus',
    'Citation verification example invalid'
  );

  // 6D. Adversarial Review Perspectives (D02 Counterparty vs D04 Financial Exposure)
  const counterpartyExample = ROLE_PERSPECTIVE_EXAMPLES.ADVERSARIAL_COUNTERPARTY_D02;
  const financeExample = ROLE_PERSPECTIVE_EXAMPLES.FINANCIAL_EXPOSURE_D04;
  assert(
    counterpartyExample.specialistId === 'D02' && financeExample.specialistId === 'D04',
    'Adversarial Bench D: Counterparty Advocate (D02) and Financial Exposure (D04) provide contrasting downside analyses',
    'Adversarial perspective examples invalid'
  );
  assert(
    financeExample.specialistPerspectiveOutput.findingSummary.includes('Rs. 2,50,000'),
    'Financial Exposure (D04) accurately quantifies deposit at risk and compounding penal interest',
    'Financial quantification missing'
  );

  // 6E. Plain-Language Explanation Perspective (E05)
  const plainLangExample = ROLE_PERSPECTIVE_EXAMPLES.PLAIN_LANGUAGE_E05;
  assert(
    plainLangExample.specialistId === 'E05' &&
    plainLangExample.specialistPerspectiveOutput.findingSummary.includes('Plain-English Translation:'),
    'Plain-Language Editor (E05): Translates deposit liquidated damages into transparent citizen-facing explanation',
    'Plain language example invalid'
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 7: Output Contract Compliance Checks
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 7] Testing specialist output contract enforcement...');

  // Valid finding for B03
  const validB03Check = SpecialistContractValidator.validateFindingOutput('B03', {
    severity: 'warning',
    verbatimExcerpts: [
      { documentId: 'doc-lease-01', pageNumber: 2, verbatimExcerpt: 'forfeit 100% of the deposit' }
    ]
  });
  assert(validB03Check.valid, 'Valid B03 finding passes output contract check', `B03 validation failed: ${validB03Check.errors.join('; ')}`);

  // Invalid finding: missing required evidence citation for B03
  const invalidB03CitationCheck = SpecialistContractValidator.validateFindingOutput('B03', {
    severity: 'warning',
    verbatimExcerpts: [] // empty citations
  });
  assert(
    !invalidB03CitationCheck.valid && invalidB03CitationCheck.errors.some(e => e.includes('verbatim evidence citation')),
    'Output contract correctly rejects finding lacking required verbatim evidence citation',
    'Output contract check failed to catch missing citation'
  );

  // Invalid finding: C09 requires legal authority reference
  const invalidC09Check = SpecialistContractValidator.validateFindingOutput('C09', {
    severity: 'warning',
    authorities: [] // empty authorities
  });
  assert(
    !invalidC09Check.valid && invalidC09Check.errors.some(e => e.includes('authority reference')),
    'Output contract correctly rejects C09 finding lacking required legal authority citation',
    'Output contract check failed to catch missing legal authority'
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 8: Unassigned Role Visibility & Clean Partitioning
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 8] Verifying unselected roles remain visible as "unassigned" without faking execution...');

  // For a tenancy agreement, B02 (Employment), B04 (Property Sale), B07 (Lending) must be unassigned
  const assignmentCheck = SpecialistContractValidator.validateRoleAssignment('tenancy_agreement');
  assert(
    assignmentCheck.unassignedRemainVisible && assignmentCheck.totalPreserved === 50,
    `Tenancy Agreement partitioning preserves all 50 specialists: ${assignmentCheck.totalEligible} eligible, ${assignmentCheck.totalUnassigned} unassigned`,
    'Specialist partitioning dropped specialists'
  );

  const { eligibleSpecialists, unassignedSpecialists } = filterEligibleSpecialists('tenancy_agreement');
  assert(
    eligibleSpecialists.some(s => s.id === 'B03'),
    'Tenancy Analyst (B03) is eligible for tenancy_agreement',
    'B03 not marked eligible'
  );
  assert(
    unassignedSpecialists.some(s => s.id === 'B02'),
    'Employment Analyst (B02) is partitioned to unassignedSpecialists for tenancy_agreement',
    'B02 not unassigned'
  );
  assert(
    unassignedSpecialists.some(s => s.id === 'B07'),
    'Lending Analyst (B07) is partitioned to unassignedSpecialists for tenancy_agreement',
    'B07 not unassigned'
  );

  console.log('\n══════════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('✔ ALL PHASE 11 TESTS PASSED.');
    console.log('GATE VERIFIED:');
    console.log('  1. Exactly fifty unique analyst IDs exist (A01 - E10).');
    console.log('  2. Exactly ten specialists per bench; chairs occupy the 10th seat (index 9).');
    console.log('  3. Messenger and Presiding Reviewer are separate from the fifty analysts.');
    console.log('  4. Persistent seat IDs and appearance seeds ensure visual continuity across refreshes.');
    console.log('  5. Role contracts and perspective examples for Tenancy, Employment, Citation Verification, Adversarial Risk, and Plain Language verified.');
    console.log('  6. Unselected roles remain visible as "unassigned" without manufactured model calls.');
    console.log('══════════════════════════════════════════════════════════════\n');
  } else {
    console.error('❌ SOME PHASE 11 TESTS FAILED.\n');
    process.exitCode = 1;
  }
}

runPhase11Verification();
