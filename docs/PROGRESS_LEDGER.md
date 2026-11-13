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
| **09** | **Multiple-Document Intake & OCR** | Multi-document grouping (agreement + receipt + annexure), parent-annexure linkage, page-by-page intake, page reordering, rotation, recapture, Indian script OCR (Kannada, Devanagari, Latin), full text (>1,000 chars without truncation), table & negation detection, uncertainty audit trail & review text correction, duplicate page detection without silent deletion, cross-document discrepancy detection, immutable case-document snapshots (v1 -> v2) with combined fingerprint, stale finding detection, and automated 8-point verification suite. | Document boundaries and page order survive capture/retry; every extracted passage points to its actual document/version/page; changes cannot silently reuse stale findings. | **COMPLETED** |
| **10** | **Source Retrieval & Evidence Provenance** | Case-restricted evidence indexing (BM25 lexical retrieval), curated Indian statutory corpus (Transfer of Property Act, Contract Act, Rent Acts, Consumer Protection), landmark Supreme Court precedents, location anchors (`doc:...`, `statute:...`, `precedent:...`), missing annexure & uncurated statute limitations, stale/repealed law detection, wrong jurisdiction filtering, and automated 10-point verification suite. | Citations point to verified sections/paragraphs; missing law acknowledged. | **COMPLETED** |
| **11** | **Fifty Specialist Identities & Bench Registry** | Complete A01–E10 registry across 5 benches (10 specialists per bench), Chair 10th seat enforcement, Messenger & Presiding Reviewer separation, persistent seat & appearance IDs, role contract validator, multi-role perspective demonstrations (Tenancy, Employment, Citation, Adversarial, Plain Language), unselected role visibility without faked model calls, and automated 8-point verification suite. | Exactly fifty unique analyst IDs exist, ten in each bench; role, seat, finding and prompt identifiers agree without any imported registry or historical data. | **COMPLETED** |
| **12** | **Durable Routing & Bounded Specialist Execution** | Persisted routing plans across all 50 specialists based on document type, uncertainty, jurisdiction, and questions; Stage progression (Stage 1 Bench A -> Stage 2 B/C -> Stage 3 D -> Stage 4 E); durable worker scheduling with claims, leases, deadlines, and retry budgets; independent first assessment and bounded contradiction round without agent voting; and automated 8-point verification suite. | Work resumes after restart without duplicating accepted findings; failures remain failed or partial; routing follows role eligibility and dependencies rather than arbitrary positional truncation. | **COMPLETED** |
| **13** | **Bench Packets, Messenger & Presiding Review** | Versioned bench packet consolidation by chairs (A10–E10) with checksums; deterministic Messenger delivery with deduplication and persisted acknowledgments; AI Presiding Reviewer synthesis preserving dissent and gaps; post-synthesis reference grounding validation with publication blocking / partial policies; non-blocking animation milestones; and automated 8-point verification suite. | Duplicate packet delivery has one logical effect; citation failures and dissent survive synthesis; real events support a truthful visible handoff. | **COMPLETED** |
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

---

## Phase 09 Execution Summary

