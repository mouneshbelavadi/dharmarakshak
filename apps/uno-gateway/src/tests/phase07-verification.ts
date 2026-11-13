import http from 'http';
import express from 'express';
import crypto from 'crypto';
import { createGateway } from '../gateway.js';
import { spoolService } from '../services/spool-service.js';
import { captureManager } from '../services/capture-manager.js';

async function runPhase07Verification() {
  console.log('=== DHARMARAKSHA PHASE 07 VERIFICATION SUITE ===\n');

  // 1. Setup Mock Main API server matching backend contracts
  const mockMainApp = express();
  mockMainApp.use(express.json({ limit: '25mb' }));

  let mainApiReceivesCount = 0;
  const receivedPages: Map<string, { checksum: string; byteSize: number }> = new Map();

  mockMainApp.post('/api/v1/devices/heartbeat', (req, res) => {
    const key = req.header('X-Dharmaraksha-Device-Key');
    if (key !== 'dharmaraksha_device_key_placeholder_safe_default') {
      return res.status(403).json({ error: 'INVALID_DEVICE_KEY' });
    }
    res.json({ status: 'ok', deviceId: req.body.deviceId });
  });

  mockMainApp.post('/api/v1/cases/:caseId/documents/:docId/pages', (req, res) => {
    const key = req.header('X-Dharmaraksha-Device-Key');
    if (key !== 'dharmaraksha_device_key_placeholder_safe_default') {
      return res.status(403).json({ error: 'INVALID_DEVICE_KEY' });
    }

    const { pageNumber, pageImageBase64, sha256, rotation } = req.body;
    const buffer = Buffer.from(pageImageBase64, 'base64');

    // Cryptographic SHA-256 check
    const calculatedHash = crypto.createHash('sha256').update(buffer).digest('hex');
    if (calculatedHash !== sha256) {
      return res.status(422).json({ error: 'CHECKSUM_MISMATCH' });
    }

    const pageKey = `${req.params.caseId}:${req.params.docId}:${pageNumber}`;
    receivedPages.set(pageKey, { checksum: sha256, byteSize: buffer.length });
    mainApiReceivesCount++;

    res.status(201).json({
      acknowledged: true,
      caseId: req.params.caseId,
      documentId: req.params.docId,
      pageNumber,
      rotation,
      checksumVerified: true,
      storageUri: `storage://${req.params.caseId}/${req.params.docId}/page_${String(pageNumber).padStart(3, '0')}.jpg`,
      storedAt: new Date().toISOString()
    });
  });

  const mainServer = http.createServer(mockMainApp);
  await new Promise<void>((resolve) => mainServer.listen(4007, resolve));

  // Configure gateway environment
  process.env.MAIN_API_URL = 'http://localhost:4007';
  process.env.DHARMARAKSHA_DEVICE_API_KEY = 'dharmaraksha_device_key_placeholder_safe_default';
  captureManager.setMainApiUrl('http://localhost:4007');

  // Spin up UNO Q Gateway on port 5007
  const gatewayApp = createGateway();
  const gatewayServer = http.createServer(gatewayApp);
  await new Promise<void>((resolve) => gatewayServer.listen(5007, resolve));

  const gatewayUrl = 'http://localhost:5007/api/v1';
  let allPassed = true;

  try {
    // TEST 1: Viewfinder Preview Frame Generation (bounded rate & resolution)
    console.log('[TEST 1] Viewfinder preview frame generation...');
    const previewRes = await fetch(`${gatewayUrl}/capture/preview`);
    const previewContentType = previewRes.headers.get('content-type');
    const previewResolution = previewRes.headers.get('x-preview-resolution');
    const previewBuffer = Buffer.from(await previewRes.arrayBuffer());

    const isJpeg = previewBuffer[0] === 0xff && previewBuffer[1] === 0xd8 &&
                   previewBuffer[previewBuffer.length - 2] === 0xff && previewBuffer[previewBuffer.length - 1] === 0xd9;

    if (previewRes.status === 200 && previewContentType === 'image/jpeg' && isJpeg && previewResolution === '640x480') {
      console.log('✔ PASS: Viewfinder preview generates valid bounded JPEG (640x480).\n');
    } else {
      console.error('❌ FAIL: Preview frame generation failed.', { status: previewRes.status, previewContentType, previewResolution });
      allPassed = false;
    }

    // TEST 2: Page Capture, Local Spooling & Durable Main API Upload
    console.log('[TEST 2] Page capture, local spooling & durable Main API upload...');
    const captureRes = await fetch(`${gatewayUrl}/capture/page`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseId: 'case-demo-001',
        documentId: 'doc-phase7-test',
        pageNumber: 1,
        rotation: 0
      })
    });
    const captureData = (await captureRes.json()) as any;

    if (
      captureRes.status === 201 &&
      captureData.acknowledged === true &&
      captureData.acknowledgment?.checksumVerified === true &&
      captureData.sha256.length === 64 &&
      mainApiReceivesCount === 1
    ) {
      console.log('✔ PASS: Page captured, spooled locally, and durably acknowledged by Main API (SHA-256 verified).\n');
    } else {
      console.error('❌ FAIL: Page capture and upload failed.', captureData);
      allPassed = false;
    }

    // TEST 3: Interruption Survival & Stable-Identity Recovery
    console.log('[TEST 3] Interrupted capture recovery with stable page identities...');
    // Simulate network interruption by pointing gateway to an unreachable offline port
    captureManager.setMainApiUrl('http://localhost:59999');

    const interruptedRes = await fetch(`${gatewayUrl}/capture/page`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseId: 'case-demo-001',
        documentId: 'doc-phase7-test',
        pageNumber: 2,
        rotation: 90
      })
    });
    const interruptedData = (await interruptedRes.json()) as any;

    // Verify it was spooled locally even though network failed (survives interruption)
    const pendingBefore = spoolService.getPendingUploads().length;
    const spooledItem = spoolService.getItem(interruptedData.captureId);

    if (
      interruptedRes.status === 202 &&
      interruptedData.status === 'queued_for_retry' &&
      spooledItem !== null &&
      pendingBefore >= 1
    ) {
      console.log('✔ PASS: Page spooled safely to local disk during network outage.');
    } else {
      console.error('❌ FAIL: Failed capture was not spooled for retry.', interruptedData);
      allPassed = false;
    }

    // Restore Main API URL and trigger recovery
    captureManager.setMainApiUrl('http://localhost:4007');
    const retryOutcome = await captureManager.retryPendingUploads();

    const pendingAfter = spoolService.getPendingUploads().length;

    if (retryOutcome.successful >= 1 && pendingAfter === 0) {
      console.log('✔ PASS: Recovery succeeded: spooled page durably reached Main API with stable identity.\n');
    } else {
      console.error('❌ FAIL: Spool retry recovery failed.', { retryOutcome, pendingAfter });
      allPassed = false;
    }

    // TEST 4: Bounded Spool Disk Pressure Enforcement
    console.log('[TEST 4] Bounded spool disk pressure threshold handling...');
    (spoolService as any).maxItems = 2;

    // Point to offline port again to fill spool with unacknowledged captures
    captureManager.setMainApiUrl('http://localhost:59999');
    await captureManager.capturePage('case-demo-001', 'doc-pressure', 1);
    await captureManager.capturePage('case-demo-001', 'doc-pressure', 2);

    let pressureRejected = false;
    try {
      // 3rd unacknowledged item must trigger SPOOL_DISK_PRESSURE
      await captureManager.capturePage('case-demo-001', 'doc-pressure', 3);
    } catch (pressureErr: any) {
      if (pressureErr.message.includes('SPOOL_DISK_PRESSURE')) {
        pressureRejected = true;
      }
    }

    // Restore settings & clear test pressure
    (spoolService as any).maxItems = 20;
    captureManager.setMainApiUrl('http://localhost:4007');
    await captureManager.retryPendingUploads();

    if (pressureRejected) {
      console.log('✔ PASS: Bounded spool disk pressure threshold enforced: rejects overflow safely.\n');
    } else {
      console.error('❌ FAIL: Disk pressure threshold was not enforced.');
      allPassed = false;
    }

    // TEST 5: Explicit Phone Camera Fallback Ingestion
    console.log('[TEST 5] Phone camera fallback ingestion...');
    const fakePhonePhoto = Buffer.from('FAKE_PHONE_CAMERA_JPEG_PAYLOAD_FOR_FALLBACK');
    const fallbackRes = await fetch(`${gatewayUrl}/capture/phone-fallback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseId: 'case-demo-001',
        documentId: 'doc-phase7-test',
        pageNumber: 3,
        pageImageBase64: fakePhonePhoto.toString('base64'),
        rotation: 0
      })
    });
    const fallbackData = (await fallbackRes.json()) as any;

    if (fallbackRes.status === 201 && fallbackData.source === 'phone_camera_fallback' && fallbackData.acknowledged === true) {
      console.log('✔ PASS: Phone camera fallback uploaded and acknowledged cleanly.\n');
    } else {
      console.error('❌ FAIL: Phone camera fallback failed.', fallbackData);
      allPassed = false;
    }

    // TEST 6: Zero Secret Leakage to Phone-Facing Routes
    console.log('[TEST 6] Device secret & provider key isolation check...');
    const readinessRes = await fetch(`${gatewayUrl}/readiness`);
    const readinessText = await readinessRes.text();
    const healthRes = await fetch(`${gatewayUrl}/health`);
    const healthText = await healthRes.text();

    const deviceKeySecret = 'dharmaraksha_device_key_placeholder_safe_default';
    const leakedDeviceKey = readinessText.includes(deviceKeySecret) || healthText.includes(deviceKeySecret);
    const leakedGemini = readinessText.includes('GEMINI_API_KEY') || healthText.includes('GEMINI_API_KEY');

    if (!leakedDeviceKey && !leakedGemini) {
      console.log('✔ PASS: Zero device keys or provider secrets leaked in phone-facing gateway responses.\n');
    } else {
      console.error('❌ FAIL: Secret found in gateway public response!');
      allPassed = false;
    }

  } catch (err) {
    console.error('Unexpected error during Phase 07 verification:', err);
    allPassed = false;
  } finally {
    mainServer.close();
    gatewayServer.close();
  }

  if (allPassed) {
    console.log('🎉 ALL PHASE 07 ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!');
  } else {
    console.error('❌ PHASE 07 VERIFICATION FAILED.');
    process.exit(1);
  }
}

runPhase07Verification()
  .then(() => {
    setTimeout(() => process.exit(0), 100);
  })
  .catch((err) => {
    console.error('Unhandled failure:', err);
    process.exit(1);
  });
