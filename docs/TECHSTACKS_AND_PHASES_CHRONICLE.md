# DHARMARAKSHA — Comprehensive Tech Stacks & Phase Chronicle

> **A Single Unified Document detailing All Tech Stacks Used and Exhaustive Phase-by-Phase Deliverables for Phases 01 through 16.**

---

# PART 1: COMPLETE TECH STACKS INVENTORY

This section documents every technology, runtime, framework, library, protocol, and tool employed in DHARMARAKSHA across all seven workspaces and three physical tiers (Laptop Kiosk, Mobile Phone Kiosk, and UNO Q Hardware Gateway).

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             DHARMARAKSHA WORKSPACES                              │
├────────────────────────────────┬─────────────────────────────────────────────────┤
│ @dharmaraksha/shared-contracts │ Domain types, DDL schemas, event contracts      │
│ @dharmaraksha/tribunal-defs    │ 50 specialist identities, bench definitions     │
│ @dharmaraksha/main-api         │ Central REST API, session auth, storage, events │
│ @dharmaraksha/worker           │ Asynchronous report engine, PDFKit, routing DAG │
│ @dharmaraksha/laptop-web       │ Three.js 3D chamber, split workspace, review    │
│ @dharmaraksha/phone-web        │ Lightweight mobile kiosk, camera intake, Q&A    │
│ @dharmaraksha/uno-gateway      │ ARM64 Linux peripheral gateway, UVC & RFID      │
└────────────────────────────────┴─────────────────────────────────────────────────┘
```

---

## 1. Programming Languages & Runtimes

- **TypeScript 5.4.5**: Strict typing across all 7 packages and applications with `strict: true`, `noImplicitAny: true`, and `exactOptionalPropertyTypes`.
- **Node.js v24.14.0 (ESM native)**: Root execution engine using modern ECMAScript modules (`"type": "module"`).
- **Python 3.12**: Automated technical architecture diagram generation (`scripts/generate_architecture_diagram.py`) utilizing Pillow for 3400×2250 vector-grade rendering.
- **C++ / Arduino Wiring**: Hardware firmware specifications and serial byte stream protocols for the Arduino UNO Q / Uno R4 WiFi microcontroller.

---

## 2. 3D Graphics & WebGL Visualization (Laptop-Only)

- **Three.js r164**: Core WebGL rendering engine powering the 3D Tribunal Chamber scene.
- **@react-three/fiber v8.16.6**: React reconciler for Three.js managing declarative scene graphs, camera mounts, and canvas lifecycles.
- **@react-three/drei v9.105.6**: Helper utilities including `OrbitControls`, `Text` SDF typography rendering, and `Float` physics-free ambient floating markers.
- **Custom Exponential Lerp Controller**: Smooth camera preset transitions (`overall`, `bench-A`–`E`, `document`, `presiding`, `reset`) with automatic reduced-motion snapping.
- **WebGL Context Loss & Restoration Listeners**: Real-time event handling for `webglcontextlost` and `webglcontextrestored` to ensure zero user-facing crashes.
- **Pure SVG Architectural Fallback**: 100% accessible, interactive 2D floor plan (`viewBox="0 0 800 700"`) providing full parity without WebGL dependencies.

---

## 3. Frontend Applications & Styling

- **React 18.3.1**: Component architecture across both `apps/laptop-web` and `apps/phone-web`.
- **Vite 5.2.11 / 5.4.21**: Fast bundling, hot module replacement, and production tree-shaking.
- **Lucide React v0.378.0**: Accessible iconography for legal, security, camera, and navigation controls.
- **Paper-and-Ink Design System**: Custom CSS variables for warm ivory paper folio surfaces (`#fdfbf7`, `#f9f6ef`) paired with obsidian ink-dark chamber surfaces (`#090d16`, `#0f172a`).
- **Responsive Theming**: Split hybrid, Light, and Dark visual modes with tested contrast levels meeting WCAG AA accessibility standards.
- **Strict Phone Independence**: Zero Three.js or WebGL dependencies in `apps/phone-web`, producing a ~180 kB production bundle that builds in 2.5 seconds.

