import React from 'react';
import { FileText, Download, Send, AlertTriangle, ShieldCheck, Mail, HardDrive } from 'lucide-react';
import { CaseRecord, OFFICIAL_LEGAL_ASSISTANCE_DISCLAIMER } from '@dharmaraksha/shared-contracts';

interface ReportPreviewProps {
  currentCase: CaseRecord;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({ currentCase }) => {
  const summary = currentCase.presidingSummary;

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
      {/* Report Header */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e7e0d3',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#ca8a04', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              OFFICIAL PRELIMINARY REVIEW PACKAGE
            </span>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>
              DHARMARAKSHA Legal Folio Report
            </h1>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              Case: {currentCase.title} • Verified Snapshot v{currentCase.currentSnapshotVersion}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#0f172a',
              color: '#ffffff',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600
            }}>
              <Download style={{ width: 14, height: 14 }} />
              Download Referenced PDF
            </button>
          </div>
        </div>

        {/* Executive Summary */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
            Tribunal Chamber Synthesis
          </h3>
          <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#334155', margin: 0 }}>
            {summary?.executiveSummary}
          </p>
        </div>

        {/* Delivery Export Actions */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '10px' }}>
            Visitor-Confirmed Dispatch Channels:
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#0284c7',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 500
            }}>
              <Send style={{ width: 13, height: 13 }} />
              Send to Telegram
            </button>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#059669',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 500
            }}>
              <HardDrive style={{ width: 13, height: 13 }} />
              Save to Google Drive
            </button>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#4f46e5',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 500
            }}>
              <Mail style={{ width: 13, height: 13 }} />
              Email via Gmail App-Password
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Statutory Disclaimer Card */}
      <div style={{
        background: '#f8fafc',
        borderRadius: '12px',
        border: '1px dashed #cbd5e1',
        padding: '16px 20px',
        color: '#64748b',
        fontSize: '12px',
        lineHeight: 1.5
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>
          <ShieldCheck style={{ width: 16, height: 16, color: '#059669' }} />
          Statutory Quality & Jurisdictional Notice
        </div>
        {OFFICIAL_LEGAL_ASSISTANCE_DISCLAIMER}
      </div>
    </div>
  );
};

