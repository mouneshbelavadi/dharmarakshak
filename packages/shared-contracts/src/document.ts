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
  pageNumber: number;
  imageUrl: string;
  thumbnailUrl?: string;
  extractedText?: string;
  scriptDetected?: string;
  qualityScore?: number; // 0.0 to 1.0
  continuityStatus: PageContinuityStatus;
  ocrConfidence?: number;
  rotationDegrees?: number;
}

export interface CaseDocument {
  documentId: string;
  caseId: string;
  title: string;
  category: DocumentCategory;
  pages: DocumentPage[];
  pageCount: number;
  uploadedAt: string;
  sourceChannel: 'kiosk_overhead_cam' | 'phone_cam' | 'laptop_direct_upload' | 'telegram_bot' | 'google_drive';
  languageDetected?: string;
  hash: string;
}

