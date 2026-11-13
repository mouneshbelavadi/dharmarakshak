import React, { useState } from 'react';
import { MessageSquare, Volume2, Bookmark, CheckCircle2, AlertCircle, CornerDownRight } from 'lucide-react';
import { CaseRecord } from '@dharmaraksha/shared-contracts';

interface GroundedQAPanelProps {
  currentCase: CaseRecord;
}

export const GroundedQAPanel: React.FC<GroundedQAPanelProps> = ({ currentCase }) => {
  const [inputText, setInputText] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const sampleQaTurns = [
    {
      id: 'turn-01',
      question: 'What is my notice period if I decide to terminate the lease early?',
      answer: 'According to Clause 11 of the Lease Agreement, there is a mandatory 11-month lock-in period during which you cannot terminate without penalty. After the lock-in expires, Clause 15 requires you to serve a 60-day advance written notice to the lessor.',
      citations: [
        { doc: 'Lease Agreement', page: 2, clause: 'Clause 11', text: 'Mandatory 11-month lock-in period applies from commencement date.' },
        { doc: 'Lease Agreement', page: 3, clause: 'Clause 15', text: '60 days prior written intimation required for non-renewal or termination.' }
      ],
      isPreliminary: false
    },
    {
      id: 'turn-02',
      question: 'Can the landlord forfeit my deposit if I leave during the lock-in?',
      answer: 'Yes, Bench D flags Clause 12 as a severe unilateral penalty risk. The text states the lessor retains the full deposit as liquidated damages upon early termination. However, under Section 74 of the Indian Contract Act 1872, liquidated damages must be a reasonable pre-estimate of actual loss, not an arbitrary penalty.',
      citations: [
        { doc: 'Lease Agreement', page: 2, clause: 'Clause 12', text: 'Lessor reserves right to forfeit 100% security deposit upon early exit.' }
      ],
      authorities: ['Indian Contract Act 1872, Section 74 (Liquidated damages vs penalty)'],
      isPreliminary: false
    }
  ];

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#fdfbf7', // Ivory paper surface
      color: '#0f172a',
      boxSizing: 'border-box'
    }}>
      {/* Panel Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #e7e0d3', background: '#f9f6ef' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8', marginBottom: '4px' }}>
          <MessageSquare style={{ width: 18, height: 18 }} />
          <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Case-Grounded Conversational Intelligence
          </span>
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Grounded Q&A & Plain-Language Explanation
        </h2>
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
          Every substantive response is anchored to document page excerpts or verified statutory provisions.
        </div>
      </div>

      {/* Conversation Thread */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {sampleQaTurns.map((turn) => (
          <div key={turn.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* User Question */}
            <div style={{
              alignSelf: 'flex-end',
              background: '#0f172a',
              color: '#ffffff',
              borderRadius: '16px 16px 4px 16px',
              padding: '12px 18px',
              maxWidth: '75%',
              fontSize: '13px',
              lineHeight: 1.5
            }}>
              {turn.question}
            </div>

            {/* Grounded Answer Card */}
            <div style={{
              alignSelf: 'flex-start',
              background: '#ffffff',
              borderRadius: '16px 16px 16px 4px',
              padding: '18px',
              maxWidth: '85%',
              border: '1px solid #e7e0d3',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#047857', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>
                  GROUNDED ANSWER (PAGE CITED)
                </span>
                <button
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    color: '#334155'
                  }}
                >
                  <Volume2 style={{ width: 13, height: 13, color: '#4f46e5' }} />
                  {isPlayingAudio ? 'Speaking...' : 'Listen via Sarvam'}
                </button>
              </div>

              <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#1e293b', margin: '0 0 12px 0' }}>
                {turn.answer}
              </p>

              {/* Citations Box */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                  Supporting Evidence Citations:
                </div>
                {turn.citations.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#0369a1' }}>
                    <CornerDownRight style={{ width: 12, height: 12 }} />
                    <span style={{ fontWeight: 600 }}>{c.doc} (Page {c.page}, {c.clause}):</span>
                    <span style={{ color: '#475569', fontStyle: 'italic' }}>"{c.text}"</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid #e7e0d3', background: '#f9f6ef', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a question about this document set (e.g. rent increase, repair duties, renewal)..."
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            background: '#ffffff',
            outline: 'none'
          }}
        />
        <button
          style={{
            background: '#0f172a',
            color: '#ffffff',
            padding: '0 20px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          Ask
        </button>
      </div>
    </div>
  );
};