- **Deliverables**:
  - `ExtractedPassage`, `CaseDocument`, `DocumentPage`, `CaseDocumentSnapshot` contract enhancements (`packages/shared-contracts/src/document.ts`, `case.ts`, `events.ts`):
    - `parentDocumentId`: Links an annexure or schedule to its parent agreement while strictly preserving separate document identities.
    - `ExtractedPassage`: Granular passage grounding with `documentId`, `documentTitle`, `versionNumber`, `pageNumber`, `sourceAnchor` (`doc:<id>:v<ver>:p<page>#para-<idx>`), `containsDate`, `containsAmount`, `containsNegation`, `isTable`, and script detection.
    - `DocumentPage`: Full page metadata including `passages`, `continuityStatus` (`intact`, `duplicate_page`, `unreadable_blur`, `missing_intermediate_page`), `isUncertain`, `uncertaintyReason`, `needsRecapture`, `reviewedText`, `reviewedBy`, `reviewedAt`, and `duplicateOfPageNumber`.
    - Event types: `document:created`, `document:page_added`, `document:pages_reordered`, `document:page_rotated`, `document:text_corrected`, `document:intake_finished`, `case:snapshot_finalized`.
  - `OcrEngine` (`apps/main-api/src/services/ocr-engine.ts`):
    - PDF text stream extraction and rasterized scan OCR processing.
    - Preserves Indian scripts: supports Kannada (e.g. ಕನ್ನಡ), Devanagari/Hindi (e.g. वाणिज्यिक पट्टा), Tamil, Telugu, and English.
    - Extracts legal dates (`1st September 2026`, `15th August 2026`, `28th August 2026`) and monetary amounts (`INR 45,000`, `Rs. 2,50,000`, `Rs. 2,70,000`).
    - Detects legal negations ("shall not", "neither...nor", "no refund", "under no circumstances", "shall never", "non-refundable").
    - Parses structured markdown/pipe tables with column headers and rows.
    - Evaluates OCR quality and flags uncertainty without inventing confidence if unreadable.
    - **No truncation**: Processes full-length documents (>1,000 characters).
  - `DocumentIntakeService` (`apps/main-api/src/services/document-intake-service.ts`):
    - `createDocument`: Creates named document with category, parentDocumentId validation.
    - `addPage`: Page-by-page intake; stores still, computes SHA-256 pre-hash; detects duplicate pages without deleting them (flags `duplicate_page` and preserves legitimate page in sequence); segments text into anchored passages.
    - `reorderPages`: Re-orders pages and re-indexes sequentially (1, 2, 3...) while updating passage anchors.
    - `rotatePage`: Rotates page orientation (0°, 90°, 180°, 270°).
    - `recapturePage`: Overwrites blurry scan with clear image, re-runs OCR, clears uncertainty.
    - `reviewCorrectPageText`: Human review correction with immutable audit trail.
    - `finishDocument`: Validates page continuity and creates `ImmutableDocumentVersion`.
    - `finalizeSnapshot`: Finalizes an immutable `CaseDocumentSnapshot` with `snapshotVersion` (v1, v2...), `documentManifest`, total page count, and cryptographic `combinedFingerprint` (SHA-256).
    - `detectCrossDocumentDiscrepancies`: Performs cross-document consistency analysis (conflicting dates, conflicting amounts, unattached exhibits) citing exact document titles, page numbers, and values.
  - REST Endpoints (`apps/main-api/src/routes/documents.ts`):
    - `POST /cases/:id/documents`: Add named document.
    - `GET /cases/:id/documents`: Review all documents in case.
    - `GET /cases/:id/documents/:docId`: Document inspection.
    - `POST /cases/:id/documents/:docId/pages`: Page still upload with OCR & duplicate preservation.
    - `POST /cases/:id/documents/:docId/pages/reorder`: Sequential reordering.
    - `POST /cases/:id/documents/:docId/pages/:pageNum/rotate`: Rotation.
    - `POST /cases/:id/documents/:docId/pages/:pageNum/recapture`: Clean recapture.
    - `POST /cases/:id/documents/:docId/pages/:pageNum/correct-text`: Review text correction.
    - `POST /cases/:id/documents/:docId/finish`: Finish document and freeze version.
    - `POST /cases/:id/snapshots/finalize`: Finalize immutable snapshot.
    - `GET /cases/:id/snapshots/current`: Retrieve active snapshot.
    - `GET /cases/:id/discrepancies`: Retrieve cross-document discrepancies.
  - Automated 8-Point Verification Suite (`apps/main-api/src/tests/phase09-verification.ts`):
    1. Multi-document creation with parent-annexure linkage (Lease Agreement, Annexure A, Deposit Receipt).
    2. Multi-page ingestion with Indian scripts (Devanagari, Kannada, Latin), full text (>1,000 characters without truncation), dates, amounts, negations, and tabular structures.
    3. Document boundaries and page reordering preservation.
    4. Text uncertainty detection, recapture, and reviewed text correction with audit trail.
    5. Duplicate page detection without silent deletion (marked `duplicate_page` and preserved in sequence).
    6. Cross-document discrepancy detection: Conflicting Date (1st September 2026 vs 15th August 2026) and Conflicting Amount (Rs. 2,50,000 vs Rs. 2,70,000), citing exact document title and page number.
    7. Finalization of Immutable Case-Document Snapshot v1 (fingerprint and manifest).
    8. Snapshot evolution (v1 -> v2) upon document modification and verification that v1 findings cannot be silently reused as fresh findings.

