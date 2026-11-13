# DHARMARAKSHA — Progress Ledger (Phases 01–24)

This ledger tracks the status, primary deliverables, and verification gates across the 24 planned engineering phases of DHARMARAKSHA.

| Phase | Phase Name | Primary Deliverables | Verification Gate | Status |
| :--- | :--- | :--- | :--- | :--- |
| **01** | **Repository & Skeleton Architecture** | Monorepo layout, npm workspaces, TypeScript configurations, pinned dependencies, minimal laptop/phone views, health endpoints. | Zero-error typecheck and build across packages and apps. | **COMPLETED** |
| **02** | **Architecture, Ownership & Shared Contracts** | Final 3-tier topology spec, PostgreSQL authority DDL (19 tables), SQLite spool DDL, versioned domain contracts (device, card, session, case, document, snapshot, analysis, QA, findings, report, events, delivery), operational protocols. | 100% typecheck pass; zero ambiguous database owner, device secret, or camera source. | **COMPLETED** |
| **03** | **Combined Light & Dark Visual System** | Semantic tokens for surfaces, text, borders, status, 3D lighting; "Paper and Ink" design specification; laptop split/light/dark themes; phone responsive styling; reviewable layouts for Review Chamber, Document Comparison, Grounded Q&A, Report Preview, and 2D Accessible fallback. | Layouts show light/dark surfaces together; all 3 laptop themes supported; all essential tasks usable outside 3D. | **COMPLETED** |
| **04** | **Accessible Laptop Shell & Small Phone UI** | Complete React/TypeScript shells; Review, Documents, Reports, Connections, and role-gated Device destinations on laptop; full 7-screen phone visitor journey; persistent "Stop speaking" action; safe-area insets; zero Three.js in phone bundle. | Phone bundle inspection confirms 0 3D payload; full navigation accessible; fixtures clearly labeled. | **COMPLETED** |
| **05** | **Central Persistence, Auth & Real Events** | PostgreSQL integration (`pg`), private disk storage (`StorageService`), device key exchange & instant revocation, session authorization middleware (`requireCaseAccess`), monotonic event ledger (`EventLedgerService`), SSE replay streaming, separate state machines, idempotency deduplication (`IdempotencyService`), and automated 6-point verification suite. | Real data survives restart; duplicate submission remains 1 logical operation; unauthorized cross-case access denied. | **COMPLETED** |
| **06** | **Issued-Card RFID Sessions** | RFID card enrollment, tap-to-start, debounced reader events, session binding, return/reassignment cleanup. | Duplicate taps create no duplicate cases; card reissue purges former visitor data. | Pending |
| **07** | **UNO Q Gateway & Capture Adapter** | ARM64 Linux gateway for UNO Q, UVC camera control, bounded spool buffer, phone camera fallback, SHA-256 upload. | Page reaches central storage; no provider secrets on board; survives disconnect. | Pending |
| **08** | **HTTPS Connection & Pairing (ngrok / LAN)** | Secure HTTPS via ngrok/local LAN, operator pairing code flow, kiosk phone session binding, CSRF/origin checks. | Phone captures and receives events over HTTPS; unpaired devices rejected. | Pending |
| **09** | **Multiple-Document Intake & OCR** | Multi-document grouping (agreement + receipt + annexure), page reordering, Indian script OCR, immutable case snapshot. | Page order intact; verbatim citations link to document/page; stale findings rejected. | Pending |
| **10** | **Source Retrieval & Evidence Provenance** | Case-restricted document index, lexical/semantic retrieval, curated Indian statute corpus, exact citation anchors. | Citations point to verified sections/paragraphs; missing law acknowledged. | Pending |
| **11** | **Bench A: Document & Evidence (10 Specialists)** | Specialists A01–A10, extraction validation, date/amount normalization, contradiction detection, Chair A10 packet. | Bench A returns structured BenchPacket with verbatim excerpts and line coordinates. | Pending |
| **12** | **Bench B: Rights & Obligations (10 Specialists)** | Specialists B01–B10, domain contract analysis (tenancy, employment, sale, debt, consumer), Chair B10 packet. | Bench B accurately maps duties, lock-in clauses, and default remedies. | Pending |
| **13** | **Bench C: Indian Legal Sources (10 Specialists)** | Specialists C01–C10, statute retrieval, precedent relevance, jurisdiction checking, Citation Verifier C09. | C09 validates act sections and flags unverified citations or state variations. | Pending |
| **14** | **Bench D: Adversarial Risk (10 Specialists)** | Specialists D01–D10, holder advocate vs counterparty advocate, ambiguity detection, financial penalties, Chair D10 packet. | Bench D highlights one-sided terms and calculates uncapped exposures. | Pending |
| **15** | **Bench E: Verification & Plain Language (10 Specialists)** | Specialists E01–E10, audit trail checking, arithmetic verifier, plain-language translation, Chair E10 packet. | Bench E flags mathematical mismatches and removes unverified assertions. | Pending |
| **16** | **Orchestration Engine & Specialist Task DAG** | Asynchronous worker scheduler, case-to-specialist routing, dependency DAG (Bench A -> B/C -> D -> E), execution bounds. | Full multi-bench execution runs within bounded latency without deadlocks. | Pending |
| **17** | **Messenger Coordination & Packet Handover** | Inter-bench packet transport, integrity check, transit animation event emission, handoff to Presiding Reviewer. | Packets successfully validated and received at Presiding Reviewer desk. | Pending |
| **18** | **AI Presiding Reviewer Synthesis** | Gemini-powered synthesis of 5 bench packets, executive summary, preserved disagreements, questions for visitor. | Consolidated PresidingReviewSummary produced with zero hallucinatory claims. | Pending |
| **19** | **Sarvam AI Indian Speech Engine** | Sarvam STT integration for Indian accents, Sarvam TTS for spoken responses, audio player with mute/stop controls. | Spoken audio correctly transcribed and synthesized in Kannada/Hindi. | Pending |
| **20** | **Grounded Conversational Q&A (Gemini)** | Case-grounded conversational agent, page-specific citations, acknowledgment of missing evidence. | Answers reference specific document pages and refuse out-of-scope advice. | Pending |
| **21** | **3D Tribunal Chamber Scene (Three.js/R3F)** | Realistic 3D tribunal chamber, 5 round tables, brass inlays, central evidence well, elevated Presiding podium. | Renders 60 FPS on laptop browser with smooth orbit/zoom controls. | Pending |
| **22** | **3D Specialist Gestures & Real-Time Sync** | Real-time state visualization, specialist animation states (reading, discussion, packet pass), Messenger path transit. | 3D visual states update immediately upon backend WebSocket/SSE events. | Pending |
| **23** | **Laptop Case Workspace & Presentation View** | Split workspace (warm folio + dark chamber), 2D accessible fallback, Evaluator Presentation mode without raw logs. | Seamless toggling between 3D Chamber, Split Workspace, and 2D Fallback. | Pending |
| **24** | **Referenced Report, Multi-Channel Delivery & Polish** | High-quality PDF generator, Telegram bot dispatch, Drive export, Gmail dispatch, end-to-end rehearsal. | End-to-end rehearsal passes from RFID tap to final report delivery. | Pending |

