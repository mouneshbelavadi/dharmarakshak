export interface SpecialistDefinition {
  id: string; // e.g., 'A01'
  benchId: 'A' | 'B' | 'C' | 'D' | 'E';
  name: string;
  role: string;
  focus: string;
  isChair: boolean;
  tablePositionIndex: number; // 0 to 9 around the round table
}

export interface BenchDefinition {
  id: 'A' | 'B' | 'C' | 'D' | 'E';
  name: string;
  workingPrinciple: string;
  chairId: string;
  primaryColor: string; // Accent color for visual styling
  specialists: SpecialistDefinition[];
}

export const BENCH_A_SPECIALISTS: SpecialistDefinition[] = [
  { id: 'A01', benchId: 'A', name: 'Capture Quality Analyst', role: 'Analyzes blur, glare, cropping, rotation, and unreadable regions', focus: 'Physical scan quality', isChair: false, tablePositionIndex: 0 },
  { id: 'A02', benchId: 'A', name: 'Page Continuity Analyst', role: 'Verifies page order, duplicates, continuity, and missing attachments', focus: 'Structural sequence', isChair: false, tablePositionIndex: 1 },
  { id: 'A03', benchId: 'A', name: 'Text Fidelity Analyst', role: 'Validates extraction accuracy, especially names, numbers, and negations', focus: 'Transcription fidelity', isChair: false, tablePositionIndex: 2 },
  { id: 'A04', benchId: 'A', name: 'Language Analyst', role: 'Identifies source languages and faithful, clearly identified translations', focus: 'Indian script & translation', isChair: false, tablePositionIndex: 3 },
  { id: 'A05', benchId: 'A', name: 'Parties and Capacities Analyst', role: 'Identifies named parties and their legally stated capacities/roles', focus: 'Signatories & entities', isChair: false, tablePositionIndex: 4 },
  { id: 'A06', benchId: 'A', name: 'Dates and Amounts Analyst', role: 'Extracts critical dates, durations, currencies, and calculation inputs', focus: 'Temporal & financial data', isChair: false, tablePositionIndex: 5 },
  { id: 'A07', benchId: 'A', name: 'Clause Structure Analyst', role: 'Maps clauses, tables, schedules, definitions, and cross-references', focus: 'Contract syntax', isChair: false, tablePositionIndex: 6 },
  { id: 'A08', benchId: 'A', name: 'Document Consistency Analyst', role: 'Detects contradictions within and between submitted records', focus: 'Cross-document coherence', isChair: false, tablePositionIndex: 7 },
  { id: 'A09', benchId: 'A', name: 'Sensitive Data Analyst', role: 'Identifies information needing restricted display or redaction', focus: 'Privacy & PII redaction', isChair: false, tablePositionIndex: 8 },
  { id: 'A10', benchId: 'A', name: 'Evidence Chair', role: 'Consolidates evidence package and flags unresolved extraction questions', focus: 'Evidence synthesis', isChair: true, tablePositionIndex: 9 }
];

export const BENCH_B_SPECIALISTS: SpecialistDefinition[] = [
  { id: 'B01', benchId: 'B', name: 'General Contract Analyst', role: 'Examines promises, conditions, dependencies, and definitions', focus: 'Commercial terms', isChair: false, tablePositionIndex: 0 },
  { id: 'B02', benchId: 'B', name: 'Employment Analyst', role: 'Reviews work conditions, compensation, non-competes, and termination terms', focus: 'Labour & employment', isChair: false, tablePositionIndex: 1 },
  { id: 'B03', benchId: 'B', name: 'Tenancy Analyst', role: 'Examines rent, security deposits, maintenance, possession, renewal, and eviction terms', focus: 'Tenancy & lease', isChair: false, tablePositionIndex: 2 },
  { id: 'B04', benchId: 'B', name: 'Property Transaction Analyst', role: 'Examines stated interests, transfers, title warranties, and supporting registry records', focus: 'Property conveyancing', isChair: false, tablePositionIndex: 3 },
  { id: 'B05', benchId: 'B', name: 'Consumer and Service Analyst', role: 'Examines service commitments, complaints, return/cancellation, and warranties', focus: 'Consumer rights', isChair: false, tablePositionIndex: 4 },
  { id: 'B06', benchId: 'B', name: 'Small-Business Analyst', role: 'Examines supply terms, procurement duties, service levels, and commercial liabilities', focus: 'MSME & vendor relations', isChair: false, tablePositionIndex: 5 },
  { id: 'B07', benchId: 'B', name: 'Lending and Security Analyst', role: 'Reviews repayment schedules, interest rates, collateral terms, and personal guarantees', focus: 'Credit & banking covenants', isChair: false, tablePositionIndex: 6 },
  { id: 'B08', benchId: 'B', name: 'Data and IP Analyst', role: 'Reviews confidentiality, data usage rights, IP assignment, and trade secrets', focus: 'Intellectual property', isChair: false, tablePositionIndex: 7 },
  { id: 'B09', benchId: 'B', name: 'Exit and Dispute Analyst', role: 'Examines notice periods, termination triggers, dispute resolution steps, and deadlines', focus: 'Dispute escalations', isChair: false, tablePositionIndex: 8 },
  { id: 'B10', benchId: 'B', name: 'Obligations Chair', role: 'Consolidates combined account of applicable obligations and candidate concerns', focus: 'Obligations synthesis', isChair: true, tablePositionIndex: 9 }
];

