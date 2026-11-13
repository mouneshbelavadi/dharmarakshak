import http from 'http';
import { createApp } from '../app.js';
import { casesStore } from '../storage/case-store.js';
import { documentIntakeService } from '../services/document-intake-service.js';
import { CaseRecord } from '@dharmaraksha/shared-contracts';

async function runPhase10Verification() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║        DHARMARAKSHA PHASE 10 VERIFICATION SUITE              ║');
  console.log('║       Source Retrieval & Evidence Provenance Engine          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const app = createApp();
  const server = http.createServer(app);
  const PORT = 4010;

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
    // ──────────────────────────────────────────────────────────────────────────
    // Setup Test Cases: Case A (Target) and Case B (Isolated Case for Security)
    // ──────────────────────────────────────────────────────────────────────────
    const targetCaseId = 'case-retrieval-karnataka-01';
    const otherCaseId = 'case-isolated-cross-check-02';

    const caseA: CaseRecord = {
      caseId: targetCaseId,
      ownership: {
        caseId: targetCaseId,
        creatorSessionId: 'sess-user-karnataka',
        creatorRole: 'visitor',
        sourceType: 'laptop_direct',
        authorizedSessionIds: ['sess-user-karnataka']
      },
      title: 'Commercial Suite Lease & Inventory Docket (Bengaluru)',
      status: 'draft_intake',
      currentSnapshotVersion: 1,
      preferredLanguage: 'kn',
      documents: [],
      benchPackets: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    casesStore.set(targetCaseId, caseA);

    const caseB: CaseRecord = {
      caseId: otherCaseId,
      ownership: {
        caseId: otherCaseId,
        creatorSessionId: 'sess-user-other',
        creatorRole: 'visitor',
        sourceType: 'laptop_direct',
        authorizedSessionIds: ['sess-user-other']
      },
      title: 'Confidential Employment Agreement Case B',
      status: 'draft_intake',
      currentSnapshotVersion: 1,
      preferredLanguage: 'en',
      documents: [],
      benchPackets: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    casesStore.set(otherCaseId, caseB);

    // Populate Case B with a unique secret keyword to test cross-case isolation
    const docB = await documentIntakeService.createDocument(otherCaseId, {
      title: 'Senior Executive Service Agreement',
      category: 'employment_contract'
    });
    await documentIntakeService.addPage(otherCaseId, docB.documentId, {
      pageNumber: 1,
      buffer: Buffer.from('TOP_SECRET_EXECUTIVE_SALARY_INR_95_LAKHS: Strictly private and confidential.'),
      rotationDegrees: 0
    });

    // Populate Case A: Document 1 (Primary Lease Agreement with 5 pages to test late pages)
    const docA1 = await documentIntakeService.createDocument(targetCaseId, {
      title: 'Commercial Lease Agreement',
      category: 'tenancy_agreement',
      language: 'en'
    });

    // Page 1: Parties and Premises
    await documentIntakeService.addPage(targetCaseId, docA1.documentId, {
      pageNumber: 1,
      buffer: Buffer.from(
        'COMMERCIAL LEASE AGREEMENT entered at Bengaluru, Karnataka on 1st September 2026. ' +
        'Lessor: Shanti Real Estate Pvt Ltd. Lessee: Sri Rajesh Kumar. ' +
        'Premises: Suite 402, Commercial Wing, MG Road, Bengaluru.'
      )
    });

    // Page 2: Rent and Deposit
    await documentIntakeService.addPage(targetCaseId, docA1.documentId, {
      pageNumber: 2,
      buffer: Buffer.from(
        'Clause 3. RENT AND DEPOSIT: ' +
        'Monthly rent of INR 45,000 payable strictly in advance on or before the 5th of each month. ' +
        'Interest-free refundable security deposit of Rs. 2,50,000 paid by Lessee. ' +
        'Clause 4. DEPOSIT FORFEITURE: ' +
        'In the event of default or early vacation, the Lessor reserves the unilateral right to forfeit 100% of the security deposit as liquidated damages.'
      )
    });

    // Page 3: Restrictive Covenants
    await documentIntakeService.addPage(targetCaseId, docA1.documentId, {
      pageNumber: 3,
      buffer: Buffer.from(
        'Clause 7. SUBLETTING RESTRICTION: ' +
        'The Lessee shall not sublet, assign, or part with possession of the premises to any person. ' +
        'Clause 8. NON-COMPETE RESTRICTION: ' +
        'The Lessee shall not operate a competing software business within 5 kilometers for a period of 2 years post termination.'
      )
    });

    // Page 4: Cross-Document References (mentions Annexure A and missing Schedule B)
    await documentIntakeService.addPage(targetCaseId, docA1.documentId, {
      pageNumber: 4,
      buffer: Buffer.from(
        'Clause 11. FIXTURES AND ATTACHMENTS: ' +
        'Refer to Annexure A for complete inventory of split air conditioners and workstations handed over. ' +
        'Clause 12. PARKING SCHEDULE: ' +
        'Refer to Schedule B for reserved basement parking bay allocations and access pass credentials.'
      )
    });

    // Page 5: LATE PAGE - Arbitration and Governing Law
    await documentIntakeService.addPage(targetCaseId, docA1.documentId, {
      pageNumber: 5,
      buffer: Buffer.from(
        'Clause 18. DISPUTE RESOLUTION AND ARBITRATION: ' +
        'All disputes arising under this agreement shall be referred to a sole arbitrator in Bengaluru under the Arbitration and Conciliation Act, 1996. ' +
        'The courts at Bengaluru alone shall have exclusive jurisdiction.'
      )
    });

    // Populate Case A: Document 2 (Annexure A linked to Document 1)
    const docA2 = await documentIntakeService.createDocument(targetCaseId, {
      title: 'Annexure A - Fixtures and Inventory Schedule',
      category: 'annexure_schedule',
      parentDocumentId: docA1.documentId
    });
    await documentIntakeService.addPage(targetCaseId, docA2.documentId, {
      pageNumber: 1,
      buffer: Buffer.from(
        'ANNEXURE A — INVENTORY SCHEDULE: ' +
        'Attached to Lease Agreement for Suite 402. ' +
        'Item 1: 4 Daikin 2.0 Ton AC units in working condition. ' +
        'Handover executed on 15th August 2026.'
      )
    });

    // Finalize Snapshot v1 for Case A
    await documentIntakeService.finalizeSnapshot(targetCaseId);

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 1: Cross-Case Authorization Isolation
    // ──────────────────────────────────────────────────────────────────────────
    console.log('[TEST 1] Verifying case-restricted retrieval (no cross-case leakage)...');

    const leakQueryRes = await fetch(`${baseUrl}/cases/${targetCaseId}/retrieval/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        queryText: 'TOP_SECRET_EXECUTIVE_SALARY'
      })
    });
    const leakData = (await leakQueryRes.json()) as any;
    assert(leakQueryRes.status === 200, 'Query endpoint responded 200', 'Query failed');
    assert(
      leakData.evidenceHits.length === 0,
      'Case A retrieval returned 0 hits for Case B secret keyword (cross-case isolation intact)',
      'Cross-case leakage detected: Case B data returned in Case A query!'
    );

    // Verify querying invalid case returns 404
    const notFoundRes = await fetch(`${baseUrl}/cases/non-existent-case-id/retrieval/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queryText: 'lease rent' })
    });
    assert(notFoundRes.status === 404, 'Non-existent case returns 404 CASE_NOT_FOUND', 'Expected 404');

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 2: References on Late Pages (Page 5)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 2] Testing lexical retrieval on late pages (Page 5 Dispute Resolution)...');

    const latePageRes = await fetch(`${baseUrl}/cases/${targetCaseId}/retrieval/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        queryText: 'arbitration sole arbitrator Bengaluru exclusive jurisdiction'
      })
    });
    const lateData = (await latePageRes.json()) as any;
    assert(lateData.evidenceHits.length > 0, 'Late page query returned evidence hits', 'No hits returned');

    const topHit = lateData.evidenceHits[0];
    assert(
      topHit.chunk.pageNumber === 5,
      `Matched exact late page: Page ${topHit.chunk.pageNumber}`,
      `Expected Page 5, got Page ${topHit.chunk?.pageNumber}`
    );
    assert(
      topHit.chunk.sourceAnchor.includes(':p5#'),
      `Exact source anchor generated: ${topHit.chunk.sourceAnchor}`,
      'Invalid source anchor'
    );

    // Resolve location anchor to verify it opens at exact document and page
    const anchorUrl = `${baseUrl}/cases/${targetCaseId}/retrieval/resolve-anchor?anchor=${encodeURIComponent(topHit.chunk.sourceAnchor)}`;
    const resolveRes = await fetch(anchorUrl);
    const resolveData = (await resolveRes.json()) as any;
    assert(
      resolveRes.status === 200 && resolveData.locationLabel.includes('Page 5'),
      `Location anchor resolved successfully to: ${resolveData.locationLabel}`,
      'Anchor resolution failed'
    );

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 3: Cross-Document Links (Agreement + Annexure A)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 3] Testing cross-document retrieval (Agreement + Annexure A)...');

    const crossDocRes = await fetch(`${baseUrl}/cases/${targetCaseId}/retrieval/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        queryText: 'inventory split air conditioner Daikin handover'
      })
    });
    const crossDocData = (await crossDocRes.json()) as any;
    const docTitles = crossDocData.evidenceHits.map((h: any) => h.chunk.documentTitle);
    assert(
      docTitles.some((t: string) => t.includes('Annexure A')),
      'Retrieved relevant evidence chunk from Annexure A',
      'Annexure A chunk missing'
    );
    const annexureHit = crossDocData.evidenceHits.find((h: any) => h.chunk.documentTitle.includes('Annexure A'));
    assert(
      annexureHit.chunk.parentDocumentId === docA1.documentId,
      'Annexure chunk preserves parentDocumentId linkage',
      'Parent document ID linkage lost'
    );

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 4: Missing Annexure Detection (No Hallucination)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 4] Detecting missing referenced annexure (Schedule B) with honest limitation...');

    const missingAnnexure = crossDocData.missingSourceLimitations.find(
      (lim: any) => lim.category === 'missing_referenced_annexure' && lim.referencedItem.includes('Schedule B')
    );
    assert(
      !!missingAnnexure,
      'Detected unattached exhibit: "Schedule B" referenced in Lease Agreement Page 4',
      'Missing annexure was not detected'
    );
    assert(
      missingAnnexure.clarificationPromptForUser.includes('Schedule B'),
      `Generated honest clarification prompt: "${missingAnnexure.clarificationPromptForUser.slice(0, 75)}..."`,
      'Clarification prompt missing'
    );

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 5: Curated Indian Legal Authority Retrieval
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 5] Retrieving curated statutory enactments and landmark precedents...');

    // 5A. Section 74 & Fateh Chand (Deposit Forfeiture & Liquidated Damages)
    const penaltyQueryRes = await fetch(`${baseUrl}/cases/${targetCaseId}/retrieval/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        queryText: 'security deposit forfeiture liquidated damages penalty'
      })
    });
    const penaltyData = (await penaltyQueryRes.json()) as any;
    assert(penaltyData.authorityHits.length > 0, 'Retrieved legal authorities for deposit penalty', 'No authorities returned');

    const s74Hit = penaltyData.authorityHits.find((h: any) => h.authority.shortCode === 'ICA_1872');
    assert(
      !!s74Hit && s74Hit.authority.sectionOrItemNumber === 'Section 74',
      'Retrieved Indian Contract Act, 1872 Section 74',
      'Section 74 missing'
    );

    const fatehHit = penaltyData.authorityHits.find((h: any) => h.authority.shortCode === 'SC_FATEH_CHAND_1963');
    assert(
      !!fatehHit && fatehHit.sourceType === 'legal_precedent',
      'Retrieved Landmark Supreme Court Precedent: Fateh Chand v. Balkishan Das (1964)',
      'Fateh Chand precedent missing'
    );

    // 5B. Section 27 & Percept D\'Mark (Non-Compete in Restraint of Trade)
    const nonCompeteRes = await fetch(`${baseUrl}/cases/${targetCaseId}/retrieval/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        queryText: 'restraint of trade non compete clause void'
      })
    });
    const nonCompeteData = (await nonCompeteRes.json()) as any;
    const s27Hit = nonCompeteData.authorityHits.find((h: any) => h.authority.shortCode === 'ICA_1872' && h.authority.sectionOrItemNumber === 'Section 27');
    assert(
      !!s27Hit && s27Hit.applicabilityStatus === 'verified_applicable',
      'Retrieved Section 27 (Restraint of Trade Void) with status verified_applicable',
      'Section 27 missing or incorrect status'
    );

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 6: Stale / Repealed Law Detection
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 6] Detecting stale/repealed law (Urban Land Ceiling Act, 1976)...');

    const staleQueryRes = await fetch(`${baseUrl}/cases/${targetCaseId}/retrieval/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        queryText: 'vacant land ceiling restriction urban land'
      })
    });
    const staleData = (await staleQueryRes.json()) as any;
    const repealedHit = staleData.authorityHits.find((h: any) => h.authority.shortCode === 'ULCRA_1976');
    assert(
      !!repealedHit && repealedHit.applicabilityStatus === 'stale_or_repealed',
      'Detected Repealed Statute: Urban Land Ceiling Act flagged stale_or_repealed',
      'Repealed statute not detected or status wrong'
    );

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 7: Wrong Jurisdiction Detection
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 7] Detecting wrong jurisdiction (Maharashtra Rent Control on Karnataka lease)...');

    const jurisQueryRes = await fetch(`${baseUrl}/cases/${targetCaseId}/retrieval/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        queryText: 'compulsory registration leave and licence Section 55',
        targetJurisdiction: 'karnataka'
      })
    });
    const jurisData = (await jurisQueryRes.json()) as any;
    const mrcaHit = jurisData.authorityHits.find((h: any) => h.authority.shortCode === 'MRCA_1999');
    assert(
      !!mrcaHit && mrcaHit.applicabilityStatus === 'wrong_jurisdiction',
      'Detected Jurisdiction Mismatch: Maharashtra Rent Control Act flagged wrong_jurisdiction for Karnataka property',
      'Jurisdiction mismatch failed'
    );

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 8: Missing Statutory Sources Handling (Zero Fabricated APIs)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 8] Handling unsupported legal query without fabricating synthetic APIs...');

    const unsupportedQueryRes = await fetch(`${baseUrl}/cases/${targetCaseId}/retrieval/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        queryText: 'California Civil Code Section 1950.5 residential tenant deposit return act'
      })
    });
    const unsupportedData = (await unsupportedQueryRes.json()) as any;
    const legalLimitation = unsupportedData.missingSourceLimitations.find(
      (lim: any) => lim.category === 'missing_legal_provision'
    );
    assert(
      !!legalLimitation && unsupportedData.authorityHits.length === 0,
      'Unsupported law produced structured MissingSourceLimitation with zero fabricated citations',
      'Fabricated citations or missing limitation'
    );

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 9: Resolving Curated Legal Authority Location Anchors
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 9] Resolving location anchors for statutory authorities...');

    const statuteAnchorRes = await fetch(
      `${baseUrl}/cases/${targetCaseId}/retrieval/resolve-anchor?anchor=${encodeURIComponent('statute:tpa_1882:s105')}`
    );
    const statuteData = (await statuteAnchorRes.json()) as any;
    assert(
      statuteAnchorRes.status === 200 && statuteData.title.includes('Transfer of Property Act'),
      `Resolved statute anchor statute:tpa_1882:s105 -> "${statuteData.locationLabel}"`,
      'Statute anchor resolution failed'
    );

    const precedentAnchorRes = await fetch(
      `${baseUrl}/cases/${targetCaseId}/retrieval/resolve-anchor?anchor=${encodeURIComponent('precedent:1964_scr_1_515#para-10')}`
    );
    const precedentData = (await precedentAnchorRes.json()) as any;
    assert(
      precedentAnchorRes.status === 200 && precedentData.title.includes('Fateh Chand'),
      `Resolved precedent anchor precedent:1964_scr_1_515#para-10 -> "${precedentData.locationLabel}"`,
      'Precedent anchor resolution failed'
    );

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 10: Distinct Labeling of Case Evidence vs Legal Authority
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 10] Verifying distinct labeling: evidence vs authority vs limitations...');

    const combinedRes = await fetch(`${baseUrl}/cases/${targetCaseId}/retrieval/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        queryText: 'deposit rent forfeiture penalty Section 74'
      })
    });
    const combinedData = (await combinedRes.json()) as any;
    assert(
      combinedData.evidenceHits.every((h: any) => h.sourceType === 'case_evidence'),
      'All user document hits strictly labeled "case_evidence"',
      'User document hits mislabeled'
    );
    assert(
      combinedData.authorityHits.every((h: any) => h.sourceType === 'legal_statute' || h.sourceType === 'legal_precedent'),
      'All curated legal authority hits strictly labeled "legal_statute" or "legal_precedent"',
      'Legal authority hits mislabeled'
    );

    console.log('\n══════════════════════════════════════════════════════════════');
    if (allPassed) {
      console.log('✔ ALL PHASE 10 TESTS PASSED.');
      console.log('GATE VERIFIED:');
      console.log('  1. Each displayed source opens at the correct document/page or legal provision.');
      console.log('  2. Unsupported legal assertions produce structured limitations, not fabricated conclusions.');
      console.log('  3. Case-restricted indexing prevents cross-case evidence leakage.');
      console.log('  4. Late pages (Page 5) retrieved with exact line/page anchors.');
      console.log('  5. Missing annexures (Schedule B) detected without hallucination.');
      console.log('  6. Stale/repealed laws and wrong jurisdictions accurately flagged.');
      console.log('══════════════════════════════════════════════════════════════\n');
    } else {
      console.error('❌ SOME PHASE 10 TESTS FAILED.\n');
      process.exitCode = 1;
    }
  } catch (err: any) {
    console.error('Verification failed with exception:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runPhase10Verification();
