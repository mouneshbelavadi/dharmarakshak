import React from 'react';
import { Send, HardDrive, Mail, Globe, Wifi, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ConnectionsViewProps {
  isFixture: boolean;
}

export const ConnectionsView: React.FC<ConnectionsViewProps> = ({ isFixture }) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      backgroundColor: '#fdfbf7', // Ivory paper surface
      color: '#0f172a',
      padding: '28px',
      boxSizing: 'border-box'
    }}>
      <div style={{ borderBottom: '2px solid #e7e0d3', paddingBottom: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              External Connections & Cloud Adapters
            </h1>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              Main Backend Integration Channels & Tunnel Health
            </div>
          </div>
          {isFixture && (
            <span style={{ fontSize: '11px', background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
              FIXTURE DIAGNOSTICS
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Telegram Bot Connection Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e7e0d3',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send style={{ width: 18, height: 18, color: '#0284c7' }} />
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Telegram Bot Adapter</span>
            </div>
            <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
              ONLINE
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: '0 0 12px 0' }}>
            Supports visitor notification dispatch, verified Telegram report delivery, and interactive question forwarding.
          </p>
          <div style={{ fontSize: '11px', color: '#475569', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', fontFamily: 'monospace' }}>
            Webhook: https://api.dharmaraksha.local/telegram/webhook
          </div>
        </div>

        {/* Google Drive Connection Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e7e0d3',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HardDrive style={{ width: 18, height: 18, color: '#059669' }} />
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Google Drive OAuth</span>
            </div>
            <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
              CONFIGURED
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: '0 0 12px 0' }}>
            OAuth 2.0 scoped access for authorized PDF report export to visitor-selected Drive folders.
          </p>
          <div style={{ fontSize: '11px', color: '#475569', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', fontFamily: 'monospace' }}>
            Scope: drive.file (Strict Minimal Grants)
          </div>
        </div>

        {/* Gmail App-Password Connection Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e7e0d3',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail style={{ width: 18, height: 18, color: '#4f46e5' }} />
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Gmail SMTP Dispatch</span>
            </div>
            <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
              ACTIVE
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: '0 0 12px 0' }}>
            App-specific password transport for secure, owner-authorized report delivery directly to confirmed visitor emails.
          </p>
          <div style={{ fontSize: '11px', color: '#475569', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', fontFamily: 'monospace' }}>
            Relay: smtp.gmail.com:465 (SSL/TLS)
          </div>
        </div>

        {/* Ngrok Gateway Tunnel Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e7e0d3',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe style={{ width: 18, height: 18, color: '#0284c7' }} />
              <span style={{ fontSize: '14px', fontWeight: 700 }}>UNO Q HTTPS Tunnel</span>
            </div>
            <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
              FORWARDING
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: '0 0 12px 0' }}>
            Secure HTTPS tunnel exposing the UNO Q gateway port 5000 to the kiosk companion phone.
          </p>
          <div style={{ fontSize: '11px', color: '#475569', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', fontFamily: 'monospace' }}>
            Endpoint: https://kiosk-dharmaraksha.ngrok-free.app
          </div>
        </div>
      </div>
    </div>
  );
};

