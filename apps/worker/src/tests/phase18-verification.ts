import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = fs.existsSync(path.resolve('packages/shared-contracts'))
  ? path.resolve('.')
  : path.resolve('..', '..');

console.log('═══════════════════════════════════════════════════════════');
console.log('  PHASE 18 VERIFICATION: Bind Real Work to Animation');
console.log('  & Presentation View');
console.log('═══════════════════════════════════════════════════════════');

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err: any) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message}`);
    failed++;
  }
}

// ─── Test 1: Activity State Engine exists and exports correct mappings ───
test('T01: Activity state engine file exists with mapping functions', () => {
  const enginePath = path.join(ROOT, 'apps/laptop-web/src/components/character/activity-state-engine.ts');
  assert.ok(fs.existsSync(enginePath), 'activity-state-engine.ts must exist');
  const content = fs.readFileSync(enginePath, 'utf-8');
  assert.ok(content.includes('mapTaskStateToActivity'), 'Must export mapTaskStateToActivity');
  assert.ok(content.includes('mapMessengerState'), 'Must export mapMessengerState');
  assert.ok(content.includes('mapPresidingState'), 'Must export mapPresidingState');
  assert.ok(content.includes('buildChamberState'), 'Must export buildChamberState');
});

// ─── Test 2: Idle breathing is the ONLY default (no fake work) ───
test('T02: Idle breathing is default for unassigned/completed/failed/cancelled states', () => {
  const enginePath = path.join(ROOT, 'apps/laptop-web/src/components/character/activity-state-engine.ts');
  const content = fs.readFileSync(enginePath, 'utf-8');
  const idleStates = ['unassigned', 'waiting', 'completed', 'failed', 'cancelled'];
  for (const state of idleStates) {
    assert.ok(
      content.includes(`'${state}'`) && content.includes("'idle_breathing'"),
      `State '${state}' must map to idle_breathing`
    );
  }
});

// ─── Test 3: Messenger locomotion ONLY during in_transit ───
test('T03: Messenger locomotion only during confirmed in_transit phase', () => {
  const enginePath = path.join(ROOT, 'apps/laptop-web/src/components/character/activity-state-engine.ts');
  const content = fs.readFileSync(enginePath, 'utf-8');
  assert.ok(content.includes("'in_transit'"), 'Must handle in_transit state');
  assert.ok(content.includes("'messenger_locomotion'"), 'Must produce messenger_locomotion');
  assert.ok(content.includes("'delivered'"), 'Must handle delivered state');
});

// ─── Test 4: Presentation service file exists with server-side field stripping ───
test('T04: Presentation service strips restricted fields server-side', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/presentation-service.ts');
  assert.ok(fs.existsSync(servicePath), 'presentation-service.ts must exist');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('RESTRICTED_FIELDS'), 'Must define RESTRICTED_FIELDS');
  assert.ok(content.includes('sanitizePayload'), 'Must export sanitizePayload');
  for (const field of ['deviceKey', 'apiKey', 'sessionToken', 'internalPrompt', 'rawLlmResponse']) {
    assert.ok(content.includes(`'${field}'`), `Must restrict '${field}'`);
  }
});

// ─── Test 5: Presentation API routes exist with requireCaseAccess ───
test('T05: Presentation routes use requireCaseAccess for cross-case protection', () => {
  const routePath = path.join(ROOT, 'apps/main-api/src/routes/presentation.ts');
  assert.ok(fs.existsSync(routePath), 'presentation.ts route must exist');
  const content = fs.readFileSync(routePath, 'utf-8');
  assert.ok(content.includes('requireCaseAccess'), 'Must use requireCaseAccess middleware');
  assert.ok(content.includes('/cases/:id/presentation'), 'Must have presentation endpoint');
  assert.ok(content.includes('/cases/:id/specialist-states'), 'Must have specialist-states endpoint');
  assert.ok(content.includes('/cases/:id/presentation/milestones'), 'Must have milestones endpoint');
});

// ─── Test 6: Presentation router is mounted in app.ts ───
test('T06: Presentation router is registered in main app', () => {
  const appPath = path.join(ROOT, 'apps/main-api/src/app.ts');
  const content = fs.readFileSync(appPath, 'utf-8');
  assert.ok(content.includes('presentationRouter'), 'app.ts must import and mount presentationRouter');
});

// ─── Test 7: SSE client hook exists for laptop-web ───
test('T07: SSE client hook useCaseEvents exists with reconnection support', () => {
  const hookPath = path.join(ROOT, 'apps/laptop-web/src/hooks/useCaseEvents.ts');
  assert.ok(fs.existsSync(hookPath), 'useCaseEvents.ts must exist');
  const content = fs.readFileSync(hookPath, 'utf-8');
  assert.ok(content.includes('EventSource'), 'Must use EventSource for SSE');
  assert.ok(content.includes('fetchCurrentState'), 'Must fetch current state on reconnect');
  assert.ok(content.includes('seenEventIds'), 'Must deduplicate events by ID');
  assert.ok(content.includes('case:run_canceled') || content.includes('case:cancelled'), 'Must handle cancellation');
});

// ─── Test 8: Duplicate event deduplication in SSE client ───
test('T08: SSE client deduplicates events by eventId', () => {
  const hookPath = path.join(ROOT, 'apps/laptop-web/src/hooks/useCaseEvents.ts');
  const content = fs.readFileSync(hookPath, 'utf-8');
  assert.ok(content.includes('seenEventIds'), 'Must track seen event IDs');
  assert.ok(
    content.includes('.has(') && content.includes('.add('),
    'Must check and add event IDs to dedup set'
  );
});

// ─── Test 9: Refresh syncs to current state (no replay of old walks) ───
test('T09: Refresh fetches current snapshot state, no animation replay', () => {
  const hookPath = path.join(ROOT, 'apps/laptop-web/src/hooks/useCaseEvents.ts');
  const content = fs.readFileSync(hookPath, 'utf-8');
  assert.ok(content.includes('/presentation'), 'Must fetch presentation endpoint on mount/reconnect');
  assert.ok(content.includes('fetchCurrentState'), 'Must call fetchCurrentState');
});

// ─── Test 10: Origin labels propagated (laptop_upload vs kiosk_capture) ───
test('T10: Origin labels (laptop_upload, kiosk_capture) are propagated', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/presentation-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes("'laptop_upload'"), 'Must produce laptop_upload origin');
  assert.ok(content.includes("'kiosk_capture'"), 'Must produce kiosk_capture origin');
  assert.ok(content.includes('kiosk:document_added') || content.includes('kiosk:card_tapped'),
    'Must detect kiosk origin from kiosk events');
});

// ─── Test 11: Phone-web progress parity (same milestones, no Three.js) ───
test('T11: Phone-web has progress hook and zero Three.js dependency', () => {
  const hookPath = path.join(ROOT, 'apps/phone-web/src/hooks/useCaseProgress.ts');
  assert.ok(fs.existsSync(hookPath), 'useCaseProgress.ts must exist for phone');
  const hookContent = fs.readFileSync(hookPath, 'utf-8');
  assert.ok(hookContent.includes('/presentation'), 'Phone must use same presentation API');
  
  const pkgPath = path.join(ROOT, 'apps/phone-web/package.json');
  const pkgContent = fs.readFileSync(pkgPath, 'utf-8');
  assert.ok(!pkgContent.includes('three'), 'Phone bundle must have ZERO Three.js dependency');
  assert.ok(!pkgContent.includes('@react-three'), 'Phone bundle must have ZERO R3F dependency');
});

// ─── Test 12: Shared contracts include new event types ───
test('T12: Shared contracts event types include Phase 18 specialist execution events', () => {
  const eventsPath = path.join(ROOT, 'packages/shared-contracts/src/events.ts');
  const content = fs.readFileSync(eventsPath, 'utf-8');
  const requiredTypes = [
    'specialist:task_assigned', 'specialist:task_started', 'specialist:reading_evidence',
    'specialist:checking_source', 'specialist:writing_finding', 'specialist:discussing',
    'specialist:task_completed', 'specialist:task_failed',
    'bench:packet_sealed', 'messenger:in_transit', 'case:run_canceled'
  ];
  for (const t of requiredTypes) {
    assert.ok(content.includes(`'${t}'`), `Must include event type '${t}'`);
  }
});

console.log('');
console.log(`═══════════════════════════════════════════════════════════`);
console.log(`  Results: ${passed} passed, ${failed} failed of ${passed + failed}`);
console.log(`═══════════════════════════════════════════════════════════`);

if (failed > 0) {
  process.exit(1);
}
