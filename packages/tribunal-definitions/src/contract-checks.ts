import {
  ALL_SPECIALISTS,
  BENCHES,
  getSpecialistById,
  filterEligibleSpecialists
} from './benches.js';
import { MESSENGER, PRESIDING_REVIEWER } from './roles.js';

export interface ContractCheckResult {
  valid: boolean;
  errors: string[];
}

export class SpecialistContractValidator {
  /**
   * Validate the tribunal structure according to Specification S2:
   * - Exactly 5 benches (A, B, C, D, E)
   * - Exactly 10 specialists per bench (total 50)
   * - Chair occupies the 10th seat (tablePositionIndex 9), not an extra seat
   * - All IDs and seatIds are unique and deterministic
   * - Messenger and Presiding Reviewer are separate from the 50 analysts
   */
  public static validateTribunalStructure(): ContractCheckResult {
    const errors: string[] = [];

    // 1. Bench count
    if (BENCHES.length !== 5) {
      errors.push(`Expected exactly 5 benches, found ${BENCHES.length}.`);
    }

    // 2. Total specialists count
    if (ALL_SPECIALISTS.length !== 50) {
      errors.push(`Expected exactly 50 specialists in registry, found ${ALL_SPECIALISTS.length}.`);
    }

    // 3. Unique IDs check
    const idSet = new Set<string>();
    const seatIdSet = new Set<string>();

    for (const s of ALL_SPECIALISTS) {
      if (idSet.has(s.id)) {
        errors.push(`Duplicate specialist ID detected: ${s.id}`);
      }
      idSet.add(s.id);

      if (seatIdSet.has(s.seatId)) {
        errors.push(`Duplicate seat ID detected: ${s.seatId}`);
      }
      seatIdSet.add(s.seatId);
    }

    // 4. Per-bench structure & chair positioning
    for (const bench of BENCHES) {
      if (bench.specialists.length !== 10) {
        errors.push(`Bench ${bench.id} has ${bench.specialists.length} specialists (must be exactly 10).`);
      }

      // Chairs must occupy the 10th seat (tablePositionIndex 9)
      const chair = bench.specialists.find(s => s.isChair);
      if (!chair) {
        errors.push(`Bench ${bench.id} is missing a Chair.`);
      } else {
        if (chair.tablePositionIndex !== 9) {
          errors.push(`Bench ${bench.id} Chair (${chair.id}) is at index ${chair.tablePositionIndex} (must occupy 10th seat at index 9).`);
        }
        if (chair.id !== bench.chairId) {
          errors.push(`Bench ${bench.id} chairId (${bench.chairId}) does not match chair specialist ID (${chair.id}).`);
        }
      }

      // Verify all tablePositionIndex values 0..9 are filled
      const indices = bench.specialists.map(s => s.tablePositionIndex).sort((a, b) => a - b);
      for (let i = 0; i < 10; i++) {
        if (indices[i] !== i) {
          errors.push(`Bench ${bench.id} missing seat index ${i}.`);
        }
      }
    }

    // 5. Messenger and Presiding Reviewer separation
    if (idSet.has(MESSENGER.id)) {
      errors.push(`Messenger (${MESSENGER.id}) must not be inside the 50 analyst registry.`);
    }
    if (idSet.has(PRESIDING_REVIEWER.id)) {
      errors.push(`Presiding Reviewer (${PRESIDING_REVIEWER.id}) must not be inside the 50 analyst registry.`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate that a generated finding complies with its specialist output contract
   */
  public static validateFindingOutput(
    specialistId: string,
    finding: {
      category?: string;
      severity: string;
      verbatimExcerpts?: Array<{ documentId: string; pageNumber: number; verbatimExcerpt: string }>;
      authorities?: Array<{ statuteName?: string; judgmentTitle?: string }>;
    }
  ): ContractCheckResult {
    const errors: string[] = [];
    const specialist = getSpecialistById(specialistId);

    if (!specialist) {
      return { valid: false, errors: [`Specialist ${specialistId} does not exist in the 50-analyst registry.`] };
    }

    const contract = specialist.outputContract;

    // Check severity
    if (!contract.permittedSeverities.includes(finding.severity as any)) {
      errors.push(
        `Specialist ${specialistId} output severity '${finding.severity}' is not permitted by contract (${contract.permittedSeverities.join(', ')}).`
      );
    }

    // Check evidence citation requirement
    if (contract.requiresEvidenceCitation) {
      if (!finding.verbatimExcerpts || finding.verbatimExcerpts.length === 0) {
        errors.push(`Specialist ${specialistId} requires at least one verbatim evidence citation.`);
      } else {
        const hasValidCitation = finding.verbatimExcerpts.some(
          c => c.documentId && typeof c.pageNumber === 'number' && c.verbatimExcerpt?.length > 0
        );
        if (!hasValidCitation) {
          errors.push(`Specialist ${specialistId} citations are incomplete (requires documentId, pageNumber, and verbatimExcerpt).`);
        }
      }
    }

    // Check legal authority citation requirement
    if (contract.requiresLegalAuthorityCitation) {
      if (!finding.authorities || finding.authorities.length === 0) {
        errors.push(`Specialist ${specialistId} requires at least one authentic statutory or precedent authority reference.`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate role assignment behavior:
   * Confirms unselected roles are preserved as 'unassigned' rather than disappearing.
   */
  public static validateRoleAssignment(documentCategory: string): {
    totalEligible: number;
    totalUnassigned: number;
    totalPreserved: number;
    unassignedRemainVisible: boolean;
  } {
    const { eligibleSpecialists, unassignedSpecialists } = filterEligibleSpecialists(documentCategory);
    const totalPreserved = eligibleSpecialists.length + unassignedSpecialists.length;

    return {
      totalEligible: eligibleSpecialists.length,
      totalUnassigned: unassignedSpecialists.length,
      totalPreserved,
      unassignedRemainVisible: totalPreserved === 50
    };
  }
}