---

## 4. Backend Microservices & API Architecture

- **Node.js HTTP & Express / Fastify Middleware**: Central RESTful routing in `apps/main-api` and `apps/uno-gateway`.
- **Server-Sent Events (SSE)**: Monotonic real-time event streaming (`/api/v1/cases/:id/events`) with `Last-Event-ID` replay support.
- **Strict CORS & CSRF Defense**: Origin validation against tunnel URLs and LAN IP addresses; `cookie-parser` for HttpOnly Secure cookies.
- **Idempotency Service**: SHA-256 pre-hash verification and monotonic operation ledger guaranteeing exact-once processing.

---

## 5. Hardware, Peripheral & IoT Gateway

- **Arduino UNO Q / Uno R4 WiFi**: Hardware bridge for scanning physical document pages and visitor RFID cards.
- **Linux UVC Video Subsystem (`/dev/video0`)**: Direct kernel-level frame grabbing with dual-mode capture (rate-limited 640×480 preview + high-resolution 1080p scan).
- **RFID Subsystem (PN532 / RC522)**: 13.56MHz contactless smart card interface with 3000ms debounce and cryptographic session isolation.
- **Systemd Daemon (`deploy/uno-q/dharmaraksha-gateway.service`)**: Supervised background process with 256MB memory cap, 80% CPU quota, and auto-restart.
- **Disk Spool Manager**: Bounded temporary cache enforcing a 20-capture / 50MB ceiling with disk pressure rejection (`507 SPOOL_DISK_PRESSURE`).

---

## 6. Indian Legal OCR, Multilingual & Script Engine

- **Multi-Script Extraction**: Native OCR support for English/Latin, Kannada (ಕನ್ನಡ), Devanagari/Hindi (वाणिज्यिक पट्टा), Tamil, and Telugu.
- **Passage-Level Grounding**: Spatial location anchoring using format `doc:<id>:v<ver>:p<page>#para-<idx>`.
- **Legal Entity Recognition**: Automated parsing for Indian monetary figures (`INR 45,000`, `Rs. 2,50,000`), calendar dates, and statutory negations (`shall not`, `neither...nor`, `no refund`).
- **Full Text Retention**: Uncapped ingestion processing long agreements (>1,000 characters per clause) without truncation.

---

## 7. Curated Indian Legal Corpus & Evidence Retrieval

- **Case-Restricted Lexical BM25 Index**: Document retrieval restricted strictly to active case snapshot boundaries.
- **Curated Authoritative Statutory Corpus**:
  - *Transfer of Property Act, 1882* (Sections 105, 106, 107, 108, 111)
  - *Indian Contract Act, 1872* (Sections 10, 23, 27, 73, 74)
  - *Consumer Protection Act, 2019* (Sections 2(7), 2(47), 35)
  - *Karnataka Rent Act, 1999* & State-specific rent regulations
- **Supreme Court Landmark Precedents**: Traceable citations including *Kailash Nath Associates v. DDA (2015)*.
- **Hallucination Blocker**: Enforces that missing statutory coverage returns an explicit limitation rather than fabricated law.

---

## 8. Fifty-Specialist Multi-Agent Tribunal Engine

- **5 Benches & 50 Specialist Personas (A01–E10)**:
  - *Bench A (A01–A10)*: Document & Evidence (Quality, Continuity, Fidelity, Language, Parties, Dates/Amounts, Syntax, Consistency, PII, Chair)
  - *Bench B (B01–B10)*: Rights & Obligations (General Contract, Employment, Tenancy, Property, Consumer, MSME, Credit, IP, Exit, Chair)
  - *Bench C (C01–C10)*: Indian Legal Sources (Jurisdiction, Central Statutes, State Law, Rules/Gazettes, Temporal Validity, Precedents, Relevance, Contrary Authority, Citation Verifier, Chair)
  - *Bench D (D01–D10)*: Adversarial Risk (Document-Holder Advocate, Counterparty Advocate, Ambiguity, Dispute Forum, Remedies, Forfeiture, Frustration, Regulatory, Vulnerability, Chair)
  - *Bench E (E01–E10)*: Verification & Explanation (Grounding, Statutory Authority, Arithmetic, Dissent, Completeness, Plain Language, Vernacular, Synthesis, Privacy, Chair)
