import React from 'react';
import { FileText, Plus, ArrowRight, Shield } from 'lucide-react';

interface DocumentSummaryItem {
  id: string;
  title: string;
  category: string;
  pageCount: number;
}

interface DocumentListScreenProps {
  documents: DocumentSummaryItem[];
  onSelectDocument: (docId: string) => void;
  onAddDocument: () => void;
  onProceedToReview: () => void;
}

export const DocumentListScreen: React.FC<DocumentListScreenProps> = ({
  documents,
  onSelectDocument,
  onAddDocument,
  onProceedToReview
}) => {
  const totalPages = documents.reduce((sum, d) => sum + d.pageCount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Documents in Your Case
            </h2>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              {documents.length} {documents.length === 1 ? 'Document' : 'Documents'} • {totalPages} Total Pages Captured
            </div>
          </div>
          <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '12px', fontWeight: 700 }}>
            CASE FOLIO
          </span>
        </div>

        {/* Document Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '16px 0' }}>
          {documents.map((doc, idx) => (
            <div
              key={doc.id}
              onClick={() => onSelectDocument(doc.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '12px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  background: '#e0f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284c7',
                  fontWeight: 700,
                  fontSize: '14px'
                }}>
                  {idx + 1}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                    {doc.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {doc.pageCount} {doc.pageCount === 1 ? 'page' : 'pages'} • {doc.category}
                  </div>
                </div>
              </div>
              <ArrowRight style={{ width: 18, height: 18, color: '#94a3b8' }} />
            </div>
          ))}

          {/* Add Another Document Button */}
          <button
            onClick={onAddDocument}
            style={{
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '12px',
              border: '1px dashed #cbd5e1',
              background: '#ffffff',
              color: '#0284c7',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus style={{ width: 16, height: 16 }} /> Add Another Document or Receipt
          </button>
        </div>

        {/* Start Analysis Button */}
        {totalPages > 0 && (
          <button
            onClick={onProceedToReview}
            style={{
              minHeight: '48px',
              width: '100%',
              background: '#059669',
              color: '#ffffff',
              padding: '14px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            Submit Documents for Legal Review ({totalPages} Pages)
          </button>
        )}
      </div>
    </div>
  );
};

