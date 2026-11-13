import React, { useState } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { IndianLanguage } from '@dharmaraksha/shared-contracts';

interface SimpleVoiceAssistantProps {
  language: IndianLanguage;
}

export const SimpleVoiceAssistant: React.FC<SimpleVoiceAssistantProps> = ({ language }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string>('Ask any question about your document in your chosen language.');

  const toggleMic = () => {
    if (!isListening) {
      setIsListening(true);
      setTranscript(`Listening in [${language.toUpperCase()}]... Speak clearly into the kiosk mic.`);
      setTimeout(() => {
        setIsListening(false);
        setTranscript('Example: "What is my notice period and security deposit deduction clause?"');
      }, 3000);
    } else {
      setIsListening(false);
      setTranscript('Microphone muted.');
    }
  };

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Volume2 style={{ width: 18, height: 18, color: '#6366f1' }} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
            Sarvam AI Voice Assistant
          </span>
        </div>
        <span style={{ fontSize: '11px', color: '#64748b' }}>STT / TTS ({language.toUpperCase()})</span>
      </div>

      <div style={{
        background: '#f8fafc',
        borderRadius: '10px',
        padding: '12px 14px',
        fontSize: '13px',
        color: '#334155',
        fontStyle: 'italic',
        minHeight: '48px',
        display: 'flex',
        alignItems: 'center'
      }}>
        "{transcript}"
      </div>

      <button
        onClick={toggleMic}
        style={{
          background: isListening ? '#dc2626' : '#6366f1',
          color: '#ffffff',
          padding: '12px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s'
        }}
      >
        {isListening ? (
          <>
            <MicOff style={{ width: 16, height: 16 }} /> Stop Listening
          </>
        ) : (
          <>
            <Mic style={{ width: 16, height: 16 }} /> Hold or Tap to Speak
          </>
        )}
      </button>
    </div>
  );
};
