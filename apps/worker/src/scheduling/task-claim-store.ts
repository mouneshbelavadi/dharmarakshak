import {
  TaskClaim,
  TaskClaimStatus,
  TaskFailureCategory,
  RoutingPlan,
  WorkerQuotaConfig,
  SpecialistInitialAssessment,
  TaskEvidenceReference
} from '@dharmaraksha/shared-contracts';

export class TaskClaimStore {
  // In-memory durable store with support for restart recovery
  private claims: Map<string, TaskClaim> = new Map();
  // Persistent record of accepted findings to ensure zero duplication on restart
  private acceptedFindingsRecord: Map<string, string> = new Map(); // specialistId -> findingId

  /**
   * Initializes task claims for a given run from its routing plan.
   * Only selected specialists generate claims; skipped specialists are omitted from execution.
   */
  public initializeTasksFromPlan(
    runId: string,
    plan: RoutingPlan,
    defaultTimeoutBufferMs: number = 10000,
    maxRetries: number = 2
  ): TaskClaim[] {
    const created: TaskClaim[] = [];
    const now = Date.now();

    for (const [id, decision] of Object.entries(plan.roleDecisions)) {
      if (decision.decision !== 'selected') {
        continue;
      }

      const taskId = `task-${runId}-${id}`;
      const deadlineAt = new Date(now + decision.timeoutMs + defaultTimeoutBufferMs).toISOString();

      const claim: TaskClaim = {
        taskId,
        runId,
        caseId: plan.caseId,
        snapshotVersion: plan.snapshotVersion,
        specialistId: id,
        benchId: decision.benchId,
        stage: decision.stage,
        dependencies: decision.dependencies,
        status: 'pending',
        deadlineAt,
        attemptCount: 0,
        maxRetries,
        retryBudgetRemaining: maxRetries,
        evidenceReferences: [],
        createdAt: new Date().toISOString()
      };

      this.claims.set(taskId, claim);
      created.push(claim);
    }

    return created;
  }

  /**
   * Retrieves all claims for a given analysis run.
   */
  public getClaimsForRun(runId: string): TaskClaim[] {
    return Array.from(this.claims.values()).filter(c => c.runId === runId);
  }

  /**
   * Retrieves a specific task claim by ID.
   */
  public getClaim(taskId: string): TaskClaim | undefined {
    return this.claims.get(taskId);
  }

  /**
   * Atomically claims the next eligible tasks respecting:
   * 1. Dependency ordering (all dependencies must be 'completed')
   * 2. Global concurrency quota
   * 3. Per-case concurrency quota
   */
  public claimNextEligibleTasks(
    workerId: string,
    quota: WorkerQuotaConfig,
    targetRunId?: string
  ): TaskClaim[] {
    const now = Date.now();
    const allClaims = Array.from(this.claims.values());

    // Compute currently active tasks
    const activeTasks = allClaims.filter(c => c.status === 'claimed' || c.status === 'running');
    let globalActiveCount = activeTasks.length;

    // Per-case active counts
    const activePerCase = new Map<string, number>();
    for (const t of activeTasks) {
      activePerCase.set(t.caseId, (activePerCase.get(t.caseId) || 0) + 1);
    }

    const claimedTasks: TaskClaim[] = [];

    // Eligible candidates must be 'pending'
    const candidates = allClaims.filter(c => {
      if (c.status !== 'pending') return false;
      if (targetRunId && c.runId !== targetRunId) return false;
      return true;
    });

    for (const candidate of candidates) {
      // Check global quota
      if (globalActiveCount >= quota.globalConcurrencyQuota) {
        break;
      }

      // Check per-case quota
      const currentCaseActive = activePerCase.get(candidate.caseId) || 0;
      if (currentCaseActive >= quota.perCaseConcurrencyQuota) {
        continue;
      }

      // Check dependencies: all prerequisite specialists must be 'completed'
      const runClaims = allClaims.filter(c => c.runId === candidate.runId);
      const dependenciesSatisfied = candidate.dependencies.every(depId => {
        const depClaim = runClaims.find(c => c.specialistId === depId);
        return depClaim && depClaim.status === 'completed';
      });

      if (!dependenciesSatisfied) {
        continue;
      }

      // Claim task atomically
      candidate.status = 'claimed';
      candidate.claimedByWorker = workerId;
      candidate.leaseExpiresAt = new Date(now + quota.defaultLeaseDurationMs).toISOString();
      candidate.startedAt = new Date(now).toISOString();
      candidate.attemptCount++;

      claimedTasks.push(candidate);
      globalActiveCount++;
      activePerCase.set(candidate.caseId, currentCaseActive + 1);
    }

    return claimedTasks;
  }

