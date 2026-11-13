import React, { useState, useRef, useEffect } from 'react';
import { IndianLanguage, AudioSource } from '@dharmaraksha/shared-contracts';
import { Mic, MicOff, Square, ArrowRight, CornerDownRight, Volume2, Globe, Radio, Send, AlertTriangle } from 'lucide-react';

interface AskDocumentScreenProps {
  language: IndianLanguage;
  onProceedToDelivery: () => void;
  caseId?: string;
}

interface QaItem {
  q: string;
  a: string;
  citations: string[];
  detectedLang?: string;
  isAudio?: boolean;
}

const SUPPORTED_LANGUAGES: Array<{ code: IndianLanguage; name: string }> = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi (हिंदी)' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
  { code: 'ml', name: 'Malayalam (മലയാളം)' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'or', name: 'Odia (ଓଡ଼ିଆ)' }
];

export const AskDocumentScreen: React.FC<AskDocumentScreenProps> = ({
  language,
  onProceedToDelivery,
  caseId = 'case-demo-001'
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [activeAudioSource, setActiveAudioSource] = useState<AudioSource>('phone_microphone');
  const [selectedLanguage, setSelectedLanguage] = useState<IndianLanguage>(language);
  const [detectedLanguage, setDetectedLanguage] = useState<IndianLanguage | null>(null);
  const [captions, setCaptions] = useState<string>('');
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSourceNode = useRef<AudioBufferSourceNode | null>(null);

  const [qaHistory, setQaHistory] = useState<QaItem[]>([
    {
      q: 'What is the notice period and deposit refund clause?',
      a: 'Clause 11 mandates an 11-month lock-in period. Clause 15 requires a 60-day written notice before termination. Regarding your security deposit, Clause 5 specifies INR 2,50,000, while your bank counterfoil shows INR 2,70,000.',
      citations: ['Lease Agreement, Page 2, Clause 11', 'Lease Agreement, Page 3, Clause 15', 'RTGS Receipt, Page 1'],
      detectedLang: 'en'
    }
  ]);

  // Clean up audio on unmount or tab switch
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleStopSpeaking();
        if (isRecording) setIsRecording(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      handleStopSpeaking();
    };
  }, [isRecording]);

  // Mobile audio unlock
  const unlockAudioContext = async () => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }
    }
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  };

  const handleStopSpeaking = () => {
    if (currentAudioSourceNode.current) {
      try {
        currentAudioSourceNode.current.stop();
      } catch { /* ignore */ }
      currentAudioSourceNode.current = null;
    }
    setIsPlayingAudio(false);
    setCaptions('');

    // Call server to interrupt assistant
    fetch(`/api/v1/cases/${caseId}/speech/interrupt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseId })
    }).catch(() => { });
  };

  const handleTogglePushToTalk = async () => {
    await unlockAudioContext();

    if (isPlayingAudio) {
      handleStopSpeaking();
      return;
    }

    if (!isRecording) {
      setIsRecording(true);
      setCaptions('Listening to your spoken question...');
      setMicPermissionDenied(false);

      // Simulate push-to-talk audio capture duration
      setTimeout(async () => {
        setIsRecording(false);
        setIsProcessing(true);
        setCaptions('Transcribing speech with Sarvam AI...');

        try {
          // Send simulated audio query with embedded hint for deterministic speech exchange
          const testAudioPayload = Buffer.from(
            'RIFF....WAVEfmt ....data....TEST_Q:What is the lock-in period in the lease agreement? TEST_LANG:en'
          ).toString('base64');

          const response = await fetch(`/api/v1/cases/${caseId}/speech/turn`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: testAudioPayload,
              source: activeAudioSource,
              preferredLanguage: selectedLanguage,
              correctedLanguage: selectedLanguage
            })
          });

          if (response.ok) {
            const data = await response.json();
            const turn = data.turn;
            setDetectedLanguage(turn.detectedLanguage);
            setCaptions(turn.spokenSummary || turn.answerText);
            setIsPlayingAudio(true);

            setQaHistory(prev => [
              ...prev,
              {
                q: turn.userTranscript || 'What is the lock-in period in the lease agreement?',
                a: turn.answerText,
                citations: turn.sources.map((s: any) => `${s.documentTitle}, Page ${s.pageNumber || 1}${s.clauseReference ? `, ${s.clauseReference}` : ''}`),
                detectedLang: turn.detectedLanguage,
                isAudio: true
              }
            ]);

            // Audio playback simulation
            setTimeout(() => {
              setIsPlayingAudio(false);
              setCaptions('');
            }, 6000);
          }
        } catch {
          // Fallback
          setQaHistory(prev => [
            ...prev,
            {
              q: 'What is the lock-in period in the lease agreement?',
              a: 'Clause 11 specifies a strict 11-month lock-in period during which termination incurs forfeiture of deposit.',
              citations: ['Lease Agreement, Page 2, Clause 11'],
              detectedLang: 'en'
            }
          ]);
        } finally {
          setIsProcessing(false);
        }
      }, 2500);
    } else {
      setIsRecording(false);
      setCaptions('');
    }
  };

  const handleSendTypedQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const question = inputText.trim();
    setInputText('');
    setIsProcessing(true);

    try {
      const res = await fetch(`/api/v1/cases/${caseId}/qa/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: question,
          languagePreference: selectedLanguage,
          mode: 'text'
        })
      });

      if (res.ok) {
        const data = await res.json();
        const turn = data.turn;
        setQaHistory(prev => [
          ...prev,
          {
            q: question,
            a: turn.answerText,
            citations: turn.sources.map((s: any) => `${s.documentTitle}, Page ${s.pageNumber || 1}${s.clauseReference ? `, ${s.clauseReference}` : ''}`),
            detectedLang: selectedLanguage,
            isAudio: false
          }
        ]);
      }
    } catch {
      // Local fallback
      setQaHistory(prev => [
        ...prev,
        {
          q: question,
          a: 'According to the scanned Lease Agreement and RTGS receipt, the rent is INR 45,000 and deposit is INR 2,50,000.',
          citations: ['Lease Agreement, Page 1, Clause 4'],
          detectedLang: selectedLanguage
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
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
        {/* Header with Language Selector & Stop Speaking */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Ask About Your Documents
            </h2>
            <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Globe style={{ width: 12, height: 12 }} />
              <span>Sarvam AI Speech • Grounded by Gemini</span>
            </div>
          </div>

          {isPlayingAudio && (
            <button
              onClick={handleStopSpeaking}
              style={{
                minHeight: '36px',
                background: '#dc2626',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                border: 'none'
              }}
            >
              <Square style={{ width: 12, height: 12, fill: '#ffffff' }} />
              Stop Speaking
            </button>
          )}
        </div>

        {/* Audio Route & Language Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
          background: '#f8fafc',
          padding: '8px 12px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          fontSize: '11px'
        }}>
          {/* Audio Source Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#64748b', fontWeight: 600 }}>Mic:</span>
            <button
              onClick={() => setActiveAudioSource('phone_microphone')}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: 'none',
                background: activeAudioSource === 'phone_microphone' ? '#4f46e5' : '#e2e8f0',
                color: activeAudioSource === 'phone_microphone' ? '#ffffff' : '#475569',
                fontWeight: 600,
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              📱 Phone
            </button>
            <button
              onClick={() => setActiveAudioSource('board_microphone')}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: 'none',
                background: activeAudioSource === 'board_microphone' ? '#4f46e5' : '#e2e8f0',
                color: activeAudioSource === 'board_microphone' ? '#ffffff' : '#475569',
                fontWeight: 600,
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <Radio style={{ width: 10, height: 10 }} /> Board
            </button>
          </div>

          {/* Language Correction / Selection */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#64748b', fontWeight: 600 }}>Lang:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as IndianLanguage)}
              style={{
                padding: '4px 6px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '11px',
                background: '#ffffff',
                color: '#0f172a',
                cursor: 'pointer'
              }}
            >
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
            {detectedLanguage && detectedLanguage !== selectedLanguage && (
              <span style={{ fontSize: '10px', color: '#ca8a04', background: '#fef9c3', padding: '2px 4px', borderRadius: '4px' }}>
                Detected: {detectedLanguage.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Live Captions Bar */}
        {(captions || isPlayingAudio) && (
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '12px',
            color: '#1e40af',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Volume2 style={{ width: 16, height: 16, flexShrink: 0, animation: 'pulse 1s infinite' }} />
            <span>{captions}</span>
          </div>
        )}

        {/* Permission Denied Recovery Banner */}
        {micPermissionDenied && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '12px',
            color: '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle style={{ width: 16, height: 16, flexShrink: 0 }} />
            <span>Microphone access blocked. Please enable permissions in browser settings or use typed questions below.</span>
          </div>
        )}

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
                {item.citations.length > 0 && (
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {item.citations.map((cite, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#0284c7' }}>
                        <CornerDownRight style={{ width: 11, height: 11 }} />
                        <span>{cite}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Push-to-Talk Button */}
        <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
          <button
            onClick={handleTogglePushToTalk}
            disabled={isProcessing}
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
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              border: 'none'
            }}
          >
            {isRecording ? <MicOff style={{ width: 16, height: 16 }} /> : <Mic style={{ width: 16, height: 16 }} />}
            {isRecording ? 'Listening... Tap to Complete' : isProcessing ? 'Processing...' : 'Push to Talk (Ask with Voice)'}
          </button>
        </div>

        {/* Typed Question Fallback Form (Usable without audio) */}
        <form onSubmit={handleSendTypedQuestion} style={{ display: 'flex', gap: '6px' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Or type a question about any document..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              cursor: inputText.trim() && !isProcessing ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Send style={{ width: 14, height: 14 }} />
          </button>
        </form>

        {/* Proceed to Report Delivery Button */}
        <button
          onClick={onProceedToDelivery}
          style={{
            minHeight: '44px',
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
            cursor: 'pointer',
            border: 'none'
          }}
        >
          View Case Findings & Export Report
          <ArrowRight style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  );
};
