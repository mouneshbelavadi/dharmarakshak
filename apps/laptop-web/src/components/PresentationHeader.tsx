import React from 'react';
import { Shield, Eye, Layers, GitCompare, MessageSquare, FileText, Sun, Moon, Split, Terminal, HardDrive, Cpu, Radio } from 'lucide-react';
import { CaseRecord, LaptopTheme, UserRole } from '@dharmaraksha/shared-contracts';

export type LaptopDestination = 'review' | 'documents' | 'reports' | 'connections' | 'device';

interface PresentationHeaderProps {
  currentCase: CaseRecord;
  destination: LaptopDestination;
  onDestinationChange: (dest: LaptopDestination) => void;
  theme: LaptopTheme;
  onThemeChange: (theme: LaptopTheme) => void;
  userRole: UserRole;
  onUserRoleChange: (role: UserRole) => void;
  isPresentationMode: boolean;
  onTogglePresentationMode: () => void;
  isFixture: boolean;
  onToggleFixture: () => void;
}

export const PresentationHeader: React.FC<PresentationHeaderProps> = ({
  currentCase,
  destination,
  onDestinationChange,
  theme,
  onThemeChange,
  userRole,
  onUserRoleChange,
  isPresentationMode,
  onTogglePresentationMode,
  isFixture,
  onToggleFixture
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
      {/* Brand & Mode Status */}
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
            {isFixture ? (
              <span style={{
                fontSize: '10px',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 700
              }}>
                SAMPLE FIXTURE
              </span>
            ) : (
              <span style={{
                fontSize: '10px',
                backgroundColor: '#ecfdf5',
                color: '#065f46',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <Radio style={{ width: 10, height: 10, color: '#10b981' }} /> LIVE BACKEND
              </span>
            )}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            {currentCase.title} (v{currentCase.currentSnapshotVersion})
          </div>
        </div>
      </div>

      {/* Primary Destinations */}
      <nav style={{
        display: 'flex',
        background: theme === 'light' ? '#f1f5f9' : '#1e293b',
        borderRadius: '8px',
        padding: '3px',
        gap: '2px'
      }}>
        <button
          onClick={() => onDestinationChange('review')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            background: destination === 'review' ? '#3b82f6' : 'transparent',
            color: destination === 'review' ? '#ffffff' : '#64748b'
          }}
        >
          <Layers style={{ width: 14, height: 14 }} />
          Review
        </button>

        <button
          onClick={() => onDestinationChange('documents')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            background: destination === 'documents' ? '#3b82f6' : 'transparent',
            color: destination === 'documents' ? '#ffffff' : '#64748b'
          }}
        >
          <FileText style={{ width: 14, height: 14 }} />
          Documents
        </button>

        <button
          onClick={() => onDestinationChange('reports')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            background: destination === 'reports' ? '#3b82f6' : 'transparent',
            color: destination === 'reports' ? '#ffffff' : '#64748b'
          }}
        >
          <GitCompare style={{ width: 14, height: 14 }} />
          Reports
        </button>

        <button
          onClick={() => onDestinationChange('connections')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            background: destination === 'connections' ? '#3b82f6' : 'transparent',
            color: destination === 'connections' ? '#ffffff' : '#64748b'
          }}
        >
          <HardDrive style={{ width: 14, height: 14 }} />
          Connections
        </button>

        <button
          onClick={() => onDestinationChange('device')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            background: destination === 'device' ? '#3b82f6' : 'transparent',
            color: destination === 'device' ? '#ffffff' : '#64748b'
          }}
        >
          <Cpu style={{ width: 14, height: 14 }} />
          Device
        </button>
      </nav>

      {/* Role Picker, Theme Toggles & Evaluator View */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Role Selector */}
        <select
          value={userRole}
          onChange={(e) => onUserRoleChange(e.target.value as UserRole)}
          style={{
            background: theme === 'light' ? '#f1f5f9' : '#1e293b',
            color: theme === 'light' ? '#0f172a' : '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '4px 8px',
            fontSize: '11px',
            fontWeight: 600,
            outline: 'none'
          }}
        >
          <option value="visitor">Role: Visitor</option>
          <option value="operator">Role: Operator</option>
          <option value="evaluator">Role: Evaluator</option>
          <option value="admin">Role: Admin</option>
        </select>

        {/* Theme Switcher */}
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

        {/* Evaluator Mode Button */}
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
          {isPresentationMode ? 'Evaluator' : 'Evaluator'}
        </button>
      </div>
    </header>
  );
};
