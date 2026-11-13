import React from 'react';
import { CameraPreset, CAMERA_PRESETS } from './chamber-types.js';
import { BENCHES, BenchId, ALL_SPECIALISTS, getSpecialistById, SpecialistDefinition } from '@dharmaraksha/tribunal-definitions';
import { CharacterActivity } from './character/types.js';
import { Camera, RotateCcw, Compass, Activity, Eye, Shield, Crown, FileText, CheckCircle2, User, Play, Radio, Clock } from 'lucide-react';

interface ChamberOverlayControlsProps {
  currentPreset: CameraPreset;
  onSelectPreset: (preset: CameraPreset) => void;
  is2DFallback: boolean;
  onToggle2DFallback: () => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  selectedBenchId: BenchId;
  selectedSpecialistId?: string;
  onSelectBench: (benchId: BenchId) => void;
  onSelectSpecialist: (specialistId: string) => void;
  theme: 'split' | 'light' | 'dark';
  currentActivity?: CharacterActivity;
  onSelectActivity?: (activity: CharacterActivity) => void;
  onOpenValidator?: () => void;
  onOpenScanner?: () => void;
  milestones?: Array<{ name: string; timestamp: string; status: string }>;
  origin?: string;
  isConnected?: boolean;
}

export const ChamberOverlayControls: React.FC<ChamberOverlayControlsProps> = ({
  currentPreset,
  onSelectPreset,
  is2DFallback,
  onToggle2DFallback,
  reducedMotion,
  onToggleReducedMotion,
  selectedBenchId,
  selectedSpecialistId,
  onSelectBench,
  onSelectSpecialist,
  theme,
  currentActivity = 'idle_breathing',
  onSelectActivity,
  onOpenValidator,
  onOpenScanner,
  milestones,
  origin,
  isConnected
}) => {
  const isLight = theme === 'light';
  const panelBg = isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(15, 23, 42, 0.90)';
  const borderColor = isLight ? '#cbd5e1' : '#334155';
  const textPrimary = isLight ? '#0f172a' : '#f8fafc';
  const textMuted = isLight ? '#64748b' : '#94a3b8';

  const selectedSpecialist: SpecialistDefinition | undefined = selectedSpecialistId
    ? getSpecialistById(selectedSpecialistId)
    : undefined;

  const currentBench = BENCHES.find((b) => b.id === selectedBenchId) || BENCHES[0];

  const activities: Array<{ id: CharacterActivity; label: string }> = [
    { id: 'idle_breathing', label: 'Idle Breathing' },
    { id: 'attentive_listening', label: 'Attentive Listening' },
    { id: 'seated_reading', label: 'Seated Reading' },
    { id: 'checking_source', label: 'Checking Source' },
    { id: 'note_taking', label: 'Note Taking' },
    { id: 'discussion_gesture', label: 'Discussion Gesture' },
    { id: 'packet_handoff', label: 'Packet Handoff' }
  ];

  const hasLiveEvents = milestones && milestones.length > 0;
  const recentMilestones = milestones ? milestones.slice(-3).reverse() : [];

  return (
    <>
      {/* Top Bar: Camera Presets, Origin, Character Activities & Mode Toggles */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        right: '12px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        pointerEvents: 'none',
        zIndex: 10
      }}>
        {/* Camera Preset Toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: panelBg,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${borderColor}`,
          borderRadius: '8px',
          padding: '4px 6px',
          pointerEvents: 'auto',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 6px', borderRight: `1px solid ${borderColor}`, marginRight: '2px' }}>
            <Camera style={{ width: 14, height: 14, color: '#38bdf8' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: textPrimary }}>
              Views:
            </span>
          </div>

          <button
            onClick={() => onSelectPreset('overall')}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '5px',
              background: currentPreset === 'overall' ? '#38bdf8' : 'transparent',
              color: currentPreset === 'overall' ? '#0f172a' : textMuted,
              border: 'none',
              cursor: 'pointer'
            }}
            title={CAMERA_PRESETS.overall.description}
          >
            Overall
          </button>

          {BENCHES.map((bench) => {
            const presetKey = `bench-${bench.id}` as CameraPreset;
            const isActive = currentPreset === presetKey;
            return (
              <button
                key={bench.id}
                onClick={() => {
                  onSelectBench(bench.id);
                  onSelectPreset(presetKey);
                }}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '5px',
                  background: isActive ? bench.primaryColor : 'transparent',
                  color: isActive ? '#ffffff' : textMuted,
                  border: 'none',
                  cursor: 'pointer'
                }}
                title={CAMERA_PRESETS[presetKey].description}
              >
                Bench {bench.id}
              </button>
            );
          })}

          <button
            onClick={() => onSelectPreset('document')}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '5px',
              background: currentPreset === 'document' ? '#38bdf8' : 'transparent',
              color: currentPreset === 'document' ? '#0f172a' : textMuted,
              border: 'none',
              cursor: 'pointer'
            }}
            title={CAMERA_PRESETS.document.description}
          >
            Well
          </button>

          <button
            onClick={() => onSelectPreset('presiding')}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '5px',
              background: currentPreset === 'presiding' ? '#fbbf24' : 'transparent',
              color: currentPreset === 'presiding' ? '#0f172a' : textMuted,
              border: 'none',
              cursor: 'pointer'
            }}
            title={CAMERA_PRESETS.presiding.description}
          >
            Presiding
          </button>

          <button
            onClick={() => onSelectPreset('overall')}
            style={{
              padding: '4px 6px',
              fontSize: '11px',
              borderRadius: '5px',
              background: 'transparent',
              color: textMuted,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}
            title="Reset to default chamber view"
          >
            <RotateCcw style={{ width: 12, height: 12 }} />
            <span>Reset</span>
          </button>
        </div>

        {/* View Mode, Activity, Origin & Accessibility Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          pointerEvents: 'auto'
        }}>
          {/* Origin Badge */}
          {origin && (
            <div style={{
              background: panelBg,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${borderColor}`,
              borderRadius: '8px',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 700,
              color: origin === 'kiosk_capture' ? '#16a34a' : '#0284c7'
            }}>
              <span>{origin === 'kiosk_capture' ? '📱 Kiosk capture' : '💻 Laptop upload'}</span>
            </div>
          )}

          {/* SSE Live Connection Status Indicator */}
          {isConnected !== undefined && (
            <div style={{
              background: panelBg,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${borderColor}`,
              borderRadius: '8px',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              fontWeight: 600,
              color: isConnected ? '#10b981' : '#94a3b8'
            }}>
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: isConnected ? '#10b981' : '#94a3b8',
                display: 'inline-block'
              }} />
              <span>{isConnected ? 'Live' : 'Offline'}</span>
            </div>
          )}

          {/* Animated Activity Clip Selector */}
          {onSelectActivity && (
            <div style={{
              background: panelBg,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${borderColor}`,
              borderRadius: '8px',
              padding: '3px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <label htmlFor="html-activity-select" style={{ fontSize: '11px', fontWeight: 600, color: textMuted, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Play style={{ width: 10, height: 10, color: '#38bdf8' }} />
                <span>{hasLiveEvents ? 'Activity (Debug):' : 'Activity:'}</span>
              </label>
              <select
                id="html-activity-select"
                value={currentActivity}
                onChange={(e) => onSelectActivity(e.target.value as CharacterActivity)}
                style={{
                  fontSize: '11px',
                  padding: '3px 6px',
                  borderRadius: '4px',
                  background: isLight ? '#ffffff' : '#1e293b',
                  color: textPrimary,
                  border: `1px solid ${borderColor}`,
                  cursor: 'pointer'
                }}
              >
                {activities.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Specialist HTML Selector */}
          <div style={{
            background: panelBg,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${borderColor}`,
            borderRadius: '8px',
            padding: '3px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <label htmlFor="html-specialist-select" style={{ fontSize: '11px', fontWeight: 600, color: textMuted }}>
              Select Seat:
            </label>
            <select
              id="html-specialist-select"
              value={selectedSpecialistId || ''}
              onChange={(e) => {
                const specId = e.target.value;
                if (specId) {
                  const spec = getSpecialistById(specId);
                  if (spec) {
                    onSelectBench(spec.benchId);
                    onSelectSpecialist(specId);
                  }
                }
              }}
              style={{
                fontSize: '11px',
                padding: '3px 6px',
                borderRadius: '4px',
                background: isLight ? '#ffffff' : '#1e293b',
                color: textPrimary,
                border: `1px solid ${borderColor}`,
                cursor: 'pointer',
                maxWidth: '170px'
              }}
            >
              <option value="">-- All 50 Specialists --</option>
              {BENCHES.map((bench) => (
                <optgroup key={bench.id} label={`Bench ${bench.id}: ${bench.name}`}>
                  {bench.specialists.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id}: {s.name} {s.isChair ? '[CHAIR]' : ''}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Live Document Camera Scanner Button */}
          {onOpenScanner && (
            <button
              onClick={onOpenScanner}
              style={{
                padding: '5px 12px',
                fontSize: '11px',
                fontWeight: 700,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(201, 168, 76, 0.25) 0%, rgba(180, 83, 9, 0.3) 100%)',
                color: '#fef08a',
                border: '1px solid #c9a84c',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 2px 10px rgba(201, 168, 76, 0.25)'
              }}
              title="Open Live Courtroom Document Camera Scanner (OCR + Gemini Grounded Analysis)"
            >
              <Camera style={{ width: 13, height: 13, color: '#fbbf24' }} />
              <span>Scan Document</span>
            </button>
          )}

          {/* Single Character Rig Validator Button */}
          {onOpenValidator && (
            <button
              onClick={onOpenValidator}
              style={{
                padding: '5px 10px',
                fontSize: '11px',
                fontWeight: 700,
                borderRadius: '8px',
                background: '#ca8a04',
                color: '#ffffff',
                border: '1px solid #eab308',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backdropFilter: 'blur(10px)'
              }}
              title="First Validation: Test individual seated character and messenger rigs"
            >
              <User style={{ width: 12, height: 12 }} />
              <span>Validate Rig</span>
            </button>
          )}

          {/* Reduced Motion Toggle */}
          <button
            onClick={onToggleReducedMotion}
            style={{
              padding: '5px 10px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '8px',
              background: reducedMotion ? '#ca8a04' : panelBg,
              color: reducedMotion ? '#ffffff' : textMuted,
              border: `1px solid ${borderColor}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              backdropFilter: 'blur(10px)'
            }}
            title={reducedMotion ? 'Reduced motion active (instant camera transitions)' : 'Enable reduced motion (disables smooth lerping)'}
          >
            <Activity style={{ width: 12, height: 12 }} />
            <span>{reducedMotion ? 'Reduced Motion: ON' : 'Reduced Motion: OFF'}</span>
          </button>

          {/* 2D Fallback Toggle */}
          <button
            onClick={onToggle2DFallback}
            style={{
              padding: '5px 10px',
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: '8px',
              background: is2DFallback ? '#0284c7' : panelBg,
              color: is2DFallback ? '#ffffff' : textPrimary,
              border: `1px solid ${borderColor}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              backdropFilter: 'blur(10px)'
            }}
            title="Toggle between 3D WebGL chamber and 2D architectural map"
          >
            <Compass style={{ width: 13, height: 13 }} />
            <span>{is2DFallback ? 'Switch to 3D Canvas' : '2D Fallback Map'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Floating Info Pill: Contextual Evidence, Real Milestones & Specialist Banner */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        maxWidth: '560px',
        background: panelBg,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '12px',
        color: textMuted,
        pointerEvents: 'auto',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
        zIndex: 10
      }}>
        {selectedSpecialist ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: selectedSpecialist.isChair ? '#fbbf24' : '#38bdf8'
                }}>
                  {selectedSpecialist.id} • {selectedSpecialist.name}
                </span>
                {selectedSpecialist.isChair && (
                  <span style={{ fontSize: '10px', background: '#ca8a04', color: '#ffffff', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                    BENCH CHAIR (SEAT 10)
                  </span>
                )}
              </div>
              <button
                onClick={() => onSelectSpecialist('')}
                style={{ background: 'transparent', border: 'none', color: textMuted, fontSize: '11px', cursor: 'pointer' }}
              >
                Clear
              </button>
            </div>
            <div style={{ color: textPrimary, fontSize: '11px', marginBottom: '6px', lineHeight: 1.35 }}>
              {selectedSpecialist.role}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '10px', color: textMuted }}>
              <span><strong>Bench:</strong> {currentBench.id} ({currentBench.name})</span>
              <span><strong>Prompt:</strong> {selectedSpecialist.promptVersion}</span>
              <span><strong>Timeout:</strong> {selectedSpecialist.timeoutMs / 1000}s</span>
              <span><strong>Focus:</strong> {selectedSpecialist.focus}</span>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontWeight: 700, color: textPrimary, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield style={{ width: 14, height: 14, color: currentBench.primaryColor }} />
              <span>Chamber Active — Bench {currentBench.id}: {currentBench.name}</span>
            </div>
            <div style={{ fontSize: '11px', lineHeight: 1.35 }}>
              {currentBench.workingPrinciple}
            </div>

            {/* If real milestones exist, display recent real milestones */}
            {recentMilestones.length > 0 && (
              <div style={{ marginTop: '8px', borderTop: `1px solid ${borderColor}`, paddingTop: '6px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#38bdf8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock style={{ width: 10, height: 10 }} />
                  <span>Real Persisted Milestones:</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {recentMilestones.map((rm, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: textPrimary }}>
                      <span>✓ {rm.name}</span>
                      <span style={{ color: textMuted }}>{rm.timestamp ? new Date(rm.timestamp).toLocaleTimeString() : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ fontSize: '10px', color: '#38bdf8', marginTop: '6px' }}>
              Click any of the 10 animated specialist characters around the table to inspect individual contract and findings
            </div>
          </div>
        )}
      </div>
    </>
  );
};