- **Seat 10 Chair Architecture**: Distinct chair role consolidating bench packets with cryptographic checksums.
- **Deterministic Messenger**: Courier delivery service ensuring immutable handoffs without inventing consensus.
- **AI Presiding Reviewer**: Independent synthesis engine preserving dissents, gaps, and visitor questions.

---

## 9. Versioned PDF Engine & Report Generation

- **PDFKit v0.20.2**: High-performance streaming PDF generation engine operating outside the HTTP request path.
- **Cross-Platform Font Resolver**: Eliminates hardcoded OS dependencies by cascading through Linux Noto/DejaVu, macOS Arial Unicode, Windows Segoe UI / Nirmala UI / Arial, and standard PDF fallbacks.
- **Accessible HTML Engine**: Lightweight, responsive HTML report generator (`renderReportHtml()`) allowing instant viewing on mobile phones without a PDF reader.
- **Spoken Summary Audio Payload**: Structured plain-language voice script designed for text-to-speech audio playback.

---

## 10. Security, Cryptography & Privacy

- **SHA-256 Digesting**: Cryptographic pre-hashing of every scanned page still, report document, and case snapshot manifest.
- **PII Redaction Engine**: Automatic masking of Aadhaar numbers, PAN cards, phone numbers, and bank account credentials.
- **Role-Based Access Control (RBAC)**: Strict permission boundaries separating `visitor`, `operator`, and `superadmin`.
- **Zero Secret Leakage Guarantee**: Phone-facing endpoints never expose device master keys, provider credentials, or internal tokens.

---

# PART 2: COMPLETE PHASE-BY-PHASE CHRONICLE (PHASES 01–16)

```
Phases 01–04 ──► Skeleton, Shared Contracts, Paper-and-Ink Tokens, Laptop/Phone UI
Phases 05–08 ──► PostgreSQL Persistence, RFID Cards, UNO Q Capture, HTTPS ngrok
Phases 09–12 ──► Multi-Doc OCR, Source Retrieval, 50 Specialists, Bounded Routing
Phases 13–16 ──► Bench Packets & Messenger, Q&A, PDF Reports, 3D Chamber & 2D Map
```

---

## Phase 01: Repository & Skeleton Architecture

- **Depends on**: Initial Workspace Setup.
- **Core Objective**: Establish the root monorepo architecture, npm workspaces, TypeScript compilation targets, pinned dependencies, minimal laptop and phone shells, and foundational health endpoints.
- **Key Deliverables**:
  - Root configuration (`package.json`, `tsconfig.json`) defining workspaces: `shared-contracts`, `tribunal-definitions`, `main-api`, `worker`, `laptop-web`, `phone-web`, `uno-gateway`.
  - Pinned core dependencies avoiding wildcard drift.
  - Minimal UI skeletons for `laptop-web` and `phone-web` with Vite development servers.
  - Baseline `/health` endpoints on `main-api` and `uno-gateway`.
- **Verification Gate**: 100% clean typecheck and build across all seven packages with zero compile errors.

---

## Phase 02: Architecture, Ownership & Shared Contracts

- **Depends on**: Phase 01.
- **Core Objective**: Define the formal 3-tier system architecture, PostgreSQL authority schema, SQLite spool schema, and versioned domain TypeScript interfaces.
- **Key Deliverables**:
  - `packages/shared-contracts/src/`:
    - `case.ts`: Case record, case ownership (`creatorSessionId`, `creatorRole`, `sourceType`), status lifecycles.
    - `document.ts`: Page definitions, extracted passages, document categories, bounding box coordinates.
    - `rfid.ts`: Card enrollment, card issuance, physical reader state.
    - `events.ts`: Monotonic event types with payload contracts.
    - `report.ts`: Report structures, delivery requests, spoken audio summary contracts.
  - PostgreSQL Authority DDL: 19 normalized relational tables covering cases, documents, pages, sessions, cards, specialists, bench packets, findings, and audit logs.
  - SQLite Spool DDL: Offline capture buffer schema for the UNO Q gateway.
