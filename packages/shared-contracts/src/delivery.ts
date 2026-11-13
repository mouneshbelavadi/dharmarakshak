export type DeliveryChannel = 'telegram_bot' | 'gmail_app_password' | 'google_drive_export';

export type DeliveryDispatchStatus =
  | 'pending_visitor_confirmation'
  | 'queued'
  | 'dispatching'
  | 'delivered'
  | 'failed'
  | 'cancelled';

export interface TelegramDeliveryPayload {
  chatId: string;
  telegramUsername?: string;
  confirmedByVisitor: boolean;
}

export interface GmailDeliveryPayload {
  recipientEmail: string;
  confirmedByVisitor: boolean;
}

export interface GoogleDriveDeliveryPayload {
  destinationFolderId?: string;
  googleAccountEmail: string;
  confirmedByVisitor: boolean;
}

export interface DeliveryDispatchRecord {
  dispatchId: string;
  caseId: string;
  reportId: string;
  channel: DeliveryChannel;
  status: DeliveryDispatchStatus;
  destinationSummary: string; // Redacted / safe destination string (e.g. "u***@gmail.com")
  requestedAt: string;
  confirmedAt?: string;
  dispatchedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

