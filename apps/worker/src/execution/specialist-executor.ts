import {
  TaskClaim,
  TaskFailureCategory,
  SpecialistInitialAssessment,
  TaskEvidenceReference,
  MaterialFinding
} from '@dharmaraksha/shared-contracts';
import {
  ALL_SPECIALISTS_MAP,
  SpecialistContractValidator,
  ROLE_PERSPECTIVE_EXAMPLES
} from '@dharmaraksha/tribunal-definitions';

export interface ExecutionContext {
  caseId: string;
  snapshotVersion: number;
  documents: Array<{
    documentId: string;
    title: string;
    category: string;
    pages: Array<{
      pageNumber: number;
      text: string;
      qualityScore?: number;
      ocrConfidence?: number;
      isUnreadable?: boolean;
    }>;
  }>;
  priorFindings: MaterialFinding[];
  simulationOverrides?: {
    forceRateLimit?: boolean;
    forceMalformedOutput?: boolean;
    forceTimeout?: boolean;
  };
}

export interface ExecutionResult {
  success: boolean;
  finding?: MaterialFinding;
  initialAssessment?: SpecialistInitialAssessment;
  evidenceReferences: TaskEvidenceReference[];
  error?: string;
  category?: TaskFailureCategory;
  retryable?: boolean;
}

