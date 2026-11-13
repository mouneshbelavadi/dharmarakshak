import React from 'react';
import { Shield, Eye, Layout, Layers, Terminal } from 'lucide-react';
import { CaseRecord } from '@dharmaraksha/shared-contracts';

interface PresentationHeaderProps {
  currentCase: CaseRecord;
  viewMode: 'chamber_3d' | 'split' | 'accessible_2d';
  onViewModeChange: (mode: 'chamber_3d' | 'split' | 'accessible_2d') => void;
  isPresentationMode: boolean;
  onTogglePresentationMode: () => void;
}

export const PresentationHeader: React.FC<PresentationHeaderProps> = ({
  currentCase,
  viewMode,
  onViewModeChange,
  isPresentationMode,
  onTogglePresentationMode
}) => {
  return (
    <header style={{
      height: '56px',
      backgroundColor: '#0f172a',
      borderBottom: '1px solid #1e293b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      color: '#ffffff'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)'
        }}>
          <Shield style={{ width: 18, height: 18, color: '#ffffff' }} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.5px' }}>DHARMARAKSHA</span>
            <span style={{
              fontSize: '11px',
              backgroundColor: '#1e3a8a',
              color: '#93c5fd',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 600
            }}>
              3D TRIBUNAL
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Case: {currentCase.title} ({currentCase.caseId})
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', background: '#1e293b', borderRadius: '8px', padding: '3px', gap: '2px' }}>
          <button
            onClick={() => onViewModeChange('chamber_3d')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
              background: viewMode === 'chamber_3d' ? '#3b82f6' : 'transparent',
              color: viewMode === 'chamber_3d' ? '#ffffff' : '#94a3b8'
            }}
          >
            <Layers style={{ width: 14, height: 14 }} />
            3D Chamber
          </button>
          <button
            onClick={() => onViewModeChange('split')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
              background: viewMode === 'split' ? '#3b82f6' : 'transparent',
              color: viewMode === 'split' ? '#ffffff' : '#94a3b8'
            }}
          >
            <Layout style={{ width: 14, height: 14 }} />
            Split Workspace
          </button>
          <button
            onClick={() => onViewModeChange('accessible_2d')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
              background: viewMode === 'accessible_2d' ? '#3b82f6' : 'transparent',
              color: viewMode === 'accessible_2d' ? '#ffffff' : '#94a3b8'
            }}
          >
            <Terminal style={{ width: 14, height: 14 }} />
            2D Fallback
          </button>
        </div>

        <button
          onClick={onTogglePresentationMode}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            background: isPresentationMode ? '#059669' : '#334155',
            color: '#ffffff'
          }}
        >
          <Eye style={{ width: 14, height: 14 }} />
          {isPresentationMode ? 'Evaluator View (Active)' : 'Evaluator View'}
        </button>
      </div>
    </header>
  );
};
