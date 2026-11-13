# DHARMARAKSHA — Project Context

Prepared 13 November 2026. This is a self-contained background brief for Antigravity to read before implementation. It describes the project, the earlier concept, the intended experience, and the current design decisions. It contains no code, installation commands, development phases, or request to begin building. Implementation instructions will be supplied separately.

## 1. What the project is

DHARMARAKSHA is an Indian legal-document assistance system. Its purpose is to help people understand documents that affect their rights, responsibilities, payments, deadlines, and practical risks, including people who find formal legal language difficult or prefer to communicate in an Indian language.

A person can bring paper documents to a kiosk or provide digital documents through the main system. The system reads the documents, examines them from different perspectives, identifies important clauses and missing information, and explains its findings in understandable language. The person can ask follow-up questions and receive a referenced report.

The distinctive feature is a visible 3D tribunal on a laptop: five round-table benches with ten specialist agents each. The chamber makes the document-review process understandable and engaging. Its activity reflects real backend work.

The product offers preliminary AI-assisted document understanding and review. Its courtroom metaphor does not make its output a binding judgment, a verified legal identity, or a guarantee that a document is enforceable or safe to sign.

## 2. What existed before

The earlier project followed a document-to-review-to-report principle. Documents entered through uploads, camera/vision input, or connected channels. Text extraction and model-assisted analysis supplied evidence to specialist roles. A final reviewer combined their findings into explanations and reports.

Earlier research identified document parsing and vision handling, session records, status events, specialist routing, staged analysis and synthesis, PDF generation, language selection, voice chat, result explanation, a Telegram bot, email sending, a Google Drive integration path, and hardware/camera event input. Those observations describe the earlier implementation's capabilities and structure; they do not establish that every path was fully tested or production-ready.

The useful principle was that multiple perspectives contribute to one understandable result, while the user can follow the review and ask questions about the document.

The new project carries forward this product idea. It does not depend on the earlier source code, private API routes, database, compiled interface, assets, or folder structure.

## 3. The new project starts from scratch

The owner requires a completely new application. Antigravity will not receive access to the previous project folder. This context supplies the background that would otherwise be missing.

The frontend, backend, agent system, hardware gateway, authentication flows, and integration adapters are new implementations. There is no requirement to inspect, recover, compare, migrate, or repair the previous codebase. Earlier application data is not required for development.

Public software libraries and properly licensed public 3D assets can still be used. “From scratch” means a new application with its own source and architecture; it does not prohibit standard libraries or licensed models.

The owner currently wants planning documents and prompts. Reading this brief alone is not an instruction to generate code, create services, configure accounts, or deploy anything.

## 4. Terms that have already been clarified

- **DHARMARAKSHA:** The project name used in this brief.
- **KYC / key system:** In this conversation, these refer to the physical kiosk experience, not a banking KYC vendor or an external identity-verification platform.
- **UNO Q / “evenoq”:** Arduino UNO Q, the board used for the kiosk gateway and hardware connections.
- **RC authentication:** Issued RFID cards and an RFID reader. A visitor receives a card and taps it at the kiosk.
- **Servom:** Sarvam AI, the requested Indian-language speech provider.
- **NROC:** Currently interpreted as ngrok, for an HTTPS tunnel to the UNO Q gateway. This spelling interpretation remains an assumption.
- **Main dashboard:** The laptop interface containing the 3D tribunal and the main case-management experience.
- **Judge:** Either the software's AI Presiding Reviewer or a human competition evaluator. These are different roles.

The exact RFID module and card technology have not been specified. RFID does not automatically mean an RC522 module.

## 5. Who uses the system

**Visitor:** Brings documents, taps an issued card, captures or selects documents, asks questions, and reads or hears the result. The visitor should not need to understand agents, infrastructure, or 3D navigation.

**Operator:** Helps with card issuance, capture problems, device status, session cleanup, and permitted delivery actions. The operator uses the laptop management interface.

