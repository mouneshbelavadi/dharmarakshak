# DHARMARAKSHA — Final Topology & Deployment Specification

## 1. Concrete System Topology

```
+---------------------------------------------------------------------------------------------------+
|                                        TIER 1: KIOSK PHONE                                        |
|  - Surface: Mobile Web Browser (Portrait 2D Interface)                                             |
|  - Role: Visitor Onboarding, Language Selection, Tap Detection, Review Trigger, Sarvam Q&A       |
|  - STRICT BOUNDARY: Zero 3D Assets, Zero Three.js/R3F, Zero Provider Keys                          |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  | [Network Hop 1: Phone-to-UNO Q]
                                                  | Protocol: HTTPS (ngrok tunnel or trusted local LAN)
                                                  | Port: 5000
                                                  | Auth: Expiring One-Time Pairing Code / Session Cookie
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                    TIER 2: UNO Q HARDWARE GATEWAY                                 |
|  - Hardware: Arduino UNO Q Board (Linux Core + Microcontroller Co-processor)                      |
|  - Role: Hardware proxy, USB Overhead Camera Control, RFID Reader Event Listener, Spool Buffer   |
|  - STRICT BOUNDARY: NO OCR Engine, NO Fifty Model Workers, NO 3D Rendering                       |
|  - Local Storage: Bounded SQLite Spool (Max 20 pages temporary spool)                             |
|  - Auth: Holds single DHARMARAKSHA Scoped Device API Key                                          |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  | [Network Hop 2: UNO Q-to-Main API]
                                                  | Protocol: HTTP/HTTPS REST + Server-Sent Events (SSE)
                                                  | Port: 4000
                                                  | Auth: Header `X-Dharmaraksha-Device-Key`
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                  TIER 3: LAPTOP HOST & CENTRAL BACKEND                            |
|                                                                                                   |
|  +--------------------------------------------+  +---------------------------------------------+  |
|  |           Laptop Web Dashboard             |  |                 Main API                    |  |
|  |  - Only surface rendering 3D Tribunal      |  |  - Node.js + Express REST API (Port 4000)   |  |
|  |  - Dual Workspace: Warm Folio + Ink 3D     |  |  - Case / Session / Document Management     |  |
|  |  - 5 Benches, 50 Specialists, Messenger    |  |  - WebSocket / SSE Event Streamer           |  |
|  |  - Evaluator Presentation View             |  |  - Direct Ingestion Fallback (No-kiosk mode)|  |
|  +--------------------------------------------+  +---------------------------------------------+  |
|                                         |               |                                         |
|                                         |               v                                         |
|                                         |        +---------------------------------------------+  |
|                                         |        |              Background Worker              |  |
|                                         |        |  - Orchestrator Engine & Specialist DAG     |  |
|                                         |        |  - OCR & Indian Script Processing Pipeline  |  |
|                                         |        |  - Gemini 1.5/2.0 API Dispatcher            |  |
|                                         |        |  - Sarvam AI Speech Dispatcher              |  |
|                                         +------->+  - Delivery Adapters (Telegram/Drive/Gmail) |  |
|                                                  +---------------------------------------------+  |
|                                                                 |                                 |
|                                                                 v                                 |
|  +---------------------------------------------------------------------------------------------+  |
|  |                                  Central PostgreSQL Database                                |  |
|  |  - Single Authoritative System of Record                                                    |  |
|  |  - Cases, Documents, Ordered Pages, Snapshots, Bench Packets, Findings, Monotonic Ledger    |  |
|  +---------------------------------------------------------------------------------------------+  |
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  |                                  Private Document Object Store                              |  |
|  |  - Local File System: `./storage/documents/{caseId}/{docId}/` (AES-256 encrypted at rest)   |  |
|  +---------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Remote Cloud Provider Boundaries

All cloud AI and speech inference remains remote on third-party cloud infrastructure. Under no circumstances is cloud inference performed on the UNO Q board or the laptop local CPU:
- **Gemini (Google AI)**: Remote REST/gRPC API. Handles multi-document reasoning, clause analysis, adversarial cross-examination, and Presiding Reviewer synthesis.
- **Sarvam AI**: Remote REST API. Handles Indian-language Speech-to-Text (STT) and Text-to-Speech (TTS).

---

## 3. Alternative Deployment Option: Hosted Central Backend

While the initial demonstration runs the Main API, Background Worker, and PostgreSQL database directly on the laptop alongside the 3D dashboard:
- **Hosted Cloud Backend**: The backend container can be deployed to a cloud VM or managed Kubernetes/ECS cluster without altering the phone UI, the UNO Q gateway code, or the visitor experience.
- The laptop browser then simply accesses the remote backend via HTTPS, while the UNO Q forwards captures to the cloud endpoint.

---

## 4. Media Ownership & Network Hop Lifecycle

### Hop 1: Phone-to-UNO Q Gateway
- **Origin**: Kiosk Phone browser.
- **Protocol**: HTTPS via ngrok tunnel (`https://<ngrok-id>.ngrok-free.app`) or trusted local Wi-Fi HTTPS.
- **Payload**: User commands (language select, consent, capture trigger, question text/audio).
- **Security**: Bound to active pairing token; no backend provider keys exposed.

### Hop 2: UNO Q-to-Main API
- **Origin**: UNO Q Linux-side gateway daemon.
- **Protocol**: HTTP/HTTPS REST endpoint with multipart streaming for captured high-res page stills.
- **Payload**: Device heartbeats, RFID raw UID tap events, captured page stills with SHA-256 checksums.
- **Security**: Scoped device key in `X-Dharmaraksha-Device-Key` header.
- **Media Handover**:
  1. USB Camera captures high-res JPEG still into UNO Q temporary spool directory (`/tmp/dharmaraksha_captures/`).
  2. Gateway computes SHA-256 checksum and spools record in local SQLite database.
  3. Gateway streams page to Main API `POST /api/v1/cases/{id}/documents/{docId}/pages`.
  4. Main API verifies checksum, writes to private persistent storage, and returns `UploadAcknowledgment`.
  5. UNO Q receives acknowledgment and purges the temporary local still from its bounded spool.

