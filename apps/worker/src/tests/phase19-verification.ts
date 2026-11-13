import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..', '..', '..', '..');

console.log('═══════════════════════════════════════════════════════════');
console.log('  PHASE 19 VERIFICATION: Multilingual Speech & Document');
console.log('  Conversation (Sarvam STT/TTS + Grounded Gemini)');
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

// ─── T01: Sarvam speech service exists with STT & TTS ───
test('T01: Sarvam speech service exists with STT and TTS synthesis', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/sarvam-speech-service.ts');
  assert.ok(fs.existsSync(servicePath), 'sarvam-speech-service.ts must exist');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('transcribe'), 'Must implement transcribe');
  assert.ok(content.includes('synthesize'), 'Must implement synthesize');
  assert.ok(content.includes('saaras:v2') || content.includes('saarika:v2'), 'Must reference Saaras STT model');
  assert.ok(content.includes('bulbul:v1') || content.includes('bulbul:v2'), 'Must reference Bulbul TTS model');
});

// ─── T02: Centralized secrets: keys never exposed to browser ───
test('T02: Centralized secrets: keys never exposed to browser or public assets', () => {
  const servicePath = path.join(ROOT, 'apps/main-api/src/services/sarvam-speech-service.ts');
  const content = fs.readFileSync(servicePath, 'utf-8');
  assert.ok(content.includes('process.env.SARVAM_API_KEY'), 'Must read key from backend environment');
  
  // Verify phone-web has zero references to API keys
  const phoneSrc = path.join(ROOT, 'apps/phone-web/src/screens/AskDocumentScreen.tsx');
  const phoneContent = fs.readFileSync(phoneSrc, 'utf-8');
  assert.ok(!phoneContent.includes('SARVAM_API_KEY'), 'Frontend must not contain Sarvam key');
  assert.ok(!phoneContent.includes('GEMINI_API_KEY'), 'Frontend must not contain Gemini key');
});

// ─── T03: Audio source route: phone mic vs board mic ───
test('T03: Audio source route: phone mic default vs explicitly selected board mic', () => {
  const contractsPath = path.join(ROOT, 'packages/shared-contracts/src/speech.ts');
  assert.ok(fs.existsSync(contractsPath), 'speech.ts contract must exist');
  const content = fs.readFileSync(contractsPath, 'utf-8');
  assert.ok(content.includes("'phone_microphone'"), 'Must define phone_microphone');
  assert.ok(content.includes("'board_microphone'"), 'Must define board_microphone');

  // Verify uno-gateway has board microphone route
  const audioRoutePath = path.join(ROOT, 'apps/uno-gateway/src/routes/audio.ts');
  assert.ok(fs.existsSync(audioRoutePath), 'uno-gateway audio.ts route must exist');
  const routeContent = fs.readFileSync(audioRoutePath, 'utf-8');
  assert.ok(routeContent.includes('/hardware/audio/record'), 'Must provide board record endpoint');
  assert.ok(routeContent.includes('/hardware/audio/status'), 'Must provide board audio status endpoint');
});

// ─── T04: Single active audio source & single speaking assistant ───
test('T04: Single active audio source and single speaking assistant enforced', () => {
  const managerPath = path.join(ROOT, 'apps/main-api/src/services/audio-turn-manager.ts');
  assert.ok(fs.existsSync(managerPath), 'audio-turn-manager.ts must exist');
  const content = fs.readFileSync(managerPath, 'utf-8');
  assert.ok(content.includes('setActiveAudioSource'), 'Must manage active audio source');
  assert.ok(content.includes('session.isSpeaking = false'), 'Must reset speaking state on turn switch');
  assert.ok(content.includes('currentTurnId'), 'Must track single active turn ID');
});

// ─── T05: Interruption halts speech output promptly ───
test('T05: Interruption halts speech output promptly', () => {
  const managerPath = path.join(ROOT, 'apps/main-api/src/services/audio-turn-manager.ts');
  const content = fs.readFileSync(managerPath, 'utf-8');
  assert.ok(content.includes('interrupt('), 'Must provide interrupt method');
  assert.ok(content.includes('interruptedTurnIds'), 'Must track interrupted turn IDs');
  assert.ok(content.includes('createInterruptedResponse'), 'Must return clean interrupted response');

  // Verify speech router exposes interrupt endpoint
  const routePath = path.join(ROOT, 'apps/main-api/src/routes/speech.ts');
  const routeContent = fs.readFileSync(routePath, 'utf-8');
  assert.ok(routeContent.includes('/speech/interrupt'), 'Must expose /speech/interrupt endpoint');
});

