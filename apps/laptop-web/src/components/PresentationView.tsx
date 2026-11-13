import React from 'react';
import { usePresentationView } from '../hooks/usePresentationView.js';
import {
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Eye,
  Activity,
  Layers,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  FileSearch,
  Scale
} from 'lucide-react';
import { BENCHES } from '@dharmaraksha/tribunal-definitions';

interface PresentationViewProps {
  caseId: string;
  theme: 'split' | 'light' | 'dark';
}

export const PresentationView: React.FC<PresentationViewProps> = ({ caseId, theme }) => {
  const isLight = theme === 'light';
  const {
    documentSetId,
    origin,
    status,
    milestones,
    specialistStates,
    findings,
    errors,
    isLoading,
    fetchError
  } = usePresentationView(caseId);

  // Background and border tokens
  const cardBg = isLight ? '#ffffff' : '#0f172a';
  const cardBorder = isLight ? '#e2e8f0' : '#1e293b';
  const textPrimary = isLight ? '#0f172a' : '#f8fafc';
  const textMuted = isLight ? '#64748b' : '#94a3b8';
  const accentBorder = isLight ? '#cbd5e1' : '#334155';

  // Compute bench summary
  const benchSummaries = BENCHES.map(b => {
    const specsInBench = specialistStates.filter(s => s.benchId === b.id);
    const activeCount = specsInBench.filter(s => s.taskStatus === 'active').length;
    const completedCount = specsInBench.filter(s => s.taskStatus === 'completed').length;
    const failedCount = specsInBench.filter(s => s.taskStatus === 'failed').length;
    const idleCount = specsInBench.length - activeCount - completedCount - failedCount;

    return {
      bench: b,
      activeCount,
      completedCount,
      failedCount,
      idleCount,
      total: specsInBench.length || 10
    };
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        padding: '24px',
        boxSizing: 'border-box',
        background: isLight ? '#f8fafc' : '#070a10',
        color: textPrimary,
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}
    >
      {/* Presentation Header Banner */}
      <div
        style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: '16px',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Scale style={{ width: 22, height: 22, color: '#0284c7' }} />
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              Evaluator Presentation View
            </h1>
            <span
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: 700,
                background: origin === 'kiosk_capture' ? '#f0fdf4' : '#eff6ff',
                color: origin === 'kiosk_capture' ? '#166534' : '#1e40af',
                border: `1px solid ${origin === 'kiosk_capture' ? '#bbf7d0' : '#bfdbfe'}`
              }}
            >
              {origin === 'kiosk_capture' ? '📱 Kiosk capture' : '💻 Laptop upload'}
            </span>
            <span
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: 700,
                background: isLight ? '#f1f5f9' : '#1e293b',
                color: textMuted
              }}
            >
              Case ID: {caseId}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: textMuted, margin: 0 }}>
            Server-authorized evaluative oversight: document intake, bench deliberation, truthful milestones, and validated findings.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: '8px',
              background: status === 'review_complete' ? '#ecfdf5' : status === 'cancelled' ? '#fef2f2' : '#eff6ff',
              color: status === 'review_complete' ? '#059669' : status === 'cancelled' ? '#dc2626' : '#2563eb'
            }}
          >
            {status === 'review_complete' ? (
              <CheckCircle2 style={{ width: 14, height: 14 }} />
            ) : (
              <Clock style={{ width: 14, height: 14 }} />
            )}
            <span>Status: {status.toUpperCase()}</span>
          </div>

          {isLoading && (
            <RefreshCw style={{ width: 16, height: 16, color: '#38bdf8', animation: 'spin 1s linear infinite' }} />
          )}
        </div>
      </div>

      {fetchError && (
        <div
          style={{
            padding: '12px 16px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            borderRadius: '10px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertCircle style={{ width: 16, height: 16 }} />
          <span>Error loading presentation stream: {fetchError}</span>
        </div>
      )}

      {/* Main Content Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '24px'
        }}
      >
        {/* Left Column: Intake Milestones Timeline */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: `1px solid ${cardBorder}`, paddingBottom: '12px' }}>
            <Clock style={{ width: 18, height: 18, color: '#0284c7' }} />
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
              Chronological Intake & Deliberation Milestones
            </h2>
          </div>

          {milestones.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: textMuted, fontSize: '13px' }}>
              <Clock style={{ width: 28, height: 28, margin: '0 auto 8px auto', opacity: 0.5 }} />
              Awaiting backend milestone dispatch...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {milestones.map((m, idx) => (
                <div
                  key={m.milestoneId || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '10px',
                    background: isLight ? '#f8fafc' : '#141c2e',
                    border: `1px solid ${cardBorder}`
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: '#ecfdf5',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <CheckCircle2 style={{ width: 14, height: 14 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: textPrimary }}>
                        {m.name}
                      </span>
                      <span style={{ fontSize: '11px', color: textMuted }}>
                        {m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : ''}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: textMuted, margin: '4px 0 0 0' }}>
                      {m.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: 5 Benches Activity Overview */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: `1px solid ${cardBorder}`, paddingBottom: '12px' }}>
            <Layers style={{ width: 18, height: 18, color: '#ca8a04' }} />
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
              Specialist Benches Real-Time State (50 Specialists)
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {benchSummaries.map(({ bench, activeCount, completedCount, failedCount, idleCount, total }) => (
              <div
                key={bench.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: `1px solid ${cardBorder}`,
                  background: isLight ? '#ffffff' : '#141c2e'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: bench.primaryColor
                      }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: textPrimary }}>
                      Bench {bench.id}: {bench.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: textMuted, fontWeight: 600 }}>
                    10 Specialists
                  </span>
                </div>

                {/* Progress bar of specialist states */}
                <div
                  style={{
                    height: '8px',
                    width: '100%',
                    background: isLight ? '#e2e8f0' : '#1e293b',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    display: 'flex',
                    marginBottom: '8px'
                  }}
                >
                  <div style={{ width: `${(completedCount / 10) * 100}%`, background: '#10b981' }} />
                  <div style={{ width: `${(activeCount / 10) * 100}%`, background: '#38bdf8' }} />
                  <div style={{ width: `${(failedCount / 10) * 100}%`, background: '#ef4444' }} />
                </div>

                <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: textMuted }}>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>{completedCount} Completed</span>
                  <span style={{ color: '#0284c7', fontWeight: 600 }}>{activeCount} Active</span>
                  {failedCount > 0 && (
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>{failedCount} Failed</span>
                  )}
                  <span>{idleCount} Idle / Breathing</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Truthful Failures & Errors Section (Honest Transparency) */}
      {errors && errors.length > 0 && (
        <div
          style={{
            background: isLight ? '#fef2f2' : '#2a1215',
            border: '1px solid #fecaca',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}>
            <AlertTriangle style={{ width: 18, height: 18 }} />
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
              Truthful Failures & Coverage Limitations
            </h2>
          </div>
          <p style={{ fontSize: '12px', color: isLight ? '#991b1b' : '#fca5a5', margin: 0 }}>
            Evaluators note: The tribunal preserves genuine coverage gaps and failures truthfully rather than simulating completeness.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {errors.map((err, i) => (
              <div
                key={i}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: isLight ? '#ffffff' : '#1a0d0e',
                  border: '1px solid #fca5a5',
                  fontSize: '12px',
                  color: isLight ? '#7f1d1d' : '#fecaca'
                }}
              >
                {err.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence-Backed Findings Section (if available) */}
      {findings && (
        <div
          style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: `1px solid ${cardBorder}`, paddingBottom: '14px' }}>
            <Sparkles style={{ width: 20, height: 20, color: '#ca8a04' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
              AI Presiding Reviewer — Validated Evidence Findings
            </h2>
          </div>

          {findings.executiveSummary && (
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: textMuted, textTransform: 'uppercase', marginBottom: '6px' }}>
                Executive Synthesis
              </h3>
              <p style={{ fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
                {findings.executiveSummary}
              </p>
            </div>
          )}

          {findings.keyObligations && findings.keyObligations.length > 0 && (
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: textMuted, textTransform: 'uppercase', marginBottom: '8px' }}>
                Key Obligations
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                {findings.keyObligations.map((ob, idx) => (
                  <li key={idx}>{ob}</li>
                ))}
              </ul>
            </div>
          )}

          {findings.materialRisks && findings.materialRisks.length > 0 && (
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', marginBottom: '8px' }}>
                Material Risks & Penalties
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#dc2626' }}>
                {findings.materialRisks.map((risk, idx) => (
                  <li key={idx}>{risk}</li>
                ))}
              </ul>
            </div>
          )}

          {findings.inconsistenciesIdentified && findings.inconsistenciesIdentified.length > 0 && (
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#ea580c', textTransform: 'uppercase', marginBottom: '8px' }}>
                Cross-Document Inconsistencies
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#ea580c' }}>
                {findings.inconsistenciesIdentified.map((inc, idx) => (
                  <li key={idx}>{inc}</li>
                ))}
              </ul>
            </div>
          )}

          {findings.questionsForVisitorClarification && (
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: textMuted, textTransform: 'uppercase', marginBottom: '8px' }}>
                Clarification Questions for Visitor
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                {(findings.questionsForVisitorClarification as string[]).map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Evaluator Security & Redaction Seal */}
      <div
        style={{
          textAlign: 'center',
          padding: '16px',
          fontSize: '11px',
          color: textMuted,
          borderTop: `1px solid ${cardBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        <Shield style={{ width: 14, height: 14, color: '#10b981' }} />
        <span>
          Server-enforced presentation boundary: Keys, internal prompts, provider diagnostics, and cross-case records are excluded from API responses.
        </span>
      </div>
    </div>
  );
};
