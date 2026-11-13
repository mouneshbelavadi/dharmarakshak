# DHARMARAKSHA — Progress Ledger (Phases 01–24)

This ledger tracks the status, primary deliverables, and verification gates across the 24 planned engineering phases of DHARMARAKSHA.

| Phase | Phase Name | Primary Deliverables | Verification Gate | Status |
| :--- | :--- | :--- | :--- | :--- |
| **01** | **Repository & Skeleton Architecture** | Monorepo layout, npm workspaces, TypeScript configurations, pinned dependencies, minimal laptop/phone views, health endpoints. | Zero-error typecheck and build across packages and apps. | **COMPLETED** |
| **02** | **Architecture, Ownership & Shared Contracts** | Final 3-tier topology spec, PostgreSQL authority DDL (19 tables), SQLite spool DDL, versioned domain contracts (device, card, session, case, document, snapshot, analysis, QA, findings, report, events, delivery), operational protocols. | 100% typecheck pass; zero ambiguous database owner, device secret, or camera source. | **COMPLETED** |
| **03** | **Combined Light & Dark Visual System** | Semantic tokens for surfaces, text, borders, status, 3D lighting; "Paper and Ink" design specification; laptop split/light/dark themes; phone responsive styling; reviewable layouts for Review Chamber, Document Comparison, Grounded Q&A, Report Preview, and 2D Accessible fallback. | Layouts show light/dark surfaces together; all 3 laptop themes supported; all essential tasks usable outside 3D. | **COMPLETED** |
| **04** | **Accessible Laptop Shell & Small Phone UI** | Complete React/TypeScript shells; Review, Documents, Reports, Connections, and role-gated Device destinations on laptop; full 7-screen phone visitor journey; persistent "Stop speaking" action; safe-area insets; zero Three.js in phone bundle. | Phone bundle inspection confirms 0 3D payload; full navigation accessible; fixtures clearly labeled. | **COMPLETED** |
| **05** | **Central Persistence, Auth & Real Events** | PostgreSQL integration (`pg`), private disk storage (`StorageService`), device key exchange & instant revocation, session authorization middleware (`requireCaseAccess`), monotonic event ledger (`EventLedgerService`), SSE replay streaming, separate state machines, idempotency deduplication (`IdempotencyService`), and automated 6-point verification suite. | Real data survives restart; duplicate submission remains 1 logical operation; unauthorized cross-case access denied. | **COMPLETED** |
| **06** | **Issued-Card RFID Sessions** | Operator card enrollment, issuance, tap-to-start, 3000ms debounce window, session binding, return card cleanup (phone token purge), clean-slate reissue with zero data carryover, revocation, physical vs simulated reader adapter (`HardwareRfidReaderAdapter`, `SimulatedRfidReaderAdapter`), automated 8-point verification suite. | Duplicate taps create no duplicate session; reissue reveals none of previous visitor's data; hardware verification accurately distinguished from simulation. | **COMPLETED** |
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

## Phase 06 Execution Summary

- **Deliverables**:
  - `IRfidReaderAdapter`, `SimulatedRfidReaderAdapter`, `HardwareRfidReaderAdapter` (`packages/shared-contracts/src/rfid.ts` and `apps/uno-gateway/src/rfid/rfid-adapter.ts`): Pluggable hardware adapter architecture. Accurately distinguishes physical reader validation (`/dev/ttyACM0` via Linux USB or microcontroller bridge) from software simulation mock (`isSimulated: true`). Hardware adapter strictly rejects simulated card fabrication attempts.
  - `RfidSessionService` (`apps/main-api/src/services/rfid-session-service.ts`):
    - Full card lifecycle state machine: `unassigned_inventory` -> `issued_to_visitor` -> `active_session` -> `returned_cleared` -> `revoked_lost`.
    - Operator enrollment (`enrollCard`) and issuance (`issueCard`) with configurable ticket expiration.
    - Tap resolution (`handleTapEvent`) with strict 3,000ms debouncing: repeated taps within the window return the active session with `debounced: true` and never spawn duplicate sessions or cases.
    - Return card protocol (`returnCard`): marks assignment returned, reverts card state to `returned_cleared`, and **instantly purges all visitor session tokens** from `AuthService`.
    - Reissuance guarantee (`issueCard` on returned card): generates a completely new isolated `sessionId` and `caseId` with zero documents, zero questions, and zero findings carried over from the prior visitor.
    - Rejection enforcement: unknown cards (`404 UNKNOWN_CARD`), expired card tickets (`403 CARD_EXPIRED`), revoked cards (`403 CARD_REVOKED`), and unassigned cards (`400 CARD_NOT_ISSUED`).
    - Session ticket guarantee: A card UID alone only ever grants a `visitor` role ticket and can never confer operator or administrative privileges.
  - Gateway RFID Routes (`apps/uno-gateway/src/routes/rfid.ts`):
    - `GET /api/v1/rfid/reader-status`: Exposes hardware status and verification mode.
    - `GET /api/v1/rfid/latest-tap`: Kiosk phone polling endpoint.
    - `POST /api/v1/rfid/simulate-tap`: Verified software simulation mock forwarder.
    - `POST /api/v1/rfid/tap-event`: Hardware reader event ingestion and Main API forwarder.
  - Central RFID Routes (`apps/main-api/src/routes/rfid.ts`):
    - `POST /api/v1/rfid/tap-event`: Normalized tap handler.
    - `POST /api/v1/cards/enroll`, `POST /api/v1/cards/issue`, `POST /api/v1/cards/:cardUid/return`, `POST /api/v1/cards/:cardUid/revoke`, `GET /api/v1/cards`, `GET /api/v1/cards/:cardUid`.
  - Automated 8-Point Verification Suite (`apps/main-api/src/tests/phase06-verification.ts`):
    1. Unknown RFID card rejection (`404 UNKNOWN_CARD`).
    2. Revoked card rejection (`403 CARD_REVOKED`).
    3. Expired card rejection (`403 CARD_EXPIRED`).
    4. Card enrollment, issuance, and first-tap session activation.
    5. Debouncing repeated taps within 3,000ms (confirms no duplicate session).
    6. Return card ends session and revokes phone token access (`401 INVALID_SESSION` on subsequent requests).
    7. Reissuing card creates a clean slate with 0% data carryover (new Case B has 0 documents, and Visitor B is rejected with `403 CROSS_CASE_ACCESS_DENIED` if attempting to view Case A).
    8. Hardware verification vs. simulation distinction verified.
- **Verification Gate**:
  - All 8 acceptance tests executed and passed cleanly (`Exit Code: 0`).
  - Monorepo typecheck passed with 0 errors across all 7 workspaces.
