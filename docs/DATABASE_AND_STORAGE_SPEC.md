# DHARMARAKSHA — Database & Storage Specification

## 1. PostgreSQL Central Authority

PostgreSQL is the single central authority for all persistent application data in DHARMARAKSHA. No shared state is stored solely in client memory, browser local storage, or temporary gateway files.

### Fresh Install Initialization
1. Ensure PostgreSQL (>= 15.0) is running locally or at `DATABASE_URL`.
2. Execute the versioned DDL migration script:
   ```bash
   psql -d dharmaraksha_db -f packages/shared-contracts/src/schema/schema.sql
   ```
3. All tables, foreign key constraints with `ON DELETE CASCADE`, unique constraints, and retrieval indexes are created idempotently (`IF NOT EXISTS`).

### Future Migration, Rollback & Backup Strategy
- **Forward Migrations**: Future schema changes will be versioned sequentially in `packages/shared-contracts/src/schema/migrations/` (e.g. `0002_add_field.sql`).
- **Rollback Scripts**: Every migration must have a paired rollback script (e.g. `0002_revert_field.sql`) tested in staging before application.
- **Automated Backup**:
  - Daily pg_dump scheduled via cron or background worker:
    ```bash
    pg_dump -Fc dharmaraksha_db > backups/dharmaraksha_backup_$(date +%Y%m%d_%H%M%S).dump
    ```
  - Point-in-time recovery enabled via Write-Ahead Logging (WAL).

---

## 2. Private Storage Directory Layout

Uploaded document scans, page thumbnails, and generated PDF reports are stored in private local file storage managed by the Main API:

```
./storage/
├── documents/
│   └── {caseId}/
│       └── {documentId}/
│           ├── original/
│           │   ├── page_001.jpg
│           │   ├── page_002.jpg
│           │   └── ...
│           └── thumbnails/
│               ├── page_001_thumb.jpg
│               └── ...
├── reports/
│   └── {caseId}/
│       └── report_v{snapshotVersion}_{reportId}.pdf
└── cache/
    └── ocr_intermediate/
```

### Storage Security Guarantees
- Documents are private: No static public web server serves `./storage/`.
- File access requires an authenticated session belonging to the specific `caseId` via streaming endpoint `GET /api/v1/cases/{id}/documents/{docId}/pages/{pageId}/image`.
- Path traversal protection: All requested file paths are sanitized against directory traversal attempts (`..` injection).

---

## 3. UNO Q Local SQLite Spool Buffer

The UNO Q gateway runs an embedded SQLite database (`/tmp/dharmaraksha_spool.db`) created using `apps/uno-gateway/src/db/spool-schema.sql`.

- **Strict Bounding**: Maximum of 20 unacknowledged page stills and 100 recent RFID events.
- **Auto-Eviction**: As soon as the Main API issues an `UploadAcknowledgment`, the corresponding image file is deleted from `/tmp/dharmaraksha_captures/` and marked completed in the spool.
- **Disk Pressure Guard**: If free space on the UNO Q filesystem falls below 100 MB, the gateway pauses capture triggers and alerts the operator.

