import React from 'react';
import { IndianLanguage } from '@dharmaraksha/shared-contracts';
import { Languages, ShieldCheck, Wifi, CreditCard } from 'lucide-react';

interface KioskHeaderProps {
  cardUid?: string;
  selectedLanguage: IndianLanguage;
  onLanguageChange: (lang: IndianLanguage) => void;
}

const LANGUAGE_LABELS: Record<IndianLanguage, string> = {
  en: 'English',
  hi: 'हिंदी (Hindi)',
  kn: 'ಕನ್ನಡ (Kannada)',
  ta: 'தமிழ் (Tamil)',
  te: 'తెలుగు (Telugu)',
  bn: 'বাংলা (Bengali)',
  mr: 'मराठी (Marathi)',
  gu: 'ગુજરાતી (Gujarati)',
  ml: 'മലയാളം (Malayalam)',
  pa: 'ਪੰਜਾਬੀ (Punjabi)',
  or: 'ଓଡ଼ିଆ (Odia)'
};

export const KioskHeader: React.FC<KioskHeaderProps> = ({
  cardUid,
  selectedLanguage,
  onLanguageChange
}) => {
  return (
    <header style={{
      backgroundColor: '#1e293b',
      color: '#ffffff',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShieldCheck style={{ width: 24, height: 24, color: '#38bdf8' }} />
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.5px' }}>DHARMARAKSHA</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Legal Document Assistance</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {cardUid && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#93c5fd', background: '#1e3a8a', padding: '3px 6px', borderRadius: '4px' }}>
            <CreditCard style={{ width: 12, height: 12 }} />
            <span>Card Active</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#cbd5e1' }}>
          <Wifi style={{ width: 14, height: 14, color: '#4ade80' }} />
          <span>UNO Q</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#334155', padding: '4px 8px', borderRadius: '6px' }}>
          <Languages style={{ width: 14, height: 14, color: '#38bdf8' }} />
          <select
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value as IndianLanguage)}
            style={{
              background: 'transparent',
              color: '#ffffff',
              border: 'none',
              fontSize: '12px',
              outline: 'none',
              fontWeight: 500
            }}
          >
            {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
              <option key={code} value={code} style={{ background: '#1e293b', color: '#ffffff' }}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