- **Verification Gate**:
  - All 8 acceptance tests executed and passed cleanly (`Exit Code: 0`).
  - Monorepo typecheck passed with 0 errors across all 7 workspaces (`npm run typecheck`).
  - Monorepo build passed across all 7 workspaces (`npm run build`).

---

## Phase 10 Execution Summary

- **Deliverables**:
  - `retrieval.ts` shared contracts (`packages/shared-contracts/src/retrieval.ts` & `index.ts`):
    - `CuratedLegalSource`: Authoritative statutory/precedent records with `shortCode`, `sectionOrItemNumber`, `jurisdiction`, `effectiveDate`, `repealedDate`, `lastReviewedDate`, `officialVerbatimText`, `sourceLocationAnchor`.
    - `EvidenceChunk`: Anchored user document passages with `caseId`, `snapshotVersion`, `documentId`, `pageNumber`, `sourceAnchor`, `containsDates`, `containsAmounts`, `containsNegation`, `isTable`.
    - `RetrievalQuery` & `RetrievalResponse`: Case-restricted queries with scope (`all_documents` vs `single_document`), jurisdiction filtering, `evidenceHits`, `authorityHits`, and `missingSourceLimitations`.
    - `MissingSourceLimitation`: Structured limitation records identifying missing referenced annexures or unverified statutes with actionable clarification prompts.
  - `CuratedLegalCorpusService` (`apps/main-api/src/services/curated-legal-corpus.ts`):
    - Curated, non-fabricated Indian legal corpus:
      - *Transfer of Property Act, 1882* (Sections 105, 106, 108, 111): Lease definitions, notice periods, tenant restoration obligations, determination/forfeiture.
      - *Indian Contract Act, 1872* (Sections 27, 74): Restraint of trade void (non-compete clauses) and penalty stipulations vs reasonable compensation.
      - *Karnataka Rent Act, 1999* (Section 2): Commercial exemption thresholds for premises > 14 sq.m.
      - *Maharashtra Rent Control Act, 1999* (Section 55): Compulsory registration under Maharashtra jurisdiction (used to test jurisdiction separation).
      - *Urban Land (Ceiling and Regulation) Act, 1976 (Repealed)*: Used to verify stale/repealed law detection.
      - *Consumer Protection Act, 2019* (Section 2(46)): Statutory definition of unfair contract terms and disproportionate penalties.
      - Landmark Precedents: *Fateh Chand v. Balkishan Das (1964)* (deposit forfeiture rule) and *Percept D'Mark v. Zaheer Khan (2006)* (post-contractual non-compete void).
    - `evaluateApplicability()`: Temporal check (flags `stale_or_repealed`) and jurisdiction check (flags `wrong_jurisdiction`).
  - `EvidenceIndexService` (`apps/main-api/src/services/evidence-index-service.ts`):
    - Extracts and indexes anchored chunks from active case snapshot.
    - BM25 lexical retrieval engine with phrase boosting and clause number weighting.
    - Strict case-restricted indexing preventing any cross-case leakage.
    - Late page indexing ensuring pages 1..N (e.g. Page 5) are indexed and retrieved with exact anchors.
  - `SourceRetrievalService` (`apps/main-api/src/services/source-retrieval-service.ts`):
    - Dual-corpus retrieval orchestrator keeping case evidence, legal statutes, and legal precedents distinctly labeled.
    - Automated detection of unattached referenced exhibits (e.g. "Schedule B") producing honest `MissingSourceLimitation` instead of hallucinating terms.
    - Unsupported law queries produce structured limitations without fabricating synthetic India Code or SCR citations.
    - `resolveLocationAnchor()`: Resolves `doc:...` and `statute:...` anchors to exact documents, pages, and verbatim legal text.
  - REST Endpoints (`apps/main-api/src/routes/retrieval.ts`, `apps/main-api/src/app.ts`):
    - `POST /cases/:id/retrieval/query`: Execute authorized retrieval query.
    - `GET /cases/:id/retrieval/resolve-anchor`: Open source location anchor.
    - `GET /retrieval/legal-corpus`: Browse/search curated legal corpus.
    - `GET /retrieval/legal-corpus/:sourceId`: Retrieve specific statutory provision or precedent.
  - Automated 10-Point Verification Suite (`apps/main-api/src/tests/phase10-verification.ts`):
    1. Case-restricted retrieval: Case B confidential data inaccessible from Case A.
    2. References on late pages: Page 5 dispute resolution retrieved with exact line/page anchor.
    3. Cross-document retrieval: Multi-document query returns chunks from both Agreement and linked Annexure A.
    4. Missing annexure detection: "Schedule B" reference detected and honest clarification prompt produced.
    5. Curated legal authority retrieval: Section 74 & *Fateh Chand* precedent retrieved for deposit penalty queries.
    6. Stale/repealed law detection: Urban Land Ceiling Act flagged `stale_or_repealed`.
    7. Wrong jurisdiction detection: Maharashtra Rent Control Act flagged `wrong_jurisdiction` on Karnataka lease.
    8. Unsupported law handling: Foreign/uncurated law query produces structured limitation with zero fabricated citations.
    9. Anchor resolution: `statute:tpa_1882:s105` and `precedent:...` resolve to verified verbatim text.
    10. Distinct labeling: User document chunks labeled `case_evidence`; statutory provisions labeled `legal_statute`/`legal_precedent`.