  /**
   * Heartbeat to renew an active lease.
   */
  public renewLease(taskId: string, workerId: string, extendMs: number): boolean {
    const claim = this.claims.get(taskId);
    if (!claim) return false;
    if (claim.claimedByWorker !== workerId) return false;
    if (claim.status !== 'claimed' && claim.status !== 'running') return false;

    claim.leaseExpiresAt = new Date(Date.now() + extendMs).toISOString();
    return true;
  }

  /**
   * Records successful task execution and preserves accepted finding.
   * Work resumed after restart will recognize this accepted finding and never duplicate it.
   */
  public recordTaskSuccess(
    taskId: string,
    findingId: string,
    initialAssessment: SpecialistInitialAssessment,
    evidenceReferences: TaskEvidenceReference[]
  ): TaskClaim | undefined {
    const claim = this.claims.get(taskId);
    if (!claim) return undefined;

    claim.status = 'completed';
    claim.acceptedFindingId = findingId;
    claim.initialAssessment = initialAssessment;
    claim.evidenceReferences = evidenceReferences;
    claim.completedAt = new Date().toISOString();

    // Persist to historical idempotency map
    this.acceptedFindingsRecord.set(`${claim.runId}:${claim.specialistId}`, findingId);
    return claim;
  }

  /**
   * Records failure attempt with retry budget handling.
   * If retryable and budget remains, task is placed back in 'pending' status.
   * If budget exhausted or unretryable, status transitions to 'failed'.
   */
  public recordTaskFailure(
    taskId: string,
    errorMessage: string,
    category: TaskFailureCategory,
    retryable: boolean
  ): TaskClaim | undefined {
    const claim = this.claims.get(taskId);
    if (!claim) return undefined;

    claim.lastError = errorMessage;
    claim.failureCategory = category;

    if (retryable && claim.retryBudgetRemaining > 0) {
      claim.retryBudgetRemaining--;
      claim.status = 'pending';
      claim.claimedByWorker = undefined;
      claim.leaseExpiresAt = undefined;
    } else {
      claim.status = 'failed';
      claim.completedAt = new Date().toISOString();
    }

    return claim;
  }

  /**
   * Cancels all non-completed tasks for a run.
   */
  public cancelRunTasks(runId: string, reason: string): TaskClaim[] {
    const affected: TaskClaim[] = [];
    const now = new Date().toISOString();

    for (const claim of this.claims.values()) {
      if (claim.runId === runId && claim.status !== 'completed' && claim.status !== 'failed') {
        claim.status = 'cancelled';
        claim.cancelledAt = now;
        claim.lastError = reason;
        claim.failureCategory = 'cancelled';
        affected.push(claim);
      }
    }

    return affected;
  }

  /**
   * Crash recovery / worker restart routine:
   * Inspects claims with expired leases.
   * 1. Already completed tasks with accepted findings are NEVER duplicated or re-run.
   * 2. Active tasks from dead workers whose lease expired are recovered:
   *    - Requeued as 'pending' if retry budget > 0.
   *    - Marked 'failed' if retry budget exhausted.
   */
  public recoverExpiredLeases(currentWorkerId: string): {
    recoveredCount: number;
    failedCount: number;
    skippedCompletedCount: number;
  } {
    const now = Date.now();
    let recoveredCount = 0;
    let failedCount = 0;
    let skippedCompletedCount = 0;

    for (const claim of this.claims.values()) {
      // Check if task already has an accepted finding
      if (claim.status === 'completed' && claim.acceptedFindingId) {
        skippedCompletedCount++;
        continue;
      }

      if (claim.status === 'claimed' || claim.status === 'running') {
        const leaseExpiry = claim.leaseExpiresAt ? new Date(claim.leaseExpiresAt).getTime() : 0;
        if (leaseExpiry < now) {
          if (claim.retryBudgetRemaining > 0) {
            claim.status = 'pending';
            claim.claimedByWorker = undefined;
            claim.leaseExpiresAt = undefined;
            claim.retryBudgetRemaining--;
            claim.lastError = `Recovered from expired lease of worker ${claim.claimedByWorker || 'unknown'}`;
            recoveredCount++;
          } else {
            claim.status = 'failed';
            claim.failureCategory = 'timeout';
            claim.lastError = `Lease expired and retry budget exhausted during worker interruption`;
            claim.completedAt = new Date().toISOString();
            failedCount++;
          }
        }
      }
    }

    return { recoveredCount, failedCount, skippedCompletedCount };
  }

  /**
   * Resets all internal stores (used for testing).
   */
  public clear(): void {
    this.claims.clear();
    this.acceptedFindingsRecord.clear();
  }
}

export const taskClaimStore = new TaskClaimStore();

