import React from 'react';
import {
  BENCHES,
  BenchId,
  BenchDefinition,
  SpecialistDefinition,
  getSpecialistById
} from '@dharmaraksha/tribunal-definitions';
import { Shield, Crown, CheckCircle2, ChevronRight, AlertCircle, FileCheck, X } from 'lucide-react';

interface BenchInspectorProps {
  selectedBenchId: BenchId;
  selectedSpecialistId?: string;
  onSelectBench: (benchId: BenchId) => void;
  onSelectSpecialist: (specialistId: string) => void;
}

export const BenchInspector: React.FC<BenchInspectorProps> = ({
  selectedBenchId,
  selectedSpecialistId,
  onSelectBench,
  onSelectSpecialist
}) => {
  const currentBench = BENCHES.find((b: BenchDefinition) => b.id === selectedBenchId) || BENCHES[0];

  const selectedSpecialist: SpecialistDefinition | undefined = selectedSpecialistId
    ? getSpecialistById(selectedSpecialistId)
    : undefined;

  return (
    <aside style={{
      width: '360px',
      height: '100%',
      backgroundColor: '#0f172a',
      borderLeft: '1px solid #1e293b',
      display: 'flex',
      flexDirection: 'column',
      color: '#f8fafc',
      zIndex: 20
    }}>
      {/* Bench Tabs Header */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #1e293b',
        background: '#090d16'
      }}>
        {BENCHES.map((b: BenchDefinition) => {
          const isCurrent = b.id === selectedBenchId;
          return (
            <button
              key={b.id}
              onClick={() => onSelectBench(b.id)}
              style={{
                flex: 1,
                padding: '10px 2px',
                fontSize: '11px',
                fontWeight: 700,
                background: isCurrent ? '#1e293b' : 'transparent',
                color: isCurrent ? b.primaryColor : '#64748b',
                borderBottom: isCurrent ? `2px solid ${b.primaryColor}` : '2px solid transparent',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              Bench {b.id}
            </button>
          );
        })}
      </div>

      {/* Selected Bench Overview Banner */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #1e293b', background: '#131b2e' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield style={{ width: 16, height: 16, color: currentBench.primaryColor }} />
            <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Bench {currentBench.id} — {currentBench.name}
            </h2>
          </div>
          <span style={{ fontSize: '10px', background: `${currentBench.primaryColor}22`, color: currentBench.primaryColor, padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
            10 SEATS
          </span>
        </div>
        <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4, margin: '6px 0 0 0' }}>
          {currentBench.workingPrinciple}
        </p>
      </div>

      {/* Expanded Specialist Detail Drawer (When a specialist is selected) */}
      {selectedSpecialist && (
        <div style={{
          padding: '14px 16px',
          background: '#1e293b',
          borderBottom: '2px solid #38bdf8',
          maxHeight: '260px',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: selectedSpecialist.isChair ? '#fbbf24' : '#38bdf8' }}>
                  {selectedSpecialist.id} • {selectedSpecialist.name}
                </span>
                {selectedSpecialist.isChair && (
                  <span style={{ fontSize: '9px', background: '#854d0e', color: '#fef08a', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                    BENCH CHAIR (SEAT 10)
                  </span>
                )}
              </div>
              <div style={{ fontSize: '11px', color: '#e2e8f0', marginTop: '2px' }}>
                {selectedSpecialist.role}
              </div>
            </div>
            <button
              onClick={() => onSelectSpecialist('')}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
              title="Close specialist inspector"
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>

          {/* Specialist Specification Details */}
          <div style={{ fontSize: '10px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div>
              <strong style={{ color: '#cbd5e1' }}>Task Objective:</strong> {selectedSpecialist.taskObjective}
            </div>
            <div>
              <strong style={{ color: '#cbd5e1' }}>Focus Area:</strong> {selectedSpecialist.focus}
            </div>
            <div>
              <strong style={{ color: '#cbd5e1' }}>Output Category:</strong> {selectedSpecialist.outputContract.findingCategory}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
              <span style={{ background: '#334155', color: '#cbd5e1', padding: '1px 5px', borderRadius: '3px' }}>
                Prompt: {selectedSpecialist.promptVersion}
              </span>
              <span style={{ background: '#334155', color: '#cbd5e1', padding: '1px 5px', borderRadius: '3px' }}>
                Timeout: {selectedSpecialist.timeoutMs / 1000}s
              </span>
              <span style={{ background: '#334155', color: '#cbd5e1', padding: '1px 5px', borderRadius: '3px' }}>
                Seat: {selectedSpecialist.seatId}
              </span>
            </div>

            {/* Read-Only Capabilities */}
            <div style={{ marginTop: '4px' }}>
              <strong style={{ color: '#cbd5e1' }}>Allowed Capabilities:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '2px' }}>
                {selectedSpecialist.allowedReadOnlyCapabilities.map((cap) => (
                  <span key={cap} style={{ background: '#0284c722', color: '#38bdf8', padding: '1px 5px', borderRadius: '3px', fontSize: '9px' }}>
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            {/* Evidence Inputs */}
            <div style={{ marginTop: '2px' }}>
              <strong style={{ color: '#cbd5e1' }}>Evidence Inputs:</strong> {selectedSpecialist.evidenceInputs.join(', ')}
            </div>
          </div>
        </div>
      )}

      {/* 10 Specialists Roster List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          fontWeight: 700,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '2px'
        }}>
          <span>Bench Specialists (10 Roster Seats)</span>
          <span>Seat 01–10</span>
        </div>

        {currentBench.specialists.map((spec: SpecialistDefinition) => {
          const isSelected = selectedSpecialistId === spec.id;
          return (
            <div
              key={spec.id}
              onClick={() => onSelectSpecialist(spec.id)}
              style={{
                background: isSelected ? '#1e293b' : '#0b0f19',
                borderRadius: '8px',
                padding: '10px 12px',
                border: isSelected
                  ? '2px solid #38bdf8'
                  : spec.isChair
                    ? '1px solid #ca8a04'
                    : '1px solid #1e293b',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: isSelected ? '#38bdf8' : spec.isChair ? '#fbbf24' : '#f8fafc'
                  }}>
                    {spec.id} • {spec.name}
                  </span>
                  {spec.isChair && (
                    <Crown style={{ width: 12, height: 12, color: '#fbbf24' }} />
                  )}
                </div>

                {spec.isChair ? (
                  <span style={{ fontSize: '9px', background: '#854d0e', color: '#fef08a', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                    CHAIR
                  </span>
                ) : (
                  <span style={{ fontSize: '9px', color: '#64748b' }}>
                    Seat {spec.tablePositionIndex + 1}
                  </span>
                )}
              </div>

              <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.3 }}>
                {spec.role}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '6px',
                fontSize: '10px',
                color: '#64748b'
              }}>
                <span>Focus: {spec.focus}</span>
                <span style={{ color: isSelected ? '#38bdf8' : '#64748b', fontWeight: 600 }}>
                  {isSelected ? 'ACTIVE' : 'Select'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
