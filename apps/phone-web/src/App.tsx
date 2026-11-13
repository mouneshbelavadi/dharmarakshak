import { useState } from 'react';
import { IndianLanguage, PhoneTheme } from '@dharmaraksha/shared-contracts';
import { KioskHeader } from './components/KioskHeader.js';
import { TapCardPrompt } from './components/TapCardPrompt.js';
import { CaptureControls } from './components/CaptureControls.js';
import { SimpleVoiceAssistant } from './components/SimpleVoiceAssistant.js';
import { Sun, Moon } from 'lucide-react';
import './styles/theme.css';

export function App() {
  const [selectedLanguage, setSelectedLanguage] = useState<IndianLanguage>('en');
  const [phoneTheme, setPhoneTheme] = useState<PhoneTheme>('light');
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
        transition: 'background 0.2s, color 0.2s'
      }}
    >
      <KioskHeader
        cardUid={cardUid}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
      />

      <main style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
        {/* Subtle Theme Toggle for Kiosk Accessibility */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
            {phoneTheme === 'light' ? (
              <>
                <Moon style={{ width: 12, height: 12 }} /> Dark Mode
              </>
            ) : (
              <>
                <Sun style={{ width: 12, height: 12 }} /> Light Mode
              </>
            )}
          </button>
        </div>

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
            background: phoneTheme === 'light' ? '#ecfdf5' : '#064e3b',
            border: `1px solid ${phoneTheme === 'light' ? '#a7f3d0' : '#047857'}`,
            borderRadius: '16px',
            padding: '16px',
            textAlign: 'center',
            color: phoneTheme === 'light' ? '#065f46' : '#a7f3d0'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
              Review In Progress on Laptop Tribunal
            </h3>
            <p style={{ fontSize: '12px', color: phoneTheme === 'light' ? '#047857' : '#6ee7b7' }}>
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
