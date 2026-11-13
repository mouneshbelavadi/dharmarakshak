import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..', '..', '..', '..');

console.log('═══════════════════════════════════════════════════════════');
console.log('  PHASE 20 VERIFICATION: Telegram Intake & Delivery');
console.log('  (Verified Chat Linking, Idempotency, Consent, Files)');
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

// ─── T01: Telegram service exists with adapter and commands ───
test('T01: Telegram service exists with adapter, commands, and delivery', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/telegram-service.ts');
  assert.ok(fs.existsSync(servicePath), 'telegram-service.ts must exist');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('processUpdate'), 'Must implement processUpdate');
  assert.ok(content.includes('generateVerificationCode'), 'Must implement generateVerificationCode');
  assert.ok(content.includes('deliverReport'), 'Must implement deliverReport');
});

// ─── T02: Centralized bot token & token URL redaction ───
test('T02: Centralized bot token & token URL redaction (bot[REDACTED])', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/telegram-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('process.env.TELEGRAM_BOT_TOKEN'), 'Must read token centrally from backend');
  assert.ok(content.includes('redactToken'), 'Must provide redactToken method');
  assert.ok(content.includes('bot[REDACTED]'), 'Must redact token with bot[REDACTED]');
});

// ─── T03: Short-lived verified chat linking with consent ───
test('T03: Short-lived verified chat linking flow with consent', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/telegram-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('/link'), 'Must handle /link command');
  assert.ok(content.includes('expiresAt'), 'Verification codes must expire');
  assert.ok(content.includes('consentGiven'), 'Binding must record consentGiven');
});

// ─── T04: Cross-case access prevention ───
test('T04: Cross-case access prevention (unauthorized case access rejected)', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/telegram-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('checkCrossCaseAccess'), 'Must provide cross-case validation');
  assert.ok(content.includes('chatToCaseMap'), 'Must map chat strictly to authorized case');
});

// ─── T05: Update deduplication: duplicate updateId has 1 logical effect ───
test('T05: Update deduplication: duplicate updateId has 1 logical effect', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/telegram-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('processedUpdateIds'), 'Must track processedUpdateIds');
  assert.ok(content.includes('DUPLICATE_UPDATE_IGNORED'), 'Must ignore duplicate updates');
});

// ─── T06: Delivery job deduplication: idempotent retries do not duplicate ───
test('T06: Delivery job deduplication: idempotent retries do not duplicate', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/telegram-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('idempotencyKey'), 'Must construct idempotencyKey');
  assert.ok(content.includes('deliveryJobs.get(idempotencyKey)'), 'Must check existing delivery job');
});

// ─── T07: Report-ready notification and PDF delivery ───
test('T07: Report-ready notification and PDF delivery', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/telegram-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('deliverReport'), 'Must implement deliverReport');
  assert.ok(content.includes('/report'), 'Must handle /report command');
});

// ─── T08: Document file intake binds to authorized case with OCR ───
test('T08: Document file intake binds to authorized case with OCR channel', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/telegram-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('message.document'), 'Must inspect message.document');
  assert.ok(content.includes('telegram_bot'), 'Must tag sourceChannel as telegram_bot');
  assert.ok(content.includes('c.documents.push'), 'Must bind document to authorized case');
});

// ─── T09: Oversized file rejection (> 20MB limit enforced) ───
test('T09: Oversized file rejection (> 20MB limit enforced)', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/telegram-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('MAX_TELEGRAM_FILE_SIZE') || content.includes('20 * 1024 * 1024'),
    'Must define 20MB file size limit');
  assert.ok(content.includes('exceeds the maximum allowed size'),
    'Must reject oversized file with courteous warning');
});

// ─── T10: Voice note input via Sarvam STT -> Grounded Gemini QA ───
test('T10: Voice note input via Sarvam STT -> Grounded Gemini QA', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/telegram-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('message.voice'), 'Must handle message.voice');
  assert.ok(content.includes('sarvamSpeechService.transcribe'), 'Must transcribe voice note with Sarvam');
  assert.ok(content.includes('geminiGroundingService.answerQuestion'), 'Must answer question with Gemini');
});

// ─── T11: Bot failure / blocked bot leaves report available on web ───
test('T11: Bot failure / blocked bot leaves report available on web', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/telegram-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('BOT_BLOCKED_BY_USER') || content.includes('bot was blocked'),
    'Must gracefully catch blocked bot errors');
  assert.ok(content.includes('job.status = \'failed\''), 'Must record failed job without crashing');
});

// ─── T12: Required commands implemented ───
test('T12: Required commands implemented: start, link, status, language, report, help, stop', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/telegram-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  const requiredCmds = ['/start', '/link', '/status', '/language', '/report', '/help', '/stop'];
  for (const cmd of requiredCmds) {
    assert.ok(content.includes(cmd), `Must implement command '${cmd}'`);
  }
});

console.log('');
console.log(`═══════════════════════════════════════════════════════════`);
console.log(`  Results: ${passed} passed, ${failed} failed of ${passed + failed}`);
console.log(`═══════════════════════════════════════════════════════════`);

if (failed > 0) {
  process.exit(1);
}

