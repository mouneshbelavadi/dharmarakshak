export type BenchId = 'A' | 'B' | 'C' | 'D' | 'E';

export type SpecialistCapability =
  | 'read_case_evidence'
  | 'read_curated_legal_corpus'
  | 'resolve_location_anchor'
  | 'detect_cross_document_links'
  | 'run_arithmetic_verifier'
  | 'redact_pii'
  | 'validate_citations'
  | 'evaluate_applicability';

export interface SpecialistAppearance {
  seatId: string; // e.g. "seat-A-01"
  tablePositionIndex: number; // 0 to 9 around the round table
  deskAngleDegrees: number; // radial angle in 3D scene (0, 36, 72, 108, 144, 180, 216, 252, 288, 324)
  primaryColor: string;
  avatarSeed: string; // deterministic identifier ensuring visual continuity across refresh
}

export interface SpecialistOutputContract {
  findingCategory: string;
  permittedSeverities: Array<'informational' | 'advisory' | 'warning' | 'critical_red_flag'>;
  requiresEvidenceCitation: boolean;
  requiresLegalAuthorityCitation: boolean;
  allowsDiscrepancyFlag: boolean;
}

export interface SpecialistEligibilityRule {
  applicableCategories?: string[]; // e.g. ['tenancy_agreement'], or undefined if universally applicable
  defaultStatus: 'auto_selected' | 'conditional_on_domain' | 'conditional_on_discrepancy';
  reasonForInclusion: string;
}

export interface SpecialistDefinition {
  id: string; // A01 to E10
  benchId: BenchId;
  name: string;
  role: string;
  taskObjective: string;
  focus: string;
  isChair: boolean;
  tablePositionIndex: number; // 0 to 9
  seatId: string; // e.g. "seat-A-01"
  appearance: SpecialistAppearance;
  eligibility: SpecialistEligibilityRule;
  evidenceInputs: string[];
  roleInstructions: string;
  allowedReadOnlyCapabilities: SpecialistCapability[];
  outputContract: SpecialistOutputContract;
  timeoutMs: number;
  promptVersion: string;
}

export interface BenchDefinition {
  id: BenchId;
  name: string;
  workingPrinciple: string;
  chairId: string;
  primaryColor: string;
  specialists: SpecialistDefinition[];
}

