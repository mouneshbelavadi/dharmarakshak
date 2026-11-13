import React, { useState } from 'react';
import { PresentationHeader, LaptopDestination } from './components/PresentationHeader.js';
import { TribunalChamber } from './components/TribunalChamber.js';
import { BenchDeliberationsView } from './components/BenchDeliberationsView.js';
import { JudicialDecreeView } from './components/JudicialDecreeView.js';
import { OralArgumentsView } from './components/OralArgumentsView.js';
import { CertifiedDeliveryView } from './components/CertifiedDeliveryView.js';
import { DocumentsView } from './components/DocumentsView.js';
import { PresentationView } from './components/PresentationView.js';
import { DeviceManagementView } from './components/DeviceManagementView.js';
import { CourtroomCameraScannerModal } from './components/CourtroomCameraScannerModal.js';
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
    executiveSummary: 'This authoritative legal adjudication covers the 3-page Commercial Lease Agreement and 1-page Security Deposit Counterfoil. Bench A established 99.4% text fidelity, Bench B identified mandatory rent & lock-in terms, Bench C cited the Transfer of Property Act 1882, Bench D highlighted uncapped forfeiture penalties, and Bench E audited source citations.',
    keyObligations: [
      'Clause 4: Monthly rent of INR 45,000 payable strictly in advance on or before the 5th of each English calendar month.',
      'Clause 8: Lessee is strictly responsible for minor interior repairs up to INR 5,000 per instance.',
      'Clause 11: Mandatory 11-month lock-in period during which lessee cannot terminate without penalty.'
    ],
    materialRisks: [
      'Clause 12: Lessor reserves unilateral right to forfeit 100% of the 6-month security deposit upon early termination (prima facie penal under Kailash Nath doctrine).',
      'Clause 14: Delayed rent accrues compounding interest at 24% per annum (unenforceable penal interest under Section 74).'
    ],
    criticalDeadlines: [
      'Rent Payment: 5th of every English calendar month',
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
      'Annexure A (Schedule of Fixtures) referenced in Clause 3 is missing from the scanned folio.'
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
  // Default to the full-viewport 3D Grand Courtroom Chamber!
  const [destination, setDestination] = useState<LaptopDestination>('chamber');
  const [theme, setTheme] = useState<LaptopTheme>('split');
  const [userRole, setUserRole] = useState<UserRole>('visitor');
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [isFixture, setIsFixture] = useState<boolean>(true);
  const [selectedBenchId, setSelectedBenchId] = useState<BenchId>('A');
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string | undefined>(undefined);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);

  return (
    <div
      data-theme={theme}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: theme === 'light' ? '#f9f6ef' : '#05070e',
        color: theme === 'light' ? '#1a1612' : '#f8fafc',
        fontFamily: 'var(--font-sans)'
      }}
    >
      {/* Imperial Courtroom Header */}
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
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* Main Courtroom Viewport Area */}
      <main style={{ flex: 1, height: 'calc(100vh - 62px)', overflow: 'hidden', position: 'relative' }}>
        {/* Section 1: 🏛️ The Grand Courtroom Chamber (Full-Screen Three.js Experience) */}
        {(destination === 'chamber' || destination === 'review') && (
          <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex' }}>
            {/* Optional Evaluator HUD drawer when toggled on */}
            {isPresentationMode && (
              <div style={{
                width: '440px',
                height: '100%',
                overflowY: 'auto',
                borderRight: theme === 'light' ? '1px solid #e2d9c8' : '1px solid rgba(212, 175, 55, 0.3)',
                background: theme === 'light' ? '#ffffff' : '#0c1222',
                zIndex: 30,
                boxShadow: '10px 0 30px rgba(0, 0, 0, 0.5)'
              }}>
                <PresentationView caseId={sampleCase.caseId} theme={theme} />
              </div>
            )}

            {/* Full 3D Chamber Canvas */}
            <div style={{ flex: 1, height: '100%', position: 'relative' }}>
              <TribunalChamber
                caseId={isFixture ? undefined : sampleCase.caseId}
                selectedBenchId={selectedBenchId}
                selectedSpecialistId={selectedSpecialistId}
                onSelectBench={setSelectedBenchId}
                onSelectSpecialist={setSelectedSpecialistId}
                theme={theme}
                onOpenScanner={() => setIsScannerOpen(true)}
              />
            </div>
          </div>
        )}

        {/* Section 2: ⚖️ Bench Deliberations & Specialist Arguments */}
        {destination === 'deliberations' && (
          <BenchDeliberationsView currentCase={sampleCase} theme={theme} />
        )}

        {/* Section 3: 📜 Legal Evidence Folios & Document Inspector */}
        {(destination === 'evidence' || destination === 'documents') && (
          <DocumentsView currentCase={sampleCase} isFixture={isFixture} />
        )}

        {/* Section 4: 🔨 Presiding Judge's Synthesis & Judicial Decree */}
        {(destination === 'decree' || destination === 'reports') && (
          <JudicialDecreeView currentCase={sampleCase} theme={theme} />
        )}

        {/* Section 5: 🎙️ Multilingual Oral Arguments & Courtroom Voice Chamber */}
        {destination === 'oral_arguments' && (
          <OralArgumentsView currentCase={sampleCase} theme={theme} />
        )}

        {/* Section 6: 📦 Certified Delivery & Export Center */}
        {(destination === 'delivery' || destination === 'connections') && (
          <CertifiedDeliveryView currentCase={sampleCase} theme={theme} />
        )}

        {/* Role-gated Device Management (UNO Q / Hardware console) */}
        {destination === 'device' && (
          <DeviceManagementView userRole={userRole} isFixture={isFixture} />
        )}
      </main>

      {/* Live High Court Document Camera Scanner & OCR Modal */}
      <CourtroomCameraScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        theme={theme}
      />
    </div>
  );
}

export default App;