export const BENCH_C_SPECIALISTS: SpecialistDefinition[] = [
  { id: 'C01', benchId: 'C', name: 'Jurisdiction Analyst', role: 'Determines relevant territory, forum, and governing-law questions', focus: 'Territorial jurisdiction', isChair: false, tablePositionIndex: 0 },
  { id: 'C02', benchId: 'C', name: 'Statute Retrieval Analyst', role: 'Retrieves relevant enactments from the approved Indian legal corpus', focus: 'Central statutory enactments', isChair: false, tablePositionIndex: 1 },
  { id: 'C03', benchId: 'C', name: 'State-Law Analyst', role: 'Identifies state-specific provisions and unavailable local coverage', focus: 'State amendments & acts', isChair: false, tablePositionIndex: 2 },
  { id: 'C04', benchId: 'C', name: 'Rules and Notifications Analyst', role: 'Cross-checks related executive rules and subordinate instruments', focus: 'Subordinate legislation', isChair: false, tablePositionIndex: 3 },
  { id: 'C05', benchId: 'C', name: 'Temporal Applicability Analyst', role: 'Validates effective dates, retrospective amendments, and temporal validity', focus: 'Enactment timelines', isChair: false, tablePositionIndex: 4 },
  { id: 'C06', benchId: 'C', name: 'Precedent Retrieval Analyst', role: 'Finds traceable Supreme Court and High Court judgments and paragraph references', focus: 'Judicial precedent corpus', isChair: false, tablePositionIndex: 5 },
  { id: 'C07', benchId: 'C', name: 'Precedent Relevance Analyst', role: 'Analyzes similarities, differences, and boundaries of cited legal precedents', focus: 'Ratio decidendi bounds', isChair: false, tablePositionIndex: 6 },
  { id: 'C08', benchId: 'C', name: 'Contrary Authority Analyst', role: 'Detects sources, distinctions, or dissents that weaken a proposed conclusion', focus: 'Dissenting & contrary view', isChair: false, tablePositionIndex: 7 },
  { id: 'C09', benchId: 'C', name: 'Citation Verifier', role: 'Confirms whether identifiers, case titles, and quoted passages match authentic sources', focus: 'Citation integrity', isChair: false, tablePositionIndex: 8 },
  { id: 'C10', benchId: 'C', name: 'Sources Chair', role: 'Summarizes the supported authority package and explicit coverage limitations', focus: 'Legal authority synthesis', isChair: true, tablePositionIndex: 9 }
];

export const BENCH_D_SPECIALISTS: SpecialistDefinition[] = [
  { id: 'D01', benchId: 'D', name: 'Document-Holder Advocate', role: 'Evaluates direct practical consequences for the person requesting the review', focus: 'Visitor interest protection', isChair: false, tablePositionIndex: 0 },
  { id: 'D02', benchId: 'D', name: 'Counterparty Advocate', role: 'Formulates strongest reasonable alternative interpretation from counterparty stance', focus: 'Adversarial perspective', isChair: false, tablePositionIndex: 1 },
  { id: 'D03', benchId: 'D', name: 'Ambiguity Analyst', role: 'Pinpoints vague language, syntax conflicts, and multiple plausible meanings', focus: 'Linguistic ambiguity', isChair: false, tablePositionIndex: 2 },
  { id: 'D04', benchId: 'D', name: 'Financial Exposure Analyst', role: 'Quantifies uncapped liabilities, penalties, indemnities, and compounding charges', focus: 'Financial downside', isChair: false, tablePositionIndex: 3 },
  { id: 'D05', benchId: 'D', name: 'Deadline and Default Analyst', role: 'Identifies immediate trigger events, notice cliffs, cured default windows, and risks', focus: 'Time-critical default', isChair: false, tablePositionIndex: 4 },
  { id: 'D06', benchId: 'D', name: 'Balance and Fairness Analyst', role: 'Evaluates one-sided clauses, adhesive consent concerns, and unequal burdens', focus: 'Procedural fairness', isChair: false, tablePositionIndex: 5 },
  { id: 'D07', benchId: 'D', name: 'Evidence-Gap Analyst', role: 'Isolates facts, records, or annexures missing from the document package', focus: 'Missing proof & exhibits', isChair: false, tablePositionIndex: 6 },
  { id: 'D08', benchId: 'D', name: 'Red-Flag Analyst', role: 'Highlights suspicious inconsistencies without making unsupported legal accusations', focus: 'Critical alerts', isChair: false, tablePositionIndex: 7 },
  { id: 'D09', benchId: 'D', name: 'Scenario Analyst', role: 'Constructs concrete "what-if" breach and termination scenarios based on text', focus: 'Scenario stress testing', isChair: false, tablePositionIndex: 8 },
  { id: 'D10', benchId: 'D', name: 'Risk Chair', role: 'Prioritizes categorized risks, counterarguments, and unresolved adversarial exposures', focus: 'Risk matrix synthesis', isChair: true, tablePositionIndex: 9 }
];

