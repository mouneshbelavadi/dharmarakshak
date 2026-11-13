import React from 'react';
import { GitCompare, AlertTriangle, ArrowRight, ShieldAlert, CheckCircle } from 'lucide-react';
import { CaseRecord } from '@dharmaraksha/shared-contracts';

interface DocumentComparisonProps {
  currentCase: CaseRecord;
}

export const DocumentComparison: React.FC<DocumentComparisonProps> = ({ currentCase }) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      backgroundColor: '#fdfbf7', // Ivory paper surface
      color: '#0f172a',
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      <div style={{ borderBottom: '2px solid #e7e0d3', paddingBottom: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', marginBottom: '4px' }}>
          <GitCompare style={{ width: 18, height: 18 }} />
          <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Cross-Document Comparison & Contradiction Audit
          </span>
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>
          Document Set Discrepancy Matrix
        </h1>
        <div style={{ fontSize: '13px', color: '#64748b' }}>
          Comparing Primary Agreement against Stamped Receipts and Schedules
        </div>
      </div>

      {/* Side-by-Side Clause Comparison Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Document A Folio Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e7e0d3',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '3px 8px', borderRadius: '6px' }}>
              DOCUMENT 1: Lease Agreement
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Page 2 • Clause 5</span>
          </div>
          <blockquote style={{
            margin: 0,
            padding: '12px 16px',
            background: '#f8fafc',
            borderLeft: '4px solid #0284c7',
            fontSize: '13px',
            lineHeight: 1.6,
            color: '#1e293b',
            fontStyle: 'italic'
          }}>
            "The Lessee shall pay an interest-free refundable security deposit of <strong>INR 2,50,000 (Two Lakhs Fifty Thousand)</strong> prior to handing over vacant possession of the premises."
          </blockquote>
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#475569' }}>
            Stated Beneficiary: <strong>Lessor (K. R. Properties)</strong>
          </div>
        </div>

        {/* Document B Folio Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e7e0d3',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#047857', background: '#dcfce7', padding: '3px 8px', borderRadius: '6px' }}>
              DOCUMENT 2: Bank RTGS Counterfoil
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Page 1 • Transaction Receipt</span>
          </div>
          <blockquote style={{
            margin: 0,
            padding: '12px 16px',
            background: '#f8fafc',
            borderLeft: '4px solid #10b981',
            fontSize: '13px',
            lineHeight: 1.6,
            color: '#1e293b',
            fontStyle: 'italic'
          }}>
            "Received the sum of <strong>INR 2,70,000 (Two Lakhs Seventy Thousand)</strong> via UTR# HDFC00984920 towards security deposit for commercial space."
          </blockquote>
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#475569' }}>
            Payment Date: <strong>12-October-2026</strong>
          </div>
        </div>
      </div>

      {/* Discrepancy Synthesis Banner */}
      <div style={{
        background: '#fffbeb',
        borderRadius: '12px',
        border: '1px solid #fde68a',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#b45309', marginBottom: '10px' }}>
          <ShieldAlert style={{ width: 22, height: 22 }} />
          <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
            Contradiction Assessment by Bench A (Fidelity) & Bench D (Adversarial Risk)
          </h3>
        </div>
        <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#78350f', margin: '0 0 12px 0' }}>
          There is an unresolved surplus of <strong>INR 20,000</strong> between the agreement text and the payment receipt. This is classified as a critical evidence discrepancy.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ background: '#ffffff', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', border: '1px solid #fef3c7', color: '#92400e' }}>
            • <strong>Risk:</strong> Counterparty could claim the additional INR 20,000 was non-refundable maintenance or brokerage rather than deposit.
          </div>
          <div style={{ background: '#ffffff', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', border: '1px solid #fef3c7', color: '#92400e' }}>
            • <strong>Action Needed:</strong> Request written endorsement from lessor confirming total refundable deposit is INR 2,70,000.
          </div>
        </div>
      </div>
    </div>
  );
};

