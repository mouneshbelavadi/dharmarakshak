import { CuratedLegalSource, JurisdictionScope } from '@dharmaraksha/shared-contracts';

/**
 * Curated Indian Legal-Source Corpus
 *
 * Narrow, verified repository of authoritative statutory enactments and landmark
 * judicial precedents for Indian tenancy, contract, employment, and consumer law.
 *
 * Strict Compliance Rules:
 *  1. Zero fabrication: every statutory section and precedent citation is verified.
 *  2. No synthetic or guessed India Code / SCR APIs.
 *  3. Accurate temporal applicability and jurisdiction scope.
 *  4. Distinct labeling from user case evidence.
 */
export const CURATED_INDIAN_LEGAL_CORPUS: CuratedLegalSource[] = [
  // ─── 1. Transfer of Property Act, 1882 (Central / Pan-India) ─────────────────
  {
    sourceId: 'src-tpa-1882-s105',
    sourceType: 'statute',
    shortCode: 'TPA_1882',
    actOrInstrumentTitle: 'The Transfer of Property Act, 1882',
    sectionOrItemNumber: 'Section 105',
    jurisdiction: 'union_of_india',
    effectiveDate: '1882-07-01',
    lastReviewedDate: '2026-01-15',
    officialVerbatimText:
      'A lease of immovable property is a transfer of a right to enjoy such property, made for a certain time, express or implied, or in perpetuity, in consideration of a price paid or promised, or of money, a share of crops, service or any other thing of value, to be rendered periodically or on specified occasions to the transferor by the transferee, who accepts the transfer on such terms. The transferor is called the lessor, the transferee is called the lessee, the price is called the premium, and the money, share, service or other thing to be so rendered is called the rent.',
    provisionsSummary:
      'Statutory definition of lease of immovable property, distinguishing premium (security deposit/advance) from recurring rent.',
    isVerifiedAuthority: true,
    sourceLocationAnchor: 'statute:tpa_1882:s105',
    applicableDocumentCategories: ['tenancy_agreement', 'commercial_supply_contract', 'property_sale_deed'],
    tags: ['lease', 'definition', 'lessor', 'lessee', 'rent', 'premium']
  },
  {
    sourceId: 'src-tpa-1882-s106',
    sourceType: 'statute',
    shortCode: 'TPA_1882',
    actOrInstrumentTitle: 'The Transfer of Property Act, 1882',
    sectionOrItemNumber: 'Section 106',
    jurisdiction: 'union_of_india',
    effectiveDate: '1882-07-01',
    lastReviewedDate: '2026-01-15',
    officialVerbatimText:
      'In the absence of a contract or local law or usage to the contrary, a lease of immovable property for agricultural or manufacturing purposes shall be deemed to be a lease from year to year, terminable, on the part of either lessor or lessee, by six months\' notice; and a lease of immovable property for any other purpose shall be deemed to be a lease from month to month, terminable, on the part of either lessor or lessee, by fifteen days\' notice.',
    provisionsSummary:
      'Statutory notice periods for termination of lease in absence of explicit contractual stipulation (15 days for residential/commercial month-to-month leases; 6 months for manufacturing).',
    isVerifiedAuthority: true,
    sourceLocationAnchor: 'statute:tpa_1882:s106',
    applicableDocumentCategories: ['tenancy_agreement', 'legal_notice'],
    tags: ['notice_period', 'termination', 'month_to_month', 'statutory_default']
  },
  {
    sourceId: 'src-tpa-1882-s108',
    sourceType: 'statute',
    shortCode: 'TPA_1882',
    actOrInstrumentTitle: 'The Transfer of Property Act, 1882',
    sectionOrItemNumber: 'Section 108',
    jurisdiction: 'union_of_india',
    effectiveDate: '1882-07-01',
    lastReviewedDate: '2026-01-15',
    officialVerbatimText:
      'In the absence of a contract or local usage to the contrary, the lessor and the lessee of immovable property, as against one another, respectively, possess the rights and are subject to the liabilities mentioned in the rules following... (B) Rights and Liabilities of the Lessee: (m) the lessee is bound to keep, and on the determination of the lease to restore, the property in as good condition as it was in at the time when he was put in possession, reasonable wear and tear and irresistible force excepted; (o) the lessee may use the property and its products as a person of ordinary prudence would use them, but he must not commit waste.',
    provisionsSummary:
      'Statutory obligations of tenant to restore leased premises in original state upon surrender, excluding reasonable wear and tear.',
    isVerifiedAuthority: true,
    sourceLocationAnchor: 'statute:tpa_1882:s108',
    applicableDocumentCategories: ['tenancy_agreement', 'annexure_schedule'],
    tags: ['wear_and_tear', 'restoration', 'fixtures', 'waste', 'tenant_duties']
  },
  {
    sourceId: 'src-tpa-1882-s111',
    sourceType: 'statute',
    shortCode: 'TPA_1882',
    actOrInstrumentTitle: 'The Transfer of Property Act, 1882',
    sectionOrItemNumber: 'Section 111',
    jurisdiction: 'union_of_india',
    effectiveDate: '1882-07-01',
    lastReviewedDate: '2026-01-15',
    officialVerbatimText:
      'A lease of immovable property determines— (a) by efflux of the time limited thereby; (b) where such time is limited conditionally on the happening of some event, by the happening of such event; (c) by express surrender; (d) by implied surrender; (g) by forfeiture; that is to say, (1) in case the lessee breaks an express condition which provides that, on breach thereof, the lessor may re-enter.',
    provisionsSummary:
      'Grounds for determination of lease, including expiry of agreed duration and landlord re-entry upon breach of express covenant.',
    isVerifiedAuthority: true,
    sourceLocationAnchor: 'statute:tpa_1882:s111',
    applicableDocumentCategories: ['tenancy_agreement', 'legal_notice'],
    tags: ['expiry', 'forfeiture', 're_entry', 'determination', 'breach']
  },

  // ─── 2. Indian Contract Act, 1872 (General Contract & Liquidated Damages) ────
  {
    sourceId: 'src-ica-1872-s27',
    sourceType: 'statute',
    shortCode: 'ICA_1872',
    actOrInstrumentTitle: 'The Indian Contract Act, 1872',
    sectionOrItemNumber: 'Section 27',
    jurisdiction: 'union_of_india',
    effectiveDate: '1872-09-01',
    lastReviewedDate: '2026-01-15',
    officialVerbatimText:
      'Every agreement by which any one is restrained from exercising a lawful profession, trade or business of any kind, is to that extent void. Exception 1: One who sells the goodwill of a business may agree with the buyer to refrain from carrying on a similar business, within specified local limits, so long as the buyer carries on a like business therein, provided that such limits appear to the Court reasonable.',
    provisionsSummary:
      'Agreements in restraint of trade are void ab initio. Post-contractual non-compete clauses in employment contracts are unenforceable under Indian law.',
    isVerifiedAuthority: true,
    sourceLocationAnchor: 'statute:ica_1872:s27',
    applicableDocumentCategories: ['employment_contract', 'nda_ip_agreement'],
    tags: ['non_compete', 'restraint_of_trade', 'void', 'employment_restriction']
  },
  {
    sourceId: 'src-ica-1872-s74',
    sourceType: 'statute',
    shortCode: 'ICA_1872',
    actOrInstrumentTitle: 'The Indian Contract Act, 1872',
    sectionOrItemNumber: 'Section 74',
    jurisdiction: 'union_of_india',
    effectiveDate: '1872-09-01',
    lastReviewedDate: '2026-01-15',
    officialVerbatimText:
      'When a contract has been broken, if a sum is named in the contract as the amount to be paid in case of such breach, or if the contract contains any other stipulation by way of penalty, the party complaining of the breach is entitled, whether or not actual damage or loss is proved to have been caused thereby, to receive from the party who has broken the contract reasonable compensation not exceeding the amount so named or, as the case may be, the penalty stipulated for.',
    provisionsSummary:
      'Stipulation for penalty or forfeiture: injured party is entitled only to reasonable compensation not exceeding the named penalty. Unilateral 100% deposit forfeiture clauses are subject to judicial moderation.',
    isVerifiedAuthority: true,
    sourceLocationAnchor: 'statute:ica_1872:s74',
    applicableDocumentCategories: ['tenancy_agreement', 'employment_contract', 'commercial_supply_contract'],
    tags: ['penalty', 'liquidated_damages', 'forfeiture', 'security_deposit', 'compensation']
  },

  // ─── 3. Karnataka State Rent Law (State-Specific Jurisdiction) ───────────────
  {
    sourceId: 'src-kra-1999-s2',
    sourceType: 'statute',
    shortCode: 'KRA_1999',
    actOrInstrumentTitle: 'The Karnataka Rent Act, 1999 (Karnataka Act No. 34 of 2001)',
    sectionOrItemNumber: 'Section 2',
    jurisdiction: 'karnataka',
    effectiveDate: '2001-12-05',
    lastReviewedDate: '2026-01-15',
    officialVerbatimText:
      'Section 2. Application of the Act: (1) The Act applies to all premises situated within the areas specified in Schedule I... (3) Nothing contained in this Act shall apply— (g) to any premises belonging to a company, body corporate or undertaking owned or controlled by the State Government or Central Government; (h) to any premises whose monthly rent exceeds three thousand five hundred rupees in any area to which this Act applies, or commercial premises having plinth area exceeding 14 square metres.',
    provisionsSummary:
      'Scope of Karnataka Rent Act: commercial premises exceeding 14 sq.m or residential premises with monthly rent > Rs. 3,500 are exempt from standard rent protection and are governed by Transfer of Property Act, 1882.',
    isVerifiedAuthority: true,
    sourceLocationAnchor: 'statute:kra_1999:s2',
    applicableDocumentCategories: ['tenancy_agreement'],
    tags: ['karnataka', 'exemption', 'commercial_premises', 'plinth_area', 'jurisdiction']
  },

  // ─── 4. Maharashtra State Rent Law (State-Specific Jurisdiction Comparison) ──
  {
    sourceId: 'src-mrca-1999-s55',
    sourceType: 'statute',
    shortCode: 'MRCA_1999',
    actOrInstrumentTitle: 'The Maharashtra Rent Control Act, 1999',
    sectionOrItemNumber: 'Section 55',
    jurisdiction: 'maharashtra',
    effectiveDate: '2000-03-31',
    lastReviewedDate: '2026-01-15',
    officialVerbatimText:
      'Tenancy agreement to be compulsorily in writing and registered: (1) Notwithstanding anything contained in this Act or any other law for the time being in force, any agreement for a licence or letting of any premises shall be in writing and shall be registered under the Registration Act, 1908.',
    provisionsSummary:
      'Compulsory registration requirement under Maharashtra Rent Control Act. Strictly applicable only within Maharashtra jurisdiction.',
    isVerifiedAuthority: true,
    sourceLocationAnchor: 'statute:mrca_1999:s55',
    applicableDocumentCategories: ['tenancy_agreement'],
    tags: ['maharashtra', 'registration', 'leave_and_licence', 'state_specific']
  },

  // ─── 5. Consumer Protection Act, 2019 (Unfair Contract Terms) ─────────────────
  {
    sourceId: 'src-cpa-2019-s2-46',
    sourceType: 'statute',
    shortCode: 'CPA_2019',
    actOrInstrumentTitle: 'The Consumer Protection Act, 2019',
    sectionOrItemNumber: 'Section 2(46)',
    jurisdiction: 'union_of_india',
    effectiveDate: '2020-07-20',
    lastReviewedDate: '2026-01-15',
    officialVerbatimText:
      '"unfair contract" means a contract between a manufacturer or trader or service provider on one hand, and a consumer on the other, having such terms which cause significant change in the rights of such consumer, including the following, namely: (i) requiring manifestly excessive security deposits to be given by a consumer; (ii) imposing any penalty on the consumer, for the breach of contract thereof which is wholly disproportionate to the loss; (iii) refusing to accept early repayment of debts; (iv) entitling a party to the contract to terminate such contract unilaterally, without reasonable cause.',
    provisionsSummary:
      'Statutory definition of unfair contract terms, explicitly prohibiting excessive security deposits, disproportionate penalties, and unilateral termination without cause.',
    isVerifiedAuthority: true,
    sourceLocationAnchor: 'statute:cpa_2019:s2_46',
    applicableDocumentCategories: ['consumer_service_agreement', 'tenancy_agreement', 'loan_agreement'],
    tags: ['unfair_contract', 'consumer_protection', 'unilateral_termination', 'excessive_deposit']
  },

  // ─── 6. Repealed/Stale Statute (For Stale Law Detection Testing) ──────────────
  {
    sourceId: 'src-ulcra-1976-repealed',
    sourceType: 'statute',
    shortCode: 'ULCRA_1976',
    actOrInstrumentTitle: 'The Urban Land (Ceiling and Regulation) Act, 1976 (Repealed)',
    sectionOrItemNumber: 'Section 3',
    jurisdiction: 'union_of_india',
    effectiveDate: '1976-02-17',
    repealedDate: '1999-03-22',
    lastReviewedDate: '2026-01-15',
    officialVerbatimText:
      '[REPEALED] Persons not entitled to hold vacant land in excess of the ceiling limit. Except as otherwise provided in this Act, on and from the commencement of this Act, no person shall be entitled to hold any vacant land in excess of the ceiling limit.',
    provisionsSummary:
      'Urban land holding ceiling restrictions. Formally REPEALED by Urban Land (Ceiling and Regulation) Repeal Act, 1999 (Act No. 15 of 1999). Inapplicable to transactions entered after 1999.',
    isVerifiedAuthority: true,
    sourceLocationAnchor: 'statute:ulcra_1976:s3',
    applicableDocumentCategories: ['property_sale_deed'],
    tags: ['repealed', 'stale_law', 'urban_ceiling', 'inactive_statute']
  },

  // ─── 7. Landmark Supreme Court Precedents ─────────────────────────────────────
  {
    sourceId: 'src-sc-fateh-chand-1963',
    sourceType: 'precedent',
    shortCode: 'SC_FATEH_CHAND_1963',
    actOrInstrumentTitle: 'Fateh Chand v. Balkishan Das, 1964 SCR (1) 515 (Supreme Court Constitution Bench)',
    sectionOrItemNumber: 'Paragraph 10',
    jurisdiction: 'union_of_india',
    effectiveDate: '1963-01-15',
    lastReviewedDate: '2026-01-15',
    officialVerbatimText:
      'Section 74 of the Indian Contract Act deals with the measure of damages in two classes of cases: (i) where the contract names a sum to be paid in case of breach, and (ii) where the contract contains any other stipulation by way of penalty. The measure of damages in the case of breach of a stipulation by way of penalty is by Section 74 reasonable compensation not exceeding the penalty stipulated for. The jurisdiction of the court to award, or of an arbitrator to award, damages is not limited by the penalty, but the court cannot award as damages an amount exceeding the penalty named.',
    provisionsSummary:
      'A landlord or party cannot automatically forfeit the entire deposit or penalty without showing reasonable nexus to actual loss suffered.',
    isVerifiedAuthority: true,
    sourceLocationAnchor: 'precedent:1964_scr_1_515#para-10',
    applicableDocumentCategories: ['tenancy_agreement', 'commercial_supply_contract'],
    tags: ['deposit_forfeiture', 'penalty_rule', 'reasonable_compensation', 'constitution_bench']
  },
  {
    sourceId: 'src-sc-percept-dmark-2006',
    sourceType: 'precedent',
    shortCode: 'SC_PERCEPT_DMARK_2006',
    actOrInstrumentTitle: 'Percept D\'Mark (India) (P) Ltd. v. Zaheer Khan, (2006) 4 SCC 227 (Supreme Court of India)',
    sectionOrItemNumber: 'Paragraph 63',
    jurisdiction: 'union_of_india',
    effectiveDate: '2006-03-22',
    lastReviewedDate: '2026-01-15',
    officialVerbatimText:
      'Under Section 27 of the Contract Act, a restrictive covenant extending beyond the term of the contract, whether negative or affirmative, is void and not enforceable. The doctrine of restraint of trade does not apply during the continuance of the contract for employment and it applies only when the contract comes to an end.',
    provisionsSummary:
      'Post-contractual restrictive covenants (e.g. post-employment non-compete clauses) are completely void under Section 27 of the Indian Contract Act.',
    isVerifiedAuthority: true,
    sourceLocationAnchor: 'precedent:2006_4_scc_227#para-63',
    applicableDocumentCategories: ['employment_contract', 'nda_ip_agreement'],
    tags: ['non_compete', 'post_termination', 'void_covenant', 'zaheer_khan']
  }
];

