import {
  RoutingPlan,
  RoutingPlanInput,
  TaskClaim,
  WorkerQuotaConfig,
  MaterialFinding
} from '@dharmaraksha/shared-contracts';
import { RoutingPlanner, routingPlanner } from './routing/routing-planner.js';
import { TaskClaimStore, taskClaimStore } from './scheduling/task-claim-store.js';
import { SpecialistExecutor, specialistExecutor, ExecutionContext } from './execution/specialist-executor.js';

export interface RunState {
  runId: string;
  caseId: string;
  snapshotVersion: number;
  status: 'queued' | 'running' | 'completed' | 'completed_with_gaps' | 'cancelled' | 'failed';
  plan: RoutingPlan;
  findings: MaterialFinding[];
  startedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

export class BackgroundOrchestrator {
  private workerId: string;
  private isRunning: boolean = false;
  private quotaConfig: WorkerQuotaConfig;
  private runs: Map<string, RunState> = new Map();
  private runContexts: Map<string, ExecutionContext> = new Map();

  constructor(
    workerId: string = `worker-${process.pid || 1}`,
    quotaConfig?: Partial<WorkerQuotaConfig>
  ) {
    this.workerId = workerId;
    this.quotaConfig = {
      globalConcurrencyQuota: quotaConfig?.globalConcurrencyQuota || 4,
      perCaseConcurrencyQuota: quotaConfig?.perCaseConcurrencyQuota || 2,
      defaultLeaseDurationMs: quotaConfig?.defaultLeaseDurationMs || 15000,
      heartbeatIntervalMs: quotaConfig?.heartbeatIntervalMs || 5000,
      maxRetryBudget: quotaConfig?.maxRetryBudget || 2
    };
  }

  public start(): void {
    this.isRunning = true;
    console.log(`[DHARMARAKSHA-Worker] Background Orchestrator (${this.workerId}) started with globalQuota=${this.quotaConfig.globalConcurrencyQuota}, perCaseQuota=${this.quotaConfig.perCaseConcurrencyQuota}.`);
  }

  public stop(): void {
    this.isRunning = false;
    console.log(`[DHARMARAKSHA-Worker] Background Orchestrator (${this.workerId}) stopped.`);
  }

  public getWorkerId(): string {
    return this.workerId;
  }

  public getQuotaConfig(): WorkerQuotaConfig {
    return this.quotaConfig;
  }

  /**
   * Initializes an analysis run from input documents and parameters.
   * Generates a deterministic routing plan and creates initial task claims.
   */
  public initializeRun(
    input: RoutingPlanInput,
    documents: ExecutionContext['documents']
  ): RunState {
    const runId = `run-${input.caseId}-${Date.now()}`;
    const plan = routingPlanner.generateRoutingPlan(input);

    const runState: RunState = {
      runId,
      caseId: input.caseId,
      snapshotVersion: input.snapshotVersion,
      status: 'queued',
      plan,
      findings: [],
      startedAt: new Date().toISOString()
    };

    this.runs.set(runId, runState);
    this.runContexts.set(runId, {
      caseId: input.caseId,
      snapshotVersion: input.snapshotVersion,
      documents,
      priorFindings: []
    });

    taskClaimStore.initializeTasksFromPlan(runId, plan, 10000, this.quotaConfig.maxRetryBudget);
    return runState;
  }

