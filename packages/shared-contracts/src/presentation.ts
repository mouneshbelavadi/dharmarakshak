import { CharacterActivity } from './animation-state.js';

export type OriginLabel = 'laptop_upload' | 'kiosk_capture';

export interface PresentationMilestone {
  milestoneId: string;
  caseId: string;
  documentSetId: string;
  origin: OriginLabel;
  name: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
}

export interface SpecialistVisibleState {
  specialistId: string;
  benchId: 'A' | 'B' | 'C' | 'D' | 'E';
  activity: CharacterActivity;
  taskStatus: 'idle' | 'assigned' | 'active' | 'completed' | 'failed' | 'cancelled';
  lastUpdated: string;
}

export interface PresentationCaseView {
  caseId: string;
  documentSetId: string;
  origin: OriginLabel;
  currentSnapshotVersion: number;
  status: string;
  milestones: PresentationMilestone[];
  specialistStates: SpecialistVisibleState[];
  messengerState: { activity: CharacterActivity; inTransit: boolean; sourceBenchId?: string; lastUpdated: string };
  presidingState: { activity: CharacterActivity; synthesisStatus: 'awaiting' | 'in_progress' | 'completed' | 'failed'; lastUpdated: string };
  findings?: {
    executiveSummary?: string;
    keyObligations?: string[];
    materialRisks?: string[];
    criticalDeadlines?: string[];
    inconsistenciesIdentified?: string[];
    questionsForVisitorClarification?: string[];
    missingDocumentsOrExhibits?: string[];
    statutoryCoverageLimitations?: string[];
  };
  errors: Array<{ benchId?: string; specialistId?: string; message: string; timestamp: string }>;
  // EXCLUDED from this type by design: device keys, provider credentials, internal prompts, developer diagnostics, raw LLM responses, session tokens
}