- **Verification Gate**:
  - All 10 acceptance tests executed and passed cleanly (`Exit Code: 0`).
  - Monorepo typecheck passed with 0 errors across all 7 workspaces (`npm run typecheck`).
  - Monorepo build passed across all 7 workspaces (`npm run build`).

---

## Phase 11 Execution Summary

- **Deliverables**:
  - `TRIBUNAL_BENCHES`, `BENCH_A_SPECIALISTS` through `BENCH_E_SPECIALISTS`, `ALL_SPECIALISTS_MAP` (`packages/tribunal-definitions/src/benches.ts`):
    - Exactly fifty unique specialist identities (`A01` through `E10`) across 5 benches:
      - **Bench A (Evidence & Grounding)**: Capture Quality (`A01`), Page Continuity (`A02`), Text Fidelity (`A03`), Language (`A04`), Parties & Capacities (`A05`), Dates & Amounts (`A06`), Clause Structure (`A07`), Document Consistency (`A08`), Sensitive Data (`A09`), Evidence Chair (`A10`).
      - **Bench B (Obligations & Rights)**: General Contract (`B01`), Employment (`B02`), Tenancy (`B03`), Property Transaction (`B04`), Consumer & Service (`B05`), Small-Business (`B06`), Lending & Security (`B07`), Data & IP (`B08`), Exit & Dispute (`B09`), Obligations Chair (`B10`).
      - **Bench C (Legal Sources & Precedent)**: Jurisdiction (`C01`), Statute Retrieval (`C02`), State-Law (`C03`), Rules & Notifications (`C04`), Temporal Applicability (`C05`), Precedent Retrieval (`C06`), Precedent Relevance (`C07`), Contrary Authority (`C08`), Citation Verifier (`C09`), Sources Chair (`C10`).
      - **Bench D (Adversarial & Risk Evaluation)**: Document-Holder Advocate (`D01`), Counterparty Advocate (`D02`), Ambiguity (`D03`), Financial Exposure (`D04`), Deadline & Default (`D05`), Balance & Fairness (`D06`), Evidence-Gap (`D07`), Red-Flag (`D08`), Scenario (`D09`), Risk Chair (`D10`).
      - **Bench E (Synthesis & Citizen Translation)**: Finding-to-Evidence Auditor (`E01`), Contradiction Resolver (`E02`), Arithmetic & Timeline Verifier (`E03`), Coverage Auditor (`E04`), Plain-Language Editor (`E05`), Multilingual Fidelity (`E06`), Clarification Planner (`E07`), Human-Review Triage (`E08`), Report Privacy (`E09`), Verification Chair (`E10`).
    - Every specialist defines: `id`, `benchId`, `name`, `role`, `taskObjective`, `eligibility`, `evidenceInputs`, `roleInstructions`, `allowedReadOnlyCapabilities`, `outputContract`, `timeoutMs` (15s–30s bounded), `promptVersion` (`"v1.0.0"`), `seatId` (e.g. `seat-A-01` to `seat-E-10`), and persistent `appearance` (table position index 0–9, 3D desk angle 0°–324°, hex primary/accent colors, deterministic avatar seed).
    - **10th Seat Rule**: The bench chair occupies `tablePositionIndex: 9` (the 10th seat at the round table), never an extra seat.
  - Separate Chamber Officials (`CHAMBER_OFFICIALS`):
    - Deterministic Messenger (`MESSENGER`): Physical packet routing between benches.
    - AI Presiding Reviewer (`PRESIDING_REVIEWER`): Multi-bench synthesis and executive review.
    - Strictly separate from the 50 analysts; neither ID appears in the A01–E10 specialist registry.
  - Multi-Role Perspective Demonstrations (`ROLE_PERSPECTIVE_EXAMPLES` in `packages/tribunal-definitions/src/perspective-examples.ts`):
    - Concrete real-world demonstrations proving contrasting, specialized analytical viewpoints on identical clauses:
      - **Tenancy Analyst (`B03`)**: Rent, deposit deduction ceilings, and Section 108(m) wear-and-tear protection.
      - **Employment Analyst (`B02`)**: Flags post-termination non-compete covenants as void under Section 27, Indian Contract Act.
      - **Citation Verifier (`C09`)**: Verifies Section 74 and Supreme Court precedent *Fateh Chand v. Balkishan Das* against authentic legal corpus.
      - **Adversarial Counterparty Advocate (`D02`)**: Defends landlord's commercial rationale, vacancy losses, and liquidated damages.
      - **Financial Exposure Analyst (`D04`)**: Quantifies worst-case financial liabilities, deposit forfeiture (Rs. 2,50,000), and 18% compounding interest.
      - **Plain-Language Editor (`E05`)**: Translates punitive legal forfeiture clauses into transparent, citizen-friendly explanations.
  - `SpecialistContractValidator` (`packages/tribunal-definitions/src/contract-checks.ts`):
    - `validateTribunalStructure()`: Confirms 5 benches, 10 specialists each, chairs at index 9, and appearance seed persistence.
    - `validateFindingOutput()`: Strictly enforces specialist output contracts (requires verbatim evidence quotes for analysts, statutory references for C09, severity rankings, etc.).
    - `validateRoleAssignment()`: Distinguishes eligible domain specialists from unassigned specialists without faking execution.
  - Unselected Role Partitioning (`filterEligibleSpecialists`):
    - Documents partition specialists cleanly into `eligibleSpecialists` and `unassignedSpecialists`.
    - Unselected roles remain visible in the UI/3D chamber as `unassigned` rather than disappearing or triggering fabricated model calls.
  - Automated 8-Point Verification Suite (`apps/main-api/src/tests/phase11-verification.ts`):
    1. Exactly 50 unique analyst IDs (`A01`–`E10`), 10 per bench, 0 duplicates.
    2. Chairs occupy 10th seat at index 9 (`A10`, `B10`, `C10`, `D10`, `E10`).
    3. Messenger and Presiding Reviewer are strictly separate chamber officials.
    4. Persistent seat IDs and deterministic visual seeds across all 50 specialists.
    5. Structural registry validation passes with 0 errors.
    6. Role perspective demonstrations verify Tenancy, Employment, Citation, Adversarial, and Plain Language roles.
    7. Output contract enforcement rejects invalid findings lacking verbatim evidence or statutory authority.
    8. Unselected domain roles (e.g. `B02`, `B07` on a lease) are visible as `unassigned` without manufactured model calls.

