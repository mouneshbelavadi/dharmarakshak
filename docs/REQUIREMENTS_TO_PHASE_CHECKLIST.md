# DHARMARAKSHA — Requirements-to-Phase Checklist (Phases 01–24)

This checklist maps all product principles, functional specifications, and constraints from the project brief to the 24 planned implementation phases.

| Requirement / Constraint | Description in Brief | Mapped Phase |
| :--- | :--- | :--- |
| **From-Scratch Repository & Monorepo Skeleton** | Independent clean repo; zero legacy code migration; TypeScript/React monorepo with workspace packages. | **Phase 01** |
| **Relational Data Architecture & Core Schema** | PostgreSQL central record store; cases, documents, pages, bench packets, findings, audit trails. | **Phase 02** |
| **Operator Session & RFID Card Issuance** | Physical RFID card issuance, session binding, activation, expiry, return/reassignment lifecycle. | **Phase 03** |
| **UNO Q Gateway & Hardware Interface** | Arduino UNO Q Linux-side gateway, scoped device key auth, RFID reader events, temporary capture queue. | **Phase 04** |
| **Lightweight Kiosk Phone Interface** | 2D responsive mobile web; language/consent selection; zero Three.js/3D assets in bundle. | **Phase 05** |
| **Document Scanning & Page Continuity** | Physical capture, page reordering, retake blur/glare, multi-document cases (agreements, receipts, annexures). | **Phase 06** |
| **Main API Ingestion & Private File Storage** | Document upload endpoints, checksum validation, metadata extraction, secure local/cloud object storage. | **Phase 07** |
| **OCR, Indian Script & Text Fidelity Engine** | High-fidelity OCR for Indian languages and English; verbatim text extraction with line/page coordinates. | **Phase 08** |
| **Bench A: Document & Evidence (10 Specialists)** | A01–A10: Quality, continuity, fidelity, language, parties, dates/amounts, structure, consistency, redaction, Chair. | **Phase 09** |
| **Bench B: Rights & Obligations (10 Specialists)** | B01–B10: Contract, employment, tenancy, property, consumer, MSME, lending, IP, exit/dispute, Chair. | **Phase 10** |
| **Bench C: Indian Legal Sources (10 Specialists)** | C01–C10: Jurisdiction, statutes, state law, rules/notifications, applicability, precedents, verifier, Chair. | **Phase 11** |
| **Bench D: Adversarial Risk (10 Specialists)** | D01–D10: Holder advocate, counterparty advocate, ambiguity, financial exposure, deadlines, balance, Chair. | **Phase 12** |
| **Bench E: Verification & Plain Language (10 Specialists)** | E01–E10: Evidence auditor, contradiction resolver, math/timeline, coverage, plain-language, translation, Chair. | **Phase 13** |
| **Orchestration Engine & Specialist Task Routing** | Bounded specialist task execution; dynamic routing based on document category and question scope. | **Phase 14** |
| **Messenger Coordination & Packet Handover** | Inter-bench courier; packet validation; handing over verified bench packets to Presiding Reviewer. | **Phase 15** |
| **AI Presiding Reviewer Synthesis** | Multi-bench consolidation; executive plain-language summary; clear preservation of disagreements & gaps. | **Phase 16** |
| **Sarvam AI Indian Speech Integration** | Multilingual STT & TTS; native Indian accents & languages (Kannada, Hindi, Tamil, Telugu, etc.); audio mute. | **Phase 17** |
| **Grounded Conversational Q&A (Gemini)** | Case-grounded question answering; citing document and page numbers; distinguishing facts from pending review. | **Phase 18** |
| **3D Tribunal Chamber Scene (Laptop Only)** | Three.js / React Three Fiber / Drei; 5 round tables, 50 seats, central evidence well, Presiding podium. | **Phase 19** |
| **3D Specialist Gestures & Real-Time Sync** | Real-time state visualization (reading, listening, note-taking, packet handover); SSE/WebSocket sync. | **Phase 20** |
| **Laptop Case Management & Presentation View** | Split workspace (warm document folio + ink-dark chamber); accessible 2D fallback; Evaluator clean mode. | **Phase 21** |
| **Comprehensive Referenced Report Generator** | PDF export with verbatim citations, clause references, risk severity flags, and professional disclaimer. | **Phase 22** |
| **Delivery Channels: Telegram, Drive, Gmail** | Explicit visitor-triggered delivery; Telegram bot, Google Drive export, Gmail app-password sender. | **Phase 23** |
| **End-to-End Evaluation, Security & Polish** | Full cross-system test; prompt injection safeguards; privacy cleanup on card return; viva demo readiness. | **Phase 24** |

