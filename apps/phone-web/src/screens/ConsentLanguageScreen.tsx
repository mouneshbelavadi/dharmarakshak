import React from 'react';
import { IndianLanguage } from '@dharmaraksha/shared-contracts';
import { ShieldCheck, Check } from 'lucide-react';

interface ConsentLanguageScreenProps {
  selectedLanguage: IndianLanguage;
  onLanguageChange: (lang: IndianLanguage) => void;
  consentGiven: boolean;
  onConsentChange: (consent: boolean) => void;
  onProceed: () => void;
  onBack: () => void;
}

const LANGUAGES: Array<{ code: IndianLanguage; label: string; script: string }> = [
  { code: 'en', label: 'English', script: 'English' },
  { code: 'hi', label: 'Hindi', script: 'हिंदी' },
  { code: 'kn', label: 'Kannada', script: 'ಕನ್ನಡ' },
  { code: 'ta', label: 'Tamil', script: 'தமிழ்' },
  { code: 'te', label: 'Telugu', script: 'తెలుగు' },
  { code: 'bn', label: 'Bengali', script: 'বাংলা' },
  { code: 'mr', label: 'Marathi', script: 'मराठी' },
  { code: 'gu', label: 'Gujarati', script: 'ગુજરાતી' },
  { code: 'ml', label: 'Malayalam', script: 'മലയാളം' },
  { code: 'pa', label: 'Punjabi', script: 'ਪੰਜਾਬੀ' },
  { code: 'or', label: 'Odia', script: 'ଓଡ଼ିଆ' }
];

export const ConsentLanguageScreen: React.FC<ConsentLanguageScreenProps> = ({
  selectedLanguage,
  onLanguageChange,
  consentGiven,
  onConsentChange,
  onProceed,
  onBack
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '24px 20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
          Select Preferred Language
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
          Explanations and spoken answers will be delivered in your chosen Indian language.
        </p>

        {/* 11 Indian Language Buttons Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLanguageChange(lang.code)}
              style={{
                minHeight: '48px',
                padding: '10px 14px',
                borderRadius: '12px',
                border: selectedLanguage === lang.code ? '2px solid #0284c7' : '1px solid #e2e8f0',
                background: selectedLanguage === lang.code ? '#f0f9ff' : '#ffffff',
                color: selectedLanguage === lang.code ? '#0369a1' : '#1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'left'
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{lang.script}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{lang.label}</div>
              </div>
              {selectedLanguage === lang.code && <Check style={{ width: 16, height: 16, color: '#0284c7' }} />}
            </button>
          ))}
        </div>

        {/* Legal Consent Checkbox */}
        <div style={{
          borderTop: '1px solid #f1f5f9',
          paddingTop: '16px',
          marginBottom: '20px'
        }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => onConsentChange(e.target.checked)}
              style={{ width: '20px', height: '20px', marginTop: '2px' }}
            />
            <span style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5 }}>
              I consent to document scanning and AI-assisted preliminary legal review. I understand this assistance does not constitute a certified legal guarantee or binding court ruling.
            </span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onBack}
            style={{
              minHeight: '48px',
              flex: '0 0 35%',
              background: '#f1f5f9',
              color: '#334155',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            Back
          </button>
          <button
            onClick={onProceed}
            disabled={!consentGiven}
            style={{
              minHeight: '48px',
              flex: 1,
              background: consentGiven ? '#0f172a' : '#94a3b8',
              color: '#ffffff',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: consentGiven ? 'pointer' : 'not-allowed'
            }}
          >
            Start Document Intake
          </button>
        </div>
      </div>
    </div>
  );
};