- **Verification Gate**: Monorepo typecheck pass with zero ambiguous device owners, session keys, or database schemas.

---

## Phase 03: Combined Light & Dark Visual System

- **Depends on**: Phase 02.
- **Core Objective**: Establish the "Paper and Ink" design language uniting warm ivory paper folio workspaces with ink-dark tribunal chamber visuals.
- **Key Deliverables**:
  - Design token CSS specifications (`apps/laptop-web/src/styles/theme.css`, `apps/phone-web/src/styles/theme.css`).
  - Three tested themes: Split (hybrid dark chamber + light folio), Light, and Dark.
  - Laptop split workspace: 50% left folio reader + 50% right 3D tribunal chamber.
  - Presentation Header component with mode switching and role simulation.
- **Verification Gate**: Both light paper and dark ink surfaces render concurrently without styling conflicts; WCAG AA contrast compliance.

---

## Phase 04: Accessible Laptop Shell & Small Phone UI

- **Depends on**: Phase 03.
- **Core Objective**: Deliver the complete navigable laptop shell with five destinations and the mobile phone visitor interface with zero 3D payload.
- **Key Deliverables**:
  - Laptop Shell Destinations:
    1. *Review*: Split workspace with folio reader, 3D chamber, and bench inspector sidebar.
    2. *Documents*: Multi-document folio manager with page thumbnail viewer.
    3. *Reports*: Referenced report preview with download triggers.
    4. *Connections*: Real-time status for Telegram, Google Drive, Gmail, and ngrok tunnel.
    5. *Device*: Role-gated UNO Q hardware management and RFID card enrollment console.
  - Phone UI: 7-screen mobile journey (Welcome, Tap Card, Camera Viewfinder, Processing Status, Review Summary, Grounded Q&A, Spoken Audio Player).
  - Phone bundle verification: Verified zero Three.js dependencies in `phone-web`.
- **Verification Gate**: Full screen navigation functional; phone bundle builds cleanly with zero 3D assets.

---

## Phase 05: Central Persistence, Auth & Real Events

- **Depends on**: Phases 02, 04.
- **Core Objective**: Build central PostgreSQL persistence, disk storage, session authorization middleware, monotonic event streaming, and idempotency deduplication.
- **Key Deliverables**:
  - `StorageService`: Secure disk storage under `./storage/` with SHA-256 pre-hash verification.
  - `requireCaseAccess`: Session-bound authorization middleware preventing unauthorized cross-case data leakage.
  - `EventLedgerService`: Monotonic append-only event stream supporting real-time SSE broadcasts.
  - `IdempotencyService`: Deduplication table preventing repeated logical operations upon network retries.
  - Automated 6-point verification test suite (`apps/main-api/src/tests/phase05-verification.ts`).
- **Verification Gate**: All 6 tests passed; real case data survives server restarts without duplicate mutations.

---

## Phase 06: Issued-Card RFID Sessions

- **Depends on**: Phase 05.
- **Core Objective**: Implement physical and simulated RFID card sessions with clean-slate reissue and instant cryptographic revocation.
- **Key Deliverables**:
  - `RfidSessionManager`: Handles card enrollment, issuance, tap-to-start with 3000ms debounce, and session termination.
  - Clean-slate reissue: When an RFID card is returned and reissued, all prior session tokens and case associations are purged.
  - Hardware vs Simulated Adapters: `HardwareRfidReaderAdapter` (serial port polling) and `SimulatedRfidReaderAdapter` (deterministic testing).
  - Automated 8-point verification test suite (`apps/main-api/src/tests/phase06-verification.ts`).
