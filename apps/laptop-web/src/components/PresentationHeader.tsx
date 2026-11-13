import React from 'react';
import {
  Scale,
  Layers,
  FileText,
  Volume2,
  Download,
  Users,
  Award,
  Sun,
  Moon,
  Split,
  Radio,
  Eye,
  Camera,
} from 'lucide-react';
import { CaseRecord, LaptopTheme, UserRole } from '@dharmaraksha/shared-contracts';

export type LaptopDestination =
  | 'chamber'
  | 'deliberations'
  | 'evidence'
  | 'decree'
  | 'oral_arguments'
  | 'delivery'
  | 'review'
  | 'documents'
  | 'reports'
  | 'connections'
  | 'device';

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
  onStartTour?: () => void;
  onOpenScanner?: () => void;
}

/** Scales-of-Justice SVG crest — inline, no CDN dependency */
const JusticeCrest: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="17" fill="url(#crestGrad)" stroke="#c9a84c" strokeWidth="1"/>
    {/* central beam */}
    <rect x="17.2" y="8" width="1.6" height="20" rx="0.8" fill="#c9a84c"/>
    {/* cross-arm */}
    <rect x="9" y="13" width="18" height="1.4" rx="0.7" fill="#c9a84c"/>
    {/* left pan */}
    <line x1="10" y1="14.7" x2="8" y2="20" stroke="#c9a84c" strokeWidth="1.1"/>
    <ellipse cx="8" cy="20.5" rx="3.5" ry="1.1" fill="none" stroke="#c9a84c" strokeWidth="1.1"/>
    {/* right pan */}
    <line x1="26" y1="14.7" x2="28" y2="20" stroke="#c9a84c" strokeWidth="1.1"/>
    <ellipse cx="28" cy="20.5" rx="3.5" ry="1.1" fill="none" stroke="#c9a84c" strokeWidth="1.1"/>
    {/* base */}
    <rect x="15" y="27.5" width="6" height="1.2" rx="0.6" fill="#c9a84c"/>
    <defs>
      <radialGradient id="crestGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#1a2040"/>
        <stop offset="100%" stopColor="#05070e"/>
      </radialGradient>
    </defs>
  </svg>
);

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
  onToggleFixture,
  onOpenScanner,
}) => {
  const isLight = theme === 'light';

  const bg         = isLight ? '#fdfaf3' : '#080b16';
  const borderCol  = isLight ? 'rgba(139,98,24,0.3)' : 'rgba(201,168,76,0.28)';
  const textPrim   = isLight ? '#1a1208' : '#f4f6fb';
  const textMuted  = isLight ? '#7a6a52' : '#7a8aab';
  const cardBg     = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)';
  const cardBorder = isLight ? 'rgba(139,98,24,0.2)' : 'rgba(255,255,255,0.08)';

  // Normalize aliases
  const activeSection: LaptopDestination =
    destination === 'review'      ? 'chamber'       :
    destination === 'documents'   ? 'evidence'      :
    destination === 'reports'     ? 'decree'        :
    destination === 'connections' ? 'delivery'      :
    destination;

  const navItems: Array<{ id: LaptopDestination; label: string; icon: React.ReactNode }> = [
    { id: 'chamber',        label: '3D Chamber',       icon: <Scale    size={13}/> },
    { id: 'deliberations',  label: 'Deliberations',    icon: <Users    size={13}/> },
    { id: 'evidence',       label: 'Evidence',         icon: <FileText size={13}/> },
    { id: 'decree',         label: 'Decree',           icon: <Award    size={13}/> },
    { id: 'oral_arguments', label: 'Oral Arguments',   icon: <Volume2  size={13}/> },
    { id: 'delivery',       label: 'Delivery',         icon: <Download size={13}/> },
  ];

  return (
    <header style={{
      height: '60px',
      backgroundColor: bg,
      borderBottom: `1px solid ${borderCol}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      color: textPrim,
      flexShrink: 0,
      position: 'relative',
      zIndex: 200,
      boxShadow: isLight
        ? '0 2px 12px rgba(0,0,0,0.08)'
        : '0 2px 20px rgba(0,0,0,0.6), 0 1px 0 rgba(201,168,76,0.12)',
    }}>

      {/* ── BRAND ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <JusticeCrest size={38}/>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{
              fontSize: '16px',
              fontWeight: 800,
              fontFamily: 'var(--font-serif, "Cinzel", serif)',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: textPrim,
              lineHeight: 1,
            }}>
              DHARMARAKSHA
            </span>
            <span style={{
              fontSize: '8.5px',
              fontWeight: 700,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              color: '#c9a84c',
              fontFamily: 'var(--font-serif, "Cinzel", serif)',
              paddingBottom: '1px',
              borderBottom: '1px solid rgba(201,168,76,0.4)',
            }}>
              Supreme Tribunal
            </span>
          </div>
          <div style={{
            fontSize: '9.5px',
            color: textMuted,
            letterSpacing: '0.3px',
            marginTop: '3px',
            fontFamily: 'var(--font-sans)',
          }}>
            50-Specialist Coram · Indian Commercial Adjudication
          </div>
        </div>
      </div>

      {/* ── NAV TABS (pill strip) ── */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${cardBorder}`,
        borderRadius: '10px',
        padding: '4px',
      }}>
        {navItems.map(item => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onDestinationChange(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '7px',
                fontSize: '11.5px',
                fontWeight: isActive ? 700 : 500,
                fontFamily: isActive ? 'var(--font-serif, "Cinzel", serif)' : 'var(--font-sans)',
                letterSpacing: isActive ? '0.4px' : '0',
                background: isActive
                  ? (isLight ? '#fff' : 'linear-gradient(135deg, #17213d 0%, #101829 100%)')
                  : 'transparent',
                color: isActive ? (isLight ? '#1a1208' : '#f4f6fb') : textMuted,
                border: isActive
                  ? `1px solid ${isLight ? 'rgba(139,98,24,0.35)' : 'rgba(201,168,76,0.4)'}`
                  : '1px solid transparent',
                borderBottom: isActive ? `2px solid #c9a84c` : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: isActive ? '0 2px 10px rgba(0,0,0,0.2)' : 'none',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: isActive ? '#c9a84c' : 'inherit', display: 'flex' }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── RIGHT CONTROLS ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>

        {/* Case pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: '8px',
          padding: '5px 10px',
          fontSize: '10.5px',
        }}>
          <div style={{
            width: '7px', height: '7px', borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 5px #10b981',
          }}/>
          <span style={{ fontWeight: 600, color: textPrim, fontFamily: 'var(--font-mono)' }}>
            {currentCase.caseId}
          </span>
          <span style={{ color: textMuted }}>v{currentCase.currentSnapshotVersion}</span>
        </div>

        {/* Live Document Camera Scanner Button */}
        <button
          onClick={onOpenScanner}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, rgba(201, 168, 76, 0.22) 0%, rgba(180, 83, 9, 0.28) 100%)',
            border: '1px solid #c9a84c',
            borderRadius: '8px',
            padding: '5px 12px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#fef08a',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(201, 168, 76, 0.25)',
            transition: 'all 0.15s'
          }}
          title="Open Live Courtroom Document Camera Scanner (OCR + Gemini Grounded Answers)"
        >
          <Camera size={13} style={{ color: '#fbbf24' }} />
          <span>Scan Document</span>
        </button>

        {/* Live / Fixture toggle */}
        <button
          onClick={onToggleFixture}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: isFixture ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
            border: isFixture ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(16,185,129,0.3)',
            borderRadius: '8px', padding: '5px 10px',
            fontSize: '10.5px', fontWeight: 700,
            color: isFixture ? '#f59e0b' : '#10b981', cursor: 'pointer',
          }}
          title="Toggle Demo Fixture / Live Backend"
        >
          <Radio size={11}/>
          <span>{isFixture ? 'Fixture' : 'Live'}</span>
        </button>

        {/* Evaluator HUD */}
        <button
          onClick={onTogglePresentationMode}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: isPresentationMode ? 'rgba(201,168,76,0.12)' : 'transparent',
            border: isPresentationMode ? '1px solid rgba(201,168,76,0.4)' : `1px solid ${cardBorder}`,
            borderRadius: '8px', padding: '5px 10px',
            fontSize: '10.5px', fontWeight: 600,
            color: isPresentationMode ? '#c9a84c' : textMuted, cursor: 'pointer',
          }}
          title="Evaluator Presentation HUD"
        >
          <Eye size={12}/>
          <span>{isPresentationMode ? 'Evaluator HUD' : 'Standard'}</span>
        </button>

        {/* Theme toggle row */}
        <div style={{
          display: 'flex',
          background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${cardBorder}`,
          borderRadius: '8px',
          padding: '3px',
          gap: '2px',
        }}>
          {(['split', 'dark', 'light'] as LaptopTheme[]).map(t => {
            const icons: Record<string, React.ReactNode> = {
              split: <Layers size={12}/>,
              dark:  <Moon   size={12}/>,
              light: <Sun    size={12}/>,
            };
            return (
              <button
                key={t}
                onClick={() => onThemeChange(t)}
                title={t === 'split' ? 'Split Theme' : t === 'dark' ? 'Obsidian Dark' : 'Parchment Light'}
                style={{
                  padding: '4px 7px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  background: theme === t ? '#c9a84c' : 'transparent',
                  color: theme === t ? '#05070e' : textMuted,
                  display: 'flex', alignItems: 'center',
                }}
              >
                {icons[t]}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