**Administrator:** Manages devices, provider connections, permissions, operational settings, and authorized maintenance.

**Human evaluator or presenter:** Observes a clean demonstration of the real document-to-answer workflow on the laptop. This view shows useful milestones and outcomes while excluding developer diagnostics and secrets.

**AI specialists and Presiding Reviewer:** Software roles that analyze evidence and produce preliminary findings. They are not human legal professionals or government officials.

## 6. The three-part system

### Laptop: main application and 3D demonstration

The laptop is the only device expected to render the 3D chamber. Its interface includes documents, case progress, specialist activity, supporting evidence, questions, reports, connections, and device management according to the user's permissions.

The planned initial deployment also runs the main backend on the laptop. That backend owns document processing, retrieval, task scheduling, synthesis, question answering, reports, provider access, and delivery. A hosted backend could be introduced later without changing the visitor experience.

Direct laptop uploads are a first-class input path. The agent system must be demonstrable even when no kiosk is connected.

### UNO Q: small gateway and hardware controller

UNO Q connects the RFID reader and selected capture hardware. Its Linux-side gateway serves the lightweight phone interface, controls or coordinates board-connected capture, keeps a bounded temporary upload queue, and communicates with the main backend.

The board does not host the 3D tribunal or the full legal-analysis workload. It does not run fifty local language models. Supported physical controls or reader interfaces may use its microcontroller and Bridge connection; a suitable USB reader may connect to Linux directly.

### Phone: simple kiosk display and conversation interface

A mobile phone is the kiosk's screen. It provides tap status, language/consent, document and page review, capture controls, simple progress, questions, answers, and report/delivery actions.

The phone is a lightweight 2D interface. It does not duplicate the laptop's administrative dashboard or download the tribunal's models and rendering libraries.

The current default is a board-connected overhead camera for documents and the phone microphone/speaker for conversation. A phone camera or board-connected microphone is an explicitly selected alternative. These defaults are planning choices, not proof that particular peripherals have been supplied.

### Communication relationship

The planned route is phone → HTTPS/ngrok or trusted local HTTPS → UNO Q gateway → main backend → configured providers. The laptop dashboard reads the same backend's case state.

A tunnel into UNO Q does not automatically establish the board's connection to the laptop backend. These are two separate connections. The phone's browser also cannot directly discover a USB camera attached to the board; board capture is exposed through the gateway.

Gemini and Sarvam remain remote services in this plan. “Processing in the main system” means that the backend coordinates and controls processing; it does not imply that cloud-model inference runs locally on the laptop or board.

## 7. The visitor experience

1. An operator issues an RFID card and prepares the kiosk phone.
2. The visitor taps the reader. The card is associated with the visitor's current permitted session.
3. The visitor confirms consent and a preferred supported language. Spoken language can help identify that preference, and the visitor can correct it.
4. The visitor starts a named document and captures its pages. Page previews allow retaking, rotating, removing, and reordering.
5. The visitor finishes that document and adds other documents or annexures when needed.
6. The visitor reviews the selected document set and explicitly starts analysis.
7. The phone shows understandable progress. The laptop shows the corresponding case reaching the relevant benches and the real work being performed.
8. The visitor asks questions about one document or the entire document set using speech or text.
9. The visitor reads or hears the findings, opens the report, and optionally chooses a delivery method and destination.
10. The session ends, visitor access is cleared, and the card can be returned or reassigned without exposing the former visitor's information.

The end of scanning is explicit. Silence or inactivity does not mean that every required page has been captured.

## 8. Multiple documents belong to one case

A case is the container for a review. It can contain several distinct documents, and each document can contain multiple ordered pages. An agreement, receipt, supporting letter, and annexure remain identifiable even when considered together.

Document titles, page boundaries, source languages, originals, and version identities matter. Findings and answers refer to the actual document and page they came from. A combined review is not a source-less block of extracted text.

