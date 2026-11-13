import { useState } from 'react';
import { PresentationHeader, LaptopActiveTab } from './components/PresentationHeader.js';
import { TribunalChamber } from './components/TribunalChamber.js';
import { DocumentWorkspace } from './components/DocumentWorkspace.js';
import { DocumentComparison } from './components/DocumentComparison.js';
import { GroundedQAPanel } from './components/GroundedQAPanel.js';
import { ReportPreview } from './components/ReportPreview.js';
import { BenchInspector } from './components/BenchInspector.js';
import { CaseRecord, LaptopTheme } from '@dharmaraksha/shared-contracts';
import './styles/theme.css';

const sampleCase: CaseRecord = {
  caseId: 'case-demo-001',
  ownership: {
    caseId: 'case-demo-001',
    creatorSessionId: 'sess-001',
    creatorRole: 'visitor',
    sourceType: 'laptop_direct',
    authorizedSessionIds: ['sess-001']
  },
  title: 'Commercial Lease Agreement & Security Deposit Review',
  status: 'review_complete',
  currentSnapshotVersion: 1,
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
  const [activeTab, setActiveTab] = useState<LaptopActiveTab>('chamber_folio');
  const [theme, setTheme] = useState<LaptopTheme>('split');
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(true);
  const [selectedBenchId, setSelectedBenchId] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');

  return (
    <div
      data-theme={theme}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: theme === 'light' ? '#f9f6ef' : '#070a10',
        color: theme === 'light' ? '#0f172a' : '#f8fafc'
      }}
    >
      <PresentationHeader
        currentCase={sampleCase}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={theme}
        onThemeChange={setTheme}
        isPresentationMode={isPresentationMode}
        onTogglePresentationMode={() => setIsPresentationMode(!isPresentationMode)}
      />

      <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
        {/* Dynamic Center Workspaces based on Active Tab */}
        <div style={{ flex: 1, height: '100%', overflow: 'hidden', display: 'flex' }}>
          {/* Tab 1: Chamber & Folio (Default Split View) */}
          {activeTab === 'chamber_folio' && (
            <>
              {/* Left Side: Warm Ivory Folio Workspace */}
              <div style={{
                flex: '0 0 50%',
                height: '100%',
                overflow: 'hidden',
                borderRight: theme === 'light' ? '1px solid #e7e0d3' : '1px solid #1e293b'
              }}>
                <DocumentWorkspace currentCase={sampleCase} />
              </div>

              {/* Right Side: Ink-Dark 3D Chamber Canvas */}
              <div style={{ flex: '0 0 50%', height: '100%', position: 'relative' }}>
                <TribunalChamber
                  selectedBenchId={selectedBenchId}
                  onSelectBench={setSelectedBenchId}
                />
              </div>
            </>
          )}

          {/* Tab 2: Document Comparison (Side-by-side Folios) */}
          {activeTab === 'comparison' && (
            <DocumentComparison currentCase={sampleCase} />
          )}

          {/* Tab 3: Grounded Conversational Q&A */}
          {activeTab === 'qa' && (
            <GroundedQAPanel currentCase={sampleCase} />
          )}

          {/* Tab 4: Referenced Report Preview & Delivery */}
          {activeTab === 'report' && (
            <ReportPreview currentCase={sampleCase} />
          )}

          {/* Tab 5: Accessible 2D Fallback View (Full Folio without WebGL) */}
          {activeTab === 'accessible_2d' && (
            <DocumentWorkspace currentCase={sampleCase} />
          )}
        </div>

        {/* Bench & Specialist Inspector Sidebar (Always Available) */}
        <BenchInspector
          selectedBenchId={selectedBenchId}
          onSelectBench={setSelectedBenchId}
        />
      </div>
    </div>
  );
}
export default App;
