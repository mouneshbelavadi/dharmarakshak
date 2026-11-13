export type DocumentCategory =
  | 'tenancy_agreement'
  | 'employment_contract'
  | 'property_sale_deed'
  | 'loan_agreement'
  | 'consumer_service_agreement'
  | 'commercial_supply_contract'
  | 'nda_ip_agreement'
  | 'payment_receipt'
  | 'legal_notice'
  | 'supporting_letter'
  | 'annexure_schedule'
  | 'unknown_uncategorized';

export type PageContinuityStatus =
  | 'intact'
  | 'missing_intermediate_page'
  | 'duplicate_page'
  | 'unreadable_blur'
  | 'glare_detected'
  | 'misoriented_rotated';

export interface DocumentPage {
  pageId: string;
  documentId: string;
  pageNumber: number; // 1-based sequential index
  imageUrl: string;
  thumbnailUrl?: string;
  extractedText?: string;
  scriptDetected?: string;
  qualityScore?: number; // 0.0 to 1.0
  continuityStatus: PageContinuityStatus;
  ocrConfidence?: number;
  rotationDegrees: number;
  sha256Checksum: string;
  byteSize: number;
  capturedAt: string;
}

export interface ImmutableDocumentVersion {
  versionId: string;
  documentId: string;
  versionNumber: number; // Monotonically increasing: 1, 2, 3...
  pageCount: number;
  pageManifest: string[]; // Ordered list of pageIds
  manifestHash: string; // Sha256 of combined page hashes
  createdAt: string;
  createdBySessionId: string;
}

export interface CaseDocument {
  documentId: string;
  caseId: string;
  title: string;
  category: DocumentCategory;
  currentVersionNumber: number;
  versions: ImmutableDocumentVersion[];
  pages: DocumentPage[];
  pageCount: number;
  uploadedAt: string;
  sourceChannel: 'kiosk_overhead_cam' | 'phone_cam' | 'laptop_direct_upload' | 'telegram_bot' | 'google_drive';
  languageDetected?: string;
  contentHash: string;
  isArchived: boolean;
}

export interface UploadAcknowledgment {
  uploadId: string;
  documentId: string;
  pageId: string;
  idempotencyKey: string;
  sha256Checksum: string;
  receivedBytes: number;
  status: 'acknowledged_and_stored' | 'duplicate_ignored' | 'rejected_corrupt';
  timestamp: string;
}

export interface DocumentIngestRequest {
  idempotencyKey: string;
  caseId: string;
  documentId?: string;
  pageNumber: number;
  sha256Checksum: string;
  sourceChannel: 'kiosk_overhead_cam' | 'phone_cam' | 'laptop_direct_upload';
}
