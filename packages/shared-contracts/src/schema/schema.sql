-- DHARMARAKSHA — PostgreSQL Central Authority DDL (Fresh Install Schema v1.0.0)
-- Strict relational model for multi-document legal intelligence, 5-bench tribunal, and kiosk sessions.

-- Extension check
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Hardware Devices & Kiosk Gateways
CREATE TABLE IF NOT EXISTS devices (
    device_id VARCHAR(64) PRIMARY KEY,
    device_type VARCHAR(32) NOT NULL, -- 'uno_q_gateway', 'laptop_host', 'evaluator_display'
    label VARCHAR(128) NOT NULL,
    hardware_serial VARCHAR(128),
    ip_address VARCHAR(45),
    gateway_port INTEGER NOT NULL DEFAULT 5000,
    firmware_version VARCHAR(32),
    status VARCHAR(32) NOT NULL DEFAULT 'offline',
    registered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMPTZ,
    is_enrolled BOOLEAN NOT NULL DEFAULT true
);

-- 2. Paired Phones (Kiosk UI screens bound to specific gateways)
CREATE TABLE IF NOT EXISTS paired_phones (
    pairing_id VARCHAR(64) PRIMARY KEY,
    device_id VARCHAR(64) NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
    pairing_code VARCHAR(32) NOT NULL,
    client_fingerprint VARCHAR(256),
    paired_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 3. RFID Cards Inventory
CREATE TABLE IF NOT EXISTS cards (
    card_uid VARCHAR(64) PRIMARY KEY,
    technology VARCHAR(32) NOT NULL DEFAULT 'nfc_mifare',
    state VARCHAR(32) NOT NULL DEFAULT 'unassigned_inventory', -- 'unassigned_inventory', 'issued_to_visitor', 'active_session', 'returned_cleared', 'revoked_lost'
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_tapped_at TIMESTAMPTZ,
    notes TEXT
);

-- 4. Visitor Sessions
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(64) PRIMARY KEY,
    card_uid VARCHAR(64) NOT NULL REFERENCES cards(card_uid),
    pairing_id VARCHAR(64) REFERENCES paired_phones(pairing_id),
    role VARCHAR(32) NOT NULL DEFAULT 'visitor',
    status VARCHAR(32) NOT NULL DEFAULT 'card_issued',
    preferred_language VARCHAR(8) NOT NULL DEFAULT 'en',
    consent_given BOOLEAN NOT NULL DEFAULT false,
    consent_timestamp TIMESTAMPTZ,
    session_token VARCHAR(256) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL
);