- **Verification Gate**: All 8 tests passed; reissued cards never expose prior visitor data; tap debouncing prevents duplicate sessions.

---

## Phase 07: UNO Q Gateway & Capture Adapter

- **Depends on**: Phases 05, 06.
- **Core Objective**: Build the Linux ARM64 peripheral gateway for the UNO Q board, managing the UVC camera, mobile preview stream, bounded disk spool, and stable page identities.
- **Key Deliverables**:
  - `CameraAdapter`: Supports hardware UVC video (`/dev/video0`) and software simulation; produces 640×480 preview frames and 1080p high-resolution captures.
  - `SpoolService`: Local disk cache under `./storage/uno_spool/` strictly capped at 20 captures / 50MB with `507 SPOOL_DISK_PRESSURE` thresholding.
  - `CaptureManager`: Cryptographic SHA-256 pre-hashing and reliable upload retry loop with stable page identities.
  - Hardened Systemd Service (`deploy/uno-q/dharmaraksha-gateway.service`) with non-root security boundaries.
  - Automated 6-point verification test suite (`apps/uno-gateway/src/tests/phase07-verification.ts`).
- **Verification Gate**: All 6 tests passed; spool protects disk from saturation; capture survives simulated network dropouts.

---

## Phase 08: HTTPS Connection & Pairing (ngrok / LAN)

- **Depends on**: Phase 07.
- **Core Objective**: Secure phone-to-kiosk communication over HTTPS via ngrok tunnels or LAN certificates, using single-use pairing codes and CSRF defense.
- **Key Deliverables**:
  - `TunnelSupervisor`: Manages ngrok agent lifecycles, endpoint updates, and independent connectivity reporting (`tunnel.status` vs `mainApi.status`).
  - `PairingService`: Ephemeral single-use pairing codes (`DK-XXXXXX`) with 10-minute expiry; sets HttpOnly Secure SameSite=Strict cookies.
  - Takeover Prevention: Blocks a second phone from hijacking an actively bound visitor session (`409 SESSION_ALREADY_BOUND`).
  - `security-middleware.ts`: Strict CORS allowlist, CSRF origin verification, and operator key gating.
  - Automated 10-point verification test suite (`apps/uno-gateway/src/tests/phase08-verification.ts`).
- **Verification Gate**: All 10 tests passed; unpaired browsers rejected with 401; zero credentials leaked in responses.

---

## Phase 09: Multiple-Document Intake & OCR

- **Depends on**: Phases 05, 07.
- **Core Objective**: Ingest multi-document case sets (agreements, receipts, annexures), execute multi-script Indian OCR, anchor extracted passages, and freeze immutable snapshots.
- **Key Deliverables**:
  - `OcrEngine`: Ingests full text without truncation; extracts legal dates, monetary values, and statutory negations; recognizes English, Kannada, Devanagari, Tamil, and Telugu.
  - `DocumentIntakeService`: Page reordering, 90° rotation, recapture of blurry pages, and human review text correction with audit trails.
  - Duplicate Page Preservation: Duplicate pages are tagged (`duplicate_page`) without silent deletion.
  - Cross-Document Discrepancy Detection: Identifies conflicting dates and conflicting deposit amounts across documents.
  - Immutable Case Snapshot (v1 -> v2) with combined SHA-256 fingerprint; detects and invalidates stale findings.
  - Automated 8-point verification test suite (`apps/main-api/src/tests/phase09-verification.ts`).
- **Verification Gate**: All 8 tests passed; document boundaries survive reordering; passage anchors point to exact pages.

---

## Phase 10: Source Retrieval & Evidence Provenance

