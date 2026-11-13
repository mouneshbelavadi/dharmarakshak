export interface RolePerspectiveExample {
  specialistId: string;
  roleName: string;
  benchId: 'A' | 'B' | 'C' | 'D' | 'E';
  domainContext: string;
  sampleInputClause: string;
  specialistPerspectiveOutput: {
    analysisFocus: string;
    findingSummary: string;
    verbatimCitation: string;
    statutoryOrPrecedentReference?: string;
    severity: 'informational' | 'advisory' | 'warning' | 'critical_red_flag';
    recommendationOrCaveat: string;
  };
}

/**
 * Concrete Perspective Examples demonstrating that different specialist roles
 * extract distinct, non-overlapping legal and practical value from the same facts.
 */
export const ROLE_PERSPECTIVE_EXAMPLES: Record<string, RolePerspectiveExample> = {
  // ─── 1. Tenancy Perspective (B03) ──────────────────────────────────────────
  TENANCY_PERSPECTIVE_B03: {
    specialistId: 'B03',
    roleName: 'Tenancy Analyst',
    benchId: 'B',
    domainContext: 'Commercial Lease Agreement (Suite 402, MG Road, Bengaluru)',
    sampleInputClause:
      'Clause 4. DEPOSIT FORFEITURE: In the event of early vacation before completion of 36 months, the Lessor reserves the unilateral right to forfeit 100% of the security deposit of Rs. 2,50,000.',
    specialistPerspectiveOutput: {
      analysisFocus: 'Tenant rights, security deposit refund conditions, and premature surrender rules.',
      findingSummary:
        'Unilateral 100% security deposit forfeiture upon early vacation constitutes an onerous lock-in penalty. Standard commercial practice allows deduction strictly for actual unpaid rent or documented physical damages.',
      verbatimCitation: 'Lessor reserves the unilateral right to forfeit 100% of the security deposit of Rs. 2,50,000.',
      statutoryOrPrecedentReference: 'Transfer of Property Act, 1882 Section 108(m) & Section 111',
      severity: 'warning',
      recommendationOrCaveat:
        'Negotiate a reciprocal 2-month notice exit clause with deposit refund conditional only upon premises inspection, rather than unconditional forfeiture.'
    }
  },

  // ─── 2. Employment Perspective (B02) ────────────────────────────────────────
  EMPLOYMENT_PERSPECTIVE_B02: {
    specialistId: 'B02',
    roleName: 'Employment Analyst',
    benchId: 'B',
    domainContext: 'Senior Software Architect Employment Agreement',
    sampleInputClause:
      'Clause 9. RESTRICTIVE COVENANT: The Employee agrees that for a period of 24 months following cessation of employment for any reason, the Employee shall not directly or indirectly work for, consult, or operate any software enterprise in India.',
    specialistPerspectiveOutput: {
      analysisFocus: 'Employee mobility, post-termination restraint of trade, and constitutional right to livelihood.',
      findingSummary:
        'The post-termination non-compete clause restricting employment across India for 24 months is void ab initio under Indian law. Employers cannot restrain lawful professional practice post-cessation.',
      verbatimCitation: 'shall not directly or indirectly work for, consult, or operate any software enterprise in India.',
      statutoryOrPrecedentReference: 'Indian Contract Act, 1872 Section 27 (Agreement in Restraint of Trade Void)',
      severity: 'critical_red_flag',
      recommendationOrCaveat:
        'While non-disclosure of confidential trade secrets remains enforceable, the blanket ban on joining a competitor cannot be legally enforced in Indian courts.'
    }
  },

  // ─── 3. Source Verification Perspective (C09) ───────────────────────────────
  SOURCE_VERIFICATION_C09: {
    specialistId: 'C09',
    roleName: 'Citation Verifier',
    benchId: 'C',
    domainContext: 'Verification of Deposit Forfeiture Legal Doctrine',
    sampleInputClause:
      'Draft Finding Claim: Under Section 74 of the Indian Contract Act, 1872 and Fateh Chand v. Balkishan Das (1964 SCR (1) 515), deposit forfeiture requires proof of reasonable compensation.',
    specialistPerspectiveOutput: {
      analysisFocus: 'Authenticity check of cited statutory provisions and judicial citations against verified legal corpus.',
      findingSummary:
        'Citation verified authentic. Section 74 of the Indian Contract Act, 1872 applies to stipulations by way of penalty. The Supreme Court Constitution Bench in Fateh Chand v. Balkishan Das confirmed reasonable compensation is the maximum measure of damages.',
      verbatimCitation:
        'Fateh Chand v. Balkishan Das (1964 SCR (1) 515, Paragraph 10): Section 74 reasonable compensation not exceeding the penalty stipulated for.',
      statutoryOrPrecedentReference: 'statute:ica_1872:s74 & precedent:1964_scr_1_515#para-10',
      severity: 'informational',
      recommendationOrCaveat:
        'Citation is fully authentic and verifiable. Zero hallucinated section numbers detected.'
    }
  },

  // ─── 4. Adversarial Review: Counterparty Advocate Perspective (D02) ────────
  ADVERSARIAL_COUNTERPARTY_D02: {
    specialistId: 'D02',
    roleName: 'Counterparty Advocate',
    benchId: 'D',
    domainContext: 'Adversarial Defense of Landlord\'s Forfeiture Clause',
    sampleInputClause:
      'Clause 4. DEPOSIT FORFEITURE: In the event of early vacation, Lessor reserves unilateral right to forfeit 100% of deposit.',
    specialistPerspectiveOutput: {
      analysisFocus: 'Landlord\'s strongest commercial argument and contractual defense.',
      findingSummary:
        'From the Landlord\'s perspective, Suite 402 was leased on a customized fit-out basis for a 36-month revenue stream. Premature exit causes brokerage costs, vacancy downtime, and advertising expenses; the forfeiture clause was mutually agreed as pre-estimated liquidated damages.',
      verbatimCitation: 'In the event of early vacation before completion of 36 months...',
      statutoryOrPrecedentReference: 'Indian Contract Act, 1872 Section 74 (Liquidated damages pre-estimate)',
      severity: 'advisory',
      recommendationOrCaveat:
        'Anticipate that the Landlord will assert commercial vacancy losses in correspondence to justify retaining the deposit.'
    }
  },

  // ─── 5. Adversarial Review: Financial Exposure Perspective (D04) ────────────
  FINANCIAL_EXPOSURE_D04: {
    specialistId: 'D04',
    roleName: 'Financial Exposure Analyst',
    benchId: 'D',
    domainContext: 'Quantification of Worst-Case Financial Liability',
    sampleInputClause:
      'Deposit: Rs. 2,50,000. Rent: INR 45,000. Late Payment Interest: 18% per annum calculated daily on unpaid balance.',
    specialistPerspectiveOutput: {
      analysisFocus: 'Downside financial exposure calculation under breach scenario.',
      findingSummary:
        'Maximum upfront capital at risk: Rs. 2,50,000 (100% deposit forfeiture). Additionally, 18% per annum compound late penal interest on INR 45,000 represents an annual finance penalty of INR 8,100 per overdue month.',
      verbatimCitation: 'penal interest of 18% per annum calculated on daily balance.',
      statutoryOrPrecedentReference: 'Interest Act, 1978 & Section 74 Contract Act',
      severity: 'warning',
      recommendationOrCaveat:
        'Financial exposure must be capped by specifying that interest applies solely on unpaid rent and cannot exceed prime lending rate.'
    }
  },

  // ─── 6. Plain-Language Explanation Perspective (E05) ────────────────────────
  PLAIN_LANGUAGE_E05: {
    specialistId: 'E05',
    roleName: 'Plain-Language Editor',
    benchId: 'E',
    domainContext: 'Citizen-Facing Summary of Lease Deposit Risk',
    sampleInputClause:
      'Clause 4: Lessor reserves unilateral right to forfeit 100% of security deposit of Rs. 2,50,000 as liquidated damages.',
    specialistPerspectiveOutput: {
      analysisFocus: 'Accessible, jargon-free explanation with actionable transparency for citizens.',
      findingSummary:
        'Plain-English Translation: If you leave the commercial property before your 3-year term ends, the owner wants to keep your entire Rs. 2.5 Lakh deposit, even if the office is in perfect condition. In Indian law, property owners can only deduct for actual financial loss or real damages, not take your whole deposit as a penalty.',
      verbatimCitation: 'forfeit 100% of the security deposit of Rs. 2,50,000',
      severity: 'informational',
      recommendationOrCaveat:
        'Ask the owner to agree in writing that if you give 2 months notice to leave, you will receive your full deposit back minus any unpaid electricity bills or actual physical damages.'
    }
  }
};