- **Verification Gate**:
  - All 8 acceptance tests executed and passed cleanly (`Exit Code: 0`).
  - Monorepo typecheck passed with 0 errors across all 7 workspaces (`npm run typecheck`).
  - Monorepo build passed across all 7 workspaces (`npm run build`).

---

## Phase 12 Execution Summary

- **Deliverables**:
  - `RoutingPlanner` (`apps/worker/src/routing/routing-planner.ts`):
    - Computes deterministic, persisted routing plans across all 50 specialists (`A01` through `E10`).
    - Evaluates document categories, factual uncertainty (low OCR confidence, blurred pages, discrepancies), territorial jurisdiction (Karnataka, Maharashtra, Delhi, Central), and questions raised.
    - Persists explicit selection or exclusion rationales for all 50 specialists (e.g. `B02` skipped because case has no employment contracts, `B07` selected when bank guarantee/deposit instruments are detected).
    - Enforces 4-stage dependency progression: Stage 1 (Bench A Evidence Grounding) -> Stage 2 (Bench B Substantive Obligations & Bench C Legal Authority) -> Stage 3 (Bench D Adversarial Challenges) -> Stage 4 (Bench E Verification, Synthesis & Plain Language).
  - `TaskClaimStore` (`apps/worker/src/scheduling/task-claim-store.ts`):
    - Durable scheduling store managing task claims, attempts, leases, deadlines, and retry budgets.
    - Atomically claims eligible candidate tasks respecting dependency ordering, global concurrency quota (`globalConcurrencyQuota`), and per-case concurrency quota (`perCaseConcurrencyQuota`).
    - Periodic lease renewal / heartbeat preventing premature lease expiries.
    - Crash recovery routine (`recoverExpiredLeases`): inspects orphaned leases from dead workers, safely re-queuing retryable tasks while strictly ensuring previously completed tasks with accepted findings are **never duplicated**.
    - Graceful cancellation (`cancelRunTasks`): marks unfinished tasks with `status: 'cancelled'` and halts further scheduling.
  - `SpecialistExecutor` (`apps/worker/src/execution/specialist-executor.ts`):
    - Executes specialist role instructions and extracts verbatim evidence citations.
    - Captures and stores each specialist's **independent first assessment** (`initialAssessment`) before contradiction analysis.
    - Strict output contract validation via `SpecialistContractValidator.validateFindingOutput`.
    - Handles bounded errors:
      - Rate limits (`429`): captures retryable rate-limit errors and decrements retry budget.
      - Malformed outputs: catches missing citations or invalid severities, requesting contract-conforming output on retry.
      - Unreadable pages: detects degraded scan quality on blurred pages (`qualityScore < 0.3`) and outputs explicit `evidence_gap` limitations with zero text hallucination.
    - Bounded contradiction round (in Stage 4 via `E02` Contradiction Resolver): preserves opposing viewpoints (e.g. `D01` Holder Advocate vs `D02` Counterparty Advocate on deposit penalties) without agent voting or invented majority percentages.
  - `BackgroundOrchestrator` (`apps/worker/src/orchestrator.ts`):
    - Daemon coordinating the end-to-end execution pipeline with lifecycle controls (`start`, `stop`, `initializeRun`, `processNextBatch`, `runUntilComplete`, `cancelRun`, `recoverAndResume`).
  - Automated 8-Point Verification Suite (`apps/worker/src/tests/phase12-verification.ts`):
    1. Tenancy case routing, persisted rationales, and 4-stage dependency ordering.
    2. Employment/IP case routing and persisted exclusion rationales.
    3. Mixed document set routing without arbitrary positional truncation.
    4. Unreadable page handling with explicit evidence-gap limitation and zero hallucination.
    5. Rate limit (429) simulation, backoff, and retry budget decrementing.
    6. Malformed output rejection and contract enforcement.
    7. Worker crash recovery without duplicating already-accepted findings.
    8. Mid-execution run cancellation with clean resource halting.

