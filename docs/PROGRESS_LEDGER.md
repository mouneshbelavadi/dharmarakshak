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
| **07** | **UNO Q Gateway & Capture Adapter** | ARM64 Linux gateway for UNO Q, UVC document camera adapter, rate-limited mobile viewfinder preview (`640x480`), bounded disk spool (`SpoolService`, 20 captures / 50MB max), disk-pressure thresholding, durable server acknowledgment, cryptographic SHA-256 pre-hash verification, interruption recovery with stable page identities, explicit phone-camera fallback, supervised systemd service, hardware dependency specification, zero secret leakage. | A real or explicitly simulated page reaches central case once; no provider secret or long-lived device key reaches phone; capture survives a recoverable interruption. | **COMPLETED** |
| **08** | **HTTPS Connection & Pairing (ngrok / LAN)** | Strict CORS allowlist; `TunnelSupervisor`; `PairingService` with single-use codes; HttpOnly/Secure/SameSite cookie exchange; CSRF/origin middleware; `/api/v1/connectivity` separating tunnel from main-API failures; ngrok ARM64 config; phone pairing flow with concurrent-takeover prevention; card-return pairing revocation; 10-test verification suite. | Phone can capture and receive status over HTTPS; unpaired browser is denied; tunnel and main-API failures reported separately. | **COMPLETED** |
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

## Phase 07 Execution Summary

- **Deliverables**:
  - `ICameraAdapter`, `SimulatedCameraAdapter`, `HardwareUvcCameraAdapter` (`apps/uno-gateway/src/capture/camera-adapter.ts`): Pluggable capture owner architecture for board-connected UVC camera (`/dev/video0`). Generates bounded preview frames (`640x480` at max 5 FPS to preserve ngrok bandwidth) and full 1080p stills with rotation support (0°, 90°, 180°, 270°).
  - `SpoolService` (`apps/uno-gateway/src/services/spool-service.ts`): Bounded temporary disk spool under `./storage/uno_spool/` enforcing a strict 20-capture / 50MB ceiling. Enforces disk-pressure rejection (`507 SPOOL_DISK_PRESSURE`) when unacknowledged uploads saturate the buffer, and auto-cleans acknowledged captures upon successful server storage.
  - `CaptureManager` (`apps/uno-gateway/src/services/capture-manager.ts`): Single native owner of the camera peripheral. Performs cryptographic SHA-256 pre-hashing, local spooling, and transmission to Main API with `X-Dharmaraksha-Device-Key` header. Implements `retryPendingUploads()` using stable page identities (`caseId`, `documentId`, `pageNumber`, `sha256`) to survive network dropouts and ensure exact-once delivery.
  - `HeartbeatClient` (`apps/uno-gateway/src/services/heartbeat-client.ts`): Periodic background heartbeat to Main API tracking connection health without ever exposing device secrets.
  - REST Endpoints (`apps/uno-gateway/src/routes/capture.ts`, `apps/uno-gateway/src/routes/health.ts`, `apps/uno-gateway/src/gateway.ts`):
    - `GET /api/v1/capture/camera-health`: Hardware readiness and adapter mode.
    - `GET /api/v1/capture/preview`: Live mobile-friendly viewfinder JPEG.
    - `POST /api/v1/capture/page`: Board UVC camera page capture and upload pipeline.
    - `POST /api/v1/capture/phone-fallback`: Explicit phone-camera fallback ingestion (HTML5 client-side camera upload, strictly distinguished from board USB hardware).
    - `GET /api/v1/capture/spool-status`, `POST /api/v1/capture/retry`, `POST /api/v1/capture/cleanup`.
    - `GET /api/v1/readiness`: Safe readiness reporting confirming zero device or provider keys are exposed to the phone client.
  - Supervised Runtime & Hardware Documentation:
    - `deploy/uno-q/dharmaraksha-gateway.service`: Hardened systemd unit with auto-restart, CPU quota (80%), memory ceiling (256MB), sandboxing, and non-root peripheral access.
    - `docs/UNO_Q_HARDWARE_DEPENDENCIES.md`: Complete specification of Linux kernel modules (`uvcvideo`, `cdc_acm`), udev permission rules (`video`, `dialout`, `plugdev`), and resource limits.
  - Automated 6-Point Verification Suite (`apps/uno-gateway/src/tests/phase07-verification.ts`):
    1. Viewfinder preview generation (`640x480` valid JPEG).
    2. Page capture, local spooling & durable Main API upload (SHA-256 verified).
    3. Network interruption survival and recovery using stable page identities.
    4. Bounded spool disk-pressure threshold enforcement (`507 SPOOL_DISK_PRESSURE`).
    5. Explicit phone camera fallback ingestion (`source: 'phone_camera_fallback'`).
    6. Zero secret leakage across all gateway public routes.
- **Verification Gate**:
  - All 6 acceptance tests executed and passed cleanly (`Exit Code: 0`).
  - Monorepo typecheck passed with 0 errors across all 7 workspaces.

