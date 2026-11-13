import React, { useState } from 'react';
import { FileText, Plus, Trash2, RotateCw, Eye, ArrowUp, ArrowDown, UploadCloud, AlertCircle } from 'lucide-react';
import { CaseRecord, CaseDocument, DocumentPage } from '@dharmaraksha/shared-contracts';

interface DocumentsViewProps {
  currentCase: CaseRecord;
  onUpdateCase?: (updated: CaseRecord) => void;
  isFixture: boolean;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ currentCase, isFixture }) => {
  const [selectedDocId, setSelectedDocId] = useState<string>('doc-001');

  // Sample multi-document folio fixtures
  const documents: CaseDocument[] = [
    {
      documentId: 'doc-001',
      caseId: currentCase.caseId,
      title: 'Commercial Lease Agreement',
      category: 'tenancy_agreement',
      currentVersionNumber: 1,
      versions: [],
      pages: [
        {
          pageId: 'pg-101',
          documentId: 'doc-001',
          pageNumber: 1,
          imageUrl: '/fixtures/page_1.jpg',
          extractedText: 'COMMERCIAL LEASE AGREEMENT\nThis agreement made on 01-Oct-2026 between K.R. Properties (Lessor) and Mounesh (Lessee)...',
          qualityScore: 0.98,
          continuityStatus: 'intact',
          rotationDegrees: 0,
          sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          byteSize: 1420900,
          capturedAt: new Date().toISOString()
        },
        {
          pageId: 'pg-102',
          documentId: 'doc-001',
          pageNumber: 2,
          imageUrl: '/fixtures/page_2.jpg',
          extractedText: 'Clause 4: Rent of INR 45,000 payable strictly by 5th. Clause 5: Security deposit of INR 2,50,000...',
          qualityScore: 0.95,
          continuityStatus: 'intact',
          rotationDegrees: 0,
          sha256Checksum: 'f4b1c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b999',
          byteSize: 1530200,
          capturedAt: new Date().toISOString()
        },
        {
          pageId: 'pg-103',
          documentId: 'doc-001',
          pageNumber: 3,
          imageUrl: '/fixtures/page_3.jpg',
          extractedText: 'Clause 11: 11-Month lock-in period. Clause 12: Unilateral forfeiture of deposit. Signatures: Lessor [Signed], Lessee [Signed]...',
          qualityScore: 0.91,
          continuityStatus: 'intact',
          rotationDegrees: 0,
          sha256Checksum: 'a7b3c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b111',
          byteSize: 1610400,
          capturedAt: new Date().toISOString()
        }
      ],
      pageCount: 3,
      uploadedAt: new Date().toISOString(),
      sourceChannel: 'kiosk_overhead_cam',
      languageDetected: 'en',
      contentHash: 'hash-lease-v1',
      isArchived: false
    },
    {
      documentId: 'doc-002',
      caseId: currentCase.caseId,
      title: 'RTGS Security Deposit Receipt',
      category: 'payment_receipt',
      currentVersionNumber: 1,
      versions: [],
      pages: [
        {
          pageId: 'pg-201',
          documentId: 'doc-002',
          pageNumber: 1,
          imageUrl: '/fixtures/receipt_1.jpg',
          extractedText: 'BANK ACKNOWLEDGMENT RECEIPT\nDate: 12-Oct-2026\nReceived from Mounesh INR 2,70,000 towards commercial deposit...',
          qualityScore: 0.96,
          continuityStatus: 'intact',
          rotationDegrees: 0,
          sha256Checksum: 'b8c2c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b222',
          byteSize: 890400,
          capturedAt: new Date().toISOString()
        }
      ],
      pageCount: 1,
      uploadedAt: new Date().toISOString(),
      sourceChannel: 'laptop_direct_upload',
      languageDetected: 'en',
      contentHash: 'hash-receipt-v1',
      isArchived: false
    }
  ];

  const activeDoc = documents.find((d) => d.documentId === selectedDocId) || documents[0];

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      backgroundColor: '#fdfbf7', // Ivory paper background
      color: '#0f172a',
      overflow: 'hidden'
    }}>
      {/* Left Column: Document Folio List */}
      <div style={{
        width: '320px',
        borderRight: '1px solid #e7e0d3',
        backgroundColor: '#f9f6ef',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e7e0d3' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
              Documents in Case ({documents.length})
            </span>
            {isFixture && (
              <span style={{ fontSize: '10px', background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                FIXTURE
              </span>
            )}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Snapshot v{currentCase.currentSnapshotVersion} • Immutable Manifest
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {documents.map((doc) => (
            <div
              key={doc.documentId}
              onClick={() => setSelectedDocId(doc.documentId)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer',
                background: selectedDocId === doc.documentId ? '#ffffff' : 'transparent',
                border: selectedDocId === doc.documentId ? '1px solid #ca8a04' : '1px solid transparent',
                boxShadow: selectedDocId === doc.documentId ? '0 2px 4px rgba(0,0,0,0.03)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText style={{ width: 16, height: 16, color: selectedDocId === doc.documentId ? '#ca8a04' : '#64748b' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                  {doc.title}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                <span>{doc.pageCount} {doc.pageCount === 1 ? 'page' : 'pages'}</span>
                <span>{doc.category.replace('_', ' ')}</span>
              </div>
            </div>
          ))}

          {/* Add Document Action */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '12px',
              borderRadius: '8px',
              border: '1px dashed #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            <Plus style={{ width: 14, height: 14 }} /> Add Supporting Document / Annexure
          </button>
        </div>
      </div>

      {/* Right Column: Ordered Page Inspector & Continuity */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e7e0d3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              {activeDoc.title}
            </h2>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Source: {activeDoc.sourceChannel} • SHA-256 Verified • {activeDoc.pageCount} Ordered Pages
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#0f172a',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 500
            }}>
              <UploadCloud style={{ width: 14, height: 14 }} />
              Upload Extra Page (Direct)
            </button>
          </div>
        </div>

        {/* Page Thumbnail List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeDoc.pages.map((page: DocumentPage) => (
            <div
              key={page.pageId}
              style={{
                background: '#ffffff',
                border: '1px solid #e7e0d3',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                gap: '16px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}
            >
              {/* Page Thumbnail Preview Mock */}
              <div style={{
                width: '100px',
                height: '140px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                fontSize: '11px',
                gap: '4px'
              }}>
                <Eye style={{ width: 20, height: 20, color: '#94a3b8' }} />
                <span>Page {page.pageNumber}</span>
              </div>

              {/* Page Metadata & Text Preview */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                      Page {page.pageNumber} of {activeDoc.pageCount}
                    </span>
                    <span style={{ fontSize: '11px', color: '#059669', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      Quality Score: {(page.qualityScore! * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: '#f8fafc',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#334155',
                    lineHeight: 1.4,
                    maxHeight: '60px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {page.extractedText}
                  </div>
                </div>

                {/* Page Reorder & Rotation Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                    SHA-256: {page.sha256Checksum.slice(0, 16)}...
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '11px' }}>
                      <RotateCw style={{ width: 12, height: 12 }} /> Rotate
                    </button>
                    <button style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '11px' }}>
                      <ArrowUp style={{ width: 12, height: 12 }} /> Move Up
                    </button>
                    <button style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '11px' }}>
                      <ArrowDown style={{ width: 12, height: 12 }} /> Move Down
                    </button>
                    <button style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #fecdd3', background: '#fff1f2', color: '#e11d48', fontSize: '11px' }}>
                      <Trash2 style={{ width: 12, height: 12 }} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

