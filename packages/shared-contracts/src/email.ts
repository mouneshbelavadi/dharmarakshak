export type EmailDeliveryStatus = 'queued' | 'submitting' | 'smtp_accepted' | 'failed' | 'uncertain';

export interface EmailConfigState {
  configured: boolean;
  senderEmail?: string;
  authType: 'app_password' | 'oauth2';
  tlsMode: 'STARTTLS' | 'TLS';
  smtpHost: string;
  smtpPort: number;
}

export interface EmailSendRequest {
  caseId: string;
  recipientEmail: string;
  reportVersion: number;
  reportFormat: 'pdf_attachment' | 'summary_text' | 'private_link';
  consentConfirmed: boolean;
}

export interface EmailDeliveryJob {
  jobId: string;
  idempotencyKey: string;
  caseId: string;
  recipientEmail: string;
  reportVersion: number;
  reportFormat: 'pdf_attachment' | 'summary_text' | 'private_link';
  status: EmailDeliveryStatus;
  messageId?: string;
  acceptedAt?: string;
  attemptCount: number;
  error?: string;
  createdAt: string;
}

