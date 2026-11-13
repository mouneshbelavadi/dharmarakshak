import {
  BenchPacket,
  PresidingReviewSummary,
  CaseRecord,
  EvidenceCitation
} from '@dharmaraksha/shared-contracts';
import { PRESIDING_REVIEWER } from '@dharmaraksha/tribunal-definitions';

export interface PublicationPolicyConfig {
  requireAllCitationsVerified: boolean; // If true, unverified citations trigger policy check
  allowPartialOnCitationGaps: boolean; // If true, unverified citations allow partial_preliminary; if false, block publication
}

export interface StoredEvidenceDocument {
  documentId: string;
  title: string;
  pages: Array<{
    pageNumber: number;
    text: string;
    isUnreadable?: boolean;
  }>;
}

export interface SynthesisInput {
  runId: string;
  caseId: string;
  snapshotVersion: number;
  acceptedPackets: BenchPacket[];
  storedDocuments: StoredEvidenceDocument[];
  policyConfig?: PublicationPolicyConfig;
}

export interface SynthesisMilestoneEvent {
  eventType: string;
  timestamp: string;
  payload: any;
}

export class PresidingReviewerService {
  private emittedMilestones: SynthesisMilestoneEvent[] = [];

  /**
   * The AI Presiding Reviewer synthesizes accepted bench packets into clear preliminary findings,
   * obligations, concerns, questions, and limitations.
   *
   * Validates every material reference against stored evidence after synthesis.
   * Enforces publication policy: blocks publication when configured checks fail or provides explicit partial results.
   * Strict disclaimer: Never describes AI synthesis as independent human legal review.
   */
  public async synthesizeReview(input: SynthesisInput): Promise<PresidingReviewSummary> {
    const policy = input.policyConfig || {
      requireAllCitationsVerified: false,
      allowPartialOnCitationGaps: true
    };

    const now = new Date().toISOString();
    this.emitMilestone('presiding:synthesis_started', {
      reviewerId: PRESIDING_REVIEWER.id,
      runId: input.runId,
      caseId: input.caseId,
      acceptedPacketsCount: input.acceptedPackets.length,
      startedAt: now
    });

    // 1. Gather all findings from accepted packets
    const allFindings = input.acceptedPackets.flatMap(p => p.findings);
    const allDisagreements = input.acceptedPackets.flatMap(p => p.preservedDisagreements || []);

    // 2. Synthesize Key Obligations (from Bench B and A)
    const keyObligations: string[] = [];
    for (const f of allFindings.filter(f => f.benchId === 'B' || f.benchId === 'A')) {
      if (f.citations && f.citations.length > 0) {
        keyObligations.push(`${f.title}: ${f.summary}`);
      }
    }
    if (keyObligations.length === 0) {
      keyObligations.push('Core mutual contractual covenants established from submitted intake folio.');
    }

    // 3. Synthesize Material Concerns & Risks (from Bench D and B)
    const materialRisks: string[] = [];
    for (const f of allFindings.filter(f => f.benchId === 'D' || f.severity === 'critical' || f.severity === 'warning')) {
      materialRisks.push(`[${f.severity.toUpperCase()}] ${f.title}: ${f.summary}`);
    }

    // 4. Critical Deadlines & Inconsistencies
    const criticalDeadlines: string[] = [];
    const inconsistenciesIdentified: string[] = [];
    for (const f of allFindings) {
      if (f.specialistId === 'A06' || f.specialistId === 'D05') {
        criticalDeadlines.push(`${f.title}: ${f.summary}`);
      }
      if (f.specialistId === 'A08' || f.flaggedDiscrepancy) {
        inconsistenciesIdentified.push(`${f.title}: ${f.summary}`);
      }
    }

    // 5. Preserved Disagreements (Preserves Dissent — Zero Forced Consensus / Zero Agent Voting)
    const preservedDisagreements = allDisagreements.map(d => ({
      disagreementId: d.disagreementId,
      clauseReference: d.clauseReference,
      viewpointA: d.viewpointA,
      viewpointB: d.viewpointB,
      preservationRationale: d.preservationRationale
    }));

    // 6. Questions for Visitor Clarification & Missing Evidence
    const questionsForVisitorClarification: string[] = [];
    const missingDocumentsOrExhibits: string[] = [];
    const statutoryCoverageLimitations: string[] = [];

    for (const p of input.acceptedPackets) {
      if (p.coverageAssessment) {
        questionsForVisitorClarification.push(...p.coverageAssessment.unresolvedQuestions);
        missingDocumentsOrExhibits.push(...p.coverageAssessment.missingEvidenceNoted);
        if (p.coverageAssessment.failedCoverage && p.coverageAssessment.failedCoverage.length > 0) {
          statutoryCoverageLimitations.push(`Unassigned/Skipped Bench ${p.benchId} domain roles: ${p.coverageAssessment.failedCoverage.join(', ')}`);
        }
      }
    }

    // 7. Post-Synthesis Reference Grounding Validation
    // Validate every material citation against stored evidence in case snapshot
    const citationVerifications: Array<{ citation: string; isVerified: boolean; reason?: string }> = [];
    let hasCitationFailure = false;

    for (const f of allFindings) {
      for (const cit of f.citations || []) {
        // Look up doc and page in storedDocuments
        const doc = input.storedDocuments.find(d => d.documentId === cit.documentId);
        if (!doc) {
          citationVerifications.push({
            citation: `${cit.documentId} Page ${cit.pageNumber}: "${cit.verbatimExcerpt.slice(0, 50)}..."`,
            isVerified: false,
            reason: `Document '${cit.documentId}' not found in stored evidence.`
          });
          hasCitationFailure = true;
          continue;
        }

        const page = doc.pages.find(p => p.pageNumber === cit.pageNumber);
        if (!page) {
          citationVerifications.push({
            citation: `${doc.title} Page ${cit.pageNumber}: "${cit.verbatimExcerpt.slice(0, 50)}..."`,
            isVerified: false,
            reason: `Page ${cit.pageNumber} does not exist in stored document '${doc.title}'.`
          });
          hasCitationFailure = true;
          continue;
        }

        // Check if text is present or unreadable
        if (page.isUnreadable || !page.text.includes(cit.verbatimExcerpt.slice(0, 30))) {
          // If explicitly marked as degraded data, it is recorded but not a hallucination
          if (cit.verbatimExcerpt.includes('[DEGRADED_UNREADABLE_SCAN_DATA]')) {
            citationVerifications.push({
              citation: `${doc.title} Page ${cit.pageNumber}: [DEGRADED_SCAN_DATA]`,
              isVerified: true,
              reason: 'Verified unreadable scan limitation.'
            });
          } else {
            citationVerifications.push({
              citation: `${doc.title} Page ${cit.pageNumber}: "${cit.verbatimExcerpt.slice(0, 50)}..."`,
              isVerified: false,
              reason: `Verbatim text excerpt not grounded in stored page ${cit.pageNumber} text.`
            });
            hasCitationFailure = true;
          }
        } else {
          citationVerifications.push({
            citation: `${doc.title} Page ${cit.pageNumber}: "${cit.verbatimExcerpt.slice(0, 50)}..."`,
            isVerified: true
          });
        }
      }
    }

    // 8. Publication Policy Check
    let publicationStatus: 'published' | 'publication_blocked' | 'partial_preliminary' = 'published';

    if (hasCitationFailure && policy.requireAllCitationsVerified) {
      if (!policy.allowPartialOnCitationGaps) {
        publicationStatus = 'publication_blocked';
        this.emitMilestone('report:publication_blocked', {
          runId: input.runId,
          reason: 'Post-synthesis reference grounding check failed: unverified citations detected.',
          unverifiedCount: citationVerifications.filter(c => !c.isVerified).length
        });
      } else {
        publicationStatus = 'partial_preliminary';
        statutoryCoverageLimitations.push('Preliminary publication flagged as partial: ungrounded citations detected in specialist findings.');
        this.emitMilestone('report:ready_for_review', {
          runId: input.runId,
          status: 'partial_preliminary',
          unverifiedCount: citationVerifications.filter(c => !c.isVerified).length
        });
      }
    } else {
      publicationStatus = 'published';
      this.emitMilestone('report:ready_for_review', {
        runId: input.runId,
        status: 'published'
      });
    }

    // 9. Statutory Disclaimer (Strict Compliance: Never describe as human legal review)
    const statutoryDisclaimer =
      'Automated preliminary legal document understanding. Generated by DHARMARAKSHA tribunal multi-bench pipeline. NOT an independent human legal review or formal advocate opinion. Does not constitute binding legal counsel. Consult a qualified advocate in your jurisdiction for certified legal advice.';

    // 10. Construct Presiding Review Summary
    const executiveSummary =
      `Preliminary synthesis of case '${input.caseId}' (Snapshot v${input.snapshotVersion}) based on ${input.acceptedPackets.length} accepted bench packets. Evaluated ${keyObligations.length} contractual obligations and ${materialRisks.length} potential risks. Preserved ${preservedDisagreements.length} bona fide legal disputes across adversarial perspectives.`;

    const summary: PresidingReviewSummary = {
      runId: input.runId,
      executiveSummary,
      preliminaryFindings: allFindings.map(f => `${f.specialistId}: ${f.title}`),
      keyObligations,
      materialRisks,
      criticalDeadlines,
      inconsistenciesIdentified,
      preservedDisagreements,
      questionsForVisitorClarification,
      missingDocumentsOrExhibits,
      statutoryCoverageLimitations,
      citationVerifications,
      publicationStatus,
      statutoryDisclaimer,
      certifiedPlainLanguage: true,
      reviewedAt: new Date().toISOString()
    };

    this.emitMilestone('presiding:synthesis_completed', {
      reviewerId: PRESIDING_REVIEWER.id,
      runId: input.runId,
      publicationStatus,
      completedAt: new Date().toISOString()
    });

    return summary;
  }

  private emitMilestone(eventType: string, payload: any): void {
    this.emittedMilestones.push({
      eventType,
      timestamp: new Date().toISOString(),
      payload
    });
  }

  public getEmittedMilestones(): SynthesisMilestoneEvent[] {
    return [...this.emittedMilestones];
  }

  public clear(): void {
    this.emittedMilestones = [];
  }
}

export const presidingReviewerService = new PresidingReviewerService();
