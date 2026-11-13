import { useState } from 'react';
import { IndianLanguage, PhoneTheme } from '@dharmaraksha/shared-contracts';
import { KioskHeader } from './components/KioskHeader.js';
import { WelcomeTapScreen } from './screens/WelcomeTapScreen.js';
import { ConsentLanguageScreen } from './screens/ConsentLanguageScreen.js';
import { DocumentListScreen } from './screens/DocumentListScreen.js';
import { CaptureReviewScreen } from './screens/CaptureReviewScreen.js';
import { ProcessingStatusScreen } from './screens/ProcessingStatusScreen.js';
import { AskDocumentScreen } from './screens/AskDocumentScreen.js';
import { ResultDeliveryScreen } from './screens/ResultDeliveryScreen.js';
import { Sun, Moon, Radio } from 'lucide-react';
import './styles/theme.css';

type PhoneStep =
  | 'welcome_tap'
  | 'consent_language'
  | 'document_list'
  | 'capture_review'
  | 'processing'
  | 'ask_qa'
  | 'result_delivery';

export function App() {
  const [currentStep, setCurrentStep] = useState<PhoneStep>('welcome_tap');
  const [selectedLanguage, setSelectedLanguage] = useState<IndianLanguage>('en');
  const [phoneTheme, setPhoneTheme] = useState<PhoneTheme>('light');
  const [cardUid, setCardUid] = useState<string | undefined>();
  const [isSimulatingTap, setIsSimulatingTap] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [activeDocTitle, setActiveDocTitle] = useState('Lease Agreement');

  // Sample Documents List in Phone Case Folio
  const [documents, setDocuments] = useState([
    { id: 'doc-001', title: 'Lease Agreement', category: 'Tenancy Contract', pageCount: 3 },
    { id: 'doc-002', title: 'Security Deposit RTGS Receipt', category: 'Bank Receipt', pageCount: 1 }
  ]);

  // Sample Pages for Active Document
  const [activePages, setActivePages] = useState([
    { id: 'pg-1', pageNumber: 1, previewUrl: '', status: 'ok' as const },
    { id: 'pg-2', pageNumber: 2, previewUrl: '', status: 'ok' as const },
    { id: 'pg-3', pageNumber: 3, previewUrl: '', status: 'ok' as const }
  ]);

  const handleSimulateTap = () => {
    setIsSimulatingTap(true);
    setTimeout(() => {
      setCardUid('E280689420000000');
      setIsSimulatingTap(false);
    }, 600);
  };

  const handleCapturePage = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setActivePages((prev) => [
        ...prev,
        { id: `pg-${prev.length + 1}`, pageNumber: prev.length + 1, previewUrl: '', status: 'ok' }
      ]);
      setIsCapturing(false);
    }, 800);
  };

  const handleRotatePage = (pageId: string) => {
    alert(`Rotated page ${pageId} by 90 degrees`);
  };

  const handleDeletePage = (pageId: string) => {
    setActivePages((prev) => prev.filter((p) => p.id !== pageId));
  };

  const handleFinishAndReset = () => {
    setCardUid(undefined);
    setConsentGiven(false);
    setCurrentStep('welcome_tap');
  };

  return (
    <div
      data-theme={phoneTheme}
      style={{
        maxWidth: '480px',
        margin: '0 auto',
        minHeight: '100vh',
        background: phoneTheme === 'light' ? '#f8fafc' : '#0b0f19',
        color: phoneTheme === 'light' ? '#0f172a' : '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxSizing: 'border-box'
      }}
    >
      <KioskHeader
        cardUid={cardUid}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
      />

      <main style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
        {/* Top Diagnostic / Theme Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontSize: '11px',
            color: '#065f46',
            background: '#ecfdf5',
            padding: '3px 8px',
            borderRadius: '6px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Radio style={{ width: 11, height: 11, color: '#10b981' }} /> UNO Q Gateway
          </span>

          <button
            onClick={() => setPhoneTheme(phoneTheme === 'light' ? 'dark' : 'light')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: phoneTheme === 'light' ? '#e2e8f0' : '#1e293b',
              color: phoneTheme === 'light' ? '#475569' : '#cbd5e1',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 600,
              minHeight: '36px'
            }}
          >
            {phoneTheme === 'light' ? <Moon style={{ width: 12, height: 12 }} /> : <Sun style={{ width: 12, height: 12 }} />}
            {phoneTheme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>

        {/* 7-Step Visitor Flow Router */}
        {currentStep === 'welcome_tap' && (
          <WelcomeTapScreen
            cardUid={cardUid}
            isSimulating={isSimulatingTap}
            onSimulateTap={handleSimulateTap}
            onProceed={() => setCurrentStep('consent_language')}
          />
        )}

        {currentStep === 'consent_language' && (
          <ConsentLanguageScreen
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            consentGiven={consentGiven}
            onConsentChange={setConsentGiven}
            onProceed={() => setCurrentStep('document_list')}
            onBack={() => setCurrentStep('welcome_tap')}
          />
        )}

        {currentStep === 'document_list' && (
          <DocumentListScreen
            documents={documents}
            onSelectDocument={(id) => {
              const doc = documents.find((d) => d.id === id);
              if (doc) setActiveDocTitle(doc.title);
              setCurrentStep('capture_review');
            }}
            onAddDocument={() => {
              setActiveDocTitle('Additional Annexure');
              setCurrentStep('capture_review');
            }}
            onProceedToReview={() => setCurrentStep('processing')}
          />
        )}

        {currentStep === 'capture_review' && (
          <CaptureReviewScreen
            documentTitle={activeDocTitle}
            pages={activePages}
            onCapturePage={handleCapturePage}
            onRotatePage={handleRotatePage}
            onDeletePage={handleDeletePage}
            onFinishDocument={() => setCurrentStep('document_list')}
            onBackToDocuments={() => setCurrentStep('document_list')}
            isCapturing={isCapturing}
          />
        )}

        {currentStep === 'processing' && (
          <ProcessingStatusScreen
            currentStage={5} // Demo complete stage
            onProceedToQA={() => setCurrentStep('ask_qa')}
          />
        )}

        {currentStep === 'ask_qa' && (
          <AskDocumentScreen
            language={selectedLanguage}
            onProceedToDelivery={() => setCurrentStep('result_delivery')}
          />
        )}

        {currentStep === 'result_delivery' && (
          <ResultDeliveryScreen onFinishAndReset={handleFinishAndReset} />
        )}
      </main>

      <footer style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', color: '#94a3b8' }}>
        DHARMARAKSHA Kiosk Companion • Step: {currentStep.replace('_', ' ').toUpperCase()}
      </footer>
    </div>
  );
}
export default App;
