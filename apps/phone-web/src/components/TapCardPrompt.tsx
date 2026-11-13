import React from 'react';
import { CreditCard, CheckCircle2 } from 'lucide-react';

interface TapCardPromptProps {
  cardUid?: string;
  isSimulating: boolean;
  onSimulateTap: () => void;
  consentGiven: boolean;
  onToggleConsent: (val: boolean) => void;
}

export const TapCardPrompt: React.FC<TapCardPromptProps> = ({
  cardUid,
  isSimulating,
  onSimulateTap,
  consentGiven,
  onToggleConsent
}) => {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      padding: '24px 20px',
      textAlign: 'center',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: cardUid ? '#ecfdf5' : '#f0fdf4',
        border: `2px dashed ${cardUid ? '#10b981' : '#0284c7'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px auto'
      }}>
        {cardUid ? (
          <CheckCircle2 style={{ width: 36, height: 36, color: '#10b981' }} />
        ) : (
          <CreditCard style={{ width: 36, height: 36, color: '#0284c7' }} />
        )}
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
        {cardUid ? 'Session Card Connected' : 'Tap Your RFID Session Card'}
      </h2>

      <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, marginBottom: '16px' }}>
        {cardUid
          ? `Card UID: ${cardUid} is assigned to your confidential review.`
          : 'Hold your card near the kiosk reader to begin your confidential review session.'}
      </p>

      {!cardUid ? (
        <button
          onClick={onSimulateTap}
          disabled={isSimulating}
          style={{
            background: '#0284c7',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {isSimulating ? 'Detecting RFID...' : 'Simulate Reader Tap (Demo)'}
        </button>
      ) : (
        <div style={{ marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', textAlign: 'left', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => onToggleConsent(e.target.checked)}
              style={{ marginTop: '3px', width: '16px', height: '16px' }}
            />
            <span style={{ fontSize: '12px', color: '#334155', lineHeight: 1.4 }}>
              I consent to document scanning and AI-assisted preliminary legal review. I understand this does not constitute a certified legal guarantee.
            </span>
          </label>
        </div>
      )}
    </div>
  );
};
