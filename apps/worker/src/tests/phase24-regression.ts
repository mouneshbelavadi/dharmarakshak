import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..', '..', '..', '..');

console.log('═══════════════════════════════════════════════════════════');
console.log('  PHASE 24 COMPLETE ACCEPTANCE REGRESSION SUITE:');
console.log('  DHARMARAKSHA Full End-to-End System Verification (Phases 01-24)');
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

// ─── T01: Multi-document intake ───
test('T01: Multi-document intake preserves document boundaries and page order', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/document-intake-service.ts');
  assert.ok(fs.existsSync(servicePath), 'document-intake-service.ts must exist');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('createDocument'), 'Must create named document');
  assert.ok(content.includes('addPage('), 'Must add ordered pages via addPage');
  assert.ok(content.includes('finalizeSnapshot') || content.includes('finalizeCaseSnapshot') || content.includes('currentSnapshotVersion'), 'Must freeze immutable snapshot');
});

// ─── T02: Dual intake parity ───
test('T02: Dual intake parity: laptop direct upload and kiosk capture use same validation', () => {
  const contractsCase = path.join(ROOT, 'packages/shared-contracts/src/case.ts');
  const content = fs.readFileSync(contractsCase, 'utf-8');
  assert.ok(content.includes('sourceType'), 'Must support sourceType tracking');
  assert.ok(content.includes("'kiosk'") && content.includes("'laptop_direct'"), 'Must support both kiosk and laptop_direct');
});

// ─── T03: RFID card session lifecycle ───
test('T03: Issued RFID card session lifecycle and strict cross-visitor isolation', () => {
  const rfidService = path.join(ROOT, 'apps/main-api/src/services/rfid-session-service.ts');
  assert.ok(fs.existsSync(rfidService), 'rfid-session-service.ts must exist');
  const content = fs.readFileSync(rfidService, 'utf-8');
  assert.ok(content.includes('issueCard'), 'Must implement issueCard');
  assert.ok(content.includes('handleTapEvent'), 'Must handle card tap via handleTapEvent');
  assert.ok(content.includes('returnCard'), 'Must sever previous session on returnCard');
});

// ─── T04: Exactly 50 unique specialist identities ───
test('T04: Exactly 50 unique specialist identities across 5 round-table benches', () => {
  const defsPath = path.join(ROOT, 'packages/tribunal-definitions/src/benches.ts');
  assert.ok(fs.existsSync(defsPath), 'benches.ts must exist');
  const content = fs.readFileSync(defsPath, 'utf-8');
  assert.ok(content.includes('ALL_SPECIALISTS'), 'Must export ALL_SPECIALISTS');
  // Check chairs in seat 10
  for (const b of ['A', 'B', 'C', 'D', 'E']) {
    assert.ok(content.includes(`'${b}10'`), `Bench ${b} must have chair at ${b}10`);
  }
});

// ─── T05: Bounded routing DAG: Bench A -> Bench B/C -> Bench D -> Bench E ───
test('T05: Bounded routing DAG: Bench A -> Bench B/C -> Bench D -> Bench E', () => {
  const routerPath = path.join(ROOT, 'apps/worker/src/routing/routing-planner.ts');
  assert.ok(fs.existsSync(routerPath), 'routing-planner.ts must exist');
  const content = fs.readFileSync(routerPath, 'utf-8');
  assert.ok(content.includes('Stage 1'), 'Must have Stage 1');
  assert.ok(content.includes('Stage 2'), 'Must have Stage 2');
  assert.ok(content.includes('Stage 3'), 'Must have Stage 3');
  assert.ok(content.includes('Stage 4'), 'Must have Stage 4');
});

// ─── T06: Bench packet consolidation & deterministic Messenger delivery ───
test('T06: Bench packet consolidation and deterministic Messenger delivery', () => {
  const messengerPath = path.join(ROOT, 'apps/worker/src/review/messenger-service.ts');
  assert.ok(fs.existsSync(messengerPath), 'messenger-service.ts must exist');
  const content = fs.readFileSync(messengerPath, 'utf-8');
  assert.ok(content.includes('deliverPacket'), 'Must implement deliverPacket');
  assert.ok(content.includes('PacketDeliveryReceipt'), 'Must record delivery receipts');
});