- **Depends on**: Phase 09.
- **Core Objective**: Implement case-restricted lexical retrieval (BM25) over case documents alongside a separately curated Indian legal source corpus.
- **Key Deliverables**:
  - `EvidenceRetrievalIndex`: Fast tokenized passage search strictly gated by case ownership and snapshot version.
  - Curated Indian Legal Corpus:
    - *Transfer of Property Act, 1882* (Lease creation, oral vs registered leases, notice periods)
    - *Indian Contract Act, 1872* (Covenants in restraint of trade, penal damages vs genuine pre-estimates)
    - *Consumer Protection Act, 2019* (Unfair contract terms, consumer dispute jurisdiction)
    - *Karnataka Rent Act, 1999* (Exemptions based on commercial rent thresholds)
  - Location Anchors: Standardized anchors for case passages (`doc:...`), statutes (`statute:...`), and precedents (`precedent:...`).
  - Hallucination Blocker: Missing sources return explicit limitation notices rather than invented legal provisions.
  - Automated 10-point verification test suite (`apps/worker/src/tests/phase10-verification.ts`).
- **Verification Gate**: All 10 tests passed; citations resolve to real sections; stale law and jurisdictional mismatches flagged.

---

## Phase 11: Fifty Specialist Identities & Bench Registry

- **Depends on**: Phase 10.
- **Core Objective**: Implement the complete tribunal roster of exactly 50 specialist identities across 5 benches with deterministic seat assignments and role contracts.
- **Key Deliverables**:
  - `BENCHES` and `ALL_SPECIALISTS` (`packages/tribunal-definitions/src/benches.ts`): Exactly 5 benches (A, B, C, D, E) with 10 specialists each (A01–E10).
  - Seat 10 Chair Enforcement: Seats `A10`, `B10`, `C10`, `D10`, `E10` explicitly defined as Bench Chairs with index 9.
  - Deterministic Seating Geometry: Seat angles incremented precisely by 36° (0° to 324°).
  - Role Contracts: Defined eligibility rules, evidence inputs, allowed read-only capabilities, finding categories, and prompt versions (`v1.0.0`).
  - Separate Messenger Courier and Presiding Reviewer identities.
  - Perspective Examples: Demonstrates distinct outputs for Tenancy, Employment, Source Verification, Adversarial Risk, and Plain Language.
  - Automated 8-point verification test suite (`apps/worker/src/tests/phase11-verification.ts`).
- **Verification Gate**: All 8 tests passed; exactly 50 unique specialist IDs exist with complete role contracts.

---

## Phase 12: Durable Routing & Bounded Specialist Execution

- **Depends on**: Phase 11.
- **Core Objective**: Implement persisted routing plans, dependency DAG progression, durable claim locks, and independent first assessments without majority voting.
- **Key Deliverables**:
  - `SpecialistExecutionRouter`: Generates routing plans mapping documents to eligible specialists; skips domain-mismatched roles with persisted reasons.
  - Dependency Stage Progression: Stage 1 (Bench A) -> Stage 2 (Bench B & C) -> Stage 3 (Bench D) -> Stage 4 (Bench E).
  - Worker Lease Management: Durable task claims with 30-second leases, retry budgets (max 3 attempts), and deadline enforcement.
  - Contradiction Round: Bounded adversarial checks without agent voting or invented probability percentages.
  - Crash Recovery: Resumes interrupted execution without duplicating previously accepted findings.
  - Automated 8-point verification test suite (`apps/worker/src/tests/phase12-verification.ts`).
- **Verification Gate**: All 8 tests passed; execution resumes cleanly after simulated worker crashes; no majority-rule fabrication.

---

## Phase 13: Bench Packets, Messenger & Presiding Review

- **Depends on**: Phase 12.
- **Core Objective**: Implement versioned bench packet consolidation by chairs, deterministic Messenger delivery, and AI Presiding Reviewer synthesis.
- **Key Deliverables**:
  - `PacketConsolidator`: Bench chairs (A10–E10) assemble findings into sealed packets with SHA-256 checksums, preserving dissents and gaps.
  - `DeterministicMessengerService`: Validates packet integrity, deduplicates delivery, and logs acknowledgments without altering contents.
  - `PresidingReviewerService`: Synthesizes accepted bench packets into preliminary findings, material obligations, and visitor questions.
  - Reference Grounding Validation: Verifies every synthesized claim against stored evidence; blocks publication if required citations are missing.
  - Animation Milestones: Emits safe events (`packet-ready`, `packet-delivered`, `synthesis-complete`) decoupled from backend latency.
  - Automated 8-point verification test suite (`apps/worker/src/tests/phase13-verification.ts`).
