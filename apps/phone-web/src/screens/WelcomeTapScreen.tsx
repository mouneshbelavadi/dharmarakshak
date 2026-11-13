import React from 'react';
import { CreditCard, CheckCircle2, Wifi } from 'lucide-react';

interface WelcomeTapScreenProps {
  cardUid?: string;
  isSimulating: boolean;
  onSimulateTap: () => void;
  onProceed: () => void;
}

export const WelcomeTapScreen: React.FC<WelcomeTapScreenProps> = ({
  cardUid,
  isSimulating,
  onSimulateTap,
  onProceed
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '32px 20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: cardUid ? '#ecfdf5' : '#f0f9ff',
          border: `2px dashed ${cardUid ? '#10b981' : '#0284c7'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto'
        }}>
          {cardUid ? (
            <CheckCircle2 style={{ width: 44, height: 44, color: '#10b981' }} />
          ) : (
            <CreditCard style={{ width: 44, height: 44, color: '#0284c7' }} />
          )}
        </div>

        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
          {cardUid ? 'Session Card Detected' : 'Tap Your RFID Session Card'}
        </h1>

        <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5, marginBottom: '24px' }}>
          {cardUid
            ? `Card UID: ${cardUid} has been linked to your confidential legal assistance session.`
            : 'Hold your card near the kiosk sensor. Your documents remain confidential and protected.'}
        </p>

        {!cardUid ? (
          <button
            onClick={onSimulateTap}
            disabled={isSimulating}
            style={{
              minHeight: '48px',
              width: '100%',
              background: '#0284c7',
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isSimulating ? 'Detecting RFID...' : 'Simulate Reader Tap (Demo)'}
          </button>
        ) : (
          <button
            onClick={onProceed}
            style={{
              minHeight: '48px',
              width: '100%',
              background: '#059669',
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            Continue to Consent & Language
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
        <Wifi style={{ width: 14, height: 14, color: '#10b981' }} />
        <span>UNO Q Hardware Bridge Online</span>
      </div>
    </div>
  );
};

