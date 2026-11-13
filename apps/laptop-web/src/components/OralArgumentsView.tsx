import React, { useState, useRef, useEffect } from 'react';
import { CaseRecord, LaptopTheme } from '@dharmaraksha/shared-contracts';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Scale,
  RotateCcw,
  Globe,
  Radio,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface OralArgumentsViewProps {
  currentCase: CaseRecord;
  theme?: LaptopTheme;
}

interface Message {
  id: string;
  sender: 'citizen' | 'tribunal';
  text: string;
  spokenAudio?: boolean;
  citations?: string[];
  timestamp: string;
  language?: string;
}

export const OralArgumentsView: React.FC<OralArgumentsViewProps> = ({
  currentCase,
  theme = 'split'
}) => {
  const isLight = theme === 'light';
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'tribunal',
      text: 'The Supreme Appellate Tribunal is in session. You may present oral inquiries or ask specific legal questions regarding your Commercial Lease Agreement and Security Deposit Counterfoil.',
      timestamp: '10:00 AM',
      citations: ['Clause 4, Lease Agreement', 'Section 105, Transfer of Property Act 1882']
    },
    {
      id: 'm2',
      sender: 'citizen',
      text: 'Can the landlord forfeit my entire 6-month security deposit if I have to terminate the lease early?',
      timestamp: '10:01 AM',
      language: 'en'
    },
    {
      id: 'm3',
      sender: 'tribunal',
      text: 'Under Clause 12 of your lease deed, the landlord attempts to reserve an unconditional right to forfeit 100% of your deposit. However, Bench C and Bench D have adjudicated that this is a penal forfeiture under Section 74 of the Indian Contract Act, 1872. Following the Supreme Court landmark in Kailash Nath Associates v. DDA (2015), the lessor cannot legally forfeit your deposit without proving actual financial damage suffered.',
      spokenAudio: true,
      citations: ['Clause 12, Lease Deed', 'Section 74, Indian Contract Act 1872', 'Kailash Nath Associates v. DDA (2015) 4 SCC 136'],
      timestamp: '10:01 AM'
    }
  ]);

  const [waveformData, setWaveformData] = useState<number[]>([15, 30, 45, 20, 60, 80, 40, 95, 70, 40, 25, 60, 85, 30, 15]);

  // Simulate audio waveform animation when listening or speaking
  useEffect(() => {
    let interval: any;
    if (isListening || isSpeaking) {
      interval = setInterval(() => {
        setWaveformData(Array.from({ length: 24 }, () => Math.floor(Math.random() * 80) + 15));
      }, 100);
    } else {
      setWaveformData(Array.from({ length: 24 }, () => 8));
    }
    return () => clearInterval(interval);
  }, [isListening, isSpeaking]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: `m-${Date.now()}`,
      sender: 'citizen',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: selectedLanguage
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Simulate grounded tribunal response
    setTimeout(() => {
      setIsSpeaking(true);
      const tribunalMsg: Message = {
        id: `t-${Date.now()}`,
        sender: 'tribunal',
        text: `Bench E and the Presiding Reviewer have examined your question regarding "${userMsg.text}". All obligations must be grounded in the verified case record. Clause 4 confirms rent of INR 45,000 is due by the 5th of every month, while Clause 14's 24% delayed payment penalty has been marked as unenforceable.`,
        spokenAudio: true,
        citations: ['Clause 4 (Rent)', 'Clause 14 (Interest Penalty)', 'Section 73, Contract Act'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, tribunalMsg]);

      setTimeout(() => {
        setIsSpeaking(false);
      }, 4000);
    }, 1200);
  };

  const handleToggleMic = () => {
    if (isSpeaking) {
      // Immediate prompt interruption
      setIsSpeaking(false);
      return;
    }

    if (isListening) {
      setIsListening(false);
      // Simulate recognized question
      setInputText('Is the 24 percent interest on late rent valid under Indian law?');
    } else {
      setIsListening(true);
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      backgroundColor: '#05070e',
      color: '#f8fafc',
      padding: '24px 32px',
      boxSizing: 'border-box',
      display: 'grid',
      gridTemplateColumns: '60% 40%',
      gap: '24px'
    }}>
      {/* Left Column: Courtroom Transcript & Oral Deliberations */}
      <div style={{
        background: '#080f1f',
        border: '1px solid rgba(201,168,76,0.2)',
        borderTop: '3px solid #c9a84c',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Oral Chamber Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(201,168,76,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0e1628 0%, #111e38 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #c9a84c 0%, #8b6218 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#05070e'
            }}>
              <Scale style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h2 style={{
                fontSize: '16px',
                fontWeight: 800,
                fontFamily: 'var(--font-serif)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                margin: 0,
                color: '#f4f6fb'
              }}>
                Oral Arguments & Live Voice Chamber
              </h2>
              <div style={{ fontSize: '11px', color: '#7a8aab' }}>
                Sarvam AI Saaras/Bulbul Engine • Document-Grounded Gemini Synthesis
              </div>
            </div>
          </div>

          {/* Language Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe style={{ width: 14, height: 14, color: '#c9a84c' }} />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              style={{
                background: '#0d1628',
                border: '1px solid rgba(201, 168, 76, 0.3)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '12px',
                color: '#f8fafc',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="en">English (Default)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="mr">मराठी (Marathi)</option>
            </select>
          </div>
        </div>

        {/* Message / Argument Feed */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {messages.map((msg) => {
            const isTribunal = msg.sender === 'tribunal';
            if (isTribunal) {
              return (
                <div
                  key={msg.id}
                  style={{
                    width: '100%',
                    background: '#0a1020',
                    borderLeft: '4px solid #c9a84c',
                    borderRadius: '0 8px 8px 0',
                    padding: '16px 20px',
                    margin: '0',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '9px',
                    letterSpacing: '2px',
                    color: '#c9a84c',
                    textTransform: 'uppercase',
                    marginBottom: '8px'
                  }}>
                    HON'BLE TRIBUNAL • {msg.timestamp}
                  </div>
                  <div style={{ fontSize: '13.5px', color: '#e8eaf2', lineHeight: 1.7 }}>
                    {msg.text}
                  </div>
                  {msg.citations && msg.citations.length > 0 && (
                    <div style={{
                      marginTop: '12px',
                      paddingTop: '8px',
                      borderTop: '1px solid rgba(201, 168, 76, 0.2)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px'
                    }}>
                      {msg.citations.map((cite, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: 'transparent',
                            border: '1px solid rgba(201, 168, 76, 0.4)',
                            color: '#c9a84c',
                            borderRadius: '3px',
                            fontSize: '10.5px',
                            fontFamily: 'var(--font-serif)',
                            padding: '2px 8px',
                            textDecoration: 'underline dotted'
                          }}
                        >
                          § {cite}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                style={{
                  background: '#111828',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRight: '4px solid #3b82f6',
                  borderRadius: '8px 0 0 8px',
                  padding: '16px 20px',
                  marginLeft: 'auto',
                  maxWidth: '75%',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{
                  fontSize: '9px',
                  letterSpacing: '2px',
                  color: '#60a5fa',
                  textTransform: 'uppercase',
                  textAlign: 'right',
                  marginBottom: '8px'
                }}>
                  CITIZEN APPELLANT • {msg.timestamp}
                </div>
                <div style={{ fontSize: '13.5px', color: '#f8fafc', lineHeight: 1.6 }}>
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Input Bar */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(201, 168, 76, 0.2)',
          background: '#050a14',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button
            onClick={handleToggleMic}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: isListening
                ? '#ef4444'
                : isSpeaking
                  ? '#f59e0b'
                  : 'linear-gradient(135deg, #c9a84c 0%, #8b6218 100%)',
              color: '#05070e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              boxShadow: isListening ? '0 0 16px rgba(239, 68, 68, 0.6)' : '0 4px 12px rgba(201, 168, 76, 0.3)',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            title={isSpeaking ? 'Interrupt Tribunal Speech' : isListening ? 'Stop Recording' : 'Push to Talk'}
          >
            {isListening ? (
              <MicOff style={{ width: 20, height: 20, color: '#ffffff' }} />
            ) : isSpeaking ? (
              <VolumeX style={{ width: 20, height: 20, color: '#ffffff' }} />
            ) : (
              <Mic style={{ width: 20, height: 20, color: '#05070e' }} />
            )}
          </button>

          <input
            type="text"
            placeholder={isListening ? 'Listening to oral submission in real time...' : 'Type legal inquiry or clause question...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            style={{
              flex: 1,
              background: '#0d1628',
              border: '1px solid rgba(201, 168, 76, 0.3)',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '13px',
              color: '#f4f6fb',
              outline: 'none'
            }}
          />

          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            style={{
              background: 'linear-gradient(135deg, #c9a84c 0%, #8b6218 100%)',
              color: '#05070e',
              fontWeight: 700,
              fontFamily: 'var(--font-serif)',
              fontSize: '12px',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: inputText.trim() ? 'pointer' : 'not-allowed',
              opacity: inputText.trim() ? 1 : 0.45,
              transition: 'all 0.15s',
              flexShrink: 0
            }}
          >
            <Send style={{ width: 14, height: 14 }} />
            <span>Submit</span>
          </button>
        </div>
      </div>

      {/* Right Column: Courtroom Acoustic & Voice Grounding Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Live Audio Oscilloscope Card */}
        <div style={{
          background: '#080f1f',
          border: '1px solid rgba(201, 168, 76, 0.2)',
          borderTop: '3px solid rgba(201, 168, 76, 0.5)',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{
              fontSize: '15px',
              fontWeight: 800,
              fontFamily: 'var(--font-serif)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              margin: '0 0 4px 0',
              color: '#f4f6fb'
            }}>
              Courtroom Acoustic Monitor
            </h3>
            <div style={{ fontSize: '11px', color: '#7a8aab' }}>
              {isListening ? '🎙️ Visitor Microphone Active' : isSpeaking ? '🔊 Presiding Judge Speaking' : '🟢 Courtroom Idle • Ready'}
            </div>
          </div>

          {/* 24-Bar Vertical Waveform Oscilloscope */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: '5px',
            height: '70px',
            width: '100%',
            background: '#050a14',
            border: '1px solid rgba(201, 168, 76, 0.15)',
            borderRadius: '8px',
            padding: '8px 12px',
            boxSizing: 'border-box'
          }}>
            {waveformData.slice(0, 24).map((val, i) => {
              const isActiveAudio = isListening || isSpeaking;
              const barHeight = isActiveAudio ? Math.max(4, Math.min(60, (val / 100) * 60)) : 4;
              return (
                <div
                  key={i}
                  style={{
                    width: '3px',
                    height: `${barHeight}px`,
                    borderRadius: '2px',
                    backgroundColor: '#c9a84c',
                    transformOrigin: 'bottom',
                    transition: 'height 80ms ease'
                  }}
                />
              );
            })}
          </div>

          {/* Status Indicators */}
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#050a14', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}>
              <span style={{ color: '#7a8aab' }}>Active Audio Route:</span>
              <strong style={{ color: '#38bdf8' }}>Central Courtroom Mic</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#050a14', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}>
              <span style={{ color: '#7a8aab' }}>Synthesis Engine:</span>
              <strong style={{ color: '#c9a84c' }}>Sarvam Bulbul (44.1 kHz)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#050a14', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}>
              <span style={{ color: '#7a8aab' }}>Interruption State:</span>
              <strong style={{ color: '#10b981' }}>Single Speaking Assistant Guard</strong>
            </div>
          </div>
        </div>

        {/* Prompt Interruption & Accessibility Guidelines */}
        <div style={{
          background: '#080f1f',
          border: '1px solid rgba(201, 168, 76, 0.2)',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          fontSize: '12px',
          lineHeight: 1.6,
          color: '#7a8aab'
        }}>
          <div style={{ fontWeight: 800, color: '#f4f6fb', fontFamily: 'var(--font-serif)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles style={{ width: 14, height: 14, color: '#c9a84c' }} />
            Specification S5 Voice Rules:
          </div>
          <div>• <strong style={{ color: '#e8eaf2' }}>Single Speaking Assistant:</strong> Only one audio route is active at any time.</div>
          <div>• <strong style={{ color: '#e8eaf2' }}>Immediate Interruption:</strong> Clicking the microphone while the tribunal is speaking instantly halts audio output.</div>
          <div>• <strong style={{ color: '#e8eaf2' }}>Document Grounding:</strong> No answer is returned without direct citation of clause numbers and statutory authority.</div>
        </div>
      </div>
    </div>
  );
};

