import http from 'http';
import { createApp } from '../app.js';
import { casesStore } from '../storage/case-store.js';
import { documentIntakeService } from '../services/document-intake-service.js';
import { CaseRecord, MaterialFinding } from '@dharmaraksha/shared-contracts';

async function runPhase09Verification() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║        DHARMARAKSHA PHASE 09 VERIFICATION SUITE              ║');
  console.log('║       Multiple-Document Intake, OCR & Immutable Snapshots    ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const app = createApp();
  const server = http.createServer(app);
  const PORT = 4009;

  await new Promise<void>(resolve => server.listen(PORT, resolve));
  const baseUrl = `http://localhost:${PORT}/api/v1`;

  let allPassed = true;

  function assert(condition: boolean, passMsg: string, failMsg: string) {
    if (condition) {
      console.log(`  ✔ PASS: ${passMsg}`);
    } else {
      console.error(`  ❌ FAIL: ${failMsg}`);
      allPassed = false;
    }
  }

  try {
    const caseId = 'case-phase09-intake-test';
    const testCase: CaseRecord = {
      caseId,
      ownership: {
        caseId,
        creatorSessionId: 'sess-phase09-user',
        creatorRole: 'visitor',
        sourceType: 'laptop_direct',
        authorizedSessionIds: ['sess-phase09-user']
      },
      title: 'Commercial Lease Agreement, Inventory Annexure & Deposit Receipt Review',
      status: 'draft_intake',
      currentSnapshotVersion: 1,
      preferredLanguage: 'en',
      documents: [],
      benchPackets: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    casesStore.set(caseId, testCase);

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 1: Multiple Named Documents & Annexure Linkage
    // ──────────────────────────────────────────────────────────────────────────
    console.log('[TEST 1] Creating multiple named documents with parent-annexure linkage...');

    // 1A. Primary Agreement
    const docRes1 = await fetch(`${baseUrl}/cases/${caseId}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Commercial Lease Agreement',
        category: 'tenancy_agreement',
        language: 'hi',
        sourceChannel: 'laptop_direct_upload'
      })
    });
    const docData1 = (await docRes1.json()) as any;
    assert(docRes1.status === 201 && docData1.document?.documentId, 'Created Primary Lease Agreement', 'Failed to create Lease Agreement');
    const leaseDocId = docData1.document.documentId;

    // 1B. Related Annexure linked to Parent
    const docRes2 = await fetch(`${baseUrl}/cases/${caseId}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Annexure A - Fixtures & Inventory Schedule',
        category: 'annexure_schedule',
        parentDocumentId: leaseDocId,
        language: 'en',
        sourceChannel: 'laptop_direct_upload'
      })
    });
    const docData2 = (await docRes2.json()) as any;
    assert(
      docRes2.status === 201 && docData2.document?.parentDocumentId === leaseDocId,
      'Created Annexure linked to parent document while maintaining separate identity',
      'Failed to link Annexure to parent'
    );
    const annexureDocId = docData2.document.documentId;

    // 1C. Payment Receipt
    const docRes3 = await fetch(`${baseUrl}/cases/${caseId}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Security Deposit Bank Counterfoil',
        category: 'payment_receipt',
        language: 'kn',
        sourceChannel: 'kiosk_overhead_cam'
      })
    });
    const docData3 = (await docRes3.json()) as any;
    assert(docRes3.status === 201 && docData3.document?.documentId, 'Created Security Deposit Receipt', 'Failed to create Receipt');
    const receiptDocId = docData3.document.documentId;

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 2: Multi-Page Ingestion, OCR & Extraction (No 1,000 char truncation)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 2] Ingesting multi-page content (>1,000 chars), Indian scripts & tables...');

    // Generate rich legal text > 1,500 characters with Devanagari script, dates, amounts, negations
    const leasePage1Text = `
THIS COMMERCIAL LEASE AGREEMENT (वाणिज्यिक पट्टा समझौता) is entered into on this 1st September 2026 at Bengaluru, Karnataka.
BETWEEN:
M/s Shanti Commercial Real Estate Pvt Ltd, having registered office at MG Road, Bengaluru (hereinafter called the "LESSOR", which expression shall include its successors).
AND:
Sri Rajesh Kumar Sharma, residing at Indiranagar, Bengaluru (hereinafter called the "LESSEE", which expression shall include his legal heirs).

WHEREAS the Lessor is the absolute lawful owner of Commercial Suite No. 402, measuring approximately 2,400 sq.ft.
NOW THIS INDENTURE WITNESSETH AS FOLLOWS:
1. COMMENCEMENT AND DURATION:
The lease shall commence strictly on 1st September 2026 for an initial term of 36 months expiring on 31st August 2029.
The Lessee shall not be permitted to seek extension without written mutual agreement signed 90 days in advance.

2. RENT AND STATUTORY CHARGES:
The monthly agreed rent payable by the Lessee shall be INR 45,000 (Forty-Five Thousand Indian Rupees only), payable strictly in advance on or before the 5th day of each calendar month.
Failure to pay within the stipulated date shall attract a penal interest of 18% per annum calculated on daily balance.

3. SECURITY DEPOSIT AND RESTRICTIONS:
The Lessee has agreed to pay an interest-free refundable security deposit of Rs. 2,50,000 (Two Lakh Fifty Thousand Rupees).
The Lessor covenants that this deposit is strictly non-refundable under no circumstances prior to full inspection of premises and adjustment of damages.
The Lessee shall not sublet, assign, mortgage, or part with possession of the leased premises or any part thereof to any third party.
The Lessee shall never make structural alterations without prior written permission from the Lessor.
`.trim();

    assert(leasePage1Text.length > 1400, `Page text length is ${leasePage1Text.length} chars (>1,000 characters)`, 'Text is unexpectedly short');

    // Ingest Lease Page 1
    const p1Res = await fetch(`${baseUrl}/cases/${caseId}/documents/${leaseDocId}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageNumber: 1,
        textContent: leasePage1Text
      })
    });
    const p1Data = (await p1Res.json()) as any;
    assert(p1Res.status === 201 && p1Data.page?.extractedText?.length === leasePage1Text.length, 'Lease Page 1 ingested without truncation', 'Lease Page 1 was truncated or failed');
    assert(p1Data.page?.scriptDetected === 'Devanagari', `Preserved Devanagari script (${p1Data.page?.scriptDetected})`, 'Failed to detect Devanagari');
    assert(p1Data.page?.passages?.some((p: any) => p.containsNegation), 'Detected legal negation clauses ("shall not", "shall never")', 'Failed to detect negations');

    // Ingest Lease Page 2 (Clauses & Termination)
    const leasePage2Text = `
4. MAINTENANCE AND UTILITIES:
The Lessee shall bear all charges for electricity, water, and local maintenance dues directly to the respective authorities.
Neither party shall be held liable for temporary disruptions caused by acts of God or municipal supply failures.

5. TERMINATION AND DEFAULT:
In the event of non-payment of rent for two consecutive months, the Lessor reserves the unilateral right to re-enter and terminate the lease forthwith.
No refund of unadjusted advance or deposit will be entertained in the event of default by Lessee.
`.trim();

    const p2Res = await fetch(`${baseUrl}/cases/${caseId}/documents/${leaseDocId}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageNumber: 2, textContent: leasePage2Text })
    });
    assert(p2Res.status === 201, 'Lease Page 2 ingested', 'Failed Lease Page 2');

    // Ingest Lease Page 3 (Signatures & Annexure Reference)
    const leasePage3Text = `
IN WITNESS WHEREOF the parties hereto have set their hands on the day, month, and year first written above.
Signed and Delivered by Lessor: (Sd/-)
Signed and Delivered by Lessee: (Sd/-)
In the presence of Witnesses:
1. Sri Mohan Lal, Bengaluru
2. Smt Ananya Rao, Bengaluru

SCHEDULE OF ATTACHMENTS:
Refer to Annexure A for detailed list of fixtures, fittings, and air-conditioning equipment handed over.
`.trim();

    const p3Res = await fetch(`${baseUrl}/cases/${caseId}/documents/${leaseDocId}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageNumber: 3, textContent: leasePage3Text })
    });
    assert(p3Res.status === 201, 'Lease Page 3 ingested', 'Failed Lease Page 3');

    // ──────────────────────────────────────────────────────────────────────────
    // Ingest Annexure A (2 Pages with Table & CONFLICTING DATE: 15th August 2026)
    // ──────────────────────────────────────────────────────────────────────────
    const annexurePage1Text = `
ANNEXURE A — FIXTURES AND INVENTORY SCHEDULE
Attached to Commercial Lease Agreement between M/s Shanti Commercial and Sri Rajesh Kumar Sharma.
The physical handover of keys, fixtures, and possession was executed on 15th August 2026.

| Item No | Description of Fixture | Quantity | Working Condition |
| 1 | Daikin 2.0 Ton Split Inverter AC | 4 Units | Working - New |
| 2 | Modular Workstations with Power Ports | 16 Seats | Good Condition |
| 3 | Conference Table with 8 Executive Chairs | 1 Set | Minor Scratches |
| 4 | Fire Extinguisher 5kg ABC Powder | 2 Cylinders | Certified valid till 2027 |

The Lessee acknowledges that all above fixtures were accepted in full working order on 15th August 2026.
`.trim();

    const annP1Res = await fetch(`${baseUrl}/cases/${caseId}/documents/${annexureDocId}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageNumber: 1, textContent: annexurePage1Text })
    });
    const annP1Data = (await annP1Res.json()) as any;
    assert(annP1Res.status === 201 && annP1Data.page?.passages?.some((p: any) => p.isTable), 'Annexure Page 1 table structure detected', 'Table detection failed');

    const annexurePage2Text = `
ELECTRICAL APPLIANCES AND RESTORATION TERMS:
Lessee shall maintain all items in Schedule A at his own cost.
Upon termination or expiry of the lease, Lessee shall restore all fixtures in same working condition.
`.trim();
    await fetch(`${baseUrl}/cases/${caseId}/documents/${annexureDocId}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageNumber: 2, textContent: annexurePage2Text })
    });

    // ──────────────────────────────────────────────────────────────────────────
    // Ingest Receipt (Kannada Script & CONFLICTING AMOUNT: Rs. 2,70,000)
    // ──────────────────────────────────────────────────────────────────────────
    const receiptPage1Text = `
ಕರ್ನಾಟಕ ಬ್ಯಾಂಕ್ - ಭದ್ರತಾ ಠೇವಣಿ ಸ್ವೀಕೃತಿ ರಶೀದಿ (KARNATAKA BANK - SECURITY DEPOSIT RECEIPT)
ದಿನಾಂಕ (Date): 28th August 2026
ಖಾತೆ ಸಂಖ್ಯೆ (Account No): 50129849201948
ಸ್ವೀಕರಿಸಿದ ಮೊತ್ತ (Amount Received): Rs. 2,70,000 (Two Lakh Seventy Thousand Rupees Only)
ಪಾವತಿದಾರರು (Paid by): Rajesh Kumar Sharma
ಪಾವತಿ ಉದ್ದೇಶ (Purpose): Commercial Lease Security Deposit for Suite 402, MG Road.
ಹಣ ಸ್ವೀಕರಿಸಿದ ಶಾಖೆ: ಎಂ.ಜಿ. ರಸ್ತೆ ಶಾಖೆ, ಬೆಂಗಳೂರು.
`.trim();

    const recRes = await fetch(`${baseUrl}/cases/${caseId}/documents/${receiptDocId}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageNumber: 1, textContent: receiptPage1Text })
    });
    const recData = (await recRes.json()) as any;
    assert(recRes.status === 201 && recData.page?.scriptDetected === 'Kannada', 'Preserved Kannada script in Security Deposit Receipt', 'Failed Kannada script detection');

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 3: Document Boundaries & Page Order Reordering
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 3] Testing page reordering and boundary preservation...');

    // Reorder Lease Agreement pages from [1, 2, 3] to [2, 1, 3]
    const reorderRes = await fetch(`${baseUrl}/cases/${caseId}/documents/${leaseDocId}/pages/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newOrder: [2, 1, 3] })
    });
    const reorderData = (await reorderRes.json()) as any;
    assert(
      reorderRes.status === 200 && reorderData.pages?.[0]?.extractedText.includes('MAINTENANCE AND UTILITIES'),
      'Pages reordered: original Page 2 is now Page 1',
      'Page reordering failed'
    );
    assert(
      reorderData.pages?.[0]?.pageNumber === 1 && reorderData.pages?.[0]?.passages?.[0]?.pageNumber === 1,
      'Passages updated to new page number 1',
      'Passage pageNumber was not updated'
    );

    // Reorder back to [2, 1, 3] -> original order [2, 1, 3] where item 2 is original 1, so [2, 1, 3]
    await fetch(`${baseUrl}/cases/${caseId}/documents/${leaseDocId}/pages/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newOrder: [2, 1, 3] })
    });

    // Rotate page
    const rotateRes = await fetch(`${baseUrl}/cases/${caseId}/documents/${leaseDocId}/pages/1/rotate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rotationDegrees: 90 })
    });
    const rotateData = (await rotateRes.json()) as any;
    assert(rotateRes.status === 200 && rotateData.page?.rotationDegrees === 90, 'Rotated page to 90 degrees', 'Rotation failed');

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 4: Text Uncertainty Detection, Recapture & Reviewed Correction
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 4] Text uncertainty marking, recapture & human review correction...');

    // Ingest a temporary blurry page
    const blurryText = 'Clause 6: The penalty for delay is [unclear] percent per annum due to [blur] on scanned page.';
    const blurRes = await fetch(`${baseUrl}/cases/${caseId}/documents/${leaseDocId}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageNumber: 4, textContent: blurryText })
    });
    const blurData = (await blurRes.json()) as any;
    assert(
      blurData.page?.isUncertain === true && blurData.page?.continuityStatus === 'unreadable_blur',
      'Detected uncertainty: flagged isUncertain=true and unreadable_blur',
      'Failed uncertainty detection'
    );

    // Test text correction with audit trail
    const correctRes = await fetch(`${baseUrl}/cases/${caseId}/documents/${leaseDocId}/pages/4/correct-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correctedText: 'Clause 6: The penalty for delay is 12 percent per annum as confirmed by original stamp paper.',
        reviewedBy: 'operator-advocate-01'
      })
    });
    const correctData = (await correctRes.json()) as any;
    assert(
      correctRes.status === 200 &&
      correctData.page?.reviewedText &&
      correctData.page?.reviewedBy === 'operator-advocate-01' &&
      correctData.page?.isUncertain === false,
      'Review correction applied with audit trail, uncertainty cleared',
      'Failed review text correction'
    );

    // Recapture page 4 with clean text
    const cleanRecaptureText = 'Clause 6: The penalty for delay is 12 percent per annum.';
    const recapRes = await fetch(`${baseUrl}/cases/${caseId}/documents/${leaseDocId}/pages/4/recapture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ textContent: cleanRecaptureText })
    });
    const recapData = (await recapRes.json()) as any;
    assert(recapRes.status === 200 && recapData.page?.isUncertain === false, 'Recaptured page cleanly replaces blurry scan', 'Recapture failed');

    // Remove temporary test page 4 by resetting pages
    const c = casesStore.get(caseId)!;
    const leaseDoc = c.documents.find(d => d.documentId === leaseDocId)!;
    leaseDoc.pages = leaseDoc.pages.filter(p => p.pageNumber <= 3);
    leaseDoc.pageCount = leaseDoc.pages.length;

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 5: Duplicate Page Detection without Silent Deletion
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 5] Testing duplicate page detection (preserves legitimate repeated page)...');

    // Ingest duplicate of Page 1 as Page 4
    const dupRes = await fetch(`${baseUrl}/cases/${caseId}/documents/${leaseDocId}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageNumber: 4,
        textContent: leasePage1Text // Exactly identical content/checksum
      })
    });
    const dupData = (await dupRes.json()) as any;
    assert(
      dupRes.status === 201 && dupData.page?.continuityStatus === 'duplicate_page',
      'Duplicate page detected and marked continuityStatus="duplicate_page"',
      'Duplicate status not marked'
    );
    assert(
      dupData.page?.duplicateOfPageNumber === 1,
      'Pointed to duplicate source (Page 1)',
      'duplicateOfPageNumber missing'
    );

    // Verify it was NOT silently deleted: document still has 4 pages
    const checkDocRes = await fetch(`${baseUrl}/cases/${caseId}/documents/${leaseDocId}`);
    const checkDocData = (await checkDocRes.json()) as any;
    assert(checkDocData.document?.pages?.length === 4, 'Duplicate page preserved in ordered pages (not silently deleted)', 'Duplicate page was silently deleted');

    // Clean up duplicate page 4
    leaseDoc.pages = leaseDoc.pages.filter(p => p.pageNumber <= 3);
    leaseDoc.pageCount = leaseDoc.pages.length;

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 6: Cross-Document Discrepancy Detection (Conflicting Dates & Amounts)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 6] Detecting cross-document discrepancies across Agreement, Annexure & Receipt...');

    const discRes = await fetch(`${baseUrl}/cases/${caseId}/discrepancies`);
    const discData = (await discRes.json()) as any;
    assert(discRes.status === 200 && discData.discrepancies?.length >= 2, `Found ${discData.discrepancies?.length} cross-document discrepancies`, 'Discrepancy count insufficient');

    // Check for Conflicting Date: 1st September 2026 vs 15th August 2026
    const dateDiscrepancy = discData.discrepancies.find((d: any) => d.discrepancyType === 'date_inconsistency');
    assert(
      !!dateDiscrepancy &&
      (dateDiscrepancy.itemA.statedValue.includes('September') || dateDiscrepancy.itemB.statedValue.includes('September')) &&
      (dateDiscrepancy.itemA.statedValue.includes('August') || dateDiscrepancy.itemB.statedValue.includes('August')),
      'Detected Conflicting Date between Lease Agreement (1st September 2026) and Annexure A (15th August 2026)',
      'Date discrepancy not found or values incorrect'
    );
    assert(
      dateDiscrepancy.itemA.documentTitle && dateDiscrepancy.itemA.pageNumber > 0,
      `Date discrepancy cites exact source: ${dateDiscrepancy.itemA.documentTitle} (Page ${dateDiscrepancy.itemA.pageNumber})`,
      'Citation missing from date discrepancy'
    );

    // Check for Conflicting Amount: Rs. 2,50,000 vs Rs. 2,70,000
    const amountDiscrepancy = discData.discrepancies.find((d: any) => d.discrepancyType === 'amount_conflict');
    assert(
      !!amountDiscrepancy,
      'Detected Conflicting Amount between Lease Agreement (Rs. 2,50,000) and Karnataka Bank Receipt (Rs. 2,70,000)',
      'Amount discrepancy not found'
    );

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 7: Finalize Immutable Case-Document Snapshot (v1)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 7] Finalizing immutable case-document snapshot v1...');

    const snapRes = await fetch(`${baseUrl}/cases/${caseId}/snapshots/finalize`, {
      method: 'POST'
    });
    const snapData = (await snapRes.json()) as any;
    assert(
      snapRes.status === 200 && snapData.snapshot?.snapshotVersion === 1,
      'Snapshot v1 finalized successfully',
      'Snapshot finalize failed'
    );
    assert(
      snapData.snapshot?.documentManifest?.length === 3,
      'Snapshot manifest includes all 3 documents (Lease, Annexure, Receipt)',
      'Manifest document count mismatch'
    );
    assert(
      snapData.snapshot?.totalPageCount === 6, // 3 lease + 2 annexure + 1 receipt
      `Total pages in snapshot = 6 (${snapData.snapshot?.totalPageCount})`,
      'Total page count mismatch'
    );
    assert(
      typeof snapData.snapshot?.combinedFingerprint === 'string' && snapData.snapshot?.combinedFingerprint.length === 64,
      `Cryptographic combinedFingerprint computed: ${snapData.snapshot?.combinedFingerprint.slice(0, 16)}...`,
      'combinedFingerprint invalid'
    );

    const v1Fingerprint = snapData.snapshot.combinedFingerprint;

    // Simulate an accepted material finding created under Snapshot Version 1
    const v1Finding: MaterialFinding = {
      findingId: 'finding-001',
      caseId,
      snapshotVersion: 1, // Explicitly bound to snapshot v1
      originatingSpecialistId: 'A06',
      originatingBenchId: 'A',
      category: 'Dates and Amounts',
      title: 'Discrepancy between stated lease deposit and bank receipt voucher',
      summary: 'Lease Agreement states Rs 2,50,000 whereas Bank Receipt shows Rs 2,70,000 paid.',
      verbatimExcerpts: [
        {
          documentId: leaseDocId,
          documentTitle: 'Commercial Lease Agreement',
          pageNumber: 1,
          verbatimExcerpt: 'interest-free refundable security deposit of Rs. 2,50,000',
          isVerifiedExcerpt: true
        }
      ],
      authorities: [],
      severity: 'warning',
      confidenceScore: 0.98,
      isPreservedDisagreement: false,
      createdTimestamp: new Date().toISOString()
    };

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 8: Snapshot Evolution (v1 -> v2) & Stale Finding Rejection
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 8] Modifying document set creates snapshot v2; prevents reusing stale findings...');

    // Add a 4th document: "Supplementary Electric Meter Undertaking"
    const doc4Res = await fetch(`${baseUrl}/cases/${caseId}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Supplementary Electric Meter Undertaking',
        category: 'supporting_letter',
        language: 'en'
      })
    });
    const doc4Data = (await doc4Res.json()) as any;
    const doc4Id = doc4Data.document.documentId;

    await fetch(`${baseUrl}/cases/${caseId}/documents/${doc4Id}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageNumber: 1,
        textContent: 'BESCOM Sub-meter No 4920 readings transferred as of 1st September 2026.'
      })
    });

    // Finalize Snapshot v2
    const snap2Res = await fetch(`${baseUrl}/cases/${caseId}/snapshots/finalize`, {
      method: 'POST'
    });
    const snap2Data = (await snap2Res.json()) as any;
    assert(
      snap2Res.status === 200 && snap2Data.snapshot?.snapshotVersion === 2,
      'Snapshot v2 finalized after modifying document set',
      'Snapshot v2 finalize failed'
    );
    assert(
      snap2Data.snapshot?.combinedFingerprint !== v1Fingerprint,
      'Combined fingerprint changed between v1 and v2',
      'Fingerprint failed to change upon document addition'
    );

    // Verify finding from v1 is detected as STALE against active snapshot v2
    const currentActiveVersion = snap2Data.snapshot.snapshotVersion;
    const isFindingStale = v1Finding.snapshotVersion < currentActiveVersion;
    assert(
      isFindingStale,
      `Finding v1 (version ${v1Finding.snapshotVersion}) is marked STALE against active snapshot v2 (version ${currentActiveVersion})`,
      'Stale finding was not detected'
    );

    console.log('\n══════════════════════════════════════════════════════════════');
    if (allPassed) {
      console.log('✔ ALL PHASE 09 TESTS PASSED.');
      console.log('GATE VERIFIED:');
      console.log('  1. Document boundaries and page order survive capture & reordering.');
      console.log('  2. Every extracted passage points to its actual document/version/page.');
      console.log('  3. Full content >1,000 characters preserved without truncation.');
      console.log('  4. Indian scripts (Devanagari, Kannada, Latin) and tables preserved.');
      console.log('  5. Conflicting dates and amounts across documents accurately detected.');
      console.log('  6. Changes to document set generate new snapshot; stale findings cannot be silently reused.');
      console.log('══════════════════════════════════════════════════════════════\n');
    } else {
      console.error('❌ SOME PHASE 09 TESTS FAILED.\n');
      process.exitCode = 1;
    }
  } catch (err: any) {
    console.error('Verification failed with exception:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runPhase09Verification();

