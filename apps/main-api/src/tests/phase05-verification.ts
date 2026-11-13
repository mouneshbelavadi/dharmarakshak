import { createApp } from '../app.js';
import { storageService, StorageService } from '../storage/storage-service.js';
import { eventLedger } from '../events/event-ledger.js';
import http from 'http';
import fs from 'fs';

async function runPhase05Verification() {
  console.log('=== DHARMARAKSHA PHASE 05 VERIFICATION SUITE ===\n');
  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(4003, resolve));
  const baseUrl = 'http://localhost:4003/api/v1';

  let allPassed = true;

  try {
    // TEST 1: Real Data Survives Restart
    console.log('[TEST 1] Persistence across simulated restart...');
    const testBuffer = Buffer.from('VERIFICATION_DOCUMENT_CONTENT_PAGE_1');
    await storageService.storePageStill('case-demo-001', 'doc-test', 1, testBuffer);
    
    // Simulate restart by creating fresh StorageService instance pointing to same dir
    const freshStorageInstance = new StorageService();
    const storedPath = freshStorageInstance.getPagePath('case-demo-001', 'doc-test', 1);
    const fileExists = storedPath !== null && fs.existsSync(storedPath);
    const readContent = fileExists ? fs.readFileSync(storedPath, 'utf8') : '';

    if (fileExists && readContent === 'VERIFICATION_DOCUMENT_CONTENT_PAGE_1') {
      console.log('✔ PASS: Page data persisted to disk and survived service re-instantiation.\n');
    } else {
      console.error('❌ FAIL: Data did not persist across re-instantiation.\n');
      allPassed = false;
    }

    // TEST 2: Duplicate Submission Remains One Logical Operation (Idempotency)
    console.log('[TEST 2] Idempotency & duplicate submission deduplication...');
    const idemKey = `idem-test-${Date.now()}`;
    const submitRes1 = await fetch(`${baseUrl}/cases/case-demo-001/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idemKey,
        'Authorization': 'Bearer tok-visitor-001'
      },
      body: JSON.stringify({ reason: 'Initial submission' })
    });
    const data1 = (await submitRes1.json()) as any;

    const submitRes2 = await fetch(`${baseUrl}/cases/case-demo-001/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idemKey,
        'Authorization': 'Bearer tok-visitor-001'
      },
      body: JSON.stringify({ reason: 'Initial submission' })
    });
    const data2 = (await submitRes2.json()) as any;

    if (data1.success && data2._idempotentReplay === true && data1.eventCursor === data2.eventCursor) {
      console.log('✔ PASS: Duplicate submission detected; returned cached result with _idempotentReplay: true.\n');
    } else {
      console.error(`❌ FAIL: Duplicate submission created conflicting state. data1: ${JSON.stringify(data1)}, data2: ${JSON.stringify(data2)}\n`);
      allPassed = false;
    }

    // TEST 3: Unauthorized Cross-Case Access Denied
    console.log('[TEST 3] Security boundary & cross-case access isolation...');
    // Visitor 1 owns case-demo-001. Attempting to access case-demo-002:
    const crossCaseRes = await fetch(`${baseUrl}/cases/case-demo-002`, {
      headers: {
        'Authorization': 'Bearer tok-visitor-001'
      }
    });
    const crossCaseData = (await crossCaseRes.json()) as any;

    if (crossCaseRes.status === 403 && crossCaseData.error === 'CROSS_CASE_ACCESS_DENIED') {
      console.log('✔ PASS: Unauthorized cross-case access rejected with 403 CROSS_CASE_ACCESS_DENIED.\n');
    } else {
      console.error(`❌ FAIL: Expected 403, got ${crossCaseRes.status}.\n`);
      allPassed = false;
    }

    // TEST 4: Monotonic Event Replay
    console.log('[TEST 4] Event ledger monotonicity & reconnect replay...');
    const currentCursor = eventLedger.getCurrentCursor();
    await eventLedger.commitEventAtomically('case-demo-001', 1, 'case:status_transitioned', { step: 'test-event-A' });
    await eventLedger.commitEventAtomically('case-demo-001', 1, 'case:status_transitioned', { step: 'test-event-B' });

    const replayRes = await fetch(`${baseUrl}/cases/case-demo-001/events/history?afterCursor=${currentCursor}`, {
      headers: { 'Authorization': 'Bearer tok-visitor-001' }
    });
    const replayData = (await replayRes.json()) as any;

    if (replayData.eventsCount === 2 && replayData.events[0].cursor > currentCursor) {
      console.log(`✔ PASS: Replayed ${replayData.eventsCount} events strictly after cursor ${currentCursor}.\n`);
    } else {
      console.error('❌ FAIL: Event replay failed.\n');
      allPassed = false;
    }

    // TEST 5: Cancellation State Transition
    console.log('[TEST 5] Case review cancellation protocol...');
    const cancelRes = await fetch(`${baseUrl}/cases/case-demo-001/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer tok-visitor-001'
      },
      body: JSON.stringify({ reason: 'Visitor requested cancellation' })
    });
    const cancelData = (await cancelRes.json()) as any;

    if (cancelData.success && cancelData.case.status === 'cancelled') {
      console.log('✔ PASS: Case successfully transitioned to "cancelled" state.\n');
    } else {
      console.error('❌ FAIL: Cancellation failed.\n');
      allPassed = false;
    }

    // TEST 6: Scoped Device Key Authentication & Revocation
    console.log('[TEST 6] Device key authentication & instant revocation...');
    const heartbeatRes1 = await fetch(`${baseUrl}/devices/heartbeat`, {
      method: 'POST',
      headers: {
        'X-Dharmaraksha-Device-Key': 'dharmaraksha_device_key_placeholder_safe_default'
      }
    });

    // Revoke the key
    await fetch(`${baseUrl}/devices/uno-q-kiosk-01/revoke`, { method: 'POST' });

    // Attempt heartbeat after revocation
    const heartbeatRes2 = await fetch(`${baseUrl}/devices/heartbeat`, {
      method: 'POST',
      headers: {
        'X-Dharmaraksha-Device-Key': 'dharmaraksha_device_key_placeholder_safe_default'
      }
    });
    const heartbeatData2 = (await heartbeatRes2.json()) as any;

    if (heartbeatRes1.status === 200 && heartbeatRes2.status === 403 && heartbeatData2.error === 'DEVICE_KEY_REVOKED') {
      console.log('✔ PASS: Device key initially accepted, then rejected with 403 DEVICE_KEY_REVOKED after revocation.\n');
    } else {
      console.error('❌ FAIL: Revocation check failed.\n');
      allPassed = false;
    }

    if (allPassed) {
      console.log('🎉 ALL PHASE 05 ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!');
    }
  } finally {
    server.close();
  }
}

runPhase05Verification()
  .then(() => {
    setTimeout(() => process.exit(0), 100);
  })
  .catch((err) => {
    console.error('Test error:', err);
    process.exit(1);
  });
