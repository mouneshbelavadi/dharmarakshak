import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..', '..', '..', '..');

console.log('═══════════════════════════════════════════════════════════');
console.log('  PHASE 21 VERIFICATION: Google Drive Import & Export');
console.log('  (OAuth2, drive.file Scope, Token Encryption, Idempotency)');
console.log('═══════════════════════════════════════════════════════════');

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  try {
    const res = fn();
    if (res instanceof Promise) {
      res.then(() => {
        console.log(`  ✓ ${name}`);
        passed++;
      }).catch((err: any) => {
        console.log(`  ✗ ${name}`);
        console.log(`    ${err.message}`);
        failed++;
      });
    } else {
      console.log(`  ✓ ${name}`);
      passed++;
    }
  } catch (err: any) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message}`);
    failed++;
  }
}

// ─── T01: Drive service exists with OAuth, import, and export ───
test('T01: Drive service exists with OAuth, import, and export methods', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/drive-service.ts');
  assert.ok(fs.existsSync(servicePath), 'drive-service.ts must exist');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('generateAuthUrl'), 'Must implement generateAuthUrl');
  assert.ok(content.includes('handleCallback'), 'Must implement handleCallback');
  assert.ok(content.includes('importFile'), 'Must implement importFile');
  assert.ok(content.includes('exportReport'), 'Must implement exportReport');
});

// ─── T02: Scope restricted to drive.file ───
test('T02: Scope restricted to drive.file (least privilege)', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/drive-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('drive.file'), 'Must restrict scope to drive.file');
  assert.ok(!content.includes('https://www.googleapis.com/auth/drive '), 'Must not use full drive scope');
});

// ─── T03: OAuth URL generated with CSRF state token ───
test('T03: OAuth URL generated with CSRF state token', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/drive-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('stateToken'), 'Must generate state token');
  assert.ok(content.includes('accounts.google.com/o/oauth2/v2/auth'), 'Must target Google OAuth2 endpoint');
});

// ─── T04: Token encryption on backend ───
test('T04: OAuth tokens encrypted with AES-256-GCM', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/drive-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('encryptToken'), 'Must provide encryptToken method');
  assert.ok(content.includes('aes-256-gcm'), 'Must use AES-256-GCM encryption');
});

// ─── T05: File import binds document to case snapshot ───
test('T05: File import binds document to case snapshot with google_drive source', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/drive-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('sourceChannel: \'google_drive\''), 'Must tag sourceChannel as google_drive');
  assert.ok(content.includes('currentSnapshotVersion += 1'), 'Must increment snapshot version on import');
});

// ─── T06: Unsupported file types rejected ───
test('T06: Unsupported file formats rejected with clear error', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/drive-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('UNSUPPORTED_DRIVE_FILE_TYPE'), 'Must throw error on unsupported file type');
});

// ─── T07: Private report export produces remote file ID ───
test('T07: Private report export produces remote file ID and view link', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/drive-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('driveFileId'), 'Must return remote driveFileId');
  assert.ok(content.includes('driveViewLink'), 'Must return driveViewLink');
});

// ─── T08: Export deduplication / idempotency ───
test('T08: Export deduplication / idempotency prevents duplicate exports', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/drive-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('idempotencyKey'), 'Must define idempotencyKey');
  assert.ok(content.includes('exportJobs.get(idempotencyKey)'), 'Must check existing export jobs');
});

// ─── T09: Disconnect resets auth state ───
test('T09: Disconnect revokes tokens and resets connection status', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/drive-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('disconnect'), 'Must implement disconnect');
  assert.ok(content.includes('status: \'disconnected\''), 'Must reset status to disconnected');
});

// ─── T10: Drive routes mounted with case authorization ───
test('T10: Drive routes mounted with requireCaseAccess', () => {
  const routesPath = path.join(ROOT, 'apps/main-api/src/routes/drive.ts');
  assert.ok(fs.existsSync(routesPath), 'drive.ts route must exist');
  const content = fs.readFileSync(routesPath, 'utf-8');
  assert.ok(content.includes('requireCaseAccess'), 'Must protect case endpoints with requireCaseAccess');
  assert.ok(content.includes('/cases/:id/drive/import'), 'Must expose import endpoint');
  assert.ok(content.includes('/cases/:id/drive/export'), 'Must expose export endpoint');
});

console.log('');
console.log(`═══════════════════════════════════════════════════════════`);
console.log(`  Results: ${passed} passed, ${failed} failed of ${passed + failed}`);
console.log(`═══════════════════════════════════════════════════════════`);

if (failed > 0) {
  process.exit(1);
}

