import React from 'react';
import { AlertTriangle, Calendar, DollarSign, Bookmark } from 'lucide-react';
import { CaseRecord } from '@dharmaraksha/shared-contracts';

interface DocumentWorkspaceProps {
  currentCase: CaseRecord;
}

export const DocumentWorkspace: React.FC<DocumentWorkspaceProps> = ({ currentCase }) => {
  const summary = currentCase.presidingSummary;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      backgroundColor: '#fdfbf7', // Warm paper light background
      color: '#1e293b',
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      {/* Case Header Banner */}
      <div style={{
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Bookmark style={{ width: 18, height: 18, color: '#b45309' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Document Folio & Evidence Review
          </span>
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>
          {currentCase.title}
        </h1>
        <div style={{ fontSize: '13px', color: '#64748b' }}>
          Source: {currentCase.sourceType === 'kiosk' ? 'Physical Kiosk Overhead Capture' : 'Laptop Direct Ingestion'} • Status: {currentCase.status}
        </div>
      </div>

      {/* Executive Findings Card */}
      {summary && (
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '18px',
          border: '1px solid #e7e5e4',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1c1917', marginBottom: '8px' }}>
            Executive Plain-Language Summary
          </h2>
          <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#44403c' }}>
            {summary.executiveSummary}
          </p>
        </div>
      )}

      {/* Discrepancy & Inconsistency Warning Card */}
      {summary && summary.inconsistenciesIdentified.length > 0 && (
        <div style={{
          background: '#fffbeb',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #fde68a',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', marginBottom: '8px' }}>
            <AlertTriangle style={{ width: 18, height: 18 }} />
            <h3 style={{ fontSize: '14px', fontWeight: 700 }}>
              Cross-Document Discrepancies Flagged by Bench A & D
            </h3>
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#78350f', lineHeight: 1.5 }}>
            {summary.inconsistenciesIdentified.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Obligations & Deadlines Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #e7e5e4'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', marginBottom: '10px' }}>
            <DollarSign style={{ width: 16, height: 16 }} />
            <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Key Rights & Obligations</h3>
          </div>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#334155', lineHeight: 1.5 }}>
            {summary?.keyObligations.map((ob, idx) => (
              <li key={idx} style={{ marginBottom: '6px' }}>{ob}</li>
            ))}
          </ul>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #e7e5e4'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', marginBottom: '10px' }}>
            <Calendar style={{ width: 16, height: 16 }} />
            <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Critical Deadlines & Risks</h3>
          </div>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#334155', lineHeight: 1.5 }}>
            {summary?.criticalDeadlines.map((dl, idx) => (
              <li key={idx} style={{ marginBottom: '6px' }}>{dl}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Missing Attachments & Limitations Card */}
      {summary && summary.missingDocumentsOrExhibits.length > 0 && (
        <div style={{
          background: '#f8fafc',
          borderRadius: '12px',
          padding: '14px',
          border: '1px dashed #cbd5e1',
          marginBottom: '16px'
        }}>
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
            Missing Records & Legal Limitations
          </h4>
          <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4, margin: 0 }}>
            {summary.missingDocumentsOrExhibits.join(' • ')}
          </p>
        </div>
      )}
    </div>
  );
};
