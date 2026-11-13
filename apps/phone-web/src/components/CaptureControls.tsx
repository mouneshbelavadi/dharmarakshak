import React from 'react';
import { Camera, RefreshCw, FileText, Check } from 'lucide-react';

interface CaptureControlsProps {
  pageCount: number;
  onCapturePage: () => void;
  onCompleteDocument: () => void;
  isCapturing: boolean;
}

export const CaptureControls: React.FC<CaptureControlsProps> = ({
  pageCount,
  onCapturePage,
  onCompleteDocument,
  isCapturing
}) => {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText style={{ width: 18, height: 18, color: '#0284c7' }} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
            Current Document Pages
          </span>
        </div>
        <span style={{
          background: '#e0f2fe',
          color: '#0369a1',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 700
        }}>
          {pageCount} {pageCount === 1 ? 'Page' : 'Pages'} Captured
        </span>
      </div>

      <div style={{
        height: '140px',
        background: '#f8fafc',
        borderRadius: '10px',
        border: '1px dashed #cbd5e1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b',
        gap: '6px'
      }}>
        <Camera style={{ width: 28, height: 28, color: '#94a3b8' }} />
        <span style={{ fontSize: '12px', fontWeight: 500 }}>
          {pageCount === 0 ? 'Place document page under overhead camera' : `Page ${pageCount} captured ready for review`}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onCapturePage}
          disabled={isCapturing}
          style={{
            flex: 1,
            background: '#0f172a',
            color: '#ffffff',
            padding: '12px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          {isCapturing ? <RefreshCw className="animate-spin" style={{ width: 16, height: 16 }} /> : <Camera style={{ width: 16, height: 16 }} />}
          Capture Page
        </button>

        {pageCount > 0 && (
          <button
            onClick={onCompleteDocument}
            style={{
              background: '#059669',
              color: '#ffffff',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Check style={{ width: 16, height: 16 }} />
            Start Review
          </button>
        )}
      </div>
    </div>
  );
};

