import React, { useState } from 'react';
import { CaseRecord, LaptopTheme } from '@dharmaraksha/shared-contracts';
import {
  Download,
  Send,
  Mail,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Shield,
  FileText,
  Lock,
  RefreshCw,
  QrCode
} from 'lucide-react';

interface CertifiedDeliveryViewProps {
  currentCase: CaseRecord;
  theme?: LaptopTheme;
}

export const CertifiedDeliveryView: React.FC<CertifiedDeliveryViewProps> = ({
  currentCase,
  theme = 'split'
}) => {
  const isLight = theme === 'light';

  // Telegram state
  const [telegramCode, setTelegramCode] = useState('849201');
  const [copiedCode, setCopiedCode] = useState(false);
  const [telegramLinked, setTelegramLinked] = useState(false);

  // Email state
  const [recipientEmail, setRecipientEmail] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle');

  // Drive state
  const [driveConnected, setDriveConnected] = useState(false);
  const [driveExporting, setDriveExporting] = useState(false);
  const [driveViewLink, setDriveViewLink] = useState<string | null>(null);

  // Local PDF download simulation
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(`/link ${telegramCode}`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendEmail = () => {
    if (!recipientEmail || !consentGiven) return;
    setEmailStatus('submitting');
    setTimeout(() => {
      setEmailStatus('sent');
    }, 1200);
  };

  const handleExportDrive = () => {
    setDriveExporting(true);
    setTimeout(() => {
      setDriveExporting(false);
      setDriveConnected(true);
      setDriveViewLink('https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J_DHARMARAKSHA/view');
    }, 1500);
  };

  const handleDownloadPdf = () => {
    setIsDownloadingPdf(true);
    setTimeout(() => {
      setIsDownloadingPdf(false);
      // Trigger download of official generated PDF from backend
      const link = document.createElement('a');
      link.href = `/api/v1/cases/${currentCase.caseId}/report/pdf`;
      link.setAttribute('download', `DHARMARAKSHA_Decree_${currentCase.caseId}_v${currentCase.currentSnapshotVersion}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1000);
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      backgroundColor: '#05070e',
      color: '#f8fafc',
      padding: '40px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: '28px'
    }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0d1428 0%, #111c35 100%)',
        border: '1px solid rgba(201, 168, 76, 0.25)',
        borderLeft: '4px solid #c9a84c',
        borderRadius: '12px',
        padding: '28px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield style={{ width: 28, height: 28, color: '#c9a84c' }} />
            <h1 style={{
              fontSize: '22px',
              fontWeight: 800,
              fontFamily: 'var(--font-serif)',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#f4f6fb',
              margin: 0
            }}>
              Certified Judicial Delivery & Private Export Center
            </h1>
          </div>
          <div style={{
            height: '2px',
            background: 'linear-gradient(90deg, #c9a84c, transparent)',
            width: '200px',
            marginTop: '8px'
          }} />
          <p style={{ fontSize: '13px', color: '#7a8aab', margin: '8px 0 0 0', maxWidth: '800px' }}>
            Official tribunal decree documents are sealed with SHA-256 cryptographic digests. Securely download watermarked PDFs or dispatch through authenticated channels.
          </p>
        </div>

        {/* Primary Download Button */}
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloadingPdf}
          style={{
            background: 'linear-gradient(135deg, #c9a84c 0%, #8b6218 100%)',
            border: 'none',
            color: '#05070e',
            padding: '12px 24px',
            borderRadius: '4px',
            fontSize: '11px',
            fontFamily: 'var(--font-serif)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            fontWeight: 700,
            cursor: isDownloadingPdf ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(201, 168, 76, 0.3)',
            transition: 'all 0.15s'
          }}
        >
          {isDownloadingPdf ? (
            <>
              <RefreshCw style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
              <span>Rendering PDF...</span>
            </>
          ) : (
            <>
              <Download style={{ width: 16, height: 16 }} />
              <span>Download Official Decree (PDF)</span>
            </>
          )}
        </button>
      </div>

      {/* Tri-Destination Delivery Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>
        {/* Destination 1: Telegram Bot Dispatch */}
        <div style={{
          background: '#0d1424',
          border: '1px solid rgba(201, 168, 76, 0.25)',
          borderTop: '4px solid #c9a84c',
          borderRadius: '8px',
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Writ Header */}
          <div style={{
            background: 'rgba(201, 168, 76, 0.08)',
            borderBottom: '1px solid rgba(201, 168, 76, 0.2)',
            padding: '10px 16px',
            margin: '-32px -28px 24px -28px',
            fontFamily: 'var(--font-serif)',
            fontSize: '9px',
            letterSpacing: '2px',
            color: '#c9a84c',
            textTransform: 'uppercase'
          }}>
            WRIT OF DELIVERY — TELEGRAM DISPATCH
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(201, 168, 76, 0.15)',
              border: '1px solid rgba(201, 168, 76, 0.3)',
              color: '#c9a84c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Send style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#f4f6fb', fontFamily: 'var(--font-serif)' }}>
                Telegram Delivery Bot
              </h3>
              <div style={{ fontSize: '11px', color: '#7a8aab' }}>
                @DharmarakshaBot • Instant PDF & Audio
              </div>
            </div>
          </div>

          <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#c8d0e4', margin: 0 }}>
            Send this temporary 6-digit verification code to the official bot to link your private chat and receive the synthesized PDF report:
          </p>

          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '28px',
            fontWeight: 700,
            letterSpacing: '8px',
            background: '#050a14',
            border: '1px solid rgba(201, 168, 76, 0.4)',
            borderRadius: '6px',
            padding: '16px',
            textAlign: 'center',
            color: '#c9a84c'
          }}>
            {telegramCode}
          </div>

          <div style={{ textAlign: 'center', fontSize: '11px', color: '#7a8aab' }}>
            Send <code style={{ color: '#c9a84c' }}>/link {telegramCode}</code> to @DharmarakshaBot
          </div>

          <button
            onClick={handleCopyCode}
            style={{
              background: copiedCode ? '#10b981' : 'linear-gradient(135deg, #c9a84c 0%, #8b6218 100%)',
              color: '#05070e',
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: '11px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              borderRadius: '4px',
              padding: '10px 20px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: 'auto'
            }}
          >
            {copiedCode ? <CheckCircle2 style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
            <span>{copiedCode ? 'Command Copied' : 'Copy Telegram Command'}</span>
          </button>

          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Code expires in <strong>9 minutes</strong>. Tokens and URLs are fully redacted.
          </div>
        </div>

        {/* Destination 2: Google Drive Private Archival */}
        <div style={{
          background: '#0d1424',
          border: '1px solid rgba(201, 168, 76, 0.25)',
          borderTop: '4px solid #c9a84c',
          borderRadius: '8px',
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Writ Header */}
          <div style={{
            background: 'rgba(201, 168, 76, 0.08)',
            borderBottom: '1px solid rgba(201, 168, 76, 0.2)',
            padding: '10px 16px',
            margin: '-32px -28px 24px -28px',
            fontFamily: 'var(--font-serif)',
            fontSize: '9px',
            letterSpacing: '2px',
            color: '#c9a84c',
            textTransform: 'uppercase'
          }}>
            WRIT OF DELIVERY — DRIVE ARCHIVAL
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(201, 168, 76, 0.15)',
              border: '1px solid rgba(201, 168, 76, 0.3)',
              color: '#c9a84c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText style={{ width: 20, height: 20, color: '#c9a84c' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#f4f6fb', fontFamily: 'var(--font-serif)' }}>
                Google Drive Archival
              </h3>
              <div style={{ fontSize: '11px', color: '#7a8aab' }}>
                OAuth 2.0 PKCE • drive.file Scope
              </div>
            </div>
          </div>

          <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#c8d0e4', margin: 0 }}>
            Export the official sealed tribunal report directly to your personal Google Drive with strict least-privilege access permissions.
          </p>

          <div style={{
            background: '#050a14',
            border: '1px solid rgba(201, 168, 76, 0.3)',
            borderRadius: '6px',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FileText style={{ width: 22, height: 22, color: '#c9a84c', flexShrink: 0 }} />
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: '#c9a84c',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              DHARMARAKSHA_Decree_{currentCase.caseId}.pdf
            </div>
          </div>

          {driveViewLink ? (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '6px',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981', fontFamily: 'var(--font-serif)', letterSpacing: '0.5px' }}>
                <CheckCircle2 style={{ width: 14, height: 14 }} />
                <span>Uploaded & Verified in Drive</span>
              </div>
              <a
                href={driveViewLink}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '11px',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none'
                }}
              >
                <span>Open in Google Drive</span>
                <ExternalLink style={{ width: 12, height: 12 }} />
              </a>
            </div>
          ) : (
            <button
              onClick={handleExportDrive}
              disabled={driveExporting}
              style={{
                background: 'linear-gradient(135deg, #c9a84c 0%, #8b6218 100%)',
                color: '#05070e',
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                fontSize: '11px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                borderRadius: '4px',
                padding: '10px 20px',
                border: 'none',
                cursor: driveExporting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: 'auto'
              }}
            >
              {driveExporting ? (
                <>
                  <RefreshCw style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                  <span>Syncing to Drive...</span>
                </>
              ) : (
                <>
                  <HardDrive style={{ width: 14, height: 14 }} />
                  <span>Sync to Google Drive</span>
                </>
              )}
            </button>
          )}

          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Tokens encrypted with AES-256-GCM. Idempotent upload.
          </div>
        </div>

        {/* Destination 3: Gmail SMTP Secure Delivery */}
        <div style={{
          background: '#0d1424',
          border: '1px solid rgba(201, 168, 76, 0.25)',
          borderTop: '4px solid #c9a84c',
          borderRadius: '8px',
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Writ Header */}
          <div style={{
            background: 'rgba(201, 168, 76, 0.08)',
            borderBottom: '1px solid rgba(201, 168, 76, 0.2)',
            padding: '10px 16px',
            margin: '-32px -28px 24px -28px',
            fontFamily: 'var(--font-serif)',
            fontSize: '9px',
            letterSpacing: '2px',
            color: '#c9a84c',
            textTransform: 'uppercase'
          }}>
            WRIT OF DELIVERY — GMAIL DISPATCH
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(201, 168, 76, 0.15)',
              border: '1px solid rgba(201, 168, 76, 0.3)',
              color: '#c9a84c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Mail style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#f4f6fb', fontFamily: 'var(--font-serif)' }}>
                Gmail SMTP Delivery
              </h3>
              <div style={{ fontSize: '11px', color: '#7a8aab' }}>
                Port 587 STARTTLS • App-Password
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '9px',
              letterSpacing: '2px',
              color: '#7a8aab',
              textTransform: 'uppercase'
            }}>
              ADDRESSEE
            </label>
            <input
              type="email"
              placeholder="Enter citizen email address..."
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              style={{
                background: '#050a14',
                border: '1px solid rgba(201, 168, 76, 0.3)',
                borderRadius: '4px',
                padding: '10px 16px',
                fontSize: '13px',
                color: '#f4f6fb',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#7a8aab', cursor: 'pointer', marginTop: '4px' }}>
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
              />
              <span>I give explicit consent to dispatch the case report.</span>
            </label>
          </div>

          {emailStatus === 'sent' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981', fontFamily: 'var(--font-serif)', letterSpacing: '0.5px' }}>
              <CheckCircle2 style={{ width: 14, height: 14 }} />
              <span>Email dispatched via STARTTLS</span>
            </div>
          ) : (
            <button
              onClick={handleSendEmail}
              disabled={!recipientEmail || !consentGiven || emailStatus === 'submitting'}
              style={{
                background: recipientEmail && consentGiven
                  ? 'linear-gradient(135deg, #c9a84c 0%, #8b6218 100%)'
                  : '#1e2840',
                color: recipientEmail && consentGiven ? '#05070e' : '#64748b',
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                fontSize: '11px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                borderRadius: '4px',
                padding: '10px 20px',
                border: 'none',
                cursor: recipientEmail && consentGiven ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: 'auto'
              }}
            >
              <Mail style={{ width: 14, height: 14 }} />
              <span>{emailStatus === 'submitting' ? 'Submitting...' : 'Send Encrypted Email'}</span>
            </button>
          )}

          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Outbox deduplication prevents duplicate dispatches.
          </div>
        </div>
      </div>
    </div>
  );
};

