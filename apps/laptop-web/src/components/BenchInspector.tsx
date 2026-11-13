import React from 'react';
import { BENCHES, BenchDefinition } from '@dharmaraksha/tribunal-definitions';
import { Shield } from 'lucide-react';

interface BenchInspectorProps {
  selectedBenchId: 'A' | 'B' | 'C' | 'D' | 'E';
  onSelectBench: (benchId: 'A' | 'B' | 'C' | 'D' | 'E') => void;
}

export const BenchInspector: React.FC<BenchInspectorProps> = ({
  selectedBenchId,
  onSelectBench
}) => {
  const currentBench = BENCHES.find((b: BenchDefinition) => b.id === selectedBenchId) || BENCHES[0];

  return (
    <aside style={{
      width: '320px',
      height: '100%',
      backgroundColor: '#0f172a',
      borderLeft: '1px solid #1e293b',
      display: 'flex',
      flexDirection: 'column',
      color: '#f8fafc'
    }}>
      {/* Bench Tabs Header */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #1e293b',
        background: '#090d16'
      }}>
        {BENCHES.map((b: BenchDefinition) => (
          <button
            key={b.id}
            onClick={() => onSelectBench(b.id)}
            style={{
              flex: 1,
              padding: '10px 4px',
              fontSize: '12px',
              fontWeight: 700,
              background: b.id === selectedBenchId ? '#1e293b' : 'transparent',
              color: b.id === selectedBenchId ? b.primaryColor : '#64748b',
              borderBottom: b.id === selectedBenchId ? `2px solid ${b.primaryColor}` : 'none'
            }}
          >
            Bench {b.id}
          </button>
        ))}
      </div>

      {/* Selected Bench Overview */}
      <div style={{ padding: '16px', borderBottom: '1px solid #1e293b', background: '#131b2e' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Shield style={{ width: 16, height: 16, color: currentBench.primaryColor }} />
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
            Bench {currentBench.id} — {currentBench.name}
          </h2>
        </div>
        <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4, margin: '6px 0 0 0' }}>
          {currentBench.workingPrinciple}
        </p>
      </div>

      {/* 10 Specialists List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
          Active Specialists (10 Roster Seats)
        </div>
        {currentBench.specialists.map((spec) => (
          <div
            key={spec.id}
            style={{
              background: '#1e293b',
              borderRadius: '8px',
              padding: '10px 12px',
              border: spec.isChair ? '1px solid #ca8a04' : '1px solid #334155'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: spec.isChair ? '#fbbf24' : '#38bdf8'
              }}>
                {spec.id} • {spec.name}
              </span>
              {spec.isChair && (
                <span style={{ fontSize: '10px', background: '#854d0e', color: '#fef08a', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                  CHAIR
                </span>
              )}
            </div>
            <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.3 }}>
              {spec.role}
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
              Focus: {spec.focus}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
