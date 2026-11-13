import { createApp } from '../app.js';
import { rfidSessionService } from '../services/rfid-session-service.js';
import { HardwareRfidReaderAdapter, SimulatedRfidReaderAdapter } from '@dharmaraksha/shared-contracts';
import http from 'http';

async function runPhase06Verification() {
  console.log('=== DHARMARAKSHA PHASE 06 VERIFICATION SUITE ===\n');
  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(4005, resolve));
  const baseUrl = 'http://localhost:4005/api/v1';

  let allPassed = true;

  try {
    // TEST 1: Unknown card rejected with 404 UNKNOWN_CARD
    console.log('[TEST 1] Unknown RFID card rejection...');
    const unknownRes = await fetch(`${baseUrl}/rfid/tap-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardUid: 'UNKNOWN_99999999', readerSource: 'simulated', isSimulated: true })
    });
    const unknownData = (await unknownRes.json()) as any;

    if (unknownRes.status === 404 && unknownData.error === 'UNKNOWN_CARD') {
      console.log('✔ PASS: Unknown card rejected with 404 UNKNOWN_CARD.\n');
    } else {
      console.error(`❌ FAIL: Expected 404 UNKNOWN_CARD, got ${unknownRes.status}`, unknownData);
      allPassed = false;
    }

    // TEST 2: Revoked card rejected with 403 CARD_REVOKED
    console.log('[TEST 2] Revoked card rejection...');
    const revokedRes = await fetch(`${baseUrl}/rfid/tap-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardUid: 'REV0000000000000', readerSource: 'simulated', isSimulated: true })
    });
    const revokedData = (await revokedRes.json()) as any;

    if (revokedRes.status === 403 && revokedData.error === 'CARD_REVOKED') {
      console.log('✔ PASS: Revoked card rejected with 403 CARD_REVOKED.\n');
    } else {
      console.error(`❌ FAIL: Expected 403 CARD_REVOKED, got ${revokedRes.status}`, revokedData);
      allPassed = false;
    }

    // TEST 3: Expired card rejected with 403 CARD_EXPIRED
    console.log('[TEST 3] Expired card rejection...');
    const expiredRes = await fetch(`${baseUrl}/rfid/tap-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardUid: 'EXP9999999999999', readerSource: 'simulated', isSimulated: true })
    });
    const expiredData = (await expiredRes.json()) as any;

    if (expiredRes.status === 403 && expiredData.error === 'CARD_EXPIRED') {
      console.log('✔ PASS: Expired card rejected with 403 CARD_EXPIRED.\n');
    } else {
      console.error(`❌ FAIL: Expected 403 CARD_EXPIRED, got ${expiredRes.status}`, expiredData);
      allPassed = false;
    }

    // TEST 4: Enrollment and First Tap Activation
    console.log('[TEST 4] Card enrollment, issuance, and tap activation...');
    const testCardUid = `TESTCARD_${Date.now()}`;
    // Step A: Operator enrolls card into unassigned inventory
    rfidSessionService.enrollCard(testCardUid, 'nfc_mifare', 'Automated Verification Card');

    // Step B: Operator issues card to Visitor A
    const issueResult = rfidSessionService.issueCard(testCardUid, 'op-desk-test', 60);
    const visitorASessionToken = issueResult.session.sessionToken;
    const visitorACaseId = issueResult.caseRecord.caseId;

    // Step C: Visitor taps card at kiosk
    const tapRes1 = await fetch(`${baseUrl}/rfid/tap-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardUid: testCardUid, readerSource: 'simulated', isSimulated: true })
    });
    const tapData1 = (await tapRes1.json()) as any;

    if (tapRes1.status === 200 && tapData1.firstTap === true && tapData1.session.activeCaseId === visitorACaseId) {
      console.log('✔ PASS: Card enrolled, issued to Visitor A, and activated on first tap.\n');
    } else {
      console.error('❌ FAIL: First tap activation failed.', tapData1);
      allPassed = false;
    }

    // TEST 5: Repeated taps within 3,000ms debounce window create no duplicate session
    console.log('[TEST 5] Debounce repeated taps within 3,000ms...');
    const tapRes2 = await fetch(`${baseUrl}/rfid/tap-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardUid: testCardUid, readerSource: 'simulated', isSimulated: true })
    });
    const tapData2 = (await tapRes2.json()) as any;

    if (
      tapRes2.status === 200 &&
      tapData2.debounced === true &&
      tapData2.session.sessionId === tapData1.session.sessionId &&
      tapData2.caseId === visitorACaseId
    ) {
      console.log('✔ PASS: Repeated tap within 3000ms debounced: no duplicate session or case created.\n');
    } else {
      console.error('❌ FAIL: Repeated tap was not debounced properly.', tapData2);
      allPassed = false;
    }

    // TEST 6: Return card clears session and purges paired phone session tokens
    console.log('[TEST 6] Return card ends session and revokes phone token access...');
    const returnRes = await fetch(`${baseUrl}/cards/${testCardUid}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorId: 'op-desk-test' })
    });
    const returnData = (await returnRes.json()) as any;

    // Now test that Visitor A's phone session token is immediately rejected by case auth middleware
    const postReturnAccessRes = await fetch(`${baseUrl}/cases/${visitorACaseId}`, {
      headers: { Authorization: `Bearer ${visitorASessionToken}` }
    });

    if (
      returnRes.status === 200 &&
      returnData.state === 'returned_cleared' &&
      postReturnAccessRes.status === 401
    ) {
      console.log('✔ PASS: Card returned to inventory and Visitor A token rejected with 401 INVALID_SESSION.\n');
    } else {
      console.error('❌ FAIL: Return card did not purge session tokens properly.', {
        returnStatus: returnRes.status,
        postReturnAccessStatus: postReturnAccessRes.status
      });
      allPassed = false;
    }

    // TEST 7: Reissuing card reveals NONE of previous visitor's data
    console.log('[TEST 7] Reissuing card creates clean slate with 0% data carryover...');
    const reissueResult = rfidSessionService.issueCard(testCardUid, 'op-desk-test', 60);
    const visitorBSessionToken = reissueResult.session.sessionToken;
    const visitorBCaseId = reissueResult.caseRecord.caseId;

    // Visitor B should have a different caseId and 0 documents, 0 packets
    const visitorBCaseRes = await fetch(`${baseUrl}/cases/${visitorBCaseId}`, {
      headers: { Authorization: `Bearer ${visitorBSessionToken}` }
    });
    const visitorBCaseData = (await visitorBCaseRes.json()) as any;

    // And Visitor B token must NOT be allowed to access Visitor A's previous case
    const visitorBCrossAccessRes = await fetch(`${baseUrl}/cases/${visitorACaseId}`, {
      headers: { Authorization: `Bearer ${visitorBSessionToken}` }
    });

    if (
      visitorBCaseId !== visitorACaseId &&
      visitorBCaseData.documents.length === 0 &&
      Object.keys(visitorBCaseData.benchPackets).length === 0 &&
      visitorBCrossAccessRes.status === 403
    ) {
      console.log('✔ PASS: Reissued card assigned to new clean Case B. Zero prior documents/packets leaked.\n');
    } else {
      console.error('❌ FAIL: Reissued card leaked previous data or failed case isolation.', {
        visitorBCaseId,
        visitorACaseId,
        visitorBCrossStatus: visitorBCrossAccessRes.status
      });
      allPassed = false;
    }

    // TEST 8: Accurate distinction between hardware reader and simulation
    console.log('[TEST 8] Hardware verification vs. simulation distinction...');
    const simAdapter = new SimulatedRfidReaderAdapter();
    const hwAdapter = new HardwareRfidReaderAdapter('/dev/ttyACM0');

    let hwSimRejected = false;
    try {
      await hwAdapter.simulateTap('TEST_HW_UID');
    } catch (_err) {
      hwSimRejected = true;
    }

    const simTap = await simAdapter.simulateTap('TEST_SIM_UID');

    if (
      simAdapter.isPhysical() === false &&
      hwAdapter.isPhysical() === true &&
      hwSimRejected === true &&
      simTap.isSimulated === true &&
      simTap.readerSource === 'simulated'
    ) {
      console.log('✔ PASS: Physical reader and simulation adapter strictly separated; hardware verification accurately distinguished.\n');
    } else {
      console.error('❌ FAIL: Reader adapter distinction failed.');
      allPassed = false;
    }

  } catch (err) {
    console.error('Unexpected error during Phase 06 verification:', err);
    allPassed = false;
  } finally {
    server.close();
  }

  if (allPassed) {
    console.log('🎉 ALL PHASE 06 ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!');
  } else {
    console.error('❌ PHASE 06 VERIFICATION FAILED.');
    process.exit(1);
  }
}

runPhase06Verification()
  .then(() => {
    setTimeout(() => process.exit(0), 100);
  })
  .catch((err) => {
    console.error('Unhandled failure:', err);
    process.exit(1);
  });