- **Verification Gate**:
  - All 8 acceptance tests executed and passed cleanly (`Exit Code: 0`).
  - Phase 11 verification suite verified cleanly (`Exit Code: 0`).
  - Monorepo typecheck passed with 0 errors across all 7 workspaces (`npm run typecheck`).
  - Monorepo build passed across all 7 workspaces (`npm run build`).

---

## Phase 13 Execution Summary

- **Deliverables**:
  - `BenchChairConsolidator` (`apps/worker/src/review/bench-chair-consolidator.ts`):
    - Each bench chair (`A10`, `B10`, `C10`, `D10`, `E10`) consolidates its bench's findings, source references, and executions into a versioned `BenchPacket`.
    - Computes cryptographic SHA-256 `packetChecksum` to ensure data integrity during transport.
    - Explicitly preserves adversarial dissent, contradiction viewpoints (`preservedDisagreements`), unresolved questions, missing evidence notes, and unassigned/skipped role coverage (`failedCoverage`).
  - `MessengerService` (`apps/worker/src/review/messenger-service.ts`):
    - Implements deterministic Chamber Messenger (`MESSENGER`) as an inter-bench courier and packet validator.
    - Validates chair signatures and packet checksum integrity; rejects tampered packets with `status: 'rejected_invalid'`.
    - Does NOT rewrite findings, invent consensus, or force agreement.
    - **Deduplication**: Tracks delivered packets by idempotency key (`${runId}:${benchId}:v${version}`). Repeated deliveries return existing receipt with `status: 'duplicate_ignored'`, ensuring duplicate packet delivery has exactly ONE logical effect.
    - **Milestone Events**: Emits non-blocking animation events (`bench:packet_ready`, `messenger:transit_started`, `messenger:packet_delivered`) without artificial delays waiting for 3D walking couriers.
    - **Delivery Acknowledgment**: Generates persisted `PacketDeliveryReceipt` acknowledging delivery to the Presiding Reviewer.
  - `PresidingReviewerService` (`apps/worker/src/review/presiding-reviewer-service.ts`):
    - Implements the AI Presiding Reviewer (`PRESIDING_REVIEWER`).
    - Synthesizes accepted bench packets into a consolidated `PresidingReviewSummary` covering preliminary findings, key obligations, material risks, critical deadlines, questions for visitor clarification, and statutory coverage limitations.
    - **Dissent Survival**: Adversarial contradictions (e.g. `D01` asserting forfeiture is void penalty vs `D02` defending liquidated damages) survive synthesis intact in `preservedDisagreements`.
    - **Post-Synthesis Reference Grounding Validation**: Validates every material reference cited against stored case document pages.
    - **Publication Policy Enforcement**:
      - Under strict policy (`requireAllCitationsVerified: true`, `allowPartialOnCitationGaps: false`): Unverified citations block publication (`publicationStatus: 'publication_blocked'`), emitting `report:publication_blocked`.
      - Under partial policy (`allowPartialOnCitationGaps: true`): Unverified citations permit publication as `partial_preliminary` with explicit warnings, emitting `report:ready_for_review`.
    - **Mandatory Disclaimer**: Strictly enforces statutory disclaimer explicitly stating the review is an automated preliminary assistance synthesis and NOT an independent human legal review or formal advocate-on-record opinion.
  - Automated 8-Point Verification Suite (`apps/worker/src/tests/phase13-verification.ts`):
    1. Consolidation of versioned packets by Chairs A10–E10 with cryptographic checksums.
    2. Preservation of adversarial disagreement between Holder (D01) and Counterparty (D02).
    3. Messenger validation: rejects tampered checksums and accepts valid packets.
    4. Duplicate packet delivery idempotency (one logical effect with `duplicate_ignored`).
    5. Non-blocking milestone event emission (`bench:packet_ready`, `messenger:transit_started`, `messenger:packet_delivered`).
    6. Presiding Reviewer synthesis with preserved dissent surviving into final review.
    7. Post-synthesis citation validation blocking publication under strict policy.
    8. Partial preliminary publication policy and mandatory statutory disclaimer enforcement.

- **Verification Gate**:
  - All 8 acceptance tests executed and passed cleanly (`Exit Code: 0`).
  - Phase 11 and Phase 12 verification suites verified cleanly (`Exit Code: 0`).
  - Monorepo typecheck passed with 0 errors across all 7 workspaces (`npm run typecheck`).
  - Monorepo build passed across all 7 workspaces (`npm run build`).
