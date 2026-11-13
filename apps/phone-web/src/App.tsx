import { useState } from 'react';
import { IndianLanguage } from '@dharmaraksha/shared-contracts';
import { KioskHeader } from './components/KioskHeader.js';
import { TapCardPrompt } from './components/TapCardPrompt.js';
import { CaptureControls } from './components/CaptureControls.js';
import { SimpleVoiceAssistant } from './components/SimpleVoiceAssistant.js';

export function App() {
  const [selectedLanguage, setSelectedLanguage] = useState<IndianLanguage>('en');
  const [cardUid, setCardUid] = useState<string | undefined>();
  const [isSimulatingTap, setIsSimulatingTap] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [pageCount, setPageCount] = useState<number>(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [reviewStarted, setReviewStarted] = useState(false);

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
      setPageCount((prev) => prev + 1);
      setIsCapturing(false);
    }, 800);
  };

  const handleCompleteDocument = () => {
    setReviewStarted(true);
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <KioskHeader
        cardUid={cardUid}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
      />

      <main style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
        <TapCardPrompt
          cardUid={cardUid}
          isSimulating={isSimulatingTap}
          onSimulateTap={handleSimulateTap}
          consentGiven={consentGiven}
          onToggleConsent={setConsentGiven}
        />

        {cardUid && consentGiven && !reviewStarted && (
          <CaptureControls
            pageCount={pageCount}
            onCapturePage={handleCapturePage}
            onCompleteDocument={handleCompleteDocument}
            isCapturing={isCapturing}
          />
        )}

        {cardUid && consentGiven && reviewStarted && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '16px',
            padding: '16px',
            textAlign: 'center',
            color: '#065f46'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
              Review In Progress on Laptop Tribunal
            </h3>
            <p style={{ fontSize: '12px', color: '#047857' }}>
              Watch the 3D chamber on the laptop screen. You may ask questions below at any time.
            </p>
          </div>
        )}

        {cardUid && consentGiven && (
          <SimpleVoiceAssistant language={selectedLanguage} />
        )}
      </main>

      <footer style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', color: '#94a3b8' }}>
        DHARMARAKSHA Kiosk Companion • Powered by UNO Q Gateway & Sarvam AI
      </footer>
    </div>
  );
}
export default App;
