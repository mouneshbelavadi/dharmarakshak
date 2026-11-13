-- DHARMARAKSHA — UNO Q Local SQLite Spool Schema
-- Bounded temporary buffer on the Linux side of UNO Q (limited to max 20 captures / 100 recent RFID events).
-- Authoritative persistent records belong ONLY to PostgreSQL on the main laptop backend.

CREATE TABLE IF NOT EXISTS local_rfid_buffer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_uid TEXT NOT NULL,
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    forwarded_to_main_api INTEGER DEFAULT 0, -- 0 = pending, 1 = forwarded, 2 = failed
    attempts INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS local_capture_spool (
    capture_id TEXT PRIMARY KEY,
    document_id TEXT,
    page_number INTEGER,
    file_path TEXT NOT NULL,
    sha256_checksum TEXT NOT NULL,
    byte_size INTEGER NOT NULL,
    captured_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    upload_status TEXT DEFAULT 'queued', -- 'queued', 'forwarding', 'acknowledged', 'failed'
    retry_count INTEGER DEFAULT 0,
    acknowledged_at DATETIME
);

CREATE TABLE IF NOT EXISTS gateway_status (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

