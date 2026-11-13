import { useState } from 'react';
import { PresentationHeader, LaptopDestination } from './components/PresentationHeader.js';
import { TribunalChamber } from './components/TribunalChamber.js';
import { DocumentWorkspace } from './components/DocumentWorkspace.js';
import { DocumentsView } from './components/DocumentsView.js';
import { ReportPreview } from './components/ReportPreview.js';
import { ConnectionsView } from './components/ConnectionsView.js';
import { DeviceManagementView } from './components/DeviceManagementView.js';
import { BenchInspector } from './components/BenchInspector.js';
import { CaseRecord, LaptopTheme, UserRole } from '@dharmaraksha/shared-contracts';
import { BenchId } from '@dharmaraksha/tribunal-definitions';
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
  const [destination, setDestination] = useState<LaptopDestination>('review');
  const [theme, setTheme] = useState<LaptopTheme>('split');
  const [userRole, setUserRole] = useState<UserRole>('visitor');
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(true);
  const [isFixture, setIsFixture] = useState<boolean>(true);
  const [selectedBenchId, setSelectedBenchId] = useState<BenchId>('A');
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string | undefined>(undefined);

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
        destination={destination}
        onDestinationChange={setDestination}
        theme={theme}
        onThemeChange={setTheme}
        userRole={userRole}
        onUserRoleChange={setUserRole}
        isPresentationMode={isPresentationMode}
        onTogglePresentationMode={() => setIsPresentationMode(!isPresentationMode)}
        isFixture={isFixture}
        onToggleFixture={() => setIsFixture(!isFixture)}
      />

      <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
        {/* Dynamic Center Workspaces based on Destination */}
        <div style={{ flex: 1, height: '100%', overflow: 'hidden', display: 'flex' }}>
          {/* Destination 1: Review (Split Workspace: Folio + 3D Chamber) */}
          {destination === 'review' && (
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
                  selectedSpecialistId={selectedSpecialistId}
                  onSelectBench={setSelectedBenchId}
                  onSelectSpecialist={setSelectedSpecialistId}
                  theme={theme}
                />
              </div>
            </>
          )}

          {/* Destination 2: Documents (Multi-document Folio Manager) */}
          {destination === 'documents' && (
            <DocumentsView currentCase={sampleCase} isFixture={isFixture} />
          )}

          {/* Destination 3: Reports (Referenced PDF Preview & Export) */}
          {destination === 'reports' && (
            <ReportPreview currentCase={sampleCase} />
          )}

          {/* Destination 4: Connections (Telegram, Drive, Gmail, Tunnel status) */}
          {destination === 'connections' && (
            <ConnectionsView isFixture={isFixture} />
          )}

          {/* Destination 5: Device (Role-gated UNO Q & RFID Console) */}
          {destination === 'device' && (
            <DeviceManagementView userRole={userRole} isFixture={isFixture} />
          )}
        </div>

        {/* Bench & Specialist Inspector Sidebar (Shown on Review destination) */}
        {destination === 'review' && (
          <BenchInspector
            selectedBenchId={selectedBenchId}
            selectedSpecialistId={selectedSpecialistId}
            onSelectBench={setSelectedBenchId}
            onSelectSpecialist={setSelectedSpecialistId}
          />
        )}
      </div>
    </div>
  );
}
export default App;