export class CuratedLegalCorpusService {
  /**
   * Search legal corpus using query tokens and optional filters
   */
  public searchCorpus(
    queryText: string,
    filters?: {
      jurisdiction?: JurisdictionScope;
      category?: string;
      includeRepealed?: boolean;
    }
  ): CuratedLegalSource[] {
    const rawTokens = queryText.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/);
    const contentTokens = rawTokens.filter(t => t.length > 2 && !GENERIC_LEGAL_WORDS.has(t));

    if (contentTokens.length === 0) return [];

    // Check if query is explicitly directed at an uncurated foreign or state jurisdiction
    const lowerQuery = queryText.toLowerCase();
    if (
      lowerQuery.includes('california') ||
      lowerQuery.includes('united kingdom') ||
      lowerQuery.includes('new york') ||
      lowerQuery.includes('singapore')
    ) {
      return []; // Foreign jurisdictions are not in the Indian legal corpus
    }

    return CURATED_INDIAN_LEGAL_CORPUS.filter(source => {
      // 1. Jurisdiction check
      if (filters?.jurisdiction && filters.jurisdiction !== 'union_of_india') {
        if (source.jurisdiction !== 'union_of_india' && source.jurisdiction !== filters.jurisdiction) {
          return false;
        }
      }

      // 2. Repealed check
      if (!filters?.includeRepealed && source.repealedDate) {
        return false;
      }

      // 3. Category check
      if (filters?.category) {
        if (!source.applicableDocumentCategories.includes(filters.category as any)) {
          return false;
        }
      }

      const searchableBlob = [
        source.shortCode,
        source.actOrInstrumentTitle,
        source.sectionOrItemNumber,
        source.officialVerbatimText,
        source.provisionsSummary,
        ...source.tags
      ]
        .join(' ')
        .toLowerCase();

      // Check for exact shortCode or title match
      if (searchableBlob.includes(source.shortCode.toLowerCase()) && lowerQuery.includes(source.shortCode.toLowerCase())) {
        return true;
      }

      // Count matching content tokens
      const matchCount = contentTokens.filter(tok => searchableBlob.includes(tok)).length;
      return matchCount >= Math.min(2, contentTokens.length);
    });
  }

  /**
   * Retrieve a specific statutory provision or precedent by sourceId or locationAnchor
   */
  public getSourceByIdOrAnchor(identifier: string): CuratedLegalSource | undefined {
    return CURATED_INDIAN_LEGAL_CORPUS.find(
      s => s.sourceId === identifier || s.sourceLocationAnchor === identifier || s.shortCode.toLowerCase() === identifier.toLowerCase()
    );
  }

  /**
   * Assess statutory applicability against a target case jurisdiction
   */
  public evaluateApplicability(
    source: CuratedLegalSource,
    caseJurisdiction: JurisdictionScope = 'karnataka',
    transactionDate: string = new Date().toISOString()
  ): {
    status: 'verified_applicable' | 'wrong_jurisdiction' | 'stale_or_repealed' | 'uncertain_applicability';
    notes: string;
  } {
    // 1. Temporal applicability
    if (source.repealedDate) {
      if (new Date(transactionDate) >= new Date(source.repealedDate)) {
        return {
          status: 'stale_or_repealed',
          notes: `Statute was formally repealed on ${source.repealedDate} and is no longer in force for transactions entered after that date.`
        };
      }
    }

    // 2. Jurisdiction applicability
    if (source.jurisdiction !== 'union_of_india' && source.jurisdiction !== caseJurisdiction) {
      return {
        status: 'wrong_jurisdiction',
        notes: `Jurisdiction mismatch: This enactment belongs to ${source.jurisdiction}, but the subject transaction/property is situated in ${caseJurisdiction}.`
      };
    }

    return {
      status: 'verified_applicable',
      notes: `Verified applicable authority: enacted under ${source.jurisdiction} jurisdiction and in force.`
    };
  }
}

const GENERIC_LEGAL_WORDS = new Set([
  'act', 'section', 'code', 'law', 'the', 'and', 'for', 'with', 'under', 'from', 'all', 'any', 'clause'
]);

export const curatedLegalCorpusService = new CuratedLegalCorpusService();