---

## Phase 08 Execution Summary

- **Deliverables**:
  - `TunnelSupervisor` (`apps/uno-gateway/src/services/tunnel-service.ts`): Manages ngrok / LAN HTTPS / mock-tunnel modes. Tracks tunnel URL and status, notifies listeners on endpoint change, provides `getConnectivityStatus()` that strictly separates tunnel health from main-API heartbeat health (gate requirement).
  - `PairingService` (`apps/uno-gateway/src/services/pairing-service.ts`): Operator-generated single-use pairing codes (format `DK-XXXXXX`, 10-min expiry by default). Generates ephemeral QR URL with no device key or provider credential embedded. `consumeCode()` marks code used *before* returning the pairing record (replay-safe). Prevents concurrent phone takeover — a second phone cannot claim an active card's session. `revokeAllPairingsForCard()` severs all browser access when a card is returned or reissued.
  - `security-middleware.ts` (`apps/uno-gateway/src/middleware/security-middleware.ts`): Three middleware functions:
    - `requirePairedPhone` — validates `dhr_pair` HttpOnly cookie, returns `401 UNPAIRED_BROWSER` on failure.
    - `csrfOriginCheck` — validates `Origin` header against tunnel public URL and optional LAN IP, returns `403 ORIGIN_MISMATCH` for unknown origins.
    - `requireOperatorKey` — validates `DHARMARAKSHA-Device-Key` header for operator-only endpoints; key never echoed in responses.
  - Pairing routes (`apps/uno-gateway/src/routes/pairing.ts`):
    - `GET /api/v1/pair/status` — Safe: pairing summary, tunnel mode, no secrets.
    - `GET /api/v1/connectivity` — Separated `tunnel.status` / `mainApi.status` (gate criterion).
    - `POST /api/v1/pair/generate` — Operator-only: one-time code + QR payload.
    - `POST /api/v1/pair/redeem` — Phone consumes code; sets HttpOnly Secure SameSite=Strict cookie; returns `redirectTo: '/kiosk/'` to strip code from URL bar.
    - `POST /api/v1/pair/revoke` — Operator-only: revoke by pairingId or entire card.
  - Updated `gateway.ts`: strict CORS allowlist (tunnel URL + LAN fallback + `EXTRA_ALLOWED_ORIGINS` for tests), `trust proxy 1`, `cookie-parser`, pairing routes mounted before CSRF middleware, CSRF/origin applied to all further API calls, `requirePairedPhone` on RFID and capture routes, global JSON error handler converting CORS rejections to `403 ORIGIN_MISMATCH`.
  - `deploy/uno-q/ngrok.yml`: ARM64-compatible ngrok agent config. `web_addr: false` (no inspection UI), `inspect: false` on the tunnel, authtoken from env variable only. Documents what is and is not exposed through the tunnel.
  - `.env.example`: Phase 08 variables — `TUNNEL_MODE`, `PUBLIC_HTTPS_URL`, `DEVICE_ID`, `PAIRING_CODE_LIFETIME_MINUTES`, `PHONE_SESSION_LIFETIME_HOURS`, `ALLOWED_LAPTOP_LAN_IP`, `LAN_HTTPS_CERT_PATH`, `LAN_HTTPS_KEY_PATH`, `EXTRA_ALLOWED_ORIGINS`.
  - `cookie-parser@^1.4.6` and `@types/cookie-parser@^1.4.7` added to uno-gateway dependencies.
  - Automated 10-test verification suite (`apps/uno-gateway/src/tests/phase08-verification.ts`):
    1. Pairing code generation — operator key required; code is non-empty; QR has no secrets.
    2. Code consumption — phone redeems; HttpOnly Secure SameSite=Strict cookie set; token not in body.
    3. Code replay rejected — `403 CODE_ALREADY_USED`.
    4. Expired/unknown code rejected — `404 CODE_NOT_FOUND` or `403 CODE_EXPIRED`.
    5. Unpaired browser denied on RFID and capture routes — `401 UNPAIRED_BROWSER`.
    6. Paired phone accesses protected routes — session accepted.
    7. Second phone takeover blocked — `409 SESSION_ALREADY_BOUND`.
    8. Card return revokes phone access — `401 UNPAIRED_BROWSER` after revoke.
    9. Tunnel vs main-API failure separation — `tunnel.status` and `mainApi.status` are independent.
    10. No secrets in phone-facing responses — `/pair/status`, `/health`, `/connectivity`, `/` all clean.
    11. Origin/CSRF check — wrong Origin → `403 ORIGIN_MISMATCH`; no Origin (server-to-server) → allowed.

- **Verification Gate**:
  - All 20 acceptance assertions across 10 tests executed and passed (`Exit Code: 0`).
  - Monorepo typecheck passed with 0 errors across all 7 workspaces (`npm run typecheck --workspaces`).
  - Full monorepo build clean (`npm run build --workspace=@dharmaraksha/shared-contracts`, `--workspace=@dharmaraksha/uno-gateway`).
