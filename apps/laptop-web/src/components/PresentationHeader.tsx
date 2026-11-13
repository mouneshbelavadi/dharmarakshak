import React from 'react';
import { Shield, Eye, Layers, GitCompare, MessageSquare, FileText, Sun, Moon, Split, Terminal } from 'lucide-react';
import { CaseRecord, LaptopTheme } from '@dharmaraksha/shared-contracts';

export type LaptopActiveTab = 'chamber_folio' | 'comparison' | 'qa' | 'report' | 'accessible_2d';

interface PresentationHeaderProps {
  currentCase: CaseRecord;
  activeTab: LaptopActiveTab;
  onTabChange: (tab: LaptopActiveTab) => void;
  theme: LaptopTheme;
  onThemeChange: (theme: LaptopTheme) => void;
  isPresentationMode: boolean;
  onTogglePresentationMode: () => void;
}

export const PresentationHeader: React.FC<PresentationHeaderProps> = ({
  currentCase,
  activeTab,
  onTabChange,
  theme,
  onThemeChange,
  isPresentationMode,
  onTogglePresentationMode
}) => {
  return (
    <header style={{
      height: '56px',
      backgroundColor: theme === 'light' ? '#ffffff' : '#0f172a',
      borderBottom: theme === 'light' ? '1px solid #e7e0d3' : '1px solid #1e293b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      color: theme === 'light' ? '#0f172a' : '#ffffff',
      transition: 'background 0.2s, color 0.2s'
    }}>
      {/* Brand & Case Info */}
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
              PAPER & INK
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            {currentCase.title} (v{currentCase.currentSnapshotVersion})
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div style={{
        display: 'flex',
        background: theme === 'light' ? '#f1f5f9' : '#1e293b',
        borderRadius: '8px',
        padding: '3px',
        gap: '2px'
      }}>
        <button
          onClick={() => onTabChange('chamber_folio')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            background: activeTab === 'chamber_folio' ? '#3b82f6' : 'transparent',
            color: activeTab === 'chamber_folio' ? '#ffffff' : '#64748b'
          }}
        >
          <Layers style={{ width: 14, height: 14 }} />
          Chamber & Folio
        </button>

        <button
          onClick={() => onTabChange('comparison')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            background: activeTab === 'comparison' ? '#3b82f6' : 'transparent',
            color: activeTab === 'comparison' ? '#ffffff' : '#64748b'
          }}
        >
          <GitCompare style={{ width: 14, height: 14 }} />
          Comparison
        </button>

        <button
          onClick={() => onTabChange('qa')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            background: activeTab === 'qa' ? '#3b82f6' : 'transparent',
            color: activeTab === 'qa' ? '#ffffff' : '#64748b'
          }}
        >
          <MessageSquare style={{ width: 14, height: 14 }} />
          Grounded Q&A
        </button>

        <button
          onClick={() => onTabChange('report')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            background: activeTab === 'report' ? '#3b82f6' : 'transparent',
            color: activeTab === 'report' ? '#ffffff' : '#64748b'
          }}
        >
          <FileText style={{ width: 14, height: 14 }} />
          Report
        </button>

        <button
          onClick={() => onTabChange('accessible_2d')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            background: activeTab === 'accessible_2d' ? '#3b82f6' : 'transparent',
            color: activeTab === 'accessible_2d' ? '#ffffff' : '#64748b'
          }}
        >
          <Terminal style={{ width: 14, height: 14 }} />
          2D Accessible
        </button>
      </div>

      {/* Theme Switcher & Evaluator View Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Theme Toggles */}
        <div style={{
          display: 'flex',
          background: theme === 'light' ? '#f1f5f9' : '#1e293b',
          borderRadius: '8px',
          padding: '2px',
          gap: '2px'
        }}>
          <button
            onClick={() => onThemeChange('split')}
            title="Split Mode (Ivory Folio + Dark Chamber)"
            style={{
              padding: '5px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              background: theme === 'split' ? '#3b82f6' : 'transparent',
              color: theme === 'split' ? '#ffffff' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Split style={{ width: 12, height: 12 }} />
            Split
          </button>
          <button
            onClick={() => onThemeChange('light')}
            title="Full Light Mode (Warm Ivory)"
            style={{
              padding: '5px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              background: theme === 'light' ? '#0f172a' : 'transparent',
              color: theme === 'light' ? '#ffffff' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Sun style={{ width: 12, height: 12 }} />
            Light
          </button>
          <button
            onClick={() => onThemeChange('dark')}
            title="Full Dark Mode (Ink Chamber)"
            style={{
              padding: '5px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              background: theme === 'dark' ? '#3b82f6' : 'transparent',
              color: theme === 'dark' ? '#ffffff' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Moon style={{ width: 12, height: 12 }} />
            Dark
          </button>
        </div>

        {/* Evaluator Presentation Mode */}
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
          {isPresentationMode ? 'Evaluator (Active)' : 'Evaluator'}
        </button>
      </div>
    </header>
  );
};
