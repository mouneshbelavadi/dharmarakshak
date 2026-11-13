import React from 'react';
import { ShieldCheck, CheckCircle2, Clock, ArrowRight, AlertCircle, Laptop, Smartphone, FileSpreadsheet } from 'lucide-react';
import { useCaseProgress } from '../hooks/useCaseProgress.js';

interface ProcessingStatusScreenProps {
  currentStage: number; // 1 to 5 (fallback/demo mode)
  onProceedToQA: () => void;
  caseId?: string; // When provided, drives live progress from API
}

const STAGES = [
  { id: 1, bench: 'Bench A', name: 'Document & Evidence Quality', desc: 'Verifying image clarity, page continuity, dates, and party names.' },
  { id: 2, bench: 'Bench B', name: 'Rights & Practical Obligations', desc: 'Mapping payment schedules, maintenance duties, lock-in, and termination.' },
  { id: 3, bench: 'Bench C', name: 'Indian Legal Corpus Verification', desc: 'Checking relevant state tenancy laws and the Indian Contract Act 1872.' },
  { id: 4, bench: 'Bench D', name: 'Adversarial Risk & Penalty Testing', desc: 'Stress-testing uncapped liabilities, deposit forfeiture, and ambiguity.' },
  { id: 5, bench: 'Bench E', name: 'Synthesis & Plain-Language Audit', desc: 'Reconciling cross-document conflicts and preparing plain-language summary.' }
];

const BENCH_CONFIGS = [
  { benchId: 'A', name: 'Document Quality & Extraction', total: 10 },
  { benchId: 'B', name: 'Practical Rights & Obligations', total: 10 },
  { benchId: 'C', name: 'Indian Legal Corpus Verification', total: 10 },
  { benchId: 'D', name: 'Adversarial Risk & Penalty Testing', total: 10 },
  { benchId: 'E', name: 'Synthesis & Plain-Language Audit', total: 10 }
];

export const ProcessingStatusScreen: React.FC<ProcessingStatusScreenProps> = ({
  currentStage,
  onProceedToQA,
  caseId
}) => {
  const liveProgress = useCaseProgress(caseId || null);

  const isLive = Boolean(caseId);
  const isComplete = isLive
    ? liveProgress.status === 'review_complete' || liveProgress.milestones.some(m => m.name.toLowerCase().includes('synthesis complete') || m.name.toLowerCase().includes('report ready'))
    : currentStage >= 5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '24px 20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Origin & Case Header when in live mode */}
        {isLive && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 8px',
              borderRadius: '6px',
              background: liveProgress.origin === 'kiosk_capture' ? '#f0fdf4' : '#eff6ff',
              color: liveProgress.origin === 'kiosk_capture' ? '#15803d' : '#1d4ed8',
              border: `1px solid ${liveProgress.origin === 'kiosk_capture' ? '#bbf7d0' : '#bfdbfe'}`
            }}>
              {liveProgress.origin === 'kiosk_capture' ? (
                <>
                  <Smartphone style={{ width: 12, height: 12 }} />
                  <span>Kiosk capture</span>
                </>
              ) : (
                <>
                  <Laptop style={{ width: 12, height: 12 }} />
                  <span>Laptop upload</span>
                </>
              )}
            </span>

            <div style={{ display: 'flex', gap: '6px', fontSize: '10px', color: '#64748b' }}>
              <span style={{ fontFamily: 'monospace', background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                {liveProgress.caseId || caseId}
              </span>
              {liveProgress.documentSetId && (
                <span style={{ fontFamily: 'monospace', background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  {liveProgress.documentSetId}
                </span>
              )}
            </div>
          </div>
        )}

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

        {/* Live Mode: Real Bench Progress & Milestones */}
        {isLive && liveProgress.specialistStates.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Bench Execution Progress (50 Specialists)
            </div>
            {BENCH_CONFIGS.map((cfg) => {
              const benchSpecialists = liveProgress.specialistStates.filter(s => s.benchId === cfg.benchId);
              const completedCount = benchSpecialists.filter(s => s.taskStatus === 'completed').length;
              const activeCount = benchSpecialists.filter(s => s.taskStatus === 'active').length;
              const isBenchDone = completedCount === cfg.total;
              const isBenchActive = activeCount > 0 || completedCount > 0;

              return (
                <div
                  key={cfg.benchId}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: isBenchDone ? '#f0fdf4' : isBenchActive ? '#f0f9ff' : '#f8fafc',
                    border: `1px solid ${isBenchDone ? '#bbf7d0' : isBenchActive ? '#bae6fd' : '#f1f5f9'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isBenchDone ? (
                        <CheckCircle2 style={{ width: 15, height: 15, color: '#10b981' }} />
                      ) : isBenchActive ? (
                        <Clock style={{ width: 15, height: 15, color: '#0284c7' }} />
                      ) : (
                        <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #cbd5e1' }} />
                      )}
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                        Bench {cfg.benchId}: {cfg.name}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: isBenchDone ? '#15803d' : '#64748b' }}>
                      {completedCount}/{cfg.total}
                    </span>
                  </div>
                  {/* Visual Progress Bar */}
                  <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, (completedCount / cfg.total) * 100)}%`,
                        height: '100%',
                        background: isBenchDone ? '#10b981' : '#38bdf8',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Milestones Timeline */}
            {liveProgress.milestones.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  Recorded Milestones ({liveProgress.milestones.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {liveProgress.milestones.map((m) => (
                    <div
                      key={m.milestoneId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        fontSize: '11px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 style={{ width: 12, height: 12, color: '#10b981' }} />
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{m.name}</span>
                      </div>
                      <span style={{ color: '#94a3b8', fontSize: '10px' }}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Fallback / Static Demo Mode */
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
        )}

        {/* Truthful Errors Section */}
        {isLive && liveProgress.errors.length > 0 && (
          <div style={{
            marginBottom: '16px',
            padding: '10px 12px',
            borderRadius: '8px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '11px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px' }}>
              <AlertCircle style={{ width: 14, height: 14 }} />
              <span>Recorded Issues ({liveProgress.errors.length})</span>
            </div>
            {liveProgress.errors.map((err, idx) => (
              <div key={idx} style={{ marginTop: '2px' }}>
                • {err.message}
              </div>
            ))}
          </div>
        )}

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
