import React from 'react';
import { Camera, RefreshCw, RotateCw, Trash2, Check, ArrowLeft } from 'lucide-react';

interface CapturedPageItem {
  id: string;
  pageNumber: number;
  previewUrl: string;
  status: 'ok' | 'blur_warning';
}

interface CaptureReviewScreenProps {
  documentTitle: string;
  pages: CapturedPageItem[];
  onCapturePage: () => void;
  onRotatePage: (pageId: string) => void;
  onDeletePage: (pageId: string) => void;
  onFinishDocument: () => void;
  onBackToDocuments: () => void;
  isCapturing: boolean;
}

export const CaptureReviewScreen: React.FC<CaptureReviewScreenProps> = ({
  documentTitle,
  pages,
  onCapturePage,
  onRotatePage,
  onDeletePage,
  onFinishDocument,
  onBackToDocuments,
  isCapturing
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <button
            onClick={onBackToDocuments}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'transparent',
              color: '#64748b',
              fontSize: '12px',
              padding: '6px 0',
              fontWeight: 600
            }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} /> All Documents
          </button>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
            {documentTitle} ({pages.length} Pages)
          </span>
        </div>

        {/* Live Camera Viewfinder Box */}
        <div style={{
          height: '180px',
          background: '#090d16',
          borderRadius: '14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '16px'
        }}>
          {/* Viewfinder Border Guideline */}
          <div style={{
            position: 'absolute',
            inset: '16px',
            border: '2px dashed rgba(255, 255, 255, 0.4)',
            borderRadius: '8px',
            pointerEvents: 'none'
          }} />

          <Camera style={{ width: 32, height: 32, color: '#38bdf8', marginBottom: '6px' }} />
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Position document page flat under overhead camera
          </span>
          <span style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
            UNO Q UVC Stream • Auto-exposure active
          </span>
        </div>

        {/* Primary Capture Action Button */}
        <button
          onClick={onCapturePage}
          disabled={isCapturing}
          style={{
            minHeight: '48px',
            width: '100%',
            background: '#0f172a',
            color: '#ffffff',
            padding: '12px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '16px',
            cursor: 'pointer'
          }}
        >
          {isCapturing ? <RefreshCw className="animate-spin" style={{ width: 16, height: 16 }} /> : <Camera style={{ width: 16, height: 16 }} />}
          {isCapturing ? 'Processing Page Image...' : `Capture Page ${pages.length + 1}`}
        </button>

        {/* Captured Pages Strip */}
        {pages.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
              Captured Pages (Check order & clarity):
            </div>
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
              {pages.map((p) => (
                <div
                  key={p.id}
                  style={{
                    width: '90px',
                    height: '125px',
                    flexShrink: 0,
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '8px',
                    fontSize: '11px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>P{p.pageNumber}</span>
                    <button onClick={() => onRotatePage(p.id)} style={{ padding: 0, background: 'none' }}>
                      <RotateCw style={{ width: 12, height: 12, color: '#0284c7' }} />
                    </button>
                  </div>
                  <div style={{ textAlign: 'center', color: '#64748b', fontSize: '10px' }}>
                    Clarity: OK
                  </div>
                  <button
                    onClick={() => onDeletePage(p.id)}
                    style={{
                      background: 'none',
                      color: '#dc2626',
                      padding: 0,
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '2px'
                    }}
                  >
                    <Trash2 style={{ width: 10, height: 10 }} /> Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Finish Document Action */}
        {pages.length > 0 && (
          <button
            onClick={onFinishDocument}
            style={{
              minHeight: '48px',
              width: '100%',
              background: '#059669',
              color: '#ffffff',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Check style={{ width: 16, height: 16 }} />
            Finish & Add to Case ({pages.length} Pages)
          </button>
        )}
      </div>
    </div>
  );
};