---

## Phase 05 Execution Summary

- **Deliverables**:
  - `DatabaseService` (`apps/main-api/src/db/client.ts`): PostgreSQL connection pooling, DDL migration runner executing `packages/shared-contracts/src/schema/schema.sql`, and resilient local authority fallback.
  - `StorageService` (`apps/main-api/src/storage/storage-service.ts`): File bounds enforcement (20MB limit), SHA-256 cryptographic digest calculation & verification, directory traversal sanitization, and structured `UploadAcknowledgment`.
  - `AuthService` & Security Middleware (`apps/main-api/src/auth/auth-service.ts`): Scoped hardware device key exchange (`X-Dharmaraksha-Device-Key`), dynamic device key revocation, session token management, and `requireCaseAccess` middleware enforcing strict cross-case isolation.
  - `EventLedgerService` (`apps/main-api/src/events/event-ledger.ts`): Strictly monotonic event cursor tracking, atomic state-and-event persistence eliminating unsynchronized dual writes, and real-time SSE broadcasting (`GET /api/v1/cases/:id/events`) with historical catch-up replay (`afterCursor`).
  - `IdempotencyService` (`apps/main-api/src/idempotency/idempotency-service.ts`): SHA-256 request body hashing and deduplication cache guaranteeing duplicate submissions remain 1 logical operation.
  - `CaseStateMachine` (`apps/main-api/src/state-machines/case-state-machine.ts`): Finite state transitions across intake, analysis, review, cancellation, and re-opening.
  - Programmatic Test Harness (`apps/main-api/src/tests/phase05-verification.ts`): Automated 6-point verification suite verifying persistence across simulated restarts, idempotency, 403 cross-case access blocking, event replay, cancellation transitions, and device key revocation.
- **Verification Gate**:
  - All 6 acceptance tests executed and passed (`Exit Code: 0`).
  - Real data verified surviving process restart.
  - Duplicate submission verified returning cached result with `_idempotentReplay: true`.
  - Unauthorized visitor access to other cases verified rejected with `403 CROSS_CASE_ACCESS_DENIED`.
  - Full monorepo typecheck passed with 0 errors across all 7 workspaces.
