export type DriveConnectionStatus = 'disconnected' | 'authorizing' | 'connected' | 'revoked';

export interface DriveAuthState {
  status: DriveConnectionStatus;
  accountEmail?: string;
  connectedAt?: string;
  scope: string;
}

export interface DriveFileItem {
  fileId: string;
  name: string;
  mimeType: string;
  size?: number;
  modifiedTime?: string;
}

export interface DriveExportJob {
  jobId: string;
  caseId: string;
  reportVersion: number;
  reportType: 'summary' | 'pdf';
  driveFileId?: string;
  driveViewLink?: string;
  status: 'queued' | 'exporting' | 'completed' | 'failed';
  idempotencyKey: string;
  error?: string;
  exportedAt?: string;
  createdAt: string;
}

export interface DriveImportRequest {
  caseId: string;
  fileId: string;
  fileName: string;
  mimeType: string;
  fileSize?: number;
  documentCategory?: string;
}