The submitted set has a defined version or snapshot. Adding a document, retaking a page, or changing the reviewed set can make earlier findings stale. Earlier reports remain associated with the evidence they actually reviewed.

The intended experience includes comparison across documents: conflicting amounts, inconsistent names or dates, missing attachments, overlapping obligations, and different wording about the same issue. An apparent discrepancy is explained with evidence rather than treated automatically as fraud.

## 9. Five benches and fifty specialists

The confirmed structure is **five benches, ten specialists per bench**. Each bench is represented as a round-table team. The following allocation is the current planning roster, providing a shared vocabulary for the new build.

A bench chair is the tenth member of that bench. The Messenger and AI Presiding Reviewer are separate from the fifty specialists. All fifty identities are represented, but only applicable specialists perform work on a particular case.

### Bench A — Document and Evidence

Working principle: establish what the submitted documents actually say before interpreting them. Its output is organized evidence with uncertainty and source locations.

- **A01 Capture Quality Analyst:** Blur, glare, cropping, rotation, and unreadable regions.
- **A02 Page Continuity Analyst:** Page order, duplicates, continuity, and missing attachments.
- **A03 Text Fidelity Analyst:** Extraction accuracy, especially names, numbers, and negations.
- **A04 Language Analyst:** Source languages and faithful, clearly identified translations.
- **A05 Parties and Capacities Analyst:** Named parties and their stated roles.
- **A06 Dates and Amounts Analyst:** Dates, durations, currencies, and calculation inputs.
- **A07 Clause Structure Analyst:** Clauses, tables, schedules, definitions, and cross-references.
- **A08 Document Consistency Analyst:** Contradictions within and between submitted records.
- **A09 Sensitive Data Analyst:** Information needing restricted display or redaction.
- **A10 Evidence Chair:** Consolidated evidence and unresolved extraction questions.

### Bench B — Rights and Obligations

Working principle: examine the parties' practical responsibilities and the relevant document category. Its output is a source-linked map of obligations and candidate concerns.

- **B01 General Contract Analyst:** Promises, conditions, dependencies, and definitions.
- **B02 Employment Analyst:** Work, compensation, restrictions, and termination terms.
- **B03 Tenancy Analyst:** Rent, deposits, maintenance, possession, renewal, and exit.
- **B04 Property Transaction Analyst:** Stated interests, transfers, warranties, and supporting records.
- **B05 Consumer and Service Analyst:** Service commitments, complaints, cancellation, and warranties.
- **B06 Small-Business Analyst:** Supply, procurement, service levels, and commercial duties.
- **B07 Lending and Security Analyst:** Repayment, interest, collateral, and guarantees.
- **B08 Data and IP Analyst:** Confidentiality, data use, ownership, and intellectual property.
- **B09 Exit and Dispute Analyst:** Notice, termination, dispute steps, and contractual deadlines.
- **B10 Obligations Chair:** A clear combined account of the applicable obligations.

### Bench C — Indian Legal Sources

Working principle: examine supporting authority and applicability before making a legal assertion. Its output distinguishes verified references from coverage gaps.

- **C01 Jurisdiction Analyst:** Relevant territory, forum, and governing-law questions.
- **C02 Statute Retrieval Analyst:** Potentially relevant enactments from the approved corpus.
- **C03 State-Law Analyst:** State-specific provisions and unavailable coverage.
- **C04 Rules and Notifications Analyst:** Related rules and subordinate instruments.
- **C05 Temporal Applicability Analyst:** Effective dates, amendments, and temporal uncertainty.
- **C06 Precedent Retrieval Analyst:** Traceable judgments and paragraph references.
- **C07 Precedent Relevance Analyst:** Similarities, differences, and limits of precedent.
- **C08 Contrary Authority Analyst:** Sources that weaken a proposed conclusion.
- **C09 Citation Verifier:** Whether identifiers and quoted passages match the source.
- **C10 Sources Chair:** The supported authority package and its limitations.

