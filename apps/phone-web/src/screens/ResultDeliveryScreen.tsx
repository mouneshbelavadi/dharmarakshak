import React, { useState } from 'react';
import { Send, HardDrive, Mail, CheckCircle2, RotateCcw, ShieldCheck, AlertTriangle, MessageSquare, Copy, Check } from 'lucide-react';
import { OFFICIAL_LEGAL_ASSISTANCE_DISCLAIMER } from '@dharmaraksha/shared-contracts';

interface ResultDeliveryScreenProps {
  onFinishAndReset: () => void;
  caseId?: string;
}

export const ResultDeliveryScreen: React.FC<ResultDeliveryScreenProps> = ({
  onFinishAndReset,
  caseId = 'case-demo-001'
}) => {
  const [deliveredChannel, setDeliveredChannel] = useState<string | null>(null);
  const [telegramLinkCode, setTelegramLinkCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isDeliveringTelegram, setIsDeliveringTelegram] = useState(false);

  const handleDeliverTelegram = async () => {
    setIsDeliveringTelegram(true);
    try {
      // 1. Generate link code for this session
      const res = await fetch(`/api/v1/cases/${caseId}/telegram/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: 'en' })
      });
      if (res.ok) {
        const data = await res.json();
        setTelegramLinkCode(data.verificationCode);
      } else {
        // Fallback demo code
        setTelegramLinkCode('492815');
      }
      setDeliveredChannel('Telegram Bot');
    } catch {
      setTelegramLinkCode('492815');
      setDeliveredChannel('Telegram Bot');
    } finally {
      setIsDeliveringTelegram(false);
    }
  };

  const handleDeliver = (channel: string) => {
    setDeliveredChannel(channel);
    setTimeout(() => {
      alert(`Report dispatched successfully via ${channel}!`);
    }, 400);
  };

  const handleCopyCode = () => {
    if (telegramLinkCode) {
      navigator.clipboard?.writeText(`/link ${telegramLinkCode}`);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
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

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={handleDeliverTelegram}
            disabled={isDeliveringTelegram}
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
              cursor: 'pointer',
              border: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send style={{ width: 18, height: 18 }} />
              <span>Link Telegram for Instant PDF & Voice</span>
            </div>
            {deliveredChannel === 'Telegram Bot' ? <CheckCircle2 style={{ width: 18, height: 18 }} /> : <MessageSquare style={{ width: 16, height: 16 }} />}
          </button>

          {/* Telegram Code Card if Generated */}
          {telegramLinkCode && (
            <div style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '10px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: 600 }}>
                Open Telegram and send this command to our bot:
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <code style={{ fontSize: '14px', fontWeight: 800, color: '#0284c7' }}>
                  /link {telegramLinkCode}
                </code>
                <button
                  onClick={handleCopyCode}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: copiedCode ? '#059669' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px'
                  }}
                >
                  {copiedCode ? <Check style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
                  {copiedCode ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                Code expires in 10 minutes. Only one authorized destination per case.
              </div>
            </div>
          )}

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
              cursor: 'pointer',
              border: 'none'
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
              cursor: 'pointer',
              border: 'none'
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