  /**
   * Performs one scheduling and execution tick for eligible tasks.
   * Respects stage dependencies, per-case quota, and global quota.
   */
  public async processNextBatch(
    targetRunId?: string,
    simulationOverrides?: ExecutionContext['simulationOverrides']
  ): Promise<{ claimedCount: number; executedSuccessCount: number; executedFailureCount: number }> {
    const claimed = taskClaimStore.claimNextEligibleTasks(this.workerId, this.quotaConfig, targetRunId);
    let executedSuccessCount = 0;
    let executedFailureCount = 0;

    for (const claim of claimed) {
      const run = this.runs.get(claim.runId);
      const context = this.runContexts.get(claim.runId);

      if (!run || !context) {
        taskClaimStore.recordTaskFailure(claim.taskId, 'Run context not found', 'fatal_error', false);
        executedFailureCount++;
        continue;
      }

      if (run.status === 'cancelled') {
        taskClaimStore.recordTaskFailure(claim.taskId, 'Run was cancelled', 'cancelled', false);
        continue;
      }

      run.status = 'running';

      // Provide updated prior findings for stage-dependent assessments (e.g. E02 contradiction round)
      const dynamicContext: ExecutionContext = {
        ...context,
        priorFindings: [...run.findings],
        simulationOverrides
      };

      const result = await specialistExecutor.executeTask(claim, dynamicContext);

      if (result.success && result.finding && result.initialAssessment) {
        taskClaimStore.recordTaskSuccess(
          claim.taskId,
          result.finding.findingId,
          result.initialAssessment,
          result.evidenceReferences
        );
        run.findings.push(result.finding);
        executedSuccessCount++;
      } else {
        taskClaimStore.recordTaskFailure(
          claim.taskId,
          result.error || 'Execution failed',
          result.category || 'fatal_error',
          result.retryable ?? false
        );
        executedFailureCount++;
      }
    }

    // Check if run reached a final status
    if (targetRunId) {
      this.updateRunCompletionState(targetRunId);
    }

    return {
      claimedCount: claimed.length,
      executedSuccessCount,
      executedFailureCount
    };
  }

  /**
   * Executes tasks in a loop until all tasks for targetRunId reach terminal states,
   * or until maxIterations is reached.
   */
  public async runUntilComplete(
    targetRunId: string,
    maxIterations: number = 20,
    simulationOverrides?: ExecutionContext['simulationOverrides']
  ): Promise<RunState> {
    let iteration = 0;

    while (iteration < maxIterations) {
      iteration++;
      const batchResult = await this.processNextBatch(targetRunId, simulationOverrides);

      const claims = taskClaimStore.getClaimsForRun(targetRunId);
      const pendingOrActive = claims.filter(c => c.status === 'pending' || c.status === 'claimed' || c.status === 'running');

      if (pendingOrActive.length === 0) {
        break;
      }

      if (batchResult.claimedCount === 0 && pendingOrActive.length > 0) {
        // No candidates could be claimed (blocked on dependencies or active leases)
        break;
      }
    }

    this.updateRunCompletionState(targetRunId);
    return this.runs.get(targetRunId)!;
  }

  /**
   * Cancels a running or queued pipeline.
   */
  public cancelRun(runId: string, reason: string = 'User cancelled analysis'): RunState | undefined {
    const run = this.runs.get(runId);
    if (!run) return undefined;

    run.status = 'cancelled';
    run.cancelledAt = new Date().toISOString();
    run.cancelReason = reason;

    taskClaimStore.cancelRunTasks(runId, reason);
    return run;
  }

  /**
   * Crash recovery & restart routine:
   * Recovers tasks with expired worker leases.
   * Preserves already completed tasks with accepted findings with ZERO duplication.
   */
  public recoverAndResume(): {
    recoveredCount: number;
    failedCount: number;
    skippedCompletedCount: number;
  } {
    return taskClaimStore.recoverExpiredLeases(this.workerId);
  }

  /**
   * Inspects all claims for a run and updates overall run state.
   */
  private updateRunCompletionState(runId: string): void {
    const run = this.runs.get(runId);
    if (!run || run.status === 'cancelled') return;

    const claims = taskClaimStore.getClaimsForRun(runId);
    if (claims.length === 0) return;

    const anyPendingOrActive = claims.some(c => c.status === 'pending' || c.status === 'claimed' || c.status === 'running');
    if (anyPendingOrActive) {
      run.status = 'running';
      return;
    }

    const failedCount = claims.filter(c => c.status === 'failed').length;
    const completedCount = claims.filter(c => c.status === 'completed').length;

    run.completedAt = new Date().toISOString();
    if (failedCount === 0 && completedCount > 0) {
      run.status = 'completed';
    } else if (failedCount > 0 && completedCount > 0) {
      run.status = 'completed_with_gaps';
    } else if (completedCount === 0 && failedCount > 0) {
      run.status = 'failed';
    }
  }

  public getRun(runId: string): RunState | undefined {
    return this.runs.get(runId);
  }

  public getClaimsForRun(runId: string): TaskClaim[] {
    return taskClaimStore.getClaimsForRun(runId);
  }
}

export const backgroundOrchestrator = new BackgroundOrchestrator();