### Bench D — Adversarial Risk

Working principle: challenge an initial interpretation with reasonable alternatives and practical consequences. Its output preserves disagreement and separates impact from evidence strength.

- **D01 Document-Holder Advocate:** Consequences for the person requesting the review.
- **D02 Counterparty Advocate:** The strongest reasonable alternative interpretation.
- **D03 Ambiguity Analyst:** Vague language, conflicts, and multiple plausible meanings.
- **D04 Financial Exposure Analyst:** Penalties, indemnities, charges, caps, and liabilities.
- **D05 Deadline and Default Analyst:** Trigger events, notices, defaults, and timing risks.
- **D06 Balance and Fairness Analyst:** One-sided duties, consent concerns, and unequal burdens.
- **D07 Evidence-Gap Analyst:** Facts or documents missing from the analysis.
- **D08 Red-Flag Analyst:** Suspicious inconsistencies without unsupported accusations.
- **D09 Scenario Analyst:** Concrete “what if” questions tied to the actual wording.
- **D10 Risk Chair:** Prioritized risks, counterarguments, and unresolved disagreements.

### Bench E — Verification and Explanation

Working principle: check coverage, evidence, consistency, and understandable communication. Its output is a complete or explicitly partial review package.

- **E01 Finding-to-Evidence Auditor:** Traceability of material findings to their evidence.
- **E02 Contradiction Resolver:** Reconciliation or explicit preservation of disagreements.
- **E03 Arithmetic and Timeline Verifier:** Calculations and date logic.
- **E04 Coverage Auditor:** Whether relevant clauses, questions, and tasks were addressed.
- **E05 Plain-Language Editor:** Understandable explanations with necessary qualifications.
- **E06 Multilingual Fidelity Reviewer:** Consistency between source wording and translations.
- **E07 Clarification Planner:** Useful questions and information the visitor still needs.
- **E08 Human-Review Triage Analyst:** Unresolved matters needing qualified professional review.
- **E09 Report Privacy Reviewer:** Redaction choices and unintended disclosures.
- **E10 Verification Chair:** Release status, completed coverage, and remaining limitations.

## 10. Routing, Messenger, and final review

Routing is based on the submitted evidence, document categories, relevant jurisdictional facts, and the user's questions. A tenancy case can activate tenancy and related general, financial, source, risk, and verification roles while leaving unrelated employment roles unassigned. A mixed document set can involve several specialties.

The logical flow begins with evidence quality and extraction, then applicable obligations and source analysis, followed by challenge, verification, and synthesis. Independent work can overlap; tasks that depend on earlier findings wait for those findings.

Each chair produces a bench packet containing findings, references, disagreements, missing information, and task status. The Messenger validates and delivers those packets to the Presiding Reviewer. Its role is reliable coordination, not inventing conclusions or manufacturing agreement.

The Presiding Reviewer combines accepted packets into an understandable overview, important obligations, material concerns, questions to clarify, and limitations. Missing evidence and failed required work remain visible in the outcome.

Fifty identities do not mean fifty simultaneous unrestricted API calls or fifty servers. They represent specialized tasks with bounded execution. Nor does agreement between many agents automatically establish truth, particularly when they use the same underlying model.

## 11. Voice and document questions

Sarvam AI is the confirmed speech provider. The planned primary conversation flow is Sarvam speech recognition, a Gemini-backed answer grounded in the current case, and Sarvam speech output. Gemini Live is an optional alternative conversation mode, not a second assistant speaking simultaneously.

The visitor's preferred supported language controls the explanation. Original document wording remains available, translations are identifiable, and dates, amounts, names, and qualifications remain consistent. Spoken language or accent does not determine legal jurisdiction.

