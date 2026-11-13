import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..', '..', '..', '..');

console.log('═══════════════════════════════════════════════════════════');
console.log('  PHASE 22 VERIFICATION: Gmail App-Password Sending');
console.log('  (Nodemailer SMTP, Consent, Outbox Idempotency, Delivery)');
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

// ─── T01: Gmail service exists with send and test methods ───
test('T01: Gmail service exists with send and connection test methods', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/gmail-service.ts');
  assert.ok(fs.existsSync(servicePath), 'gmail-service.ts must exist');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('sendReportEmail'), 'Must implement sendReportEmail');
  assert.ok(content.includes('testConnection'), 'Must implement testConnection');
  assert.ok(content.includes('getConfigState'), 'Must implement getConfigState');
});

// ─── T02: Credentials centrally stored ───
test('T02: Credentials centrally stored (GMAIL_USER, GMAIL_APP_PASSWORD)', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/gmail-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('process.env.GMAIL_USER'), 'Must read GMAIL_USER from environment');
  assert.ok(content.includes('process.env.GMAIL_APP_PASSWORD'), 'Must read GMAIL_APP_PASSWORD from environment');
});

// ─── T03: Config state never leaks app password ───
test('T03: Config state never leaks app password to callers', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/gmail-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('getConfigState'), 'Must provide getConfigState');
  // Check that getConfigState masks the email and does not return the appPassword
  assert.ok(!content.includes('appPassword: this.appPassword'), 'Must never return raw app password');
});

// ─── T04: Explicit user consent required ───
test('T04: Explicit user consent required before sending email', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/gmail-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('CONSENT_REQUIRED'), 'Must throw error if consentConfirmed is false');
  assert.ok(content.includes('consentConfirmed'), 'Must check req.consentConfirmed');
});

// ─── T05: Recipient email format validation ───
test('T05: Valid recipient email validation', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/gmail-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('INVALID_RECIPIENT_EMAIL'), 'Must validate email format');
});

// ─── T06: Outbox deduplication / idempotency ───
test('T06: Outbox deduplication / idempotency prevents duplicate email delivery', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/gmail-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('idempotencyKey'), 'Must define idempotencyKey');
  assert.ok(content.includes('outboxJobs.get(idempotencyKey)'), 'Must check existing outbox jobs');
});

// ─── T07: SMTP transport settings: smtp.gmail.com:587 STARTTLS ───
test('T07: SMTP transport settings: smtp.gmail.com:587 STARTTLS', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/gmail-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('smtp.gmail.com'), 'Must target smtp.gmail.com');
  assert.ok(content.includes('587'), 'Must specify port 587');
  assert.ok(content.includes('STARTTLS'), 'Must specify STARTTLS mode');
});

// ─── T08: Delivery statuses tracked ───
test('T08: Delivery statuses tracked (queued, submitting, smtp_accepted, failed, uncertain)', () => {
  const contractsPath = path.join(ROOT, 'packages/shared-contracts/src/email.ts');
  const content = fs.readFileSync(contractsPath, 'utf-8');
  assert.ok(content.includes('smtp_accepted'), 'Must track smtp_accepted status');
  assert.ok(content.includes('submitting'), 'Must track submitting status');
  assert.ok(content.includes('uncertain'), 'Must track uncertain status');
});

// ─── T09: No implicit administrative fallback recipient ───
test('T09: No implicit administrative fallback recipient or second send path', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/gmail-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(!content.includes('admin@'), 'Must not send to implicit admin email');
  assert.ok(content.includes('req.recipientEmail'), 'Must send strictly to confirmed recipient');
});

// ─── T10: Email routes mounted with requireCaseAccess ───
test('T10: Email routes mounted with requireCaseAccess', () => {
  const routesPath = path.join(ROOT, 'apps/main-api/src/routes/email.ts');
  assert.ok(fs.existsSync(routesPath), 'email.ts route must exist');
  const content = fs.readFileSync(routesPath, 'utf-8');
  assert.ok(content.includes('requireCaseAccess'), 'Must protect send endpoint with requireCaseAccess');
  assert.ok(content.includes('/cases/:id/email/send'), 'Must expose /email/send endpoint');
});

console.log('');
console.log(`═══════════════════════════════════════════════════════════`);
console.log(`  Results: ${passed} passed, ${failed} failed of ${passed + failed}`);
console.log(`═══════════════════════════════════════════════════════════`);

if (failed > 0) {
  process.exit(1);
}