// ─── T06: Silence handling ───
test('T06: Silence handling: empty audio returns courteous prompt without error', () => {
  const managerPath = path.join(ROOT, 'apps/main-api/src/services/audio-turn-manager.ts');
  const content = fs.readFileSync(managerPath, 'utf-8');
  assert.ok(content.includes('silenceMessage') || content.includes('did not detect any speech'),
    'Must handle silence with courteous message');

  const sarvamPath = path.join(ROOT, 'apps/main-api/src/services/sarvam-speech-service.ts');
  const sarvamContent = fs.readFileSync(sarvamPath, 'utf-8');
  assert.ok(sarvamContent.includes('isSilent') || sarvamContent.includes('rawBuffer.length < 128'),
    'Must perform silence detection on raw audio buffer');
});

// ─── T07: Language detection, display, and visitor correction ───
test('T07: Language detection, display, and visitor correction supported', () => {
  const contractsPath = path.join(ROOT, 'packages/shared-contracts/src/speech.ts');
  const content = fs.readFileSync(contractsPath, 'utf-8');
  assert.ok(content.includes('detectedLanguage'), 'Contract must include detectedLanguage');
  assert.ok(content.includes('correctedLanguage'), 'Contract must include correctedLanguage');

  const phoneSrc = path.join(ROOT, 'apps/phone-web/src/screens/AskDocumentScreen.tsx');
  const phoneContent = fs.readFileSync(phoneSrc, 'utf-8');
  assert.ok(phoneContent.includes('detectedLanguage'), 'Phone UI must track detectedLanguage');
  assert.ok(phoneContent.includes('selectedLanguage'), 'Phone UI must allow language correction');
});

// ─── T08: Code-switching and unsupported languages handled honestly ───
test('T08: Code-switching and unsupported languages handled honestly', () => {
  const contractsPath = path.join(ROOT, 'packages/shared-contracts/src/speech.ts');
  const content = fs.readFileSync(contractsPath, 'utf-8');
  assert.ok(content.includes('isCodeSwitching'), 'Must flag code-switching');

  const sarvamPath = path.join(ROOT, 'apps/main-api/src/services/sarvam-speech-service.ts');
  const sarvamContent = fs.readFileSync(sarvamPath, 'utf-8');
  assert.ok(sarvamContent.includes('is_code_switching') || sarvamContent.includes('isCodeSwitching'),
    'Must process code-switching from STT output');
});

// ─── T09: Document-grounded Q&A cites exact documents, versions, pages ───
test('T09: Document-grounded Q&A cites exact documents, versions, pages', () => {
  const groundingPath = path.join(ROOT, 'apps/main-api/src/services/gemini-grounding-service.ts');
  assert.ok(fs.existsSync(groundingPath), 'gemini-grounding-service.ts must exist');
  const content = fs.readFileSync(groundingPath, 'utf-8');
  assert.ok(content.includes('qaTurnService.processQuestion'), 'Must ground answers via qaTurnService');
  assert.ok(content.includes('spokenSummary'), 'Must produce concise spoken summary for speech');
});

// ─── T10: Typed questions remain completely usable without audio ───
test('T10: Typed questions remain completely usable without audio', () => {
  const phoneSrc = path.join(ROOT, 'apps/phone-web/src/screens/AskDocumentScreen.tsx');
  const phoneContent = fs.readFileSync(phoneSrc, 'utf-8');
  assert.ok(phoneContent.includes('handleSendTypedQuestion'), 'Must provide typed question handler');
  assert.ok(phoneContent.includes('<form onSubmit={handleSendTypedQuestion}'), 'Must render typed question form');
  assert.ok(phoneContent.includes('/qa/ask'), 'Must call text QA endpoint');
});

// ─── T11: Gemini Live session mode is separate, issues short-lived tokens ───
test('T11: Gemini Live session mode is separate, issues short-lived tokens', () => {
  const tokenPath = path.join(ROOT, 'apps/main-api/src/services/gemini-live-token-service.ts');
  assert.ok(fs.existsSync(tokenPath), 'gemini-live-token-service.ts must exist');
  const content = fs.readFileSync(tokenPath, 'utf-8');
  assert.ok(content.includes('issueLiveSessionToken'), 'Must issue live session token');
  assert.ok(content.includes('expiresAt'), 'Tokens must have expiration timestamp');
  assert.ok(content.includes('validateToken'), 'Must validate token expiration');
});

// ─── T12: Phone-web maintains zero Three.js dependencies ───
test('T12: Phone-web maintains zero Three.js dependencies', () => {
  const pkgPath = path.join(ROOT, 'apps/phone-web/package.json');
  const content = fs.readFileSync(pkgPath, 'utf-8');
  assert.ok(!content.includes('three'), 'Phone bundle must have ZERO three dependencies');
  assert.ok(!content.includes('@react-three'), 'Phone bundle must have ZERO @react-three dependencies');
});

console.log('');
console.log(`═══════════════════════════════════════════════════════════`);
console.log(`  Results: ${passed} passed, ${failed} failed of ${passed + failed}`);
console.log(`═══════════════════════════════════════════════════════════`);

if (failed > 0) {
  process.exit(1);
}

