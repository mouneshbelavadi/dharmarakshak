import React, { useState } from 'react';
import { IndianLanguage } from '@dharmaraksha/shared-contracts';
import { Mic, MicOff, Volume2, Square, ArrowRight, CornerDownRight } from 'lucide-react';

interface AskDocumentScreenProps {
  language: IndianLanguage;
  onProceedToDelivery: () => void;
}

export const AskDocumentScreen: React.FC<AskDocumentScreenProps> = ({
  language,
  onProceedToDelivery
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [inputText, setInputText] = useState('');

  const [qaHistory, setQaHistory] = useState([
    {
      q: 'What is the notice period and deposit refund clause?',
      a: 'Clause 11 mandates an 11-month lock-in period. Clause 15 requires a 60-day written notice before termination. Regarding your security deposit, Clause 5 specifies INR 2,50,000, while your bank counterfoil shows INR 2,70,000.',
      citations: ['Lease Agreement, Page 2, Clause 11', 'Lease Agreement, Page 3, Clause 15', 'RTGS Receipt, Page 1']
    }
  ]);

  const toggleMic = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setIsPlayingAudio(true);
        setQaHistory((prev) => [
          ...prev,
          {
            q: 'Can the landlord deduct maintenance charges from the deposit?',
            a: 'Clause 8 specifies that ordinary minor repairs under INR 5,000 are the responsibility of the lessee. Structural repairs remain the duty of the lessor. The landlord cannot arbitrarily deduct general building maintenance from the security deposit without itemized receipts.',
            citations: ['Lease Agreement, Page 2, Clause 8']
          }
        ]);
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  const handleStopSpeaking = () => {
    setIsPlayingAudio(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Header & Persistent Stop Speaking Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Ask About Your Documents
            </h2>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              Sarvam AI Speech Engine • Language: [{language.toUpperCase()}]
            </div>
          </div>

          {/* Persistent Stop Speaking Action */}
          {isPlayingAudio && (
            <button
              onClick={handleStopSpeaking}
              style={{
                minHeight: '44px',
                background: '#dc2626',
                color: '#ffffff',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                animation: 'pulse 1.5s infinite'
              }}
            >
              <Square style={{ width: 14, height: 14, fill: '#ffffff' }} />
              Stop Speaking
            </button>
          )}
        </div>

        {/* Q&A Conversation Flow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '280px', overflowY: 'auto' }}>
          {qaHistory.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                alignSelf: 'flex-end',
                background: '#0f172a',
                color: '#ffffff',
                padding: '10px 14px',
                borderRadius: '14px 14px 2px 14px',
                fontSize: '13px',
                maxWidth: '85%'
              }}>
                {item.q}
              </div>

              <div style={{
                alignSelf: 'flex-start',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '12px 14px',
                borderRadius: '14px 14px 14px 2px',
                fontSize: '13px',
                lineHeight: 1.5,
                color: '#1e293b',
                maxWidth: '90%'
              }}>
                <div style={{ marginBottom: '8px' }}>{item.a}</div>
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {item.citations.map((cite, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#0284c7' }}>
                      <CornerDownRight style={{ width: 11, height: 11 }} />
                      <span>{cite}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Audio / Text Input Bar */}
        <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
          <button
            onClick={toggleMic}
            style={{
              minHeight: '48px',
              flex: 1,
              background: isRecording ? '#dc2626' : '#4f46e5',
              color: '#ffffff',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            {isRecording ? <MicOff style={{ width: 16, height: 16 }} /> : <Mic style={{ width: 16, height: 16 }} />}
            {isRecording ? 'Listening... Tap to Stop' : 'Hold / Tap to Speak Question'}
          </button>
        </div>

        {/* Proceed to Report Delivery Button */}
        <button
          onClick={onProceedToDelivery}
          style={{
            minHeight: '48px',
            width: '100%',
            background: '#059669',
            color: '#ffffff',
            padding: '12px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          View Case Findings & Export Report
          <ArrowRight style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  );
};