The visitor can ask about a selected document or all documents in the case. Questions can concern a clause, payment, deadline, obligation, inconsistency, missing attachment, or the meaning of a finding. An answer identifies its supporting document/page or verified legal source. Information absent from the evidence is acknowledged as missing.

Factual questions may be answered from extracted text before full review finishes if their pending-review status is clear. A new question requiring material legal analysis can create targeted review work. Every conversational turn does not require rerunning all fifty specialists.

The expected experience includes captions, visible listening status, a clear stop control, interruption handling, language correction, and a text alternative. One selected microphone and one speaking guide avoid competing audio streams. Recording and playback end with the visitor session.

## 12. Required integrations and authorization

**Telegram:** A linked private chat can support document/voice input, report-ready notifications, questions where supported, and requested report delivery. Chat access belongs to a verified user/session relationship rather than a typed username alone.

**Google Drive:** The main application supports selected-document import and private report export through an authorized Google account. Drive authorization is separate from Gmail sending.

**Gmail:** Email sending uses the owner's requested app-password method with an eligible account. The intended scope is sending confirmed reports or messages, not reading the inbox or conducting bulk outreach. Account eligibility and actual credentials remain configuration matters.

**Gemini and Sarvam:** Their credentials and model configuration belong to the main backend. They are not embedded in the phone interface, card, or public assets.

**UNO Q device access:** The board uses one scoped DHARMARAKSHA device API key to communicate with the main system. This is an application credential, not a replacement for provider authorization. A chosen tunnel service may also require its own infrastructure credential.

External delivery follows an explicit visitor action or recorded per-case preference with a confirmed destination. The analyzed document cannot select a trusted recipient or instruct the system to send itself somewhere. A report remains available even when a delivery connection is unavailable.

## 13. RFID and phone-session context

The RFID card is issued by an operator and acts as a ticket to the visitor's current permitted session. Its lifecycle includes enrollment, issuance, activation, expiry, return, reassignment, and revocation for a lost card.

Repeated taps do not create repeated cases. Reassignment does not transfer the former visitor's documents. A simple card UID is not treated as verified personal identity or sufficient authority for administrator access.

The phone is paired with the intended kiosk and then associated with the correct active visitor assignment. Merely opening a public tunnel URL does not grant access to the latest card tap. Ending the session or returning/reassigning the card removes the old visitor's access.

A dedicated kiosk phone is the initial planning default. A visitor-owned phone would require its own limited pairing relationship. The exact reader, card technology, and wiring remain unresolved hardware details.

## 14. Visual identity and interaction expectations

The requested visual direction is attractive, distinctive, lively, and easy to handle. The default laptop composition combines a warm light document workspace with an ink-dark tribunal chamber. Full Light and Dark modes provide alternative appearances.

The visual vocabulary is paper, folios, evidence, round tables, source references, bench packets, and a central evidence well. Indigo, restrained brass details, matte materials, and legible typography support a professional civic setting. The phone remains a readable, simple interface.

Characters are coherent stylized adult professionals with stable identities and believable seated poses. Their relevant activities include listening, reading, checking evidence, note-taking, discussion gestures, and handing over a packet. The Messenger visibly connects completed bench work to final review.

Licensed rigged models and compatible animation clips can reduce production work. Some desk-specific gestures may still need authoring or adaptation. The expected result is not fifty unrelated asset styles or a room of static decorative icons.

The laptop provides straightforward overview, bench, and document views. Selecting a bench or specialist reveals its role, actual status, concise findings, and references. Important text and controls remain in accessible HTML. Reading a report or completing a review never depends on precise 3D clicking or free-roaming camera movement.

All fifty seats remain represented. More detailed motion can be concentrated on the selected bench, with simpler distant animation. Smooth operation is measured on the actual laptop; no untested frame-rate guarantee is assumed. A functional 2D laptop view remains available when rendering is unavailable or unwanted.

## 15. What evaluators see

