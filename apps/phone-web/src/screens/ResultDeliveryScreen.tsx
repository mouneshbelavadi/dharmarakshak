import React, { useState } from 'react';
import { Send, HardDrive, Mail, CheckCircle2, RotateCcw, ShieldCheck, AlertTriangle } from 'lucide-react';
import { OFFICIAL_LEGAL_ASSISTANCE_DISCLAIMER } from '@dharmaraksha/shared-contracts';

interface ResultDeliveryScreenProps {
  onFinishAndReset: () => void;
}

export const ResultDeliveryScreen: React.FC<ResultDeliveryScreenProps> = ({ onFinishAndReset }) => {
  const [deliveredChannel, setDeliveredChannel] = useState<string | null>(null);

  const handleDeliver = (channel: string) => {
    setDeliveredChannel(channel);
    setTimeout(() => {
      alert(`Report dispatched successfully via ${channel}!`);
    }, 400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', marginBottom: '12px' }}>
          <ShieldCheck style={{ width: 22, height: 22 }} />
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Case Findings Summary
          </h2>
        </div>

        {/* Executive Summary Card */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '12px',
          padding: '14px',
          border: '1px solid #e2e8f0',
          marginBottom: '16px',
          fontSize: '13px',
          lineHeight: 1.5,
          color: '#334155'
        }}>
          <strong>Summary:</strong> Your 3-page Commercial Lease and 1-page deposit receipt have been cross-examined by the 5 tribunal benches. 3 key obligations were identified, and an INR 20,000 discrepancy between the agreement and receipt was flagged.
        </div>

        {/* Inconsistency Warning */}
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '10px',
          padding: '12px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          color: '#92400e',
          fontSize: '12px'
        }}>
          <AlertTriangle style={{ width: 16, height: 16, flexShrink: 0, marginTop: '2px', color: '#b45309' }} />
          <span>
            <strong>Attention:</strong> Agreement mentions INR 2,50,000 deposit; bank receipt shows INR 2,70,000. Request written receipt endorsement from landlord.
          </span>
        </div>

        {/* Delivery Options Header */}
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>
          Export & Save Your Referenced Report:
        </div>

        {/* 3 Large Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => handleDeliver('Telegram Bot')}
            style={{
              minHeight: '48px',
              background: '#0284c7',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send style={{ width: 18, height: 18 }} />
              <span>Send PDF to Telegram</span>
            </div>
            {deliveredChannel === 'Telegram Bot' && <CheckCircle2 style={{ width: 18, height: 18 }} />}
          </button>

          <button
            onClick={() => handleDeliver('Google Drive')}
            style={{
              minHeight: '48px',
              background: '#059669',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HardDrive style={{ width: 18, height: 18 }} />
              <span>Save to Google Drive</span>
            </div>
            {deliveredChannel === 'Google Drive' && <CheckCircle2 style={{ width: 18, height: 18 }} />}
          </button>

          <button
            onClick={() => handleDeliver('Gmail')}
            style={{
              minHeight: '48px',
              background: '#4f46e5',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail style={{ width: 18, height: 18 }} />
              <span>Email Report via Gmail</span>
            </div>
            {deliveredChannel === 'Gmail' && <CheckCircle2 style={{ width: 18, height: 18 }} />}
          </button>
        </div>

        {/* Finish & Clear Session Button */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
          <button
            onClick={onFinishAndReset}
            style={{
              minHeight: '48px',
              width: '100%',
              background: '#f1f5f9',
              color: '#dc2626',
              border: '1px solid #fecdd3',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <RotateCcw style={{ width: 16, height: 16 }} />
            Finish & Return Session Card (Clears Data)
          </button>
        </div>
      </div>

      {/* Statutory Disclaimer */}
      <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', lineHeight: 1.4, padding: '0 8px' }}>
        {OFFICIAL_LEGAL_ASSISTANCE_DISCLAIMER}
      </div>
    </div>
  );
};