// ─── Bench A: Document and Evidence (A01 - A10) ──────────────────────────────
export const BENCH_A_SPECIALISTS: SpecialistDefinition[] = [
  {
    id: 'A01',
    benchId: 'A',
    name: 'Capture Quality Analyst',
    role: 'Locate blur, glare, cropping, rotation, and unreadable regions; request targeted rescans',
    taskObjective: 'Ensure optical and digital legibility of submitted page images before interpretation commences.',
    focus: 'Physical scan quality',
    isChair: false,
    tablePositionIndex: 0,
    seatId: 'seat-A-01',
    appearance: { seatId: 'seat-A-01', tablePositionIndex: 0, deskAngleDegrees: 0, primaryColor: '#3b82f6', avatarSeed: 'seed-A01-quality' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Quality triage is mandatory on all submitted evidence.' },
    evidenceInputs: ['captured_pages', 'image_metadata', 'ocr_confidence'],
    roleInstructions: 'Locate blur, glare, cropping, rotation, and unreadable regions. Mark uncertain text passages explicitly and formulate targeted recapture requests for illegible pages.',
    allowedReadOnlyCapabilities: ['read_case_evidence', 'resolve_location_anchor'],
    outputContract: { findingCategory: 'Extraction Quality', permittedSeverities: ['informational', 'advisory', 'warning'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: true },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'A02',
    benchId: 'A',
    name: 'Page Continuity Analyst',
    role: 'Check ordering, duplicates, missing-page indicators, annexures, and cross-page continuity',
    taskObjective: 'Verify sequential pagination, detect duplicate pages without deleting them, and audit referenced annexures.',
    focus: 'Structural sequence',
    isChair: false,
    tablePositionIndex: 1,
    seatId: 'seat-A-02',
    appearance: { seatId: 'seat-A-02', tablePositionIndex: 1, deskAngleDegrees: 36, primaryColor: '#3b82f6', avatarSeed: 'seed-A02-continuity' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Document boundaries and page order must be validated for every case.' },
    evidenceInputs: ['ordered_pages', 'page_manifest', 'document_metadata'],
    roleInstructions: 'Check ordering, duplicates, missing-page indicators, and cross-page sentence flow. Flag gaps between page numbers and flag duplicate pages without silently deleting legitimate duplicates.',
    allowedReadOnlyCapabilities: ['read_case_evidence', 'detect_cross_document_links'],
    outputContract: { findingCategory: 'Page Continuity', permittedSeverities: ['informational', 'warning', 'critical_red_flag'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: true },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'A03',
    benchId: 'A',
    name: 'Text Fidelity Analyst',
    role: 'Compare extracted text with page evidence; flag uncertain names, numbers, and negations',
    taskObjective: 'Prevent hallucinated or erroneous transcription of material nouns, numerals, and restrictive covenants.',
    focus: 'Transcription fidelity',
    isChair: false,
    tablePositionIndex: 2,
    seatId: 'seat-A-03',
    appearance: { seatId: 'seat-A-03', tablePositionIndex: 2, deskAngleDegrees: 72, primaryColor: '#3b82f6', avatarSeed: 'seed-A03-fidelity' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Text transcription verification is required for all document sets.' },
    evidenceInputs: ['extracted_text', 'page_passages', 'ocr_confidence'],
    roleInstructions: 'Compare extracted text with page evidence. Specifically inspect risky numbers, dates, party names, and legal negations (shall not, neither, nor, no refund). Never invent confidence scores.',
    allowedReadOnlyCapabilities: ['read_case_evidence'],
    outputContract: { findingCategory: 'Text Fidelity', permittedSeverities: ['informational', 'advisory', 'warning'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: true },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'A04',
    benchId: 'A',
    name: 'Language Analyst',
    role: 'Identify languages and preserve original wording alongside explicitly labeled translations',
    taskObjective: 'Preserve Indian scripts (Kannada, Devanagari, Tamil) and ensure translations remain faithful to source wording.',
    focus: 'Indian script & translation',
    isChair: false,
    tablePositionIndex: 3,
    seatId: 'seat-A-04',
    appearance: { seatId: 'seat-A-04', tablePositionIndex: 3, deskAngleDegrees: 108, primaryColor: '#3b82f6', avatarSeed: 'seed-A04-language' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Multi-script and multilingual intake is native to all cases.' },
    evidenceInputs: ['extracted_text', 'script_metadata', 'detected_languages'],
    roleInstructions: 'Identify source languages and scripts. Preserve original vernacular wording alongside explicitly labeled translations. Keep names, dates, and numbers consistent across language boundaries.',
    allowedReadOnlyCapabilities: ['read_case_evidence'],
    outputContract: { findingCategory: 'Language & Translation', permittedSeverities: ['informational', 'advisory'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'A05',
    benchId: 'A',
    name: 'Parties and Capacities Analyst',
    role: 'Identify named parties and stated roles without claiming verified identity or authority',
    taskObjective: 'Extract all individuals, corporate entities, and their stated contractual capacities.',
    focus: 'Signatories & entities',
    isChair: false,
    tablePositionIndex: 4,
    seatId: 'seat-A-05',
    appearance: { seatId: 'seat-A-05', tablePositionIndex: 4, deskAngleDegrees: 144, primaryColor: '#3b82f6', avatarSeed: 'seed-A05-parties' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Party identification is essential for establishing contractual privity.' },
    evidenceInputs: ['extracted_text', 'preamble_clauses', 'signature_blocks'],
    roleInstructions: 'Identify named parties and stated roles without claiming verified physical identity or corporate power of attorney. Distinguish individual capacity from representative capacity.',
    allowedReadOnlyCapabilities: ['read_case_evidence'],
    outputContract: { findingCategory: 'Parties & Capacities', permittedSeverities: ['informational', 'warning'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: true },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'A06',
    benchId: 'A',
    name: 'Dates and Amounts Analyst',
    role: 'Extract dates, currencies, amounts, durations, and calculation inputs with locations',
    taskObjective: 'Catalog every financial figure, currency unit, commencement date, expiry deadline, and calculation basis.',
    focus: 'Temporal & financial data',
    isChair: false,
    tablePositionIndex: 5,
    seatId: 'seat-A-06',
    appearance: { seatId: 'seat-A-06', tablePositionIndex: 5, deskAngleDegrees: 180, primaryColor: '#3b82f6', avatarSeed: 'seed-A06-dates-amounts' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Financial and temporal parameters underpin all contractual reviews.' },
    evidenceInputs: ['extracted_text', 'payment_clauses', 'schedule_tables'],
    roleInstructions: 'Extract dates, currencies, amounts, durations, and calculation inputs with exact document and page locations. Flag inconsistencies between numerical figures and written words.',
    allowedReadOnlyCapabilities: ['read_case_evidence', 'run_arithmetic_verifier'],
    outputContract: { findingCategory: 'Dates & Amounts', permittedSeverities: ['informational', 'warning', 'critical_red_flag'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: true },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'A07',
    benchId: 'A',
    name: 'Clause Structure Analyst',
    role: 'Segment numbered clauses, tables, schedules, definitions, and cross-references',
    taskObjective: 'Deconstruct contract architecture into defined terms, operative covenants, and schedules.',
    focus: 'Contract syntax',
    isChair: false,
    tablePositionIndex: 6,
    seatId: 'seat-A-07',
    appearance: { seatId: 'seat-A-07', tablePositionIndex: 6, deskAngleDegrees: 216, primaryColor: '#3b82f6', avatarSeed: 'seed-A07-clause-structure' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Structural segmentation is required for downstream specialist routing.' },
    evidenceInputs: ['extracted_text', 'table_structures'],
    roleInstructions: 'Segment numbered clauses, tables, schedules, definitions, and cross-references. Map dependencies between operative clauses and incorporated schedules.',
    allowedReadOnlyCapabilities: ['read_case_evidence', 'detect_cross_document_links'],
    outputContract: { findingCategory: 'Clause Architecture', permittedSeverities: ['informational', 'advisory'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'A08',
    benchId: 'A',
    name: 'Document Consistency Analyst',
    role: 'Compare repeated facts and incorporated attachments for contradictions',
    taskObjective: 'Detect internal contradictions within a document and across related agreements, receipts, and annexures.',
    focus: 'Cross-document coherence',
    isChair: false,
    tablePositionIndex: 7,
    seatId: 'seat-A-08',
    appearance: { seatId: 'seat-A-08', tablePositionIndex: 7, deskAngleDegrees: 252, primaryColor: '#3b82f6', avatarSeed: 'seed-A08-consistency' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Multi-document consistency analysis is core to case evidence integrity.' },
    evidenceInputs: ['all_case_documents', 'passages_manifest', 'discrepancy_records'],
    roleInstructions: 'Compare repeated facts, dates, amounts, and incorporated attachments for contradictions across submitted documents. Distinguish genuine contradictions from missing attachments.',
    allowedReadOnlyCapabilities: ['read_case_evidence', 'detect_cross_document_links'],
    outputContract: { findingCategory: 'Document Consistency', permittedSeverities: ['advisory', 'warning', 'critical_red_flag'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: true },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'A09',
    benchId: 'A',
    name: 'Sensitive Data Analyst',
    role: 'Mark information requiring restricted display or redaction and separate facts from assumptions',
    taskObjective: 'Guard PII (Aadhaar, PAN, bank account numbers, personal phone numbers) against unintended disclosure.',
    focus: 'Privacy & PII redaction',
    isChair: false,
    tablePositionIndex: 8,
    seatId: 'seat-A-09',
    appearance: { seatId: 'seat-A-09', tablePositionIndex: 8, deskAngleDegrees: 288, primaryColor: '#3b82f6', avatarSeed: 'seed-A09-privacy' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Privacy and data protection audit is mandatory for all submitted records.' },
    evidenceInputs: ['extracted_text', 'pii_candidates'],
    roleInstructions: 'Identify personal identifiers requiring masking or restricted display. Strictly separate verified factual text from user assumptions or unverified annotations.',
    allowedReadOnlyCapabilities: ['read_case_evidence', 'redact_pii'],
    outputContract: { findingCategory: 'Privacy & Sensitivity', permittedSeverities: ['informational', 'advisory', 'warning'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'A10',
    benchId: 'A',
    name: 'Evidence Chair',
    role: 'Reconcile the nine assessments and publish the evidence package, preserving unresolved uncertainty',
    taskObjective: 'Consolidate Bench A findings into a unified, source-anchored canonical evidence packet for Bench B, C, D, and E.',
    focus: 'Evidence synthesis',
    isChair: true, // Chair occupies seat 10 (index 9)
    tablePositionIndex: 9,
    seatId: 'seat-A-10',
    appearance: { seatId: 'seat-A-10', tablePositionIndex: 9, deskAngleDegrees: 324, primaryColor: '#3b82f6', avatarSeed: 'seed-A10-chair' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Evidence Chair consolidates and publishes the official Bench A packet.' },
    evidenceInputs: ['specialist_findings_A01_A09', 'canonical_snapshot'],
    roleInstructions: 'Reconcile assessments A01 through A09. Publish the consolidated evidence packet preserving all unresolved uncertainties. Do not smooth over genuine factual discrepancies.',
    allowedReadOnlyCapabilities: ['read_case_evidence', 'detect_cross_document_links'],
    outputContract: { findingCategory: 'Evidence Consolidation', permittedSeverities: ['informational', 'warning'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: true },
    timeoutMs: 20000,
    promptVersion: 'v1.0.0'
  }
];

// ─── Bench B: Rights and Obligations (B01 - B10) ─────────────────────────────
export const BENCH_B_SPECIALISTS: SpecialistDefinition[] = [
  {
    id: 'B01',
    benchId: 'B',
    name: 'General Contract Analyst',
    role: 'Identify promises, conditions, dependencies, and definitions affecting interpretation',
    taskObjective: 'Analyze general contractual mechanics, covenants, conditions precedent, and mutual promises.',
    focus: 'Commercial terms',
    isChair: false,
    tablePositionIndex: 0,
    seatId: 'seat-B-01',
    appearance: { seatId: 'seat-B-01', tablePositionIndex: 0, deskAngleDegrees: 0, primaryColor: '#10b981', avatarSeed: 'seed-B01-contract' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Applies to all agreements involving contractual promises.' },
    evidenceInputs: ['canonical_evidence_packet', 'covenant_passages'],
    roleInstructions: 'Identify promises, conditions precedent, mutual dependencies, and operative definitions. Map which party bears the primary performance duty under each clause.',
    allowedReadOnlyCapabilities: ['read_case_evidence'],
    outputContract: { findingCategory: 'Contractual Promises', permittedSeverities: ['informational', 'advisory', 'warning'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'B02',
    benchId: 'B',
    name: 'Employment Analyst',
    role: 'Examine work, compensation, restrictions, termination, and employment-related provisions',
    taskObjective: 'Evaluate employment covenants: probation, compensation, IP assignment, post-termination non-compete, and exit notice.',
    focus: 'Labour & employment',
    isChair: false,
    tablePositionIndex: 1,
    seatId: 'seat-B-02',
    appearance: { seatId: 'seat-B-02', tablePositionIndex: 1, deskAngleDegrees: 36, primaryColor: '#10b981', avatarSeed: 'seed-B02-employment' },
    eligibility: { applicableCategories: ['employment_contract', 'nda_ip_agreement'], defaultStatus: 'conditional_on_domain', reasonForInclusion: 'Selected for employment and service agreements.' },
    evidenceInputs: ['employment_clauses', 'compensation_schedules'],
    roleInstructions: 'Examine duties, compensation, non-compete covenants, non-solicitation, and termination terms. Highlight one-sided restrictions and restrictive covenants.',
    allowedReadOnlyCapabilities: ['read_case_evidence'],
    outputContract: { findingCategory: 'Employment Terms', permittedSeverities: ['informational', 'advisory', 'warning', 'critical_red_flag'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'B03',
    benchId: 'B',
    name: 'Tenancy Analyst',
    role: 'Examine rent, deposits, maintenance, possession, renewal, and exit obligations',
    taskObjective: 'Analyze lease terms: rent payment cycles, security deposit return conditions, maintenance split, and eviction triggers.',
    focus: 'Tenancy & lease',
    isChair: false,
    tablePositionIndex: 2,
    seatId: 'seat-B-03',
    appearance: { seatId: 'seat-B-03', tablePositionIndex: 2, deskAngleDegrees: 72, primaryColor: '#10b981', avatarSeed: 'seed-B03-tenancy' },
    eligibility: { applicableCategories: ['tenancy_agreement', 'payment_receipt', 'annexure_schedule'], defaultStatus: 'conditional_on_domain', reasonForInclusion: 'Selected for residential, commercial, and agricultural lease reviews.' },
    evidenceInputs: ['lease_clauses', 'rent_receipts', 'inventory_schedules'],
    roleInstructions: 'Examine rent payment schedules, grace periods, deposit refund timelines, maintenance liabilities, painting deductions, lock-in periods, and grounds for vacation.',
    allowedReadOnlyCapabilities: ['read_case_evidence', 'detect_cross_document_links'],
    outputContract: { findingCategory: 'Tenancy Obligations', permittedSeverities: ['informational', 'advisory', 'warning', 'critical_red_flag'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: true },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'B04',
    benchId: 'B',
    name: 'Property Transaction Analyst',
    role: 'Examine described interests, transfers, warranties, and missing supporting records',
    taskObjective: 'Review title warranties, conveyancing covenants, encumbrances, and registry prerequisites.',
    focus: 'Property conveyancing',
    isChair: false,
    tablePositionIndex: 3,
    seatId: 'seat-B-04',
    appearance: { seatId: 'seat-B-04', tablePositionIndex: 3, deskAngleDegrees: 108, primaryColor: '#10b981', avatarSeed: 'seed-B04-property' },
    eligibility: { applicableCategories: ['property_sale_deed'], defaultStatus: 'conditional_on_domain', reasonForInclusion: 'Selected for real estate conveyancing and sale deeds.' },
    evidenceInputs: ['property_schedule', 'conveyance_clauses'],
    roleInstructions: 'Examine stated property rights, boundaries, consideration payment terms, title warranties, and identify missing supporting records like mutation certificates or encumbrance forms.',
    allowedReadOnlyCapabilities: ['read_case_evidence'],
    outputContract: { findingCategory: 'Property Rights', permittedSeverities: ['informational', 'warning', 'critical_red_flag'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: true },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'B05',
    benchId: 'B',
    name: 'Consumer and Service Analyst',
    role: 'Examine service delivery, complaints, warranties, cancellation, and consumer-facing terms',
    taskObjective: 'Analyze service level commitments, refund policies, unfair contract terms, and consumer remedies.',
    focus: 'Consumer rights',
    isChair: false,
    tablePositionIndex: 4,
    seatId: 'seat-B-05',
    appearance: { seatId: 'seat-B-05', tablePositionIndex: 4, deskAngleDegrees: 144, primaryColor: '#10b981', avatarSeed: 'seed-B05-consumer' },
    eligibility: { applicableCategories: ['consumer_service_agreement'], defaultStatus: 'conditional_on_domain', reasonForInclusion: 'Selected for service agreements and consumer-facing contracts.' },
    evidenceInputs: ['service_clauses', 'cancellation_terms'],
    roleInstructions: 'Examine service commitments, response times, warranty terms, cancellation penalties, and unilateral termination clauses from a consumer protection viewpoint.',
    allowedReadOnlyCapabilities: ['read_case_evidence'],
    outputContract: { findingCategory: 'Consumer Protection', permittedSeverities: ['informational', 'advisory', 'warning'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'B06',
    benchId: 'B',
    name: 'Small-Business Analyst',
    role: 'Examine supply, procurement, service levels, payment dependencies, and commercial exposure',
    taskObjective: 'Evaluate MSME and commercial supply terms: delivery schedules, acceptance criteria, and penalty caps.',
    focus: 'MSME & vendor relations',
    isChair: false,
    tablePositionIndex: 5,
    seatId: 'seat-B-06',
    appearance: { seatId: 'seat-B-06', tablePositionIndex: 5, deskAngleDegrees: 180, primaryColor: '#10b981', avatarSeed: 'seed-B06-business' },
    eligibility: { applicableCategories: ['commercial_supply_contract'], defaultStatus: 'conditional_on_domain', reasonForInclusion: 'Selected for B2B supply and vendor agreements.' },
    evidenceInputs: ['commercial_clauses', 'payment_terms'],
    roleInstructions: 'Examine payment schedules, delivery timelines, inspection rights, delay penalties, and commercial liability limitations affecting small enterprise vendors.',
    allowedReadOnlyCapabilities: ['read_case_evidence'],
    outputContract: { findingCategory: 'Commercial Duties', permittedSeverities: ['informational', 'advisory', 'warning'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'B07',
    benchId: 'B',
    name: 'Lending and Security Analyst',
    role: 'Examine repayment, interest, collateral, guarantees, and financial obligations without giving investment advice',
    taskObjective: 'Review loan amortization terms, compound penal interest rates, collateral liens, and personal guarantees.',
    focus: 'Credit & banking covenants',
    isChair: false,
    tablePositionIndex: 6,
    seatId: 'seat-B-07',
    appearance: { seatId: 'seat-B-07', tablePositionIndex: 6, deskAngleDegrees: 216, primaryColor: '#10b981', avatarSeed: 'seed-B07-lending' },
    eligibility: { applicableCategories: ['loan_agreement'], defaultStatus: 'conditional_on_domain', reasonForInclusion: 'Selected for loan and credit documents.' },
    evidenceInputs: ['loan_schedules', 'security_clauses'],
    roleInstructions: 'Review repayment schedules, interest calculation terms, default triggers, and personal guarantees. Never provide financial or investment advice.',
    allowedReadOnlyCapabilities: ['read_case_evidence', 'run_arithmetic_verifier'],
    outputContract: { findingCategory: 'Lending & Debt', permittedSeverities: ['informational', 'warning', 'critical_red_flag'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'B08',
    benchId: 'B',
    name: 'Data and IP Analyst',
    role: 'Examine confidentiality, data handling, intellectual-property ownership, and permitted uses',
    taskObjective: 'Audit trade secret protection, IP assignment, work-for-hire covenants, and confidentiality terms.',
    focus: 'Intellectual property',
    isChair: false,
    tablePositionIndex: 7,
    seatId: 'seat-B-08',
    appearance: { seatId: 'seat-B-08', tablePositionIndex: 7, deskAngleDegrees: 252, primaryColor: '#10b981', avatarSeed: 'seed-B08-data-ip' },
    eligibility: { applicableCategories: ['nda_ip_agreement', 'employment_contract'], defaultStatus: 'conditional_on_domain', reasonForInclusion: 'Selected for NDAs, IP assignments, and tech employment contracts.' },
    evidenceInputs: ['ip_clauses', 'confidentiality_terms'],
    roleInstructions: 'Examine confidentiality obligations, duration of secrecy, ownership of created intellectual property, and license scopes. Flag perpetual restrictions.',
    allowedReadOnlyCapabilities: ['read_case_evidence'],
    outputContract: { findingCategory: 'Data & Intellectual Property', permittedSeverities: ['informational', 'advisory', 'warning'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'B09',
    benchId: 'B',
    name: 'Exit and Dispute Analyst',
    role: 'Map notice, renewal, termination, dispute steps, and contractual deadlines',
    taskObjective: 'Catalog exit conditions: notice requirements, cure periods, arbitration clauses, and post-termination survival.',
    focus: 'Dispute escalations',
    isChair: false,
    tablePositionIndex: 8,
    seatId: 'seat-B-09',
    appearance: { seatId: 'seat-B-09', tablePositionIndex: 8, deskAngleDegrees: 288, primaryColor: '#10b981', avatarSeed: 'seed-B09-exit' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Exit and termination mechanics are analyzed across all contract types.' },
    evidenceInputs: ['termination_clauses', 'dispute_clauses'],
    roleInstructions: 'Map required notice periods, cure windows, immediate termination triggers, multi-tier dispute escalation steps, and survival clauses.',
    allowedReadOnlyCapabilities: ['read_case_evidence'],
    outputContract: { findingCategory: 'Exit & Dispute Escalation', permittedSeverities: ['informational', 'advisory', 'warning'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'B10',
    benchId: 'B',
    name: 'Obligations Chair',
    role: 'Consolidate applicable domain assessments into a clear party-by-party obligation map',
    taskObjective: 'Synthesize Bench B assessments into an organized matrix of rights, duties, and candidate concerns.',
    focus: 'Obligations synthesis',
    isChair: true, // Chair occupies seat 10 (index 9)
    tablePositionIndex: 9,
    seatId: 'seat-B-10',
    appearance: { seatId: 'seat-B-10', tablePositionIndex: 9, deskAngleDegrees: 324, primaryColor: '#10b981', avatarSeed: 'seed-B10-chair' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Obligations Chair consolidates Bench B findings.' },
    evidenceInputs: ['specialist_findings_B01_B09'],
    roleInstructions: 'Consolidate applicable domain specialist outputs into a structured, party-by-party obligation map. Highlight high-exposure liabilities for legal source checking.',
    allowedReadOnlyCapabilities: ['read_case_evidence'],
    outputContract: { findingCategory: 'Obligations Map', permittedSeverities: ['informational', 'warning'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: false },
    timeoutMs: 20000,
    promptVersion: 'v1.0.0'
  }
];

// ─── Bench C: Indian Legal Sources (C01 - C10) ───────────────────────────────
export const BENCH_C_SPECIALISTS: SpecialistDefinition[] = [
  {
    id: 'C01',
    benchId: 'C',
    name: 'Jurisdiction Analyst',
    role: 'Identify relevant territory, forum, and governing-law questions requiring clarification',
    taskObjective: 'Determine applicable state/central jurisdiction and identify foreign or conflicting forum clauses.',
    focus: 'Territorial jurisdiction',
    isChair: false,
    tablePositionIndex: 0,
    seatId: 'seat-C-01',
    appearance: { seatId: 'seat-C-01', tablePositionIndex: 0, deskAngleDegrees: 0, primaryColor: '#8b5cf6', avatarSeed: 'seed-C01-jurisdiction' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Jurisdiction determination is a necessary predicate for legal retrieval.' },
    evidenceInputs: ['governing_law_clauses', 'premises_location'],
    roleInstructions: 'Identify the territorial jurisdiction, state enactments, and governing-law provisions. Flag attempts to confer jurisdiction on distant courts.',
    allowedReadOnlyCapabilities: ['read_case_evidence', 'evaluate_applicability'],
    outputContract: { findingCategory: 'Jurisdiction', permittedSeverities: ['informational', 'advisory', 'warning'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: true, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'C02',
    benchId: 'C',
    name: 'Statute Retrieval Analyst',
    role: 'Retrieve relevant enactments from the curated authoritative corpus',
    taskObjective: 'Search and link verified central enactments (Transfer of Property Act, Contract Act, Consumer Protection Act).',
    focus: 'Central statutory enactments',
    isChair: false,
    tablePositionIndex: 1,
    seatId: 'seat-C-02',
    appearance: { seatId: 'seat-C-02', tablePositionIndex: 1, deskAngleDegrees: 36, primaryColor: '#8b5cf6', avatarSeed: 'seed-C02-statute' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Statutory cross-checking is conducted on all analyzed agreements.' },
    evidenceInputs: ['candidate_concerns', 'statutory_corpus'],
    roleInstructions: 'Retrieve relevant provisions from the curated Indian statutory corpus. Never fabricate unverified statutes or guess Section numbers.',
    allowedReadOnlyCapabilities: ['read_curated_legal_corpus', 'resolve_location_anchor'],
    outputContract: { findingCategory: 'Statutory Provisions', permittedSeverities: ['informational', 'advisory'], requiresEvidenceCitation: false, requiresLegalAuthorityCitation: true, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'C03',
    benchId: 'C',
    name: 'State-Law Analyst',
    role: 'Check state-specific sources and record when that coverage is unavailable',
    taskObjective: 'Analyze state-specific amendments and rent control statutes (e.g. Karnataka Rent Act, 1999).',
    focus: 'State amendments & acts',
    isChair: false,
    tablePositionIndex: 2,
    seatId: 'seat-C-03',
    appearance: { seatId: 'seat-C-03', tablePositionIndex: 2, deskAngleDegrees: 72, primaryColor: '#8b5cf6', avatarSeed: 'seed-C03-state-law' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'State-level rent and stamp laws vary across states.' },
    evidenceInputs: ['state_jurisdiction', 'state_statutes'],
    roleInstructions: 'Check applicable state rent, tenancy, or stamp statutes. Record clearly when a particular state statute is outside the curated corpus.',
    allowedReadOnlyCapabilities: ['read_curated_legal_corpus', 'evaluate_applicability'],
    outputContract: { findingCategory: 'State Enactments', permittedSeverities: ['informational', 'advisory', 'warning'], requiresEvidenceCitation: false, requiresLegalAuthorityCitation: true, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'C04',
    benchId: 'C',
    name: 'Rules and Notifications Analyst',
    role: 'Locate related rules, notifications, and subordinate instruments where relevant',
    taskObjective: 'Check applicable subordinate rules and statutory gazette notifications.',
    focus: 'Subordinate legislation',
    isChair: false,
    tablePositionIndex: 3,
    seatId: 'seat-C-04',
    appearance: { seatId: 'seat-C-04', tablePositionIndex: 3, deskAngleDegrees: 108, primaryColor: '#8b5cf6', avatarSeed: 'seed-C04-rules' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Checks subordinate rules where statutory schemes rely on notifications.' },
    evidenceInputs: ['statutory_rules', 'gazette_notifications'],
    roleInstructions: 'Locate related executive rules, notifications, and subordinate instruments. Confirm whether statutory exemption rules apply to the subject premises.',
    allowedReadOnlyCapabilities: ['read_curated_legal_corpus'],
    outputContract: { findingCategory: 'Rules & Notifications', permittedSeverities: ['informational', 'advisory'], requiresEvidenceCitation: false, requiresLegalAuthorityCitation: true, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'C05',
    benchId: 'C',
    name: 'Temporal Applicability Analyst',
    role: 'Check effective dates, amendments, repeals, and transitional uncertainty',
    taskObjective: 'Verify whether a statute was in force at the date of agreement execution, flagging repealed acts.',
    focus: 'Enactment timelines',
    isChair: false,
    tablePositionIndex: 4,
    seatId: 'seat-C-05',
    appearance: { seatId: 'seat-C-05', tablePositionIndex: 4, deskAngleDegrees: 144, primaryColor: '#8b5cf6', avatarSeed: 'seed-C05-temporal' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Temporal checks prevent applying repealed or future un-notified law.' },
    evidenceInputs: ['agreement_date', 'statute_effective_dates'],
    roleInstructions: 'Check effective dates, amendments, repeals, and transitional uncertainty. Flag any statute or rule that has been repealed or was not in force on the transaction date.',
    allowedReadOnlyCapabilities: ['read_curated_legal_corpus', 'evaluate_applicability'],
    outputContract: { findingCategory: 'Temporal Validity', permittedSeverities: ['informational', 'warning', 'critical_red_flag'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: true, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'C06',
    benchId: 'C',
    name: 'Precedent Retrieval Analyst',
    role: 'Retrieve potentially relevant judgments with traceable case and paragraph identifiers',
    taskObjective: 'Locate landmark binding judgments from the curated precedent corpus.',
    focus: 'Judicial precedent corpus',
    isChair: false,
    tablePositionIndex: 5,
    seatId: 'seat-C-06',
    appearance: { seatId: 'seat-C-06', tablePositionIndex: 5, deskAngleDegrees: 180, primaryColor: '#8b5cf6', avatarSeed: 'seed-C06-precedent' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Precedent retrieval grounds legal interpretation in case law.' },
    evidenceInputs: ['legal_issues', 'precedent_corpus'],
    roleInstructions: 'Retrieve potentially relevant judicial decisions with traceable case names, reporters, and paragraph numbers. Do not invent citations.',
    allowedReadOnlyCapabilities: ['read_curated_legal_corpus', 'resolve_location_anchor'],
    outputContract: { findingCategory: 'Judicial Precedents', permittedSeverities: ['informational', 'advisory'], requiresEvidenceCitation: false, requiresLegalAuthorityCitation: true, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'C07',
    benchId: 'C',
    name: 'Precedent Relevance Analyst',
    role: 'Explain factual similarity, important differences, and limits of the retrieved precedent',
    taskObjective: 'Distinguish the ratio decidendi of retrieved judgments and test whether facts align.',
    focus: 'Ratio decidendi bounds',
    isChair: false,
    tablePositionIndex: 6,
    seatId: 'seat-C-07',
    appearance: { seatId: 'seat-C-07', tablePositionIndex: 6, deskAngleDegrees: 216, primaryColor: '#8b5cf6', avatarSeed: 'seed-C07-relevance' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Distinguishes applicable precedents from superficially similar cases.' },
    evidenceInputs: ['case_facts', 'retrieved_precedents'],
    roleInstructions: 'Explain factual similarities, important distinctions, and jurisdictional limits of cited precedents. Prevent over-generalization of narrow rulings.',
    allowedReadOnlyCapabilities: ['read_case_evidence', 'read_curated_legal_corpus'],
    outputContract: { findingCategory: 'Precedent Applicability', permittedSeverities: ['informational', 'advisory'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: true, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'C08',
    benchId: 'C',
    name: 'Contrary Authority Analyst',
    role: 'Search the approved corpus for authority that weakens a proposed conclusion',
    taskObjective: 'Act as devil\'s advocate against proposed legal interpretations, finding contrary rulings or statutory provisos.',
    focus: 'Dissenting & contrary view',
    isChair: false,
    tablePositionIndex: 7,
    seatId: 'seat-C-08',
    appearance: { seatId: 'seat-C-08', tablePositionIndex: 7, deskAngleDegrees: 252, primaryColor: '#8b5cf6', avatarSeed: 'seed-C08-contrary' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Ensures adversarial balance in legal authority research.' },
    evidenceInputs: ['proposed_findings', 'statutory_provisos'],
    roleInstructions: 'Search the approved corpus for authority, exceptions, or statutory provisos that weaken a proposed conclusion. Highlight conflicting High Court views.',
    allowedReadOnlyCapabilities: ['read_curated_legal_corpus'],
    outputContract: { findingCategory: 'Contrary Authority', permittedSeverities: ['informational', 'advisory', 'warning'], requiresEvidenceCitation: false, requiresLegalAuthorityCitation: true, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'C09',
    benchId: 'C',
    name: 'Citation Verifier',
    role: 'Confirm quoted passages and identifiers against stored source text; flag unsupported citations',
    taskObjective: 'Audit every statutory section number, act year, and case citation against verified text.',
    focus: 'Citation integrity',
    isChair: false,
    tablePositionIndex: 8,
    seatId: 'seat-C-09',
    appearance: { seatId: 'seat-C-09', tablePositionIndex: 8, deskAngleDegrees: 288, primaryColor: '#8b5cf6', avatarSeed: 'seed-C09-verifier' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Citation verification gate prevents hallucinated citations from entering reports.' },
    evidenceInputs: ['draft_citations', 'curated_corpus'],
    roleInstructions: 'Confirm whether quoted passages and identifiers match authentic sources stored in the legal corpus. Flag unsupported citations or non-existent sections.',
    allowedReadOnlyCapabilities: ['read_curated_legal_corpus', 'validate_citations'],
    outputContract: { findingCategory: 'Citation Verification', permittedSeverities: ['informational', 'warning', 'critical_red_flag'], requiresEvidenceCitation: false, requiresLegalAuthorityCitation: true, allowsDiscrepancyFlag: true },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'C10',
    benchId: 'C',
    name: 'Sources Chair',
    role: 'Publish an evidence bundle with applicability limits, source dates, and unresolved legal questions',
    taskObjective: 'Consolidate verified statutory and precedent packages, explicitly recording gaps and limitations.',
    focus: 'Legal authority synthesis',
    isChair: true, // Chair occupies seat 10 (index 9)
    tablePositionIndex: 9,
    seatId: 'seat-C-10',
    appearance: { seatId: 'seat-C-10', tablePositionIndex: 9, deskAngleDegrees: 324, primaryColor: '#8b5cf6', avatarSeed: 'seed-C10-chair' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Sources Chair consolidates and certifies the Bench C authority bundle.' },
    evidenceInputs: ['specialist_findings_C01_C09'],
    roleInstructions: 'Publish the consolidated authority package with explicit applicability limits, review dates, and unresolved legal questions. Disallow unsupported claims.',
    allowedReadOnlyCapabilities: ['read_curated_legal_corpus', 'evaluate_applicability'],
    outputContract: { findingCategory: 'Authority Package', permittedSeverities: ['informational', 'advisory'], requiresEvidenceCitation: false, requiresLegalAuthorityCitation: true, allowsDiscrepancyFlag: false },
    timeoutMs: 20000,
    promptVersion: 'v1.0.0'
  }
];

// ─── Bench D: Adversarial Risk (D01 - D10) ───────────────────────────────────
export const BENCH_D_SPECIALISTS: SpecialistDefinition[] = [
  {
    id: 'D01',
    benchId: 'D',
    name: 'Document-Holder Advocate',
    role: 'Examine consequences for the person requesting the review',
    taskObjective: 'Evaluate operational, personal, and financial risks strictly from the perspective of the document holder.',
    focus: 'Visitor interest protection',
    isChair: false,
    tablePositionIndex: 0,
    seatId: 'seat-D-01',
    appearance: { seatId: 'seat-D-01', tablePositionIndex: 0, deskAngleDegrees: 0, primaryColor: '#f59e0b', avatarSeed: 'seed-D01-holder' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Protects the document holder\'s interests across all reviews.' },
    evidenceInputs: ['obligations_map', 'document_clauses'],
    roleInstructions: 'Examine consequences for the person requesting the review. Pinpoint hidden burdens, loss-of-rights risks, and procedural traps in the contract.',
    allowedReadOnlyCapabilities: ['read_case_evidence'],
    outputContract: { findingCategory: 'Holder Risk Assessment', permittedSeverities: ['advisory', 'warning', 'critical_red_flag'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'D02',
    benchId: 'D',
    name: 'Counterparty Advocate',
    role: 'Present the strongest reasonable alternative reading favoring the other party',
    taskObjective: 'Formulate the counterparty\'s strongest contractual arguments and counter-claims.',
    focus: 'Adversarial perspective',
    isChair: false,
    tablePositionIndex: 1,
    seatId: 'seat-D-02',
    appearance: { seatId: 'seat-D-02', tablePositionIndex: 1, deskAngleDegrees: 36, primaryColor: '#f59e0b', avatarSeed: 'seed-D02-counterparty' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Adversarial counter-arguments prevent one-sided wishful thinking.' },
    evidenceInputs: ['obligations_map', 'counterparty_clauses'],
    roleInstructions: 'Present the strongest reasonable alternative interpretation favoring the counterparty. Show how ambiguous terms could be aggressively weaponized.',
    allowedReadOnlyCapabilities: ['read_case_evidence'],
    outputContract: { findingCategory: 'Counterparty Position', permittedSeverities: ['advisory', 'warning'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'D03',
    benchId: 'D',
    name: 'Ambiguity Analyst',
    role: 'Identify vague definitions, conflicting terms, and multiple plausible interpretations',
    taskObjective: 'Locate ambiguous wording, syntax traps, undefined thresholds, and conflicting clauses.',
    focus: 'Linguistic ambiguity',
    isChair: false,
    tablePositionIndex: 2,
    seatId: 'seat-D-03',
    appearance: { seatId: 'seat-D-03', tablePositionIndex: 2, deskAngleDegrees: 72, primaryColor: '#f59e0b', avatarSeed: 'seed-D03-ambiguity' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Ambiguity detection flags draftsmanship weaknesses.' },
    evidenceInputs: ['all_clauses', 'contract_definitions'],
    roleInstructions: 'Identify vague definitions, conflicting terms, and multiple plausible interpretations. Note where the absence of a definition invites dispute.',
    allowedReadOnlyCapabilities: ['read_case_evidence'],
    outputContract: { findingCategory: 'Contractual Ambiguity', permittedSeverities: ['advisory', 'warning'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: true },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'D04',
    benchId: 'D',
    name: 'Financial Exposure Analyst',
    role: 'Examine penalties, indemnities, caps, recurring charges, and conditional liabilities',
    taskObjective: 'Quantify worst-case financial liabilities, compounding interest, indemnity exposure, and forfeit deposits.',
    focus: 'Financial downside',
    isChair: false,
    tablePositionIndex: 3,
    seatId: 'seat-D-04',
    appearance: { seatId: 'seat-D-04', tablePositionIndex: 3, deskAngleDegrees: 108, primaryColor: '#f59e0b', avatarSeed: 'seed-D04-finance' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Quantifies financial downside across all contractual disputes.' },
    evidenceInputs: ['financial_clauses', 'penalties', 'indemnities'],
    roleInstructions: 'Examine penalties, uncapped indemnities, compound penal interest, recurring charges, and forfeiture clauses. Calculate maximum exposure figures.',
    allowedReadOnlyCapabilities: ['read_case_evidence', 'run_arithmetic_verifier'],
    outputContract: { findingCategory: 'Financial Downside Exposure', permittedSeverities: ['warning', 'critical_red_flag'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'D05',
    benchId: 'D',
    name: 'Deadline and Default Analyst',
    role: 'Examine trigger events, notice windows, default, and loss-of-rights scenarios',
    taskObjective: 'Audit time-sensitive triggers: cure periods, notice cliffs, deemed acceptance, and limitation deadlines.',
    focus: 'Time-critical default',
    isChair: false,
    tablePositionIndex: 4,
    seatId: 'seat-D-05',
    appearance: { seatId: 'seat-D-05', tablePositionIndex: 4, deskAngleDegrees: 144, primaryColor: '#f59e0b', avatarSeed: 'seed-D05-deadlines' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Timing defaults cause forfeiture of rights.' },
    evidenceInputs: ['notice_clauses', 'calendar_deadlines'],
    roleInstructions: 'Examine trigger events, notice windows, automatic renewal traps, cure periods, and deemed-default scenarios. Highlight short response windows.',
    allowedReadOnlyCapabilities: ['read_case_evidence'],
    outputContract: { findingCategory: 'Deadlines & Default Traps', permittedSeverities: ['advisory', 'warning', 'critical_red_flag'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'D06',
    benchId: 'D',
    name: 'Balance and Fairness Analyst',
    role: 'Identify one-sided obligations, consent concerns, and unequal practical burdens',
    taskObjective: 'Detect adhesive contract terms where one party enjoys unilateral termination/forfeiture rights.',
    focus: 'Procedural fairness',
    isChair: false,
    tablePositionIndex: 5,
    seatId: 'seat-D-06',
    appearance: { seatId: 'seat-D-06', tablePositionIndex: 5, deskAngleDegrees: 180, primaryColor: '#f59e0b', avatarSeed: 'seed-D06-fairness' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Evaluates substantive fairness of terms.' },
    evidenceInputs: ['covenants_map', 'unilateral_rights'],
    roleInstructions: 'Identify one-sided obligations, unilateral termination rights, unequal audit powers, and disproportionate performance burdens. Flag unconscionable covenants.',
    allowedReadOnlyCapabilities: ['read_case_evidence'],
    outputContract: { findingCategory: 'Contractual Balance & Fairness', permittedSeverities: ['advisory', 'warning'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'D07',
    benchId: 'D',
    name: 'Evidence-Gap Analyst',
    role: 'List missing documents or facts needed before a concern can be resolved',
    taskObjective: 'Identify missing receipts, unattached exhibits, or missing approvals needed to clarify obligations.',
    focus: 'Missing proof & exhibits',
    isChair: false,
    tablePositionIndex: 6,
    seatId: 'seat-D-07',
    appearance: { seatId: 'seat-D-07', tablePositionIndex: 6, deskAngleDegrees: 216, primaryColor: '#f59e0b', avatarSeed: 'seed-D07-gaps' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Prevents speculation when foundational exhibits are missing.' },
    evidenceInputs: ['case_document_manifest', 'referenced_attachments'],
    roleInstructions: 'List missing documents, missing receipts, unattached annexures, or unstated facts needed before an adversarial concern can be resolved.',
    allowedReadOnlyCapabilities: ['read_case_evidence', 'detect_cross_document_links'],
    outputContract: { findingCategory: 'Evidentiary Gaps', permittedSeverities: ['advisory', 'warning'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: true },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'D08',
    benchId: 'D',
    name: 'Red-Flag Analyst',
    role: 'Highlight suspicious inconsistencies without declaring fraud, authenticity, or criminal guilt',
    taskObjective: 'Flag critical risks and discrepancies responsibly without fabricating unproven fraud accusations.',
    focus: 'Critical alerts',
    isChair: false,
    tablePositionIndex: 7,
    seatId: 'seat-D-08',
    appearance: { seatId: 'seat-D-08', tablePositionIndex: 7, deskAngleDegrees: 252, primaryColor: '#f59e0b', avatarSeed: 'seed-D08-red-flags' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Highlights severe anomalies with responsible legal neutrality.' },
    evidenceInputs: ['discrepancy_ledger', 'document_anomalies'],
    roleInstructions: 'Highlight suspicious inconsistencies, conflicting dates, or altered figures without declaring fraud, authenticity, or criminal guilt. Recommend forensic confirmation where warranted.',
    allowedReadOnlyCapabilities: ['read_case_evidence'],
    outputContract: { findingCategory: 'Red Flag Alerts', permittedSeverities: ['warning', 'critical_red_flag'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: true },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'D09',
    benchId: 'D',
    name: 'Scenario Analyst',
    role: 'Test concrete "what if" situations against the actual wording and assumptions',
    taskObjective: 'Simulate concrete dispute situations: early surrender, delayed rent, destruction of premises.',
    focus: 'Scenario stress testing',
    isChair: false,
    tablePositionIndex: 8,
    seatId: 'seat-D-09',
    appearance: { seatId: 'seat-D-09', tablePositionIndex: 8, deskAngleDegrees: 288, primaryColor: '#f59e0b', avatarSeed: 'seed-D09-scenario' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Stress-tests contractual terms against real-life operational friction.' },
    evidenceInputs: ['operative_clauses', 'assumptions'],
    roleInstructions: 'Test concrete "what if" dispute situations against the actual wording and stated assumptions. Analyze default and exit sequences step-by-step.',
    allowedReadOnlyCapabilities: ['read_case_evidence'],
    outputContract: { findingCategory: 'Dispute Scenario Simulation', permittedSeverities: ['advisory', 'warning'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'D10',
    benchId: 'D',
    name: 'Risk Chair',
    role: 'Deduplicate risks, record disagreements, and separate seriousness from evidence strength',
    taskObjective: 'Consolidate Bench D findings into an authoritative, prioritized risk register.',
    focus: 'Risk matrix synthesis',
    isChair: true, // Chair occupies seat 10 (index 9)
    tablePositionIndex: 9,
    seatId: 'seat-D-10',
    appearance: { seatId: 'seat-D-10', tablePositionIndex: 9, deskAngleDegrees: 324, primaryColor: '#f59e0b', avatarSeed: 'seed-D10-chair' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Risk Chair consolidates and prioritizes Bench D adversarial assessments.' },
    evidenceInputs: ['specialist_findings_D01_D09'],
    roleInstructions: 'Deduplicate risks, record disagreements between specialists, and strictly separate severity from evidence strength. Publish the consolidated risk packet.',
    allowedReadOnlyCapabilities: ['read_case_evidence'],
    outputContract: { findingCategory: 'Consolidated Risk Matrix', permittedSeverities: ['advisory', 'warning', 'critical_red_flag'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: true },
    timeoutMs: 20000,
    promptVersion: 'v1.0.0'
  }
];

// ─── Bench E: Verification and Explanation (E01 - E10) ───────────────────────
export const BENCH_E_SPECIALISTS: SpecialistDefinition[] = [
  {
    id: 'E01',
    benchId: 'E',
    name: 'Finding-to-Evidence Auditor',
    role: 'Check that material findings point to real clauses and supporting sources',
    taskObjective: 'Audit every material finding to verify that verbatim excerpts exist on the cited page numbers.',
    focus: 'Audit trail verification',
    isChair: false,
    tablePositionIndex: 0,
    seatId: 'seat-E-01',
    appearance: { seatId: 'seat-E-01', tablePositionIndex: 0, deskAngleDegrees: 0, primaryColor: '#06b6d4', avatarSeed: 'seed-E01-evidence-auditor' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Factual verification gate prevents unsourced claims from entering reports.' },
    evidenceInputs: ['all_bench_findings', 'case_snapshot'],
    roleInstructions: 'Check that material findings point to real clauses and supporting sources. Reject any assertion that lacks an authentic citation to a document page or legal section.',
    allowedReadOnlyCapabilities: ['read_case_evidence', 'resolve_location_anchor'],
    outputContract: { findingCategory: 'Evidence Audit', permittedSeverities: ['informational', 'warning', 'critical_red_flag'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: true },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'E02',
    benchId: 'E',
    name: 'Contradiction Resolver',
    role: 'Reconcile bench disagreements or preserve them explicitly when evidence is insufficient',
    taskObjective: 'Reconcile differing findings across benches or record them as preserved disagreements.',
    focus: 'Dispute reconciliation',
    isChair: false,
    tablePositionIndex: 1,
    seatId: 'seat-E-02',
    appearance: { seatId: 'seat-E-02', tablePositionIndex: 1, deskAngleDegrees: 36, primaryColor: '#06b6d4', avatarSeed: 'seed-E02-reconciler' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Reconciles conflicting perspectives without artificially erasing dissent.' },
    evidenceInputs: ['bench_packets_A_B_C_D'],
    roleInstructions: 'Reconcile bench disagreements or preserve them explicitly when evidence is insufficient. Do not force an artificial consensus where evidence supports multiple interpretations.',
    allowedReadOnlyCapabilities: ['read_case_evidence'],
    outputContract: { findingCategory: 'Contradiction Reconciliation', permittedSeverities: ['informational', 'advisory'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: true },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'E03',
    benchId: 'E',
    name: 'Arithmetic and Timeline Verifier',
    role: 'Verify calculations and date logic using deterministic tools and stated assumptions',
    taskObjective: 'Execute deterministic verification of interest, notice dates, and deposit balance calculations.',
    focus: 'Math & timeline check',
    isChair: false,
    tablePositionIndex: 2,
    seatId: 'seat-E-03',
    appearance: { seatId: 'seat-E-03', tablePositionIndex: 2, deskAngleDegrees: 72, primaryColor: '#06b6d4', avatarSeed: 'seed-E03-arithmetic' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Arithmetic and timeline verification protects against mathematical errors.' },
    evidenceInputs: ['financial_findings', 'timeline_claims'],
    roleInstructions: 'Verify calculations, penal interest formulas, and date logic using deterministic verification. Flag mathematical inconsistencies or impossible calendar deadlines.',
    allowedReadOnlyCapabilities: ['run_arithmetic_verifier'],
    outputContract: { findingCategory: 'Arithmetic Verification', permittedSeverities: ['informational', 'warning'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: true },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'E04',
    benchId: 'E',
    name: 'Coverage Auditor',
    role: 'Check that applicable clauses, requested questions, and planned tasks are accounted for',
    taskObjective: 'Ensure no page, operative clause, or visitor query was skipped or overlooked.',
    focus: 'Scope completeness',
    isChair: false,
    tablePositionIndex: 3,
    seatId: 'seat-E-04',
    appearance: { seatId: 'seat-E-04', tablePositionIndex: 3, deskAngleDegrees: 108, primaryColor: '#06b6d4', avatarSeed: 'seed-E04-coverage' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Coverage completeness audit certifies review exhaustiveness.' },
    evidenceInputs: ['routing_plan', 'bench_findings', 'visitor_questions'],
    roleInstructions: 'Check that all submitted pages, applicable clauses, and visitor questions are accounted for in the findings. Record explicit notes for skipped or failed coverage.',
    allowedReadOnlyCapabilities: ['read_case_evidence'],
    outputContract: { findingCategory: 'Coverage Audit', permittedSeverities: ['informational', 'warning'], requiresEvidenceCitation: false, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'E05',
    benchId: 'E',
    name: 'Plain-Language Editor',
    role: 'Explain clauses clearly while retaining qualifications and original references',
    taskObjective: 'Translate dense legal terminology into transparent, accessible citizen-facing explanations.',
    focus: 'Accessible communication',
    isChair: false,
    tablePositionIndex: 4,
    seatId: 'seat-E-05',
    appearance: { seatId: 'seat-E-05', tablePositionIndex: 4, deskAngleDegrees: 144, primaryColor: '#06b6d4', avatarSeed: 'seed-E05-plain-lang' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Plain language translation is essential for citizen usability.' },
    evidenceInputs: ['bench_findings', 'presiding_drafts'],
    roleInstructions: 'Explain legal concepts, indemnities, and obligations in plain, accessible language without eliminating necessary legal qualifications or original clause references.',
    allowedReadOnlyCapabilities: ['read_case_evidence'],
    outputContract: { findingCategory: 'Plain Language Explanation', permittedSeverities: ['informational'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'E06',
    benchId: 'E',
    name: 'Multilingual Fidelity Reviewer',
    role: 'Check translated explanations against source wording and flag uncertainty',
    taskObjective: 'Ensure translations in Kannada, Hindi, and Indian languages remain accurate to legal source text.',
    focus: 'Translation fidelity',
    isChair: false,
    tablePositionIndex: 5,
    seatId: 'seat-E-06',
    appearance: { seatId: 'seat-E-06', tablePositionIndex: 5, deskAngleDegrees: 180, primaryColor: '#06b6d4', avatarSeed: 'seed-E06-multilingual' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Ensures multilingual consistency between English contracts and vernacular outputs.' },
    evidenceInputs: ['vernacular_explanations', 'english_sources'],
    roleInstructions: 'Check translated summaries against source contract wording. Flag translations where nuances of legal liability or notice periods could be misunderstood.',
    allowedReadOnlyCapabilities: ['read_case_evidence'],
    outputContract: { findingCategory: 'Multilingual Consistency', permittedSeverities: ['informational', 'advisory'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'E07',
    benchId: 'E',
    name: 'Clarification Planner',
    role: 'Suggest questions and missing information the user should discuss with the other party or a professional',
    taskObjective: 'Formulate actionable, grounded questions for the visitor to take to the landlord/counterparty.',
    focus: 'Visitor query guidance',
    isChair: false,
    tablePositionIndex: 6,
    seatId: 'seat-E-07',
    appearance: { seatId: 'seat-E-07', tablePositionIndex: 6, deskAngleDegrees: 216, primaryColor: '#06b6d4', avatarSeed: 'seed-E07-clarification' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Guides the visitor toward constructive dispute prevention.' },
    evidenceInputs: ['evidentiary_gaps', 'ambiguities'],
    roleInstructions: 'Formulate practical questions and missing documents the user should request from the counterparty or discuss with a qualified legal professional.',
    allowedReadOnlyCapabilities: ['read_case_evidence'],
    outputContract: { findingCategory: 'Actionable Clarifications', permittedSeverities: ['informational', 'advisory'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'E08',
    benchId: 'E',
    name: 'Human-Review Triage Analyst',
    role: 'Identify unresolved, high-impact, or out-of-scope issues requiring qualified review',
    taskObjective: 'Establish unambiguous escalation boundaries where AI review ends and human advocate consultation begins.',
    focus: 'Professional escalation',
    isChair: false,
    tablePositionIndex: 7,
    seatId: 'seat-E-08',
    appearance: { seatId: 'seat-E-08', tablePositionIndex: 7, deskAngleDegrees: 252, primaryColor: '#06b6d4', avatarSeed: 'seed-E08-triage' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Ethical escalation gate prevents automated over-reaching.' },
    evidenceInputs: ['critical_findings', 'high_exposure_liabilities'],
    roleInstructions: 'Identify unresolved, high-financial-impact, or contentious issues that strictly require consultation with a qualified human advocate. Formulate professional escalation summaries.',
    allowedReadOnlyCapabilities: ['read_case_evidence'],
    outputContract: { findingCategory: 'Human Advocate Escalation', permittedSeverities: ['advisory', 'warning', 'critical_red_flag'], requiresEvidenceCitation: true, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'E09',
    benchId: 'E',
    name: 'Report Privacy Reviewer',
    role: 'Check redaction choices, destination-sensitive content, and unintended disclosures',
    taskObjective: 'Verify that PII redactions are properly applied before external delivery or report export.',
    focus: 'Export privacy guard',
    isChair: false,
    tablePositionIndex: 8,
    seatId: 'seat-E-09',
    appearance: { seatId: 'seat-E-09', tablePositionIndex: 8, deskAngleDegrees: 288, primaryColor: '#06b6d4', avatarSeed: 'seed-E09-privacy' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Final privacy audit before report generation and multi-channel delivery.' },
    evidenceInputs: ['final_report_draft', 'redaction_rules'],
    roleInstructions: 'Audit redaction choices and destination-sensitive content before final report generation. Ensure private banking details and national IDs are masked in printable outputs.',
    allowedReadOnlyCapabilities: ['read_case_evidence', 'redact_pii'],
    outputContract: { findingCategory: 'Export Privacy Audit', permittedSeverities: ['informational', 'warning'], requiresEvidenceCitation: false, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: false },
    timeoutMs: 15000,
    promptVersion: 'v1.0.0'
  },
  {
    id: 'E10',
    benchId: 'E',
    name: 'Verification Chair',
    role: 'Release a complete or explicitly partial review package, with unresolved items intact',
    taskObjective: 'Certify the final tribunal review package, approving complete or explicitly partial release.',
    focus: 'Final quality release',
    isChair: true, // Chair occupies seat 10 (index 9)
    tablePositionIndex: 9,
    seatId: 'seat-E-10',
    appearance: { seatId: 'seat-E-10', tablePositionIndex: 9, deskAngleDegrees: 324, primaryColor: '#06b6d4', avatarSeed: 'seed-E10-chair' },
    eligibility: { defaultStatus: 'auto_selected', reasonForInclusion: 'Verification Chair certifies and signs off on the complete review package.' },
    evidenceInputs: ['specialist_findings_E01_E09'],
    roleInstructions: 'Release a complete or explicitly partial review package with unresolved items intact. Certify that all material citations and arithmetic checks have been verified.',
    allowedReadOnlyCapabilities: ['read_case_evidence'],
    outputContract: { findingCategory: 'Final Release Certification', permittedSeverities: ['informational', 'warning'], requiresEvidenceCitation: false, requiresLegalAuthorityCitation: false, allowsDiscrepancyFlag: true },
    timeoutMs: 20000,
    promptVersion: 'v1.0.0'
  }
];

export const BENCHES: BenchDefinition[] = [
  {
    id: 'A',
    name: 'Document and Evidence',
    workingPrinciple: 'Establish what the submitted documents actually say before interpreting them.',
    chairId: 'A10',
    primaryColor: '#3b82f6',
    specialists: BENCH_A_SPECIALISTS
  },
  {
    id: 'B',
    name: 'Rights and Obligations',
    workingPrinciple: 'Analyze the document from the parties practical positions and applicable subject areas.',
    chairId: 'B10',
    primaryColor: '#10b981',
    specialists: BENCH_B_SPECIALISTS
  },
  {
    id: 'C',
    name: 'Indian Legal Sources',
    workingPrinciple: 'Retrieve evidence before making a legal assertion.',
    chairId: 'C10',
    primaryColor: '#8b5cf6',
    specialists: BENCH_C_SPECIALISTS
  },
  {
    id: 'D',
    name: 'Adversarial Risk',
    workingPrinciple: 'Seek plausible counterarguments and practical failure cases instead of echoing the initial assessment.',
    chairId: 'D10',
    primaryColor: '#f59e0b',
    specialists: BENCH_D_SPECIALISTS
  },
  {
    id: 'E',
    name: 'Verification and Explanation',
    workingPrinciple: 'Check the final answer for evidence, coverage, and understandable language.',
    chairId: 'E10',
    primaryColor: '#06b6d4',
    specialists: BENCH_E_SPECIALISTS
  }
];

export const ALL_SPECIALISTS: SpecialistDefinition[] = [
  ...BENCH_A_SPECIALISTS,
  ...BENCH_B_SPECIALISTS,
  ...BENCH_C_SPECIALISTS,
  ...BENCH_D_SPECIALISTS,
  ...BENCH_E_SPECIALISTS
];

/**
 * Registry Lookup Helpers
 */
export function getSpecialistById(id: string): SpecialistDefinition | undefined {
  return ALL_SPECIALISTS.find(s => s.id === id);
}

export function getSpecialistsByBench(benchId: BenchId): SpecialistDefinition[] {
  return ALL_SPECIALISTS.filter(s => s.benchId === benchId);
}

export function getBenchById(benchId: BenchId): BenchDefinition | undefined {
  return BENCHES.find(b => b.id === benchId);
}

export function getChairForBench(benchId: BenchId): SpecialistDefinition {
  const bench = getBenchById(benchId);
  if (!bench) throw new Error(`BENCH_NOT_FOUND: Bench ${benchId}`);
  const chair = bench.specialists.find(s => s.isChair);
  if (!chair) throw new Error(`CHAIR_NOT_FOUND: Bench ${benchId} has no chair`);
  return chair;
}

export function getAllChairs(): SpecialistDefinition[] {
  return ALL_SPECIALISTS.filter(s => s.isChair);
}

/**
 * Filter eligible specialists for a given case document category.
 * Bench B domain specialists (B02..B08) are only eligible when the document category matches.
 * Unselected specialists remain visible in the registry as 'unassigned'.
 */
export function filterEligibleSpecialists(
  documentCategory: string,
  options?: { hasDiscrepancy?: boolean; hasUncertainty?: boolean }
): {
  eligibleSpecialists: SpecialistDefinition[];
  unassignedSpecialists: SpecialistDefinition[];
} {
  const eligibleSpecialists: SpecialistDefinition[] = [];
  const unassignedSpecialists: SpecialistDefinition[] = [];

  for (const s of ALL_SPECIALISTS) {
    // Bench A, C, D, E are generally applicable
    if (s.benchId !== 'B') {
      eligibleSpecialists.push(s);
      continue;
    }

    // Bench B: General Contract (B01), Exit (B09), and Chair (B10) are universally eligible
    if (s.id === 'B01' || s.id === 'B09' || s.id === 'B10') {
      eligibleSpecialists.push(s);
      continue;
    }

    // Domain-specific Bench B roles (B02-B08)
    if (s.eligibility.applicableCategories && s.eligibility.applicableCategories.includes(documentCategory)) {
      eligibleSpecialists.push(s);
    } else {
      unassignedSpecialists.push(s);
    }
  }

  return { eligibleSpecialists, unassignedSpecialists };
}
