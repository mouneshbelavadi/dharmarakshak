import React from 'react';
import { ShieldCheck, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

interface ProcessingStatusScreenProps {
  currentStage: number; // 1 to 5
  onProceedToQA: () => void;
}

const STAGES = [
  { id: 1, bench: 'Bench A', name: 'Document & Evidence Quality', desc: 'Verifying image clarity, page continuity, dates, and party names.' },
  { id: 2, bench: 'Bench B', name: 'Rights & Practical Obligations', desc: 'Mapping payment schedules, maintenance duties, lock-in, and termination.' },
  { id: 3, bench: 'Bench C', name: 'Indian Legal Corpus Verification', desc: 'Checking relevant state tenancy laws and the Indian Contract Act 1872.' },
  { id: 4, bench: 'Bench D', name: 'Adversarial Risk & Penalty Testing', desc: 'Stress-testing uncapped liabilities, deposit forfeiture, and ambiguity.' },
  { id: 5, bench: 'Bench E', name: 'Synthesis & Plain-Language Audit', desc: 'Reconciling cross-document conflicts and preparing plain-language summary.' }
];

export const ProcessingStatusScreen: React.FC<ProcessingStatusScreenProps> = ({
  currentStage,
  onProceedToQA
}) => {
  const isComplete = currentStage >= 5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '24px 20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: isComplete ? '#ecfdf5' : '#eff6ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto'
          }}>
            <ShieldCheck style={{ width: 32, height: 32, color: isComplete ? '#10b981' : '#3b82f6' }} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
            {isComplete ? 'Review Completed' : 'Tribunal Deliberation in Progress'}
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            {isComplete ? 'All 5 benches have finalized their findings.' : 'Watch the 3D chamber on the laptop screen.'}
          </p>
        </div>

        {/* Bench Progress Milestones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {STAGES.map((s) => {
            const isDone = currentStage > s.id || isComplete;
            const isCurrent = currentStage === s.id && !isComplete;

            return (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '10px',
                  background: isCurrent ? '#f0f9ff' : '#f8fafc',
                  border: isCurrent ? '1px solid #bae6fd' : '1px solid #f1f5f9'
                }}
              >
                {isDone ? (
                  <CheckCircle2 style={{ width: 18, height: 18, color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                ) : isCurrent ? (
                  <Clock style={{ width: 18, height: 18, color: '#0284c7', flexShrink: 0, marginTop: '2px' }} />
                ) : (
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #cbd5e1', flexShrink: 0, marginTop: '2px' }} />
                )}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: isCurrent ? '#0369a1' : '#1e293b' }}>
                    {s.bench}: {s.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>
                    {s.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Proceed to Q&A Button */}
        <button
          onClick={onProceedToQA}
          style={{
            minHeight: '48px',
            width: '100%',
            background: '#0f172a',
            color: '#ffffff',
            padding: '14px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          {isComplete ? 'View Findings & Ask Questions' : 'Ask Questions During Analysis'}
          <ArrowRight style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  );
};

