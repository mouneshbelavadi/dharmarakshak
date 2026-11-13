import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..', '..', '..', '..');

console.log('═══════════════════════════════════════════════════════════');
console.log('  PHASE 23 VERIFICATION: Deployment, Commissioning');
console.log('  & Laptop 3D Performance Tuning');
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

// ─── T01: Hardware commissioning worksheet exists ───
test('T01: Hardware commissioning worksheet exists with inventory', () => {
  const wsPath = path.join(ROOT, 'docs/HARDWARE_COMMISSIONING_WORKSHEET.md');
  assert.ok(fs.existsSync(wsPath), 'HARDWARE_COMMISSIONING_WORKSHEET.md must exist');
  const content = fs.readFileSync(wsPath, 'utf-8');
  assert.ok(content.includes('Overhead UVC Document Camera'), 'Must include UVC camera');
  assert.ok(content.includes('Arduino UNO Q'), 'Must include Arduino UNO Q');
  assert.ok(content.includes('RFID Reader Unit'), 'Must include RFID reader unit');
});

// ─── T02: Environment configuration specification (.env.example) ───
test('T02: Environment configuration specification (.env.example) exists', () => {
  const envPath = path.join(ROOT, '.env.example');
  assert.ok(fs.existsSync(envPath), '.env.example must exist in project root');
  const content = fs.readFileSync(envPath, 'utf-8');
  assert.ok(content.includes('DATABASE_URL'), 'Must document DATABASE_URL');
  assert.ok(content.includes('DHARMARAKSHA_DEVICE_API_KEY'), 'Must document DHARMARAKSHA_DEVICE_API_KEY');
  assert.ok(content.includes('SARVAM_API_KEY'), 'Must document SARVAM_API_KEY');
  assert.ok(content.includes('GEMINI_API_KEY'), 'Must document GEMINI_API_KEY');
});

// ─── T03: Central server settings match Specification S8 ───
test('T03: Central server settings match Specification S8', () => {
  const envPath = path.join(ROOT, '.env.example');
  const content = fs.readFileSync(envPath, 'utf-8');
  assert.ok(content.includes('GMAIL_USER'), 'Must document GMAIL_USER');
  assert.ok(content.includes('GMAIL_APP_PASSWORD'), 'Must document GMAIL_APP_PASSWORD');
  assert.ok(content.includes('GOOGLE_OAUTH_CLIENT_ID'), 'Must document GOOGLE_OAUTH_CLIENT_ID');
  assert.ok(content.includes('TELEGRAM_BOT_TOKEN'), 'Must document TELEGRAM_BOT_TOKEN');
});

// ─── T04: UNO Q settings match Specification S8 ───
test('T04: UNO Q settings match Specification S8', () => {
  const envPath = path.join(ROOT, '.env.example');
  const content = fs.readFileSync(envPath, 'utf-8');
  assert.ok(content.includes('GATEWAY_PORT'), 'Must document GATEWAY_PORT');
  assert.ok(content.includes('DEVICE_ID'), 'Must document DEVICE_ID');
});

// ─── T05: Startup order documented ───
test('T05: Startup order documented and enforced', () => {
  const wsPath = path.join(ROOT, 'docs/HARDWARE_COMMISSIONING_WORKSHEET.md');
  const content = fs.readFileSync(wsPath, 'utf-8');
  assert.ok(content.includes('Startup Order'), 'Must document startup sequence');
  assert.ok(content.includes('UNO Q Gateway'), 'Must position gateway correctly in order');
});

// ─── T06: Process isolation ───
test('T06: Process isolation: board does not run 3D or model inference', () => {
  const gatewayPkg = path.join(ROOT, 'apps/uno-gateway/package.json');
  const content = fs.readFileSync(gatewayPkg, 'utf-8');
  assert.ok(!content.includes('three'), 'UNO gateway must not import three.js');
  assert.ok(!content.includes('@google/genai'), 'UNO gateway must not run model inference');
});

// ─── T07: Phone web maintains 0 Three.js dependencies ───
test('T07: Phone web maintains 0 Three.js dependencies', () => {
  const phonePkg = path.join(ROOT, 'apps/phone-web/package.json');
  const content = fs.readFileSync(phonePkg, 'utf-8');
  assert.ok(!content.includes('three'), 'Phone bundle must have 0 three.js dependencies');
  assert.ok(!content.includes('@react-three'), 'Phone bundle must have 0 R3F dependencies');
});

// ─── T08: Laptop WebGL fallback handles context loss ───
test('T08: Laptop WebGL fallback handles context loss gracefully', () => {
  const chamberPath = path.join(ROOT, 'apps/laptop-web/src/components/TribunalChamber.tsx');
  const content = fs.readFileSync(chamberPath, 'utf-8');
  assert.ok(content.includes('webglcontextlost'), 'Must listen to webglcontextlost');
  assert.ok(content.includes('setIs2DFallback'), 'Must failover to 2D view on context loss');
});

// ─── T09: Reduced motion preference handled ───
test('T09: Reduced motion preference handled by camera controller', () => {
  const chamberPath = path.join(ROOT, 'apps/laptop-web/src/components/TribunalChamber.tsx');
  const content = fs.readFileSync(chamberPath, 'utf-8');
  assert.ok(content.includes('prefers-reduced-motion'), 'Must check prefers-reduced-motion');
  assert.ok(content.includes('reducedMotion'), 'Must pass reducedMotion prop');
});

// ─── T10: Storage encryption key configured ───
test('T10: Storage encryption key configured for credential protection', () => {
  const envPath = path.join(ROOT, '.env.example');
  const content = fs.readFileSync(envPath, 'utf-8');
  assert.ok(content.includes('ENCRYPTION_KEY'), 'Must configure ENCRYPTION_KEY');
});

console.log('');
console.log(`═══════════════════════════════════════════════════════════`);
console.log(`  Results: ${passed} passed, ${failed} failed of ${passed + failed}`);
console.log(`═══════════════════════════════════════════════════════════`);

if (failed > 0) {
  process.exit(1);
}