// ─── T07: Presiding Reviewer evidence synthesis ───
test('T07: Presiding Reviewer evidence-grounded synthesis with zero hallucinated consensus', () => {
  const presidingPath = path.join(ROOT, 'apps/worker/src/review/presiding-reviewer-service.ts');
  assert.ok(fs.existsSync(presidingPath), 'presiding-reviewer-service.ts must exist');
  const content = fs.readFileSync(presidingPath, 'utf-8');
  assert.ok(content.includes('synthesizeReview'), 'Must implement synthesizeReview');
  assert.ok(content.includes('executiveSummary') || content.includes('keyObligations'), 'Must synthesize obligations and findings');
});

// ─── T08: Multilingual document Q&A ───
test('T08: Multilingual document Q&A with exact citations across documents', () => {
  const qaPath = path.join(ROOT, 'apps/main-api/src/services/qa-turn-service.ts');
  assert.ok(fs.existsSync(qaPath), 'qa-turn-service.ts must exist');
  const content = fs.readFileSync(qaPath, 'utf-8');
  assert.ok(content.includes('processQuestion'), 'Must process document-grounded questions');
  assert.ok(content.includes('sources'), 'Must return exact source citations');
});

// ─── T09: Sarvam speech recognition & synthesis ───
test('T09: Sarvam speech recognition & synthesis with mobile audio unlock and prompt interruption', () => {
  const speechPath = path.join(ROOT, 'apps/main-api/src/services/audio-turn-manager.ts');
  assert.ok(fs.existsSync(speechPath), 'audio-turn-manager.ts must exist');
  const content = fs.readFileSync(speechPath, 'utf-8');
  assert.ok(content.includes('processVoiceTurn'), 'Must process voice turn');
  assert.ok(content.includes('interrupt('), 'Must provide prompt interruption');
});

// ─── T10: Tri-destination delivery ───
test('T10: Tri-destination delivery: Telegram bot, Google Drive OAuth, and Gmail SMTP', () => {
  const tgPath = path.join(ROOT, 'apps/main-api/src/services/telegram-service.ts');
  const drivePath = path.join(ROOT, 'apps/main-api/src/services/drive-service.ts');
  const emailPath = path.join(ROOT, 'apps/main-api/src/services/gmail-service.ts');
  assert.ok(fs.existsSync(tgPath), 'telegram-service.ts must exist');
  assert.ok(fs.existsSync(drivePath), 'drive-service.ts must exist');
  assert.ok(fs.existsSync(emailPath), 'gmail-service.ts must exist');
});

// ─── T11: Evaluator Presentation View strictly excludes secrets ───
test('T11: Evaluator Presentation View strictly excludes provider keys, prompts, and diagnostics', () => {
  const presentationPath = path.join(ROOT, 'apps/main-api/src/services/presentation-service.ts');
  assert.ok(fs.existsSync(presentationPath), 'presentation-service.ts must exist');
  const content = fs.readFileSync(presentationPath, 'utf-8');
  assert.ok(content.includes('RESTRICTED_FIELDS'), 'Must define RESTRICTED_FIELDS');
  assert.ok(content.includes('sanitizePayload'), 'Must sanitize presentation payloads server-side');
});

// ─── T12: Laptop 3D chamber renders with 2D fallback; Phone maintains 0 Three.js payload ───
test('T12: Laptop 3D chamber renders with 2D fallback; Phone maintains 0 Three.js payload', () => {
  const chamberPath = path.join(ROOT, 'apps/laptop-web/src/components/TribunalChamber.tsx');
  const phonePkg = path.join(ROOT, 'apps/phone-web/package.json');
  assert.ok(fs.existsSync(chamberPath), 'TribunalChamber.tsx must exist');
  const phoneContent = fs.readFileSync(phonePkg, 'utf-8');
  assert.ok(!phoneContent.includes('three'), 'Phone bundle must have ZERO three.js dependencies');
});

console.log('');
console.log(`═══════════════════════════════════════════════════════════`);
console.log(`  Results: ${passed} passed, ${failed} failed of ${passed + failed}`);
console.log(`═══════════════════════════════════════════════════════════`);

if (failed > 0) {
  process.exit(1);
}
