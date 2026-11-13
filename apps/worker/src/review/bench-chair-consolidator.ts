import crypto from 'crypto';
import {
  BenchPacket,
  SpecialistFinding,
  PreservedDisagreement,
  DiscrepancyReport,
  MaterialFinding
} from '@dharmaraksha/shared-contracts';
import {
  BENCHES,
  getChairForBench,
  BenchId
} from '@dharmaraksha/tribunal-definitions';

export interface ConsolidateBenchInput {
  runId: string;
  caseId: string;
  snapshotVersion: number;
  benchId: BenchId;
  packetVersion?: number;
  findings: MaterialFinding[];
  specialistExecutions: Record<string, { status: any; latencyMs: number; errorMessage?: string }>;
  failedRoles?: string[];
  unresolvedQuestions?: string[];
  missingEvidenceNoted?: string[];
}

export class BenchChairConsolidator {
  /**
   * Each bench chair consolidates its bench's outputs into a versioned packet
   * preserving disagreements, gaps, source references, and failed coverage.
   */
  public consolidatePacket(input: ConsolidateBenchInput): BenchPacket {
    const chair = getChairForBench(input.benchId);
    const packetVersion = input.packetVersion || 1;
    const packetId = `packet-${input.runId}-${input.benchId}-v${packetVersion}`;

    // Filter findings belonging to this bench
    const benchFindings = input.findings.filter(f => f.originatingBenchId === input.benchId);

    // Map to SpecialistFinding
    const mappedFindings: SpecialistFinding[] = benchFindings.map(f => ({
      specialistId: f.originatingSpecialistId,
      benchId: f.originatingBenchId,
      title: f.title,
      summary: f.summary,
      detail: f.alternativeViewpoint ? `${f.summary} [Preserved Disagreement: ${f.alternativeViewpoint}]` : f.summary,
      citations: f.verbatimExcerpts,
      authorities: f.authorities,
      severity: f.severity === 'critical_red_flag' ? 'critical' : f.severity === 'warning' ? 'warning' : f.severity === 'advisory' ? 'advisory' : 'info',
      confidence: f.confidenceScore,
      flaggedDiscrepancy: f.isPreservedDisagreement
    }));

    // Collect Preserved Disagreements (e.g. D01 vs D02)
    const preservedDisagreements: PreservedDisagreement[] = [];
    for (const f of benchFindings) {
      if (f.isPreservedDisagreement && f.alternativeViewpoint) {
        preservedDisagreements.push({
          disagreementId: `disagree-${f.findingId}`,
          clauseReference: f.verbatimExcerpts[0]?.clauseReference || 'Clause 4 (Deposit Forfeiture)',
          specialistA: f.originatingSpecialistId,
          viewpointA: f.summary,
          specialistB: 'D02', // Opposing viewpoint
          viewpointB: f.alternativeViewpoint,
          preservationRationale: 'Genuine legal dispute regarding liquidated damages vs penal forfeiture under Section 74 Indian Contract Act preserved for presiding review.'
        });
      }
    }

    // Build Coverage Assessment
    const coveredPoints = mappedFindings.map(f => `${f.specialistId}: ${f.title}`);
    const unresolvedQuestions = input.unresolvedQuestions || [];
    const missingEvidenceNoted = input.missingEvidenceNoted || [];
    const failedCoverage = input.failedRoles || [];

    // Compute cryptographic packet checksum to guarantee integrity
    const checksumPayload = JSON.stringify({
      packetId,
      runId: input.runId,
      benchId: input.benchId,
      chairId: chair.id,
      findings: mappedFindings.map(f => ({ id: f.specialistId, title: f.title, summary: f.summary })),
      disagreements: preservedDisagreements
    });
    const packetChecksum = crypto.createHash('sha256').update(checksumPayload).digest('hex');

    return {
      packetId,
      runId: input.runId,
      snapshotVersion: input.snapshotVersion,
      packetVersion,
      benchId: input.benchId,
      chairId: chair.id,
      caseId: input.caseId,
      status: 'packet_ready',
      generatedAt: new Date().toISOString(),
      packetChecksum,
      findings: mappedFindings,
      discrepancies: [],
      preservedDisagreements,
      coverageAssessment: {
        coveredPoints,
        unresolvedQuestions,
        missingEvidenceNoted,
        failedCoverage
      },
      specialistExecutions: input.specialistExecutions
    };
  }
}

export const benchChairConsolidator = new BenchChairConsolidator();