- **Verification Gate**: All 8 tests passed; duplicate delivery has single logical effect; citations strictly validated.

---

## Phase 14: Document-Grounded Questions Across Case

- **Depends on**: Phases 10, 13.
- **Core Objective**: Enable typed natural language Q&A across one document or all documents in the active snapshot, distinguishing preliminary OCR from tribunal findings.
- **Key Deliverables**:
  - `GroundedQAService`: Scoped Q&A supporting single-document focus or multi-document comparison.
  - Ambiguity Clarifier: Detects ambiguous queries like "this agreement" and prompts for document selection.
  - Multi-Document Comparison: Calculates date discrepancies and financial differences with exact page citations.
  - Grounding Enforcement: Refuses to hallucinate answers when information is absent from the submitted evidence.
  - Multi-Tenant Isolation: Blocks cross-case Q&A leakage and prevents querying against outdated snapshot versions.
  - Automated 10-point verification test suite (`apps/worker/src/tests/phase14-verification.ts`).
- **Verification Gate**: All 10 tests passed; absent facts yield limitation statements; stale snapshots rejected.

---

## Phase 15: Readable Reports & Private Downloads

- **Depends on**: Phases 13, 14.
- **Core Objective**: Generate versioned, printable A4 PDF reports, accessible HTML summaries, and plain-language spoken summaries outside the HTTP path.
- **Key Deliverables**:
  - `FontResolver`: Cross-platform font resolver supporting Linux Noto/DejaVu, macOS Arial Unicode, Windows Segoe UI / Nirmala UI / Arial, and Indian scripts (Kannada, Devanagari, Tamil, Telugu, Latin).
  - `ReportRenderer`: Versioned PDF generator with running headers/footers, selectable text, and clickable source links; includes mandatory preliminary disclaimer.
  - `renderReportHtml`: Accessible HTML summary enabling instant reading on mobile phones without desktop PDF software.
  - `SpokenSummaryPayload`: Voice-ready bullet points for mobile TTS playback.
  - Private Storage & Revocable Download: Downloads gated by `requireCaseAccess`; card return immediately revokes access tokens.
  - Disconnected Delivery Resilience: Failed Telegram/Drive/Gmail integrations do not prevent local PDF downloads.
  - Automated 9-point verification test suite (`apps/worker/src/tests/phase15-verification.ts`).
- **Verification Gate**: All 9 tests passed; PDF layout renders legibly; private links enforce access control.

---

## Phase 16: Laptop-Only 3D Chamber & 2D Fallback