The laptop's Presentation View shows a document entering the system, the relevant teams receiving work, genuine processing milestones, the Messenger handoff, and the resulting answers/report. Kiosk-origin and laptop-origin inputs are distinguishable.

Human evaluators do not need internal prompts, raw developer logs, provider diagnostics, or secret configuration. They can still see concise evidence-backed explanations and honest errors or partial results.

The presentation does not claim that cloud inference occurred on UNO Q. Waiting, failure, and incomplete coverage are real visible states. Rehearsal data is identifiable as sample data rather than presented as a live case.

## 16. Reliability and information boundaries

The main backend is the authority for case, document, review, answer, report, and delivery state. The phone and laptop present different views of that same case. Reconnection does not create a second conflicting result.

Document processing covers the submitted pages, preserves source locations and Indian scripts, and identifies uncertain scans. Source references must support their associated claims. Missing information and uncertainty remain part of the answer rather than being replaced with invented confidence.

Documents, extracted text, reports, and retrieved pages are evidence. Instructions contained inside them do not control application behavior, reveal secrets, change permissions, or initiate delivery.

Private documents and reports remain restricted to authorized sessions and roles. Capture consent and delivery preferences are explicit. Temporary media, previews, recordings, and browser access have a defined cleanup lifecycle so a new visitor cannot inherit another person's information.

Network loss, provider limits, failed tasks, interrupted uploads, unavailable devices, and ambiguous send outcomes are expected states. They lead to a truthful pending, partial, failed, or recovery experience. Offline capture, if configured, is not represented as completed offline AI analysis.

## 17. Planned technical baseline

The current architectural plan uses React and TypeScript for the laptop and phone web interfaces, with Three.js, React Three Fiber, and Drei confined to the laptop's 3D interface. The main API and worker use Node.js/TypeScript with Express. PostgreSQL is the central record store, with durable background work and private document/report storage.

The UNO Q gateway is a separate small deployable. Its hardware adapter may use Python or the board's supported tooling where appropriate. Temporary board storage is bounded and separate from the authoritative central records.

These are planning choices that support a manageable first demonstration. Exact compatible package versions, provider model IDs, deployment settings, and hardware drivers belong to the later implementation/configuration documents. No previous software installation or private module is assumed to exist.

## 18. What a successful demonstration looks like

A visitor brings a three-page agreement and a separate two-page supporting document. After card authentication, they capture both, retake a blurred page, and confirm the order. The phone submits one clearly identified document set.

The laptop displays the same case and routes it to relevant specialists. Evidence, obligation, source, risk, and verification work produce traceable findings. Unrelated roles remain visibly unassigned. The Messenger delivers the accepted packets to the Presiding Reviewer.

The visitor asks in a supported language what a payment clause means and whether the supporting document contradicts it. The answer refers to the relevant pages, distinguishes evidence from interpretation, and is spoken in the chosen language with readable captions.

The report reflects that same reviewed document set. The visitor can read or download it and choose a confirmed Telegram, Gmail, or Drive action. Returning the card ends access to that visitor's material. A direct laptop upload can demonstrate the same review path without the kiosk.

The final impression is a clear relationship between input, actual specialist work, evidence, and an understandable answer. The 3D scene helps explain the system while the phone keeps the visitor's task straightforward.

## 19. Decisions still awaiting configuration

The confirmed scope includes a fresh build, five benches with fifty specialists, laptop-only 3D, a phone kiosk interface, UNO Q hardware access, RFID-issued sessions, multiple documents, Sarvam/Gemini conversation, and Telegram/Drive/Gmail integrations.

Remaining details include the precise UNO Q variant; reader module, interface and card type; camera and microphone models; phone/browser; final media-source choices; supported languages to demonstrate; initial document categories and reviewed legal-source corpus; account credentials and quotas; hosting/network availability; and actual asset/performance measurements.

These details do not create a dependency on the earlier folder. They distinguish the agreed product direction from facts that can only be established during configuration and testing.