-- 5. Card Assignment Log
CREATE TABLE IF NOT EXISTS card_assignments (
    assignment_id VARCHAR(64) PRIMARY KEY,
    card_uid VARCHAR(64) NOT NULL REFERENCES cards(card_uid),
    operator_id VARCHAR(64) NOT NULL,
    visitor_session_id VARCHAR(64) NOT NULL REFERENCES sessions(session_id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    returned_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ
);

-- 6. Cases (Containers for multi-document reviews)
CREATE TABLE IF NOT EXISTS cases (
    case_id VARCHAR(64) PRIMARY KEY,
    creator_session_id VARCHAR(64) REFERENCES sessions(session_id),
    assigned_card_uid VARCHAR(64) REFERENCES cards(card_uid),
    title VARCHAR(256) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft_intake',
    source_type VARCHAR(32) NOT NULL DEFAULT 'kiosk',
    current_snapshot_version INTEGER NOT NULL DEFAULT 1,
    preferred_language VARCHAR(8) NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT
);

-- 7. Case Snapshots (Immutable freeze of a document set)
CREATE TABLE IF NOT EXISTS case_snapshots (
    snapshot_id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    snapshot_version INTEGER NOT NULL,
    manifest JSONB NOT NULL,
    total_page_count INTEGER NOT NULL DEFAULT 0,
    combined_fingerprint VARCHAR(128) NOT NULL,
    frozen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_case_snapshot_version UNIQUE (case_id, snapshot_version)
);

-- 8. Case Documents
CREATE TABLE IF NOT EXISTS documents (
    document_id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    title VARCHAR(256) NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'unknown_uncategorized',
    current_version_number INTEGER NOT NULL DEFAULT 1,
    page_count INTEGER NOT NULL DEFAULT 0,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    source_channel VARCHAR(32) NOT NULL DEFAULT 'kiosk_overhead_cam',
    language_detected VARCHAR(16),
    content_hash VARCHAR(64) NOT NULL,
    is_archived BOOLEAN NOT NULL DEFAULT false
);

-- 9. Immutable Document Versions
CREATE TABLE IF NOT EXISTS document_versions (
    version_id VARCHAR(64) PRIMARY KEY,
    document_id VARCHAR(64) NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    page_count INTEGER NOT NULL,
    page_manifest JSONB NOT NULL,
    manifest_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_session_id VARCHAR(64) REFERENCES sessions(session_id),
    CONSTRAINT uq_document_version UNIQUE (document_id, version_number)
);

-- 10. Ordered Document Pages
CREATE TABLE IF NOT EXISTS document_pages (
    page_id VARCHAR(64) PRIMARY KEY,
    document_id VARCHAR(64) NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    image_url VARCHAR(512) NOT NULL,
    thumbnail_url VARCHAR(512),
    extracted_text TEXT,
    script_detected VARCHAR(32),
    quality_score NUMERIC(3, 2),
    continuity_status VARCHAR(64) NOT NULL DEFAULT 'intact',
    ocr_confidence NUMERIC(3, 2),
    rotation_degrees INTEGER NOT NULL DEFAULT 0,
    sha256_checksum VARCHAR(64) NOT NULL,
    byte_size INTEGER NOT NULL,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_document_page_number UNIQUE (document_id, page_number)
);

-- 11. Analysis Runs (Orchestrator executions bound to a snapshot)
CREATE TABLE IF NOT EXISTS analysis_runs (
    run_id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    snapshot_version INTEGER NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'queued',
    router_decision JSONB,
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    aborted_at TIMESTAMPTZ,
    abort_reason TEXT
);

-- 12. Bench Packets
CREATE TABLE IF NOT EXISTS bench_packets (
    packet_id VARCHAR(64) PRIMARY KEY,
    run_id VARCHAR(64) NOT NULL REFERENCES analysis_runs(run_id) ON DELETE CASCADE,
    case_id VARCHAR(64) NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    bench_id CHAR(1) NOT NULL, -- 'A', 'B', 'C', 'D', 'E'
    chair_id VARCHAR(16) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    coverage_assessment JSONB NOT NULL,
    specialist_executions JSONB NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMPTZ,
    CONSTRAINT uq_run_bench UNIQUE (run_id, bench_id)
);

-- 13. Material Findings
CREATE TABLE IF NOT EXISTS findings (
    finding_id VARCHAR(64) PRIMARY KEY,
    packet_id VARCHAR(64) NOT NULL REFERENCES bench_packets(packet_id) ON DELETE CASCADE,
    case_id VARCHAR(64) NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    snapshot_version INTEGER NOT NULL,
    originating_specialist_id VARCHAR(16) NOT NULL,
    originating_bench_id CHAR(1) NOT NULL,
    category VARCHAR(64) NOT NULL,
    title VARCHAR(256) NOT NULL,
    summary TEXT NOT NULL,
    citations JSONB NOT NULL,
    authorities JSONB,
    severity VARCHAR(32) NOT NULL DEFAULT 'advisory',
    confidence_score NUMERIC(3, 2) NOT NULL DEFAULT 1.0,
    is_preserved_disagreement BOOLEAN NOT NULL DEFAULT false,
    alternative_viewpoint TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 14. Discrepancy Reports
CREATE TABLE IF NOT EXISTS discrepancies (
    discrepancy_id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    snapshot_version INTEGER NOT NULL,
    discrepancy_type VARCHAR(64) NOT NULL,
    item_a JSONB NOT NULL,
    item_b JSONB NOT NULL,
    explanation TEXT NOT NULL,
    adversarial_significance TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 15. Grounded Q&A Turns
CREATE TABLE IF NOT EXISTS qa_turns (
    turn_id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    snapshot_version INTEGER NOT NULL,
    session_id VARCHAR(64) NOT NULL REFERENCES sessions(session_id),
    mode VARCHAR(16) NOT NULL DEFAULT 'text',
    language VARCHAR(8) NOT NULL DEFAULT 'en',
    question_text TEXT NOT NULL,
    question_audio_url VARCHAR(512),
    answer_text TEXT NOT NULL,
    answer_audio_url VARCHAR(512),
    sources JSONB NOT NULL,
    is_preliminary BOOLEAN NOT NULL DEFAULT false,
    missing_info_acknowledged TEXT,
    latency_ms INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 16. Reports
CREATE TABLE IF NOT EXISTS reports (
    report_id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    snapshot_version INTEGER NOT NULL,
    report_language VARCHAR(8) NOT NULL DEFAULT 'en',
    presiding_summary JSONB NOT NULL,
    pdf_storage_path VARCHAR(512),
    pdf_file_size_bytes INTEGER,
    sha256_hash VARCHAR(64),
    statutory_disclaimer TEXT NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 17. Delivery Dispatches
CREATE TABLE IF NOT EXISTS deliveries (
    dispatch_id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    report_id VARCHAR(64) NOT NULL REFERENCES reports(report_id) ON DELETE CASCADE,
    channel VARCHAR(32) NOT NULL, -- 'telegram_bot', 'gmail_app_password', 'google_drive_export'
    status VARCHAR(32) NOT NULL DEFAULT 'pending_visitor_confirmation',
    destination_summary VARCHAR(128) NOT NULL,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMPTZ,
    dispatched_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT
);

-- 18. Monotonic Events Ledger (Audit & WebSocket Replay)
CREATE TABLE IF NOT EXISTS events_ledger (
    cursor BIGSERIAL PRIMARY KEY,
    event_id VARCHAR(64) NOT NULL UNIQUE,
    event_type VARCHAR(64) NOT NULL,
    case_id VARCHAR(64) NOT NULL,
    snapshot_version INTEGER NOT NULL,
    originating_tier VARCHAR(32) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 19. Idempotency Keys (Deduplication & Retry Guard)
CREATE TABLE IF NOT EXISTS idempotency_keys (
    idempotency_key VARCHAR(128) PRIMARY KEY,
    target_resource_type VARCHAR(64) NOT NULL,
    target_resource_id VARCHAR(64) NOT NULL,
    request_hash VARCHAR(64) NOT NULL,
    response_payload JSONB,
    status VARCHAR(32) NOT NULL DEFAULT 'processing',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL
);

-- INDEXES for fast retrieval
CREATE INDEX IF NOT EXISTS idx_sessions_card_uid ON sessions(card_uid);
CREATE INDEX IF NOT EXISTS idx_cases_creator_session ON cases(creator_session_id);
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_document_pages_document_id ON document_pages(document_id);
CREATE INDEX IF NOT EXISTS idx_findings_case_id ON findings(case_id);
CREATE INDEX IF NOT EXISTS idx_events_cursor_case ON events_ledger(case_id, cursor);

