import {
  RoutingPlan,
  RoutingPlanInput,
  RoleRoutingDecision
} from '@dharmaraksha/shared-contracts';
import {
  ALL_SPECIALISTS_MAP,
  SpecialistDefinition
} from '@dharmaraksha/tribunal-definitions';

export class RoutingPlanner {
  /**
   * Generates a deterministic, persisted routing plan based on document types,
   * factual uncertainty, jurisdiction, and questions raised across the selected documents.
   *
   * Benches Progression:
   * - Bench A establishes evidence (Stage 1)
   * - Appropriate Bench B roles interpret obligations & Bench C checks authority (Stage 2)
   * - Bench D challenges (Stage 3)
   * - Bench E verifies and explains (Stage 4)
   *
   * Every one of the 50 specialists is explicitly evaluated with a persisted rationale
   * for why it was selected or skipped.
   */
  public generateRoutingPlan(input: RoutingPlanInput): RoutingPlan {
    const planId = `plan-${input.caseId}-${input.snapshotVersion}-${Date.now()}`;
    const roleDecisions: Record<string, RoleRoutingDecision> = {};

    const categoriesLower = (input.documentCategories || []).map(c => c.toLowerCase());
    const titlesLower = (input.documentTitles || []).map(t => t.toLowerCase());

    const hasTenancy = categoriesLower.some(c =>
      c.includes('tenancy') || c.includes('lease') || c.includes('rent') || c.includes('license')
    ) || titlesLower.some(t => t.includes('lease') || t.includes('tenancy') || t.includes('rent'));

    const hasEmployment = categoriesLower.some(c =>
      c.includes('employment') || c.includes('labour') || c.includes('service_agreement') || c.includes('consultancy')
    ) || titlesLower.some(t => t.includes('employment') || t.includes('appointment') || t.includes('service agreement'));

    const hasIp = categoriesLower.some(c =>
      c.includes('intellectual_property') || c.includes('ip_assignment') || c.includes('nda') || c.includes('software_license')
    ) || titlesLower.some(t => t.includes('ip') || t.includes('intellectual property') || t.includes('nda') || t.includes('assignment'));

    const hasPropertySale = categoriesLower.some(c =>
      c.includes('property_sale') || c.includes('sale_deed') || c.includes('conveyance')
    ) || titlesLower.some(t => t.includes('sale deed') || t.includes('conveyance') || t.includes('property sale'));

    const hasConsumer = categoriesLower.some(c =>
      c.includes('consumer') || c.includes('warranty') || c.includes('retail')
    ) || titlesLower.some(t => t.includes('consumer') || t.includes('warranty'));

    const hasMsme = categoriesLower.some(c =>
      c.includes('msme') || c.includes('supplier') || c.includes('vendor') || c.includes('invoice')
    ) || titlesLower.some(t => t.includes('msme') || t.includes('vendor') || t.includes('invoice'));

    const hasLending = categoriesLower.some(c =>
      c.includes('loan') || c.includes('security') || c.includes('bank_guarantee') || c.includes('deposit') || c.includes('promissory')
    ) || titlesLower.some(t => t.includes('loan') || t.includes('guarantee') || t.includes('deposit') || t.includes('promissory'));

    const stage1: string[] = [];
    const stage2: string[] = [];
    const stage3: string[] = [];
    const stage4: string[] = [];

    // Evaluate each of the 50 specialists
    for (const [id, spec] of ALL_SPECIALISTS_MAP.entries()) {
      let decision: 'selected' | 'skipped' = 'selected';
      let reason = '';
      let stage: 1 | 2 | 3 | 4 = 1;
      let dependencies: string[] = [];

      switch (spec.benchId) {
        case 'A': {
          stage = 1;
          dependencies = [];
          if (input.hasFactualUncertainty && (id === 'A01' || id === 'A03' || id === 'A08')) {
            reason = `Selected (High Priority): Factual uncertainty detected in OCR/page scan; stringent text and continuity verification required.`;
          } else {
            reason = `Selected: Foundational evidence grounding required for all case documents.`;
          }
          stage1.push(id);
          break;
        }

        case 'B': {
          stage = 2;
          dependencies = ['A10']; // Depends on Bench A Evidence Chair

          if (id === 'B01') {
            decision = 'selected';
            reason = 'Selected: Core contractual terms, mutual obligations, and conditions analysis.';
            stage2.push(id);
          } else if (id === 'B02') {
            if (hasEmployment) {
              decision = 'selected';
              reason = 'Selected: Analyzes employment terms, non-compete covenants, and compensation obligations.';
              stage2.push(id);
            } else {
              decision = 'skipped';
              reason = 'Skipped: Case documents contain no employment agreements or labour dispute terms.';
            }
          } else if (id === 'B03') {
            if (hasTenancy) {
              decision = 'selected';
              reason = 'Selected: Analyzes tenancy terms, rent schedules, deposit refund conditions, and premises covenants.';
              stage2.push(id);
            } else {
              decision = 'skipped';
              reason = 'Skipped: Case documents contain no lease, tenancy, or real estate rental terms.';
            }
          } else if (id === 'B04') {
            if (hasPropertySale) {
              decision = 'selected';
              reason = 'Selected: Analyzes title, encumbrances, and real estate conveyance covenants.';
              stage2.push(id);
            } else {
              decision = 'skipped';
              reason = 'Skipped: Case documents contain no real estate conveyance or title transfer instruments.';
            }
          } else if (id === 'B05') {
            if (hasConsumer) {
              decision = 'selected';
              reason = 'Selected: Analyzes consumer service standards, warranties, and unfair contract terms.';
              stage2.push(id);
            } else {
              decision = 'skipped';
              reason = 'Skipped: Case documents contain no consumer service or retail purchase terms.';
            }
          } else if (id === 'B06') {
            if (hasMsme) {
              decision = 'selected';
              reason = 'Selected: Analyzes small-business vendor terms and statutory delayed payment protections.';
              stage2.push(id);
            } else {
              decision = 'skipped';
              reason = 'Skipped: Case documents contain no MSME supply or commercial trade covenants.';
            }
          } else if (id === 'B07') {
            if (hasLending) {
              decision = 'selected';
              reason = 'Selected: Analyzes loan terms, security charges, bank guarantees, and deposit instruments.';
              stage2.push(id);
            } else {
              decision = 'skipped';
              reason = 'Skipped: Case documents contain no lending facilities, debt instruments, or security charges.';
            }
          } else if (id === 'B08') {
            if (hasIp) {
              decision = 'selected';
              reason = 'Selected: Analyzes intellectual property ownership, license scope, and confidentiality covenants.';
              stage2.push(id);
            } else {
              decision = 'skipped';
              reason = 'Skipped: Case documents contain no IP assignment or confidentiality covenants.';
            }
          } else if (id === 'B09') {
            decision = 'selected';
            reason = 'Selected: Analyzes dispute resolution mechanisms, arbitration, jurisdiction, and termination exit terms.';
            stage2.push(id);
          } else if (id === 'B10') {
            decision = 'selected';
            reason = 'Selected: Synthesizes active Bench B obligation findings into bench packet.';
            stage2.push(id);
          }
          break;
        }

        case 'C': {
          stage = 2;
          dependencies = ['A10']; // Depends on Bench A Evidence Chair

          if (id === 'C01') {
            reason = 'Selected: Analyzes governing law and territorial jurisdiction.';
          } else if (id === 'C02') {
            reason = 'Selected: Retrieves central statutes relevant to identified obligations.';
          } else if (id === 'C03') {
            reason = input.jurisdiction
              ? `Selected: Evaluates state-specific legislation for ${input.jurisdiction}.`
              : 'Selected: Evaluates state-specific statutory notifications.';
          } else if (id === 'C04') {
            reason = 'Selected: Evaluates municipal notifications, delegated rules, and stamp duty schedules.';
          } else if (id === 'C05') {
            reason = 'Selected: Verifies statutory currency and screens against repealed statutes.';
          } else if (id === 'C06') {
            reason = 'Selected: Identifies landmark Supreme Court precedents relevant to obligations.';
          } else if (id === 'C07') {
            reason = 'Selected: Assesses factual similarity and doctrine applicability.';
          } else if (id === 'C08') {
            reason = 'Selected: Identifies distinguishing precedents and counter-doctrines.';
          } else if (id === 'C09') {
            reason = 'Selected: Cryptographically verifies legal citations against authentic statutory corpus.';
          } else if (id === 'C10') {
            reason = 'Selected: Consolidates Bench C legal source packet.';
          }
          decision = 'selected';
          stage2.push(id);
          break;
        }

        case 'D': {
          stage = 3;
          dependencies = ['B10', 'C10']; // Depends on Bench B and Bench C Chairs

          if (id === 'D07' && input.hasFactualUncertainty) {
            reason = 'Selected (High Priority): Factual uncertainty and/or unreadable pages detected in case intake snapshot.';
          } else if (id === 'D01') {
            reason = 'Selected: Evaluates risks and remedies from document holder\'s perspective.';
          } else if (id === 'D02') {
            reason = 'Selected: Evaluates commercial defensibility and remedies from counterparty\'s perspective.';
          } else if (id === 'D03') {
            reason = 'Selected: Flags vague drafting, unilateral discretion, and ambiguous clauses.';
          } else if (id === 'D04') {
            reason = 'Selected: Quantifies maximum financial downside, deposit forfeiture, and penal interest.';
          } else if (id === 'D05') {
            reason = 'Selected: Maps cure periods, grace periods, and notice default timelines.';
          } else if (id === 'D06') {
            reason = 'Selected: Tests mutuality of obligations and substantive fairness.';
          } else if (id === 'D07') {
            reason = 'Selected: Identifies missing annexures and unproduced evidence records.';
          } else if (id === 'D08') {
            reason = 'Selected: Highlights unconscionable clauses, void restraints, and severe red flags.';
          } else if (id === 'D09') {
            reason = 'Selected: Simulates dispute trajectories under contractual default scenarios.';
          } else if (id === 'D10') {
            reason = 'Selected: Consolidates Bench D adversarial findings and risk matrix.';
          }
          decision = 'selected';
          stage3.push(id);
          break;
        }

        case 'E': {
          stage = 4;
          dependencies = ['D10']; // Depends on Bench D Risk Chair

          if (id === 'E01') {
            reason = 'Selected: Verifies every finding links to verbatim document text or verified statute.';
          } else if (id === 'E02') {
            reason = 'Selected: Evaluates opposing adversarial positions (D01 vs D02) in bounded contradiction round without agent voting.';
          } else if (id === 'E03') {
            reason = 'Selected: Reconciles financial arithmetic, deposit calculations, and calendar timelines.';
          } else if (id === 'E04') {
            reason = input.questionsRaised && input.questionsRaised.length > 0
              ? `Selected: Audits finding coverage against ${input.questionsRaised.length} visitor questions.`
              : 'Selected: Audits finding coverage against full document scope.';
          } else if (id === 'E05') {
            reason = 'Selected: Rewrites technical legal findings into accessible, citizen-friendly language.';
          } else if (id === 'E06') {
            reason = 'Selected: Verifies Kannada/Hindi terminology accuracy for multilingual synthesis.';
          } else if (id === 'E07') {
            reason = 'Selected: Prepares targeted clarification requests for the visitor.';
          } else if (id === 'E08') {
            reason = 'Selected: Categorizes actionable issues requiring professional legal counsel.';
          } else if (id === 'E09') {
            reason = 'Selected: Redacts sensitive personal and financial identifiers from public summaries.';
          } else if (id === 'E10') {
            reason = 'Selected: Finalizes verified Bench E packet for the Presiding Reviewer.';
          }
          decision = 'selected';
          stage4.push(id);
          break;
        }
      }

      roleDecisions[id] = {
        specialistId: id,
        benchId: spec.benchId,
        roleName: spec.name,
        decision,
        reason,
        stage,
        dependencies,
        tablePositionIndex: spec.appearance.tablePositionIndex,
        timeoutMs: spec.timeoutMs
      };
    }

    const totalSelected = Object.values(roleDecisions).filter(d => d.decision === 'selected').length;
    const totalSkipped = Object.values(roleDecisions).filter(d => d.decision === 'skipped').length;

    return {
      planId,
      caseId: input.caseId,
      snapshotVersion: input.snapshotVersion,
      documentCategories: input.documentCategories,
      jurisdiction: input.jurisdiction || 'Central/General',
      factualUncertaintyDetected: input.hasFactualUncertainty,
      uncertaintyReasons: input.uncertaintyReasons || [],
      questionsRaised: input.questionsRaised || [],
      totalSpecialistsConsidered: 50,
      totalSelected,
      totalSkipped,
      roleDecisions,
      stages: {
        stage1_evidenceGrounding: stage1,
        stage2_substantiveObligationsAndSources: stage2,
        stage3_adversarialEvaluation: stage3,
        stage4_verificationAndSynthesis: stage4
      },
      createdAt: new Date().toISOString()
    };
  }
}

export const routingPlanner = new RoutingPlanner();

