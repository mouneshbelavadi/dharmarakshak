# DHARMARAKSHA — Operational Protocols & Security Contracts

This document explains the runtime operational protocols and security guarantees in plain language.

---

## 1. Document Upload Acknowledgment Protocol

1. **Capture & Digest Calculation**:
   - When a page is captured by the UNO Q overhead camera (or selected via laptop direct upload), a SHA-256 cryptographic digest is calculated over the raw image bytes before transmission.
2. **Streaming Transmission with Idempotency Key**:
   - The client streams the multipart payload with headers:
     - `X-Idempotency-Key: <unique-uuid>`
     - `X-Checksum-SHA256: <hex-digest>`
     - `X-Page-Number: <1-based-index>`
3. **Server Verification & Storage**:
   - The Main API streams bytes directly into private storage while computing the running SHA-256 hash.
   - If the received hash matches `X-Checksum-SHA256`, the page is committed to PostgreSQL and disk.
4. **Formal Acknowledgment**:
   - The server responds with `UploadAcknowledgment` (`201 Created`):
     ```json
     {
       "uploadId": "upl-892301",
       "documentId": "doc-001",
       "pageId": "pg-003",
       "idempotencyKey": "idem-9a8f",
       "sha256Checksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
       "receivedBytes": 2048590,
       "status": "acknowledged_and_stored",
       "timestamp": "2026-11-13T10:00:00Z"
     }
     ```
   - If the hash mismatches, the server returns `422 Unprocessable Entity` with status `rejected_corrupt`, and the gateway retries upload from spool.

---

## 2. Idempotency & Duplicate Submission Handling

- **Physical Taps**: If a visitor taps their RFID card multiple times in rapid succession, the UNO Q gateway and Main API apply a 3,000ms debounce window. Subsequent taps within this window do not spawn additional cases or wipe current progress.
- **Page Submissions**: Every page upload and document submission requires an `X-Idempotency-Key`. If a network timeout causes a retry with the same key and payload hash, the server immediately returns the previously computed acknowledgment response without re-processing or storing duplicate pages.
- **Review Submission**: The visitor must explicitly confirm "Submit for Analysis". Double-clicking this action triggers an idempotent state machine check; if already in progress, the second request safely attaches to the existing analysis run.

---

## 3. Cancellation Protocol

- **Visitor or Operator Abort**: A visitor or operator can trigger `POST /api/v1/cases/{id}/cancel` at any time.
- **Worker Execution Abort**: The background orchestrator aborts pending specialist tasks via `AbortController`. Outbound LLM API calls are terminated where supported.
- **Packet Invalidation**: In-flight bench packets from cancelled runs are tagged with `status: rejected_for_rework` and dropped by the Messenger.
- **State Transition**: The case status transitions to `cancelled`, and a case-scoped event is emitted to notify the 3D chamber and phone UI immediately.

---

## 4. Replay Mechanism & Monotonic Event Cursors

- Every state change in the system (status updates, specialist activity, packet handovers, Q&A turns) is appended to the `events_ledger` table with a strictly monotonic 64-bit integer `cursor`.
- **Client Reconnection**: If the laptop browser or phone disconnects due to Wi-Fi jitter or sleep, the client reconnects via SSE/WebSocket with its last observed cursor:
  `GET /api/v1/cases/{id}/events?afterCursor=142`
- The server replays all events with `cursor > 142` in deterministic order, ensuring the 3D tribunal scene and mobile UI catch up without data loss or UI desynchronization.

---

## 5. Stale-Version Rejection (Optimistic Concurrency)

- When analysis is launched, the document set is frozen into an immutable `CaseDocumentSnapshot` with a specific `snapshotVersion` (e.g., Version 1).
- **Mutations Invalidate State**: If a visitor captures an extra page or removes a page, the case increments to `snapshotVersion: 2`.
- Any background worker tasks or Q&A turns referencing a stale snapshot version are rejected with `StaleVersionRejection`:
  ```json
  {
    "rejected": true,
    "reason": "STALE_SNAPSHOT_VERSION",
    "caseId": "case-001",
    "requestedVersion": 1,
    "currentActiveVersion": 2,
    "message": "Document set was modified after review began. Stale analysis results discarded."
  }
  ```
- Previous reports remain explicitly tagged with the exact snapshot version they analyzed.

---

## 6. Permissions & Role Separation

Four strict operational roles are enforced:
1. **Visitor**:
   - Identity: Ephemeral session bound to an issued RFID card UID.
   - Capabilities: Capture own pages, review own document set, view own progress, ask questions, download own report.
   - Boundaries: Cannot view other cases, cannot reassign cards, cannot inspect developer logs, cannot access provider keys.
2. **Operator**:
   - Identity: Authenticated staff member.
   - Capabilities: Issue cards, pair kiosk phones, monitor hardware health, clear sessions, assist visitor capture.
   - Boundaries: Cannot bypass document consent or view raw API keys.
3. **Evaluator / Presenter**:
   - Identity: Presentation view audience or competition evaluator.
   - Capabilities: Observe genuine end-to-end case flow, inspect 3D chamber benches, review plain-language findings.
   - Boundaries: Server-enforced hiding of raw developer logs, internal prompt strings, provider keys, and private credentials.
4. **Administrator**:
   - Capabilities: Manage device enrollments, rotate device keys, configure provider endpoints.