- **Depends on**: Phases 03, 04, 11, 13.
- **Core Objective**: Build the laptop WebGL 3D Tribunal Chamber using Three.js / React Three Fiber / Drei, featuring 5 round tables, 50 selectable seats, central evidence well, courier paths, presiding podium, camera presets, and a complete 2D architectural SVG fallback.
- **Key Deliverables**:
  - `chamber-types.ts`: Defines camera presets (`overall`, `bench-A`–`E`, `document`, `presiding`, `reset`), 3D coordinate vectors, 6 courier transit floor routes, and theme color palettes (`split`, `light`, `dark`).
  - `TribunalChamber.tsx`:
    - 5 distinctive round tables with bench primary colors and brass perimeter rings.
    - 50 individually selectable specialist seats with unique seat IDs (`A01`–`E10`). Clicking any seat activates visual beacon rings and syncs the inspector.
    - Elevated Chair seat (Seat 10, index 9) adorned with golden metallic finish, ornate backrest, cone crown finial, and amber glow ring.
    - Central Evidence Well with rotating luminous glyph ring and floating immutable evidence snapshot folio.
    - Elevated Presiding Reviewer podium with marble/brass dais, slanted reading console, and adjudication banner.
    - Inlaid brass Messenger transit tracks across the floor with floating crystal octahedron courier marker.
    - CameraController: Smooth exponential lerp between presets with instant snapping under `reducedMotion`.
    - WebGL Context-Loss Recovery: Listens for `webglcontextlost` and `webglcontextrestored`, automatically falling back to 2D view.
  - `Chamber2DFallback.tsx`:
    - Full interactive SVG architectural schematic floor plan (`viewBox="0 0 800 700"`).
    - 100% accessible parity with interactive click handlers on all 50 seats, gold crown indicators for Chairs, and pulsing selection halos.
  - `ChamberOverlayControls.tsx`:
    - Camera preset toolbar, 2D/3D toggle, reduced motion toggle, reset view button, and active specialist detail pill.
    - HTML `<select>` dropdown containing all 50 specialists, ensuring every seat is selectable via standard HTML form controls.
  - `BenchInspector.tsx`:
    - Two-way selection synchronization with expanded detail cards showing task objectives, focus areas, allowed capabilities, evidence inputs, and output contracts.
  - Phone Independence:
    - Confirmed zero Three.js or WebGL dependencies in `apps/phone-web` (~180 kB production bundle).
  - Automated 10-point verification test suite (`apps/worker/src/tests/phase16-verification.ts`).
- **Verification Gate**: All 10 tests passed; all 50 seats selectable; camera presets understandable; full HTML equivalence established.

---

# PART 3: VERIFICATION SUMMARY TABLE

| Phase | Title | Tests | Status | Verification Gate Summary |
| :---: | :--- | :---: | :---: | :--- |
| **01** | Repository & Skeleton Architecture | 1 | **PASSED** | Zero-error typecheck and build across all packages |
| **02** | Architecture, Ownership & Shared Contracts | 1 | **PASSED** | 100% typecheck pass; zero ambiguous database owners |
| **03** | Combined Light & Dark Visual System | 1 | **PASSED** | Paper and ink surfaces render concurrently; WCAG AA |
| **04** | Accessible Laptop Shell & Small Phone UI | 1 | **PASSED** | Phone bundle inspection confirms 0 3D payload |
| **05** | Central Persistence, Auth & Real Events | 6 | **PASSED** | Real data survives restart; duplicate submission rejected |
| **06** | Issued-Card RFID Sessions | 8 | **PASSED** | Reissued cards reveal zero prior data; debounce active |
| **07** | UNO Q Gateway & Capture Adapter | 6 | **PASSED** | Bounded spool prevents disk saturation; SHA-256 verified |
| **08** | HTTPS Connection & Pairing (ngrok / LAN) | 10 | **PASSED** | Unpaired browsers denied; zero secrets leaked |
| **09** | Multiple-Document Intake & OCR | 8 | **PASSED** | Document boundaries survive; exact passage grounding |
| **10** | Source Retrieval & Evidence Provenance | 10 | **PASSED** | Citations point to verified law; missing sources limited |
| **11** | Fifty Specialist Identities & Bench Registry | 8 | **PASSED** | Exactly 50 unique analyst IDs; chair in seat 10 |
| **12** | Durable Routing & Bounded Execution | 8 | **PASSED** | Execution resumes after crash; no majority voting |
| **13** | Bench Packets, Messenger & Presiding Review | 8 | **PASSED** | Duplicate packet delivery idempotent; citations grounded |
| **14** | Document-Grounded Questions Across Case | 10 | **PASSED** | Cross-document differences cited; no hallucinations |
| **15** | Readable Reports & Private Downloads | 9 | **PASSED** | Versioned PDF renders legibly; private links enforced |
| **16** | Laptop-Only 3D Chamber & 2D Fallback | 10 | **PASSED** | All 50 seats selectable; camera presets; HTML parity |

---

*Chronicle finalized and verified through Phase 16.*
