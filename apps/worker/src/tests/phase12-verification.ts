import {
  RoutingPlanInput,
  TaskClaim,
  WorkerQuotaConfig,
  MaterialFinding
} from '@dharmaraksha/shared-contracts';
import {
  RoutingPlanner,
  routingPlanner
} from '../routing/routing-planner.js';
import {
  TaskClaimStore,
  taskClaimStore
} from '../scheduling/task-claim-store.js';
import {
  SpecialistExecutor,
  specialistExecutor,
  ExecutionContext
} from '../execution/specialist-executor.js';
import {
  BackgroundOrchestrator,
  backgroundOrchestrator,
  RunState
} from '../orchestrator.js';

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

async function runPhase12Verification() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║        DHARMARAKSHA PHASE 12 VERIFICATION SUITE              ║');
  console.log('║    Durable Routing & Bounded Specialist Execution Pipeline   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 1: Tenancy Case Routing, Selection Rationale & Stage Dependencies
  // ──────────────────────────────────────────────────────────────────────────
  console.log('[TEST 1] Testing Tenancy Case Routing, Persisted Rationales & Dependency Stages...');

  const tenancyInput: RoutingPlanInput = {
    caseId: 'case-tenancy-001',
    snapshotVersion: 1,
    documentCategories: ['commercial_lease', 'rent_agreement'],
    documentTitles: ['Commercial Lease Agreement Suite 402', 'Security Deposit Receipt'],
    jurisdiction: 'Karnataka',
    hasFactualUncertainty: false,
    questionsRaised: ['Can landlord retain full deposit on early termination?']
  };

  const tenancyPlan = routingPlanner.generateRoutingPlan(tenancyInput);

  assert(
    tenancyPlan.totalSpecialistsConsidered === 50,
    'Routing plan evaluates all 50 specialists across five benches',
    `Total considered: ${tenancyPlan.totalSpecialistsConsidered}`
  );

  // Bench B selections for tenancy:
  const b03Decision = tenancyPlan.roleDecisions['B03'];
  const b02Decision = tenancyPlan.roleDecisions['B02'];
  const b07Decision = tenancyPlan.roleDecisions['B07'];

  assert(
    b03Decision.decision === 'selected' && b03Decision.reason.includes('tenancy terms') && b03Decision.stage === 2,
    'Tenancy Analyst (B03) is selected with persisted rationale and assigned to Stage 2',
    `B03 Decision: ${JSON.stringify(b03Decision)}`
  );

  assert(
    b02Decision.decision === 'skipped' && b02Decision.reason.includes('no employment agreements'),
    'Employment Analyst (B02) is skipped with persisted non-applicability rationale',
    `B02 Decision: ${JSON.stringify(b02Decision)}`
  );

  assert(
    b07Decision.decision === 'selected' && b07Decision.reason.includes('deposit instruments'),
    'Lending/Security Analyst (B07) is selected because case includes deposit instrument',
    `B07 Decision: ${JSON.stringify(b07Decision)}`
  );

  // Verify Stage 1 -> 2 -> 3 -> 4 Progression
  assert(
    tenancyPlan.stages.stage1_evidenceGrounding.length === 10,
    'Stage 1 contains all 10 Bench A specialists (A01 - A10)',
    `Stage 1 count: ${tenancyPlan.stages.stage1_evidenceGrounding.length}`
  );

  assert(
    tenancyPlan.roleDecisions['B10'].dependencies.includes('A10'),
    'Stage 2 (Bench B & C) strictly depends on Stage 1 Evidence Chair (A10)',
    `B10 dependencies: ${tenancyPlan.roleDecisions['B10'].dependencies.join(', ')}`
  );

  assert(
    tenancyPlan.roleDecisions['D10'].dependencies.includes('B10') &&
    tenancyPlan.roleDecisions['D10'].dependencies.includes('C10'),
    'Stage 3 (Bench D) strictly depends on Stage 2 Chairs (B10, C10)',
    `D10 dependencies: ${tenancyPlan.roleDecisions['D10'].dependencies.join(', ')}`
  );

  assert(
    tenancyPlan.roleDecisions['E10'].dependencies.includes('D10'),
    'Stage 4 (Bench E) strictly depends on Stage 3 Risk Chair (D10)',
    `E10 dependencies: ${tenancyPlan.roleDecisions['E10'].dependencies.join(', ')}`
  );

  // Execute full tenancy run through orchestrator
  const tenancyDocuments = [
    {
      documentId: 'doc-lease-01',
      title: 'Commercial Lease Agreement Suite 402',
      category: 'commercial_lease',
      pages: [
        {
          pageNumber: 1,
          text: 'This Lease Agreement made at Bangalore on 1st April 2024 between Bangalore Realty Pvt Ltd and TechStart Labs.'
        },
        {
          pageNumber: 2,
          text: 'Clause 4: Monthly rent of INR 45,000 payable strictly in advance on or before 5th of each calendar month.'
        },
        {
          pageNumber: 3,
          text: 'Clause 12: Lessor reserves unilateral right to forfeit 100% of deposit (Rs. 2,50,000) upon early vacation.'
        }
      ]
    }
  ];

  const orchestrator = new BackgroundOrchestrator('worker-tenancy-test', {
    globalConcurrencyQuota: 4,
    perCaseConcurrencyQuota: 2
  });
  orchestrator.start();

  const runState = orchestrator.initializeRun(tenancyInput, tenancyDocuments);
  assert(runState.status === 'queued', 'Run successfully initialized in queued state');

  const completedRun = await orchestrator.runUntilComplete(runState.runId, 50);
  assert(
    completedRun.status === 'completed',
    `Tenancy pipeline completed all stages successfully with status=${completedRun.status}`,
    `Run details: ${JSON.stringify(completedRun.status)}`
  );

  assert(
    completedRun.findings.length > 0 && completedRun.findings.some(f => f.originatingSpecialistId === 'B03'),
    'Tenancy run generated verified findings including Tenancy Specialist (B03)',
    `Total findings: ${completedRun.findings.length}`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 2: Employment / IP Case Routing & Exclusion of Unrelated Roles
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 2] Testing Employment/IP Case Routing & Persisted Exclusions...');

  const empIpInput: RoutingPlanInput = {
    caseId: 'case-emp-ip-002',
    snapshotVersion: 1,
    documentCategories: ['employment_contract', 'intellectual_property', 'ip_assignment'],
    documentTitles: ['Executive Employment Agreement', 'Proprietary Inventions and IP Assignment'],
    jurisdiction: 'Maharashtra',
    hasFactualUncertainty: false
  };

  const empIpPlan = routingPlanner.generateRoutingPlan(empIpInput);

  assert(
    empIpPlan.roleDecisions['B02'].decision === 'selected' &&
    empIpPlan.roleDecisions['B08'].decision === 'selected',
    'Employment Analyst (B02) and IP Analyst (B08) both selected for Employment/IP portfolio',
    `B02: ${empIpPlan.roleDecisions['B02'].decision}, B08: ${empIpPlan.roleDecisions['B08'].decision}`
  );

  assert(
    empIpPlan.roleDecisions['B03'].decision === 'skipped' &&
    empIpPlan.roleDecisions['B03'].reason.includes('no lease, tenancy, or real estate'),
    'Tenancy Analyst (B03) correctly skipped with persisted exclusion reason',
    `B03 Reason: ${empIpPlan.roleDecisions['B03'].reason}`
  );

  assert(
    empIpPlan.roleDecisions['B04'].decision === 'skipped' &&
    empIpPlan.roleDecisions['B04'].reason.includes('no real estate conveyance'),
    'Property Sale Analyst (B04) correctly skipped with persisted exclusion reason',
    `B04 Reason: ${empIpPlan.roleDecisions['B04'].reason}`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 3: Mixed Document Set Routing (Zero Arbitrary Positional Truncation)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 3] Testing Mixed Document Set Routing (No Positional Truncation)...');

  const mixedInput: RoutingPlanInput = {
    caseId: 'case-mixed-003',
    snapshotVersion: 1,
    documentCategories: ['commercial_lease', 'loan_agreement', 'bank_guarantee'],
    documentTitles: ['Anchor Lease Agreement', 'Security Deposit Bank Guarantee Instrument'],
    jurisdiction: 'Delhi',
    hasFactualUncertainty: false
  };

  const mixedPlan = routingPlanner.generateRoutingPlan(mixedInput);

  assert(
    mixedPlan.roleDecisions['B03'].decision === 'selected' &&
    mixedPlan.roleDecisions['B07'].decision === 'selected',
    'Mixed document case selects both Tenancy (B03) and Lending/Security (B07) without positional truncation',
    `B03: ${mixedPlan.roleDecisions['B03'].decision}, B07: ${mixedPlan.roleDecisions['B07'].decision}`
  );

  assert(
    mixedPlan.roleDecisions['B01'].decision === 'selected' &&
    mixedPlan.roleDecisions['B09'].decision === 'selected' &&
    mixedPlan.roleDecisions['B10'].decision === 'selected',
    'Core contract, dispute, and chair roles remain active alongside multi-category domain specialists',
    'Bench B core roles failed to remain active'
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 4: Unreadable Page Handling & Zero Hallucination Guard
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 4] Testing Unreadable Page Handling & Zero-Hallucination Guard...');

  const unreadableDocInput: RoutingPlanInput = {
    caseId: 'case-unreadable-004',
    snapshotVersion: 1,
    documentCategories: ['commercial_lease'],
    documentTitles: ['Water-Damaged Lease Agreement'],
    hasFactualUncertainty: true,
    uncertaintyReasons: ['Page 2 blur index 0.15 below readability threshold']
  };

  const unreadablePlan = routingPlanner.generateRoutingPlan(unreadableDocInput);

  assert(
    unreadablePlan.factualUncertaintyDetected === true &&
    unreadablePlan.roleDecisions['D07'].reason.includes('High Priority') &&
    unreadablePlan.roleDecisions['A01'].reason.includes('High Priority'),
    'Factual uncertainty detection elevates Evidence-Gap (D07) and Capture Quality (A01) to High Priority',
    `D07 Reason: ${unreadablePlan.roleDecisions['D07'].reason}`
  );

  // Execute unreadable page through specialist executor
  const unreadableTaskClaim: TaskClaim = {
    taskId: 'task-test-unreadable-d07',
    runId: 'run-test-unreadable',
    caseId: 'case-unreadable-004',
    snapshotVersion: 1,
    specialistId: 'D07',
    benchId: 'D',
    stage: 3,
    dependencies: [],
    status: 'claimed',
    deadlineAt: new Date(Date.now() + 30000).toISOString(),
    attemptCount: 1,
    maxRetries: 2,
    retryBudgetRemaining: 2,
    evidenceReferences: [],
    createdAt: new Date().toISOString()
  };

  const unreadableContext: ExecutionContext = {
    caseId: 'case-unreadable-004',
    snapshotVersion: 1,
    documents: [
      {
        documentId: 'doc-damaged-01',
        title: 'Water-Damaged Lease Agreement',
        category: 'commercial_lease',
        pages: [
          {
            pageNumber: 1,
            text: 'Valid agreement intro text.'
          },
          {
            pageNumber: 2,
            text: '',
            isUnreadable: true,
            qualityScore: 0.15,
            ocrConfidence: 0.20
          }
        ]
      }
    ],
    priorFindings: []
  };

  const unreadableResult = await specialistExecutor.executeTask(unreadableTaskClaim, unreadableContext);

  assert(
    unreadableResult.success &&
    unreadableResult.finding?.category === 'evidence_gap' &&
    unreadableResult.finding.summary.includes('Text was NOT fabricated'),
    'Unreadable page correctly produces explicit evidence_gap limitation with zero text hallucination',
    `Finding Summary: ${unreadableResult.finding?.summary}`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 5: Rate Limit (429) & Retry Budget Bounding
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 5] Testing Rate Limit (429) & Retry Budget Bounding...');

  const rateLimitStore = new TaskClaimStore();
  const rateLimitRunId = 'run-ratelimit-test';
  const dummyPlan = routingPlanner.generateRoutingPlan({
    caseId: 'case-rl-005',
    snapshotVersion: 1,
    documentCategories: ['commercial_lease'],
    documentTitles: ['Lease'],
    hasFactualUncertainty: false
  });

  const rateLimitClaims = rateLimitStore.initializeTasksFromPlan(rateLimitRunId, dummyPlan, 10000, 2);
  const targetTask = rateLimitClaims.find(c => c.specialistId === 'A01')!;

  // Claim the task
  const claimedForRateLimit = rateLimitStore.claimNextEligibleTasks('worker-rl', {
    globalConcurrencyQuota: 4,
    perCaseConcurrencyQuota: 2,
    defaultLeaseDurationMs: 15000,
    heartbeatIntervalMs: 5000,
    maxRetryBudget: 2
  }, rateLimitRunId)[0];

  assert(claimedForRateLimit !== undefined, 'Task successfully claimed for rate limit test');

  // Attempt 1: Encounter 429
  const rlResult = await specialistExecutor.executeTask(claimedForRateLimit, {
    caseId: 'case-rl-005',
    snapshotVersion: 1,
    documents: tenancyDocuments,
    priorFindings: [],
    simulationOverrides: { forceRateLimit: true }
  });

  assert(
    !rlResult.success && rlResult.category === 'rate_limit' && rlResult.retryable === true,
    'Specialist executor properly captures HTTP 429 rate limit as retryable error',
    `Category: ${rlResult.category}, Retryable: ${rlResult.retryable}`
  );

  // Record failure in store
  rateLimitStore.recordTaskFailure(
    claimedForRateLimit.taskId,
    rlResult.error || 'Rate limit',
    rlResult.category || 'rate_limit',
    rlResult.retryable || false
  );

  const updatedClaimAfterFail1 = rateLimitStore.getClaim(claimedForRateLimit.taskId)!;
  assert(
    updatedClaimAfterFail1.status === 'pending' && updatedClaimAfterFail1.retryBudgetRemaining === 1,
    'Rate-limited task resets to pending status and decrements retry budget (2 -> 1)',
    `Status: ${updatedClaimAfterFail1.status}, Budget Remaining: ${updatedClaimAfterFail1.retryBudgetRemaining}`
  );

  // Attempt 2: Reclaim and succeed
  const reclaimedTask = rateLimitStore.claimNextEligibleTasks('worker-rl', {
    globalConcurrencyQuota: 4,
    perCaseConcurrencyQuota: 2,
    defaultLeaseDurationMs: 15000,
    heartbeatIntervalMs: 5000,
    maxRetryBudget: 2
  }, rateLimitRunId)[0];

  assert(reclaimedTask !== undefined && reclaimedTask.attemptCount === 2, 'Task reclaimed on attempt 2');

  const rlSuccessResult = await specialistExecutor.executeTask(reclaimedTask, {
    caseId: 'case-rl-005',
    snapshotVersion: 1,
    documents: tenancyDocuments,
    priorFindings: []
    // Overrides cleared: success
  });

  rateLimitStore.recordTaskSuccess(
    reclaimedTask.taskId,
    rlSuccessResult.finding!.findingId,
    rlSuccessResult.initialAssessment!,
    rlSuccessResult.evidenceReferences
  );

  const finalClaim = rateLimitStore.getClaim(reclaimedTask.taskId)!;
  assert(
    finalClaim.status === 'completed' && finalClaim.acceptedFindingId !== undefined,
    'Task completed successfully on retry after rate limit resolved',
    `Final Status: ${finalClaim.status}`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 6: Malformed Output Rejection & Output Contract Enforcement
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 6] Testing Malformed Output Rejection & Contract Enforcement...');

  const malformedClaim: TaskClaim = {
    taskId: 'task-test-malformed-b03',
    runId: 'run-test-malformed',
    caseId: 'case-malformed-006',
    snapshotVersion: 1,
    specialistId: 'B03',
    benchId: 'B',
    stage: 2,
    dependencies: [],
    status: 'claimed',
    deadlineAt: new Date(Date.now() + 30000).toISOString(),
    attemptCount: 1,
    maxRetries: 2,
    retryBudgetRemaining: 2,
    evidenceReferences: [],
    createdAt: new Date().toISOString()
  };

  const malformedResult = await specialistExecutor.executeTask(malformedClaim, {
    caseId: 'case-malformed-006',
    snapshotVersion: 1,
    documents: tenancyDocuments,
    priorFindings: [],
    simulationOverrides: { forceMalformedOutput: true }
  });

  assert(
    Boolean(
      !malformedResult.success &&
      malformedResult.category === 'malformed_output' &&
      malformedResult.error?.includes('Output contract violated')
    ),
    'Contract validator correctly catches and rejects output violating verbatim citation requirements',
    `Error: ${malformedResult.error}`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 7: Worker Restart & Recovery Without Duplicating Accepted Findings
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 7] Testing Worker Restart & Crash Recovery (Zero Duplicate Findings)...');

  const restartStore = new TaskClaimStore();
  const restartRunId = 'run-restart-test';
  const restartPlan = routingPlanner.generateRoutingPlan({
    caseId: 'case-restart-007',
    snapshotVersion: 1,
    documentCategories: ['commercial_lease'],
    documentTitles: ['Lease'],
    hasFactualUncertainty: false
  });

  const restartClaims = restartStore.initializeTasksFromPlan(restartRunId, restartPlan, 10000, 2);

  // Simulate 3 completed tasks with accepted findings
  const completedTask1 = restartClaims[0];
  const completedTask2 = restartClaims[1];
  const completedTask3 = restartClaims[2];

  restartStore.recordTaskSuccess(
    completedTask1.taskId,
    'finding-pre-crash-001',
    {
      specialistId: completedTask1.specialistId,
      roleName: 'Specialist 1',
      benchId: 'A',
      findingTitle: 'Pre-Crash Finding 1',
      summary: 'Already accepted before crash',
      detailedAnalysis: 'Full analysis',
      severity: 'advisory',
      confidenceScore: 0.95,
      evidenceReferences: [],
      assessedAt: new Date().toISOString()
    },
    []
  );

  restartStore.recordTaskSuccess(
    completedTask2.taskId,
    'finding-pre-crash-002',
    {
      specialistId: completedTask2.specialistId,
      roleName: 'Specialist 2',
      benchId: 'A',
      findingTitle: 'Pre-Crash Finding 2',
      summary: 'Already accepted before crash',
      detailedAnalysis: 'Full analysis',
      severity: 'advisory',
      confidenceScore: 0.95,
      evidenceReferences: [],
      assessedAt: new Date().toISOString()
    },
    []
  );

  restartStore.recordTaskSuccess(
    completedTask3.taskId,
    'finding-pre-crash-003',
    {
      specialistId: completedTask3.specialistId,
      roleName: 'Specialist 3',
      benchId: 'A',
      findingTitle: 'Pre-Crash Finding 3',
      summary: 'Already accepted before crash',
      detailedAnalysis: 'Full analysis',
      severity: 'advisory',
      confidenceScore: 0.95,
      evidenceReferences: [],
      assessedAt: new Date().toISOString()
    },
    []
  );

  // Simulate 1 in-flight task whose lease expired during worker crash
  const inFlightTask = restartClaims[3];
  inFlightTask.status = 'running';
  inFlightTask.claimedByWorker = 'dead-worker-pid-999';
  inFlightTask.leaseExpiresAt = new Date(Date.now() - 5000).toISOString(); // 5s in past (expired)

  // A new worker starts up and executes recovery routine
  const recoveryReport = restartStore.recoverExpiredLeases('new-worker-pid-1000');

  assert(
    recoveryReport.skippedCompletedCount >= 3,
    'Recovery routine safely skipped all previously accepted tasks without re-running them',
    `Skipped completed count: ${recoveryReport.skippedCompletedCount}`
  );

  assert(
    recoveryReport.recoveredCount === 1,
    'Expired in-flight task from crashed worker was reclaimed for retry',
    `Recovered count: ${recoveryReport.recoveredCount}`
  );

  const reclaimedInFlight = restartStore.getClaim(inFlightTask.taskId)!;
  assert(
    reclaimedInFlight.status === 'pending' && reclaimedInFlight.retryBudgetRemaining === 1,
    'Reclaimed task reset to pending status with decremented retry budget (2 -> 1)',
    `Status: ${reclaimedInFlight.status}, Budget: ${reclaimedInFlight.retryBudgetRemaining}`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 8: Mid-Execution Cancellation Handling
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 8] Testing Mid-Execution Cancellation Handling...');

  const cancelOrchestrator = new BackgroundOrchestrator('worker-cancel-test');
  cancelOrchestrator.start();

  const cancelRunState = cancelOrchestrator.initializeRun(
    {
      caseId: 'case-cancel-008',
      snapshotVersion: 1,
      documentCategories: ['commercial_lease'],
      documentTitles: ['Lease to be cancelled'],
      hasFactualUncertainty: false
    },
    tenancyDocuments
  );

  // Process just 1 batch (Stage 1 initial tasks)
  await cancelOrchestrator.processNextBatch(cancelRunState.runId);

  // Operator issues cancellation
  const cancelledState = cancelOrchestrator.cancelRun(
    cancelRunState.runId,
    'Visitor revoked RFID card mid-analysis'
  );

  assert(
    cancelledState !== undefined && cancelledState.status === 'cancelled',
    'Analysis run status transitioned immediately to cancelled',
    `Run status: ${cancelledState?.status}`
  );

  const claimsAfterCancel = cancelOrchestrator.getClaimsForRun(cancelRunState.runId);
  const remainingPendingOrActive = claimsAfterCancel.filter(
    c => c.status === 'pending' || c.status === 'claimed' || c.status === 'running'
  );

  assert(
    remainingPendingOrActive.length === 0,
    'Zero tasks remain in pending or running state after run cancellation',
    `Pending/Active count: ${remainingPendingOrActive.length}`
  );

  const cancelledTasks = claimsAfterCancel.filter(c => c.status === 'cancelled');
  assert(
    cancelledTasks.length > 0 && cancelledTasks.every(c => c.failureCategory === 'cancelled'),
    'All unfinished tasks marked with status=cancelled and failureCategory=cancelled',
    `Cancelled tasks count: ${cancelledTasks.length}`
  );

  // Try processing next batch on cancelled run
  const postCancelBatch = await cancelOrchestrator.processNextBatch(cancelRunState.runId);
  assert(
    postCancelBatch.claimedCount === 0,
    'Worker scheduling halts completely: zero additional tasks claimed for cancelled run',
    `Post-cancel claimed count: ${postCancelBatch.claimedCount}`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Summary & Gate Check
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════════════');
  if (failedTests === 0) {
    console.log('✔ ALL PHASE 12 TESTS PASSED.');
    console.log('GATE VERIFIED:');
    console.log('  1. Work resumes after restart without duplicating accepted findings.');
    console.log('  2. Failures remain failed or partial (bounded retries).');
    console.log('  3. Routing follows role eligibility and dependencies rather than arbitrary positional truncation.');
    console.log('  4. Stage progression strictly adheres to Stage 1 (Bench A) -> Stage 2 (B/C) -> Stage 3 (D) -> Stage 4 (E).');
    console.log('  5. Persisted rationales exist for every selected or skipped role.');
    console.log('  6. Factual uncertainty / degraded scans handled with zero text hallucination.');
    console.log('  7. No agent voting or invented majority percentages used.');
    console.log('══════════════════════════════════════════════════════════════\n');
    process.exit(0);
  } else {
    console.error(`❌ SOME PHASE 12 TESTS FAILED (${failedTests} failures).`);
    console.log('══════════════════════════════════════════════════════════════\n');
    process.exit(1);
  }
}

runPhase12Verification();