export const BENCH_E_SPECIALISTS: SpecialistDefinition[] = [
  { id: 'E01', benchId: 'E', name: 'Finding-to-Evidence Auditor', role: 'Checks rigorous traceability of material findings to source document page numbers', focus: 'Audit trail verification', isChair: false, tablePositionIndex: 0 },
  { id: 'E02', benchId: 'E', name: 'Contradiction Resolver', role: 'Reconciles conflicting findings or mandates explicit preservation of disagreements', focus: 'Dispute reconciliation', isChair: false, tablePositionIndex: 1 },
  { id: 'E03', benchId: 'E', name: 'Arithmetic and Timeline Verifier', role: 'Independently verifies calculations, compound rates, and statutory timeline dates', focus: 'Math & timeline check', isChair: false, tablePositionIndex: 2 },
  { id: 'E04', benchId: 'E', name: 'Coverage Auditor', role: 'Verifies whether all relevant clauses, submitted documents, and user queries were answered', focus: 'Scope completeness', isChair: false, tablePositionIndex: 3 },
  { id: 'E05', benchId: 'E', name: 'Plain-Language Editor', role: 'Translates legal concepts into plain language with necessary legal disclaimers', focus: 'Accessible communication', isChair: false, tablePositionIndex: 4 },
  { id: 'E06', benchId: 'E', name: 'Multilingual Fidelity Reviewer', role: 'Checks consistency between English legal source wording and Indian vernacular outputs', focus: 'Translation fidelity', isChair: false, tablePositionIndex: 5 },
  { id: 'E07', benchId: 'E', name: 'Clarification Planner', role: 'Formulates targeted follow-up questions to help the visitor fill informational gaps', focus: 'Visitor query guidance', isChair: false, tablePositionIndex: 6 },
  { id: 'E08', benchId: 'E', name: 'Human-Review Triage Analyst', role: 'Flags high-stakes matters requiring mandatory licensed human advocate review', focus: 'Professional escalation', isChair: false, tablePositionIndex: 7 },
  { id: 'E09', benchId: 'E', name: 'Report Privacy Reviewer', role: 'Ensures proper PII redactions before final report export and delivery dispatch', focus: 'Export privacy guard', isChair: false, tablePositionIndex: 8 },
  { id: 'E10', benchId: 'E', name: 'Verification Chair', role: 'Certifies final release status, completed coverage, and explicit product limitations', focus: 'Final quality release', isChair: true, tablePositionIndex: 9 }
];

export const BENCHES: BenchDefinition[] = [
  {
    id: 'A',
    name: 'Document and Evidence',
    workingPrinciple: 'Establish what the submitted documents actually say before interpreting them.',
    chairId: 'A10',
    primaryColor: '#3b82f6', // Indigo-blue
    specialists: BENCH_A_SPECIALISTS
  },
  {
    id: 'B',
    name: 'Rights and Obligations',
    workingPrinciple: 'Examine the parties practical responsibilities and the relevant document category.',
    chairId: 'B10',
    primaryColor: '#10b981', // Emerald
    specialists: BENCH_B_SPECIALISTS
  },
  {
    id: 'C',
    name: 'Indian Legal Sources',
    workingPrinciple: 'Examine supporting authority and applicability before making a legal assertion.',
    chairId: 'C10',
    primaryColor: '#8b5cf6', // Purple-amber
    specialists: BENCH_C_SPECIALISTS
  },
  {
    id: 'D',
    name: 'Adversarial Risk',
    workingPrinciple: 'Challenge an initial interpretation with reasonable alternatives and practical consequences.',
    chairId: 'D10',
    primaryColor: '#f59e0b', // Amber-coral
    specialists: BENCH_D_SPECIALISTS
  },
  {
    id: 'E',
    name: 'Verification and Explanation',
    workingPrinciple: 'Check coverage, evidence, consistency, and understandable communication.',
    chairId: 'E10',
    primaryColor: '#06b6d4', // Cyan-teal
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

