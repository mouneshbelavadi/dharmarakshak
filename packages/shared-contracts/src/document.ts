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

export interface ExtractedPassage {
  passageId: string;
  documentId: string;
  documentTitle: string;
  versionNumber: number;
  pageNumber: number;
  text: string;
  language?: string;
  scriptDetected?: string;
  confidence?: number;
  isUncertain?: boolean;
  uncertaintyReason?: string;
  containsDate?: string[];
  containsAmount?: string[];
  containsNegation?: boolean;
  isTable?: boolean;
  tableStructure?: {
    headers: string[];
    rows: string[][];
  };
  lineRange?: { start: number; end: number };
  sourceAnchor: string; // e.g. "doc:doc-lease-01:v1:p2#para-3"
}

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
  isUncertain?: boolean;
  uncertaintyReason?: string;
  needsRecapture?: boolean;
  reviewedText?: string; // Corrected text after human review
  reviewedBy?: string;
  reviewedAt?: string;
  duplicateOfPageNumber?: number;
  passages?: ExtractedPassage[];
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
  parentDocumentId?: string; // Links an annexure/schedule to its parent agreement while keeping its own identity
  currentVersionNumber: number;
  versions: ImmutableDocumentVersion[];
  pages: DocumentPage[];
  pageCount: number;
  uploadedAt: string;
  sourceChannel: 'kiosk_overhead_cam' | 'phone_cam' | 'laptop_direct_upload' | 'telegram_bot' | 'google_drive';
  languageDetected?: string;
  contentHash: string;
  isArchived: boolean;
  status?: 'draft_intake' | 'intake_completed' | 'archived';
  originalFileName?: string;
  fileType?: 'pdf' | 'image' | 'scanned_pages';
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