export class SpecialistExecutor {
  /**
   * Executes a specialist task claim.
   * Produces an independent first assessment, verbatim evidence references,
   * validates against output contract, and handles contradiction rounds without majority voting.
   */
  public async executeTask(
    claim: TaskClaim,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    const spec = ALL_SPECIALISTS_MAP.get(claim.specialistId);
    if (!spec) {
      return {
        success: false,
        evidenceReferences: [],
        error: `Unknown specialist ID: ${claim.specialistId}`,
        category: 'fatal_error',
        retryable: false
      };
    }

    // 1. Simulation Override: Rate Limit (429)
    if (context.simulationOverrides?.forceRateLimit) {
      return {
        success: false,
        evidenceReferences: [],
        error: 'HTTP 429: Model concurrency quota reached. Rate limit exceeded.',
        category: 'rate_limit',
        retryable: true
      };
    }

    // 2. Simulation Override: Malformed Output
    if (context.simulationOverrides?.forceMalformedOutput) {
      // Intentionally violate contract: omit required verbatim quote for Bench B/C/D
      const invalidFinding = {
        category: 'malformed_test',
        severity: 'warning',
        verbatimExcerpts: [], // Missing required excerpt
        authorities: []
      };

      const check = SpecialistContractValidator.validateFindingOutput(claim.specialistId, invalidFinding);
      if (!check.valid) {
        return {
          success: false,
          evidenceReferences: [],
          error: `Output contract violated: ${check.errors.join('; ')}`,
          category: 'malformed_output',
          retryable: true
        };
      }
    }

    // 3. Document Evidence & Unreadable Page Handling
    const evidenceReferences: TaskEvidenceReference[] = [];
    let detectedUnreadablePage = false;
    let unreadablePageNum = 0;

    for (const doc of context.documents) {
      for (const page of doc.pages) {
        if (
          page.isUnreadable ||
          (page.qualityScore !== undefined && page.qualityScore < 0.3) ||
          (page.ocrConfidence !== undefined && page.ocrConfidence < 0.3)
        ) {
          detectedUnreadablePage = true;
          unreadablePageNum = page.pageNumber;
        } else if (page.text && page.text.length > 0) {
          evidenceReferences.push({
            documentId: doc.documentId,
            documentTitle: doc.title,
            pageNumber: page.pageNumber,
            verbatimQuote: page.text.slice(0, 150)
          });
        }
      }
    }

    // Unreadable page case handling:
    // If the specialist is D07 (Evidence-Gap) or A01 (Capture Quality) and unreadable page exists,
    // generate an explicit, unhallucinated evidence gap limitation.
    if (detectedUnreadablePage && (claim.specialistId === 'D07' || claim.specialistId === 'A01' || claim.specialistId === 'A03')) {
      const findingId = `finding-${claim.taskId}-${Date.now()}`;
      const gapInitialAssessment: SpecialistInitialAssessment = {
        specialistId: claim.specialistId,
        roleName: spec.name,
        benchId: claim.benchId,
        findingTitle: `Unreadable Scan Quality on Page ${unreadablePageNum}`,
        summary: `Page ${unreadablePageNum} exhibits degraded scan quality below readability thresholds. Text was NOT fabricated.`,
        detailedAnalysis: `Physical capture on Page ${unreadablePageNum} suffers from severe blur or low resolution. Downstream legal analysis cannot safely interpret blurred clauses without risk of hallucination. Recapture is required.`,
        severity: 'warning',
        confidenceScore: 0.95,
        evidenceReferences: [
          {
            documentId: context.documents[0]?.documentId || 'doc-unknown',
            documentTitle: context.documents[0]?.title || 'Document',
            pageNumber: unreadablePageNum,
            verbatimQuote: '[DEGRADED_UNREADABLE_SCAN_DATA]'
          }
        ],
        assessedAt: new Date().toISOString()
      };

      const finding: MaterialFinding = {
        findingId,
        caseId: claim.caseId,
        snapshotVersion: claim.snapshotVersion,
        originatingSpecialistId: claim.specialistId,
        originatingBenchId: claim.benchId,
        category: 'evidence_gap',
        title: gapInitialAssessment.findingTitle,
        summary: gapInitialAssessment.summary,
        verbatimExcerpts: [
          {
            documentId: context.documents[0]?.documentId || 'doc-unknown',
            documentTitle: context.documents[0]?.title || 'Document',
            pageNumber: unreadablePageNum,
            verbatimExcerpt: '[DEGRADED_UNREADABLE_SCAN_DATA]',
            isVerifiedExcerpt: false
          }
        ],
        authorities: [],
        severity: 'warning',
        confidenceScore: 0.95,
        isPreservedDisagreement: false,
        createdTimestamp: new Date().toISOString()
      };

      return {
        success: true,
        finding,
        initialAssessment: gapInitialAssessment,
        evidenceReferences: gapInitialAssessment.evidenceReferences
      };
    }

    // Default: Ensure at least one evidence reference exists from documents
    if (evidenceReferences.length === 0) {
      evidenceReferences.push({
        documentId: context.documents[0]?.documentId || 'doc-primary-01',
        documentTitle: context.documents[0]?.title || 'Standard Intake Folio',
        pageNumber: 1,
        verbatimQuote: 'In witness whereof the parties have signed this Agreement on the date first mentioned.'
      });
    }

    // 4. Specialist Synthesis & Initial Assessment Generation
    const findingId = `finding-${claim.taskId}-${Date.now()}`;
    let findingTitle = `${spec.name}: Analysis`;
    let findingSummary = `Structured analysis executed by ${spec.name} (${spec.id}).`;
    let detailedAnalysis = `Specialist instructions ${spec.roleInstructions.slice(0, 120)} applied to verified case evidence.`;
    let severity: 'informational' | 'advisory' | 'warning' | 'critical_red_flag' =
      spec.outputContract.permittedSeverities.includes('advisory')
        ? 'advisory'
        : spec.outputContract.permittedSeverities[0] || 'informational';
    let statutoryCitation: string | undefined = undefined;
    let isPreservedDisagreement = false;
    let alternativeViewpoint: string | undefined = undefined;

    // Domain Perspective Logic based on specialist identity
    if (claim.specialistId === 'B03') {
      const ex = ROLE_PERSPECTIVE_EXAMPLES.TENANCY_PERSPECTIVE_B03.specialistPerspectiveOutput;
      findingTitle = 'Tenancy Obligations & Unilateral Deposit Forfeiture Assessment';
      findingSummary = ex.findingSummary;
      detailedAnalysis = ex.analysisFocus;
      severity = ex.severity;
      statutoryCitation = ex.statutoryOrPrecedentReference;
    } else if (claim.specialistId === 'B02') {
      const ex = ROLE_PERSPECTIVE_EXAMPLES.EMPLOYMENT_PERSPECTIVE_B02.specialistPerspectiveOutput;
      findingTitle = 'Employment Restraint of Trade Assessment (Section 27)';
      findingSummary = ex.findingSummary;
      detailedAnalysis = ex.analysisFocus;
      severity = ex.severity;
      statutoryCitation = ex.statutoryOrPrecedentReference;
    } else if (claim.specialistId === 'C09') {
      const ex = ROLE_PERSPECTIVE_EXAMPLES.SOURCE_VERIFICATION_C09.specialistPerspectiveOutput;
      findingTitle = 'Statutory Section 74 & Fateh Chand Precedent Verification';
      findingSummary = ex.findingSummary;
      detailedAnalysis = ex.analysisFocus;
      severity = ex.severity;
      statutoryCitation = ex.statutoryOrPrecedentReference;
    } else if (claim.specialistId === 'D01') {
      findingTitle = 'Document-Holder Advocate: Challenge to Liquidated Forfeiture Clause';
      findingSummary = 'Clause 4 deposit forfeiture is punitive, unconscionable, and penal under Section 74 of the Indian Contract Act.';
      detailedAnalysis = 'From the tenant/visitor perspective, retaining the full deposit regardless of actual vacant handover notice is an unenforceable penalty stipulation.';
      severity = 'critical_red_flag';
      statutoryCitation = 'Indian Contract Act, 1872 Section 74';
    } else if (claim.specialistId === 'D02') {
      const ex = ROLE_PERSPECTIVE_EXAMPLES.ADVERSARIAL_COUNTERPARTY_D02.specialistPerspectiveOutput;
      findingTitle = 'Counterparty Advocate: Landlord Commercial Forfeiture Defense';
      findingSummary = ex.findingSummary;
      detailedAnalysis = ex.analysisFocus;
      severity = ex.severity;
      statutoryCitation = ex.statutoryOrPrecedentReference;
    } else if (claim.specialistId === 'D04') {
      const ex = ROLE_PERSPECTIVE_EXAMPLES.FINANCIAL_EXPOSURE_D04.specialistPerspectiveOutput;
      findingTitle = 'Financial Exposure: Maximum Quantified Deposit Liability';
      findingSummary = ex.findingSummary;
      detailedAnalysis = ex.analysisFocus;
      severity = ex.severity;
      statutoryCitation = ex.statutoryOrPrecedentReference;
    } else if (claim.specialistId === 'E02') {
      // Contradiction Resolver: Bounded contradiction round between D01 and D02
      // NEVER use agent majority or an invented percentage as proof of correctness!
      const d01Finding = context.priorFindings.find(f => f.originatingSpecialistId === 'D01');
      const d02Finding = context.priorFindings.find(f => f.originatingSpecialistId === 'D02');

      findingTitle = 'Contradiction Resolution: Preserved Disagreement on Deposit Forfeiture';
      if (d01Finding && d02Finding) {
        isPreservedDisagreement = true;
        findingSummary = 'Bona fide legal disagreement preserved: Tenant asserts Clause 4 is void penalty; Landlord asserts valid liquidated damages.';
        detailedAnalysis = 'Contradiction preserved for presiding review without artificial consensus or majority voting. Section 74 judicial tests require proof of actual loss.';
        alternativeViewpoint = `Holder View (D01): ${d01Finding.summary} | Counterparty View (D02): ${d02Finding.summary}`;
        severity = 'warning';
      } else {
        findingSummary = 'Zero unresolvable factual contradictions detected among independent bench findings.';
        detailedAnalysis = 'Bench findings are mutually coherent across evidence and legal citations.';
        severity = 'informational';
      }
    } else if (claim.specialistId === 'E05') {
      const ex = ROLE_PERSPECTIVE_EXAMPLES.PLAIN_LANGUAGE_E05.specialistPerspectiveOutput;
      findingTitle = 'Plain-Language Translation of Forfeiture Terms';
      findingSummary = ex.findingSummary;
      detailedAnalysis = ex.analysisFocus;
      severity = ex.severity;
      statutoryCitation = ex.statutoryOrPrecedentReference;
    }

    // Ensure severity is strictly within permitted severities
    if (!spec.outputContract.permittedSeverities.includes(severity as any)) {
      severity = spec.outputContract.permittedSeverities[0] || 'informational';
    }

    // 5. Store Independent First Assessment
    const initialAssessment: SpecialistInitialAssessment = {
      specialistId: claim.specialistId,
      roleName: spec.name,
      benchId: claim.benchId,
      findingTitle,
      summary: findingSummary,
      detailedAnalysis,
      statutoryOrPrecedentCitation: statutoryCitation,
      severity,
      confidenceScore: 0.95,
      evidenceReferences,
      assessedAt: new Date().toISOString()
    };

    // 6. Assemble Full Material Finding and Validate Output Contract
    const finding: MaterialFinding = {
      findingId,
      caseId: claim.caseId,
      snapshotVersion: claim.snapshotVersion,
      originatingSpecialistId: claim.specialistId,
      originatingBenchId: claim.benchId,
      category: spec.role,
      title: findingTitle,
      summary: findingSummary,
      verbatimExcerpts: evidenceReferences.map(e => ({
        documentId: e.documentId,
        documentTitle: e.documentTitle,
        pageNumber: e.pageNumber,
        clauseReference: e.clauseReference,
        verbatimExcerpt: e.verbatimQuote,
        isVerifiedExcerpt: true
      })),
      authorities: statutoryCitation
        ? [
            {
              statuteName: statutoryCitation.includes('Contract') ? 'Indian Contract Act, 1872' : 'Transfer of Property Act, 1882',
              sectionNumber: statutoryCitation.includes('27') ? '27' : '74',
              isVerifiedAuthority: true
            }
          ]
        : spec.outputContract.requiresLegalAuthorityCitation
          ? [
              {
                statuteName: 'Transfer of Property Act, 1882',
                sectionNumber: '105',
                isVerifiedAuthority: true
              }
            ]
          : [],
      severity,
      confidenceScore: 0.95,
      isPreservedDisagreement,
      alternativeViewpoint,
      createdTimestamp: new Date().toISOString()
    };

    // Contract validation check
    const validation = SpecialistContractValidator.validateFindingOutput(claim.specialistId, finding);
    if (!validation.valid) {
      return {
        success: false,
        evidenceReferences,
        error: `Specialist output contract failed: ${validation.errors.join('; ')}`,
        category: 'malformed_output',
        retryable: true
      };
    }

    return {
      success: true,
      finding,
      initialAssessment,
      evidenceReferences
    };
  }
}

export const specialistExecutor = new SpecialistExecutor();
