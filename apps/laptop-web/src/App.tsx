import { useState } from 'react';
import { PresentationHeader } from './components/PresentationHeader.js';
import { TribunalChamber } from './components/TribunalChamber.js';
import { DocumentWorkspace } from './components/DocumentWorkspace.js';
import { BenchInspector } from './components/BenchInspector.js';
import { CaseRecord } from '@dharmaraksha/shared-contracts';

const sampleCase: CaseRecord = {
  caseId: 'case-demo-001',
  title: 'Commercial Lease Agreement & Security Deposit Review',
  sourceType: 'laptop_direct',
  status: 'review_complete',
  preferredLanguage: 'en',
  documents: [],
  benchPackets: {},
  presidingSummary: {
    executiveSummary: 'This preliminary legal review covers the 3-page Commercial Lease Agreement and 1-page Security Deposit Counterfoil. Bench A established high text fidelity, Bench B identified key rent & lock-in terms, Bench C cited the Transfer of Property Act 1882, Bench D highlighted uncapped forfeiture penalties, and Bench E audited source citations.',
    keyObligations: [
      'Clause 4: Monthly rent of INR 45,000 payable strictly in advance on or before the 5th of each English calendar month.',
      'Clause 8: Lessee is strictly responsible for minor interior repairs up to INR 5,000 per instance.',
      'Clause 11: Mandatory 11-month lock-in period during which lessee cannot terminate without penalty.'
    ],
    materialRisks: [
      'Clause 12: Lessor reserves unilateral right to forfeit 100% of the 6-month security deposit upon early termination.',
      'Clause 14: Delayed rent accrues compounding interest at 24% per annum (prima facie penal interest).'
    ],
    criticalDeadlines: [
      'Rent Payment: 5th of every month',
      'Renewal Notice: Written intimation required 60 days prior to lease expiry'
    ],
    inconsistenciesIdentified: [
      'Cross-Document Conflict: Deposit receipt dated 12-Oct shows payment of INR 2,70,000, whereas Clause 5 of the Lease Agreement records a deposit of INR 2,50,000.'
    ],
    questionsForVisitorClarification: [
      'Can you produce the stamped bank receipt for the additional INR 20,000 difference?',
      'Has the physical inspection checklist (Annexure A) been signed by the lessor?'
    ],
    missingDocumentsOrExhibits: [
      'Annexure A (Inventory of fixtures) referenced in Clause 3 is missing from the scanned folio.'
    ],
    statutoryCoverageLimitations: [
      'State-specific Rent Control exemptions for commercial premises exceeding specified municipal valuation require confirmation of local municipal notification.'
    ],
    certifiedPlainLanguage: true,
    reviewedAt: new Date().toISOString()
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  completedAt: new Date().toISOString()
};

export function App() {
  const [viewMode, setViewMode] = useState<'chamber_3d' | 'split' | 'accessible_2d'>('split');
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(true);
  const [selectedBenchId, setSelectedBenchId] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <PresentationHeader
        currentCase={sampleCase}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isPresentationMode={isPresentationMode}
        onTogglePresentationMode={() => setIsPresentationMode(!isPresentationMode)}
      />

      <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
        {/* Left Side: Document Workspace or Full View depending on mode */}
        {(viewMode === 'split' || viewMode === 'accessible_2d') && (
          <div style={{
            flex: viewMode === 'accessible_2d' ? 1 : '0 0 50%',
            height: '100%',
            overflow: 'hidden',
            borderRight: '1px solid #334155'
          }}>
            <DocumentWorkspace currentCase={sampleCase} />
          </div>
        )}

        {/* 3D Chamber Workspace (confining Three.js & R3F strictly to laptop app) */}
        {(viewMode === 'chamber_3d' || viewMode === 'split') && (
          <div style={{ flex: 1, height: '100%', position: 'relative' }}>
            <TribunalChamber
              selectedBenchId={selectedBenchId}
              onSelectBench={setSelectedBenchId}
            />
          </div>
        )}

        {/* Bench & Specialist Inspector Panel */}
        <BenchInspector
          selectedBenchId={selectedBenchId}
          onSelectBench={setSelectedBenchId}
        />
      </div>
    </div>
  );
}
export default App;
