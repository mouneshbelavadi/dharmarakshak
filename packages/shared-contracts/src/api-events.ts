import { SpecialistStatus, BenchStatus, ActivityType } from '@dharmaraksha/tribunal-definitions';

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  dependencies?: Record<string, 'ok' | 'unreachable' | 'mocked'>;
}

export type TribunalEventType =
  | 'case:status_changed'
  | 'bench:status_changed'
  | 'specialist:status_changed'
  | 'specialist:activity_changed'
  | 'messenger:transit_started'
  | 'messenger:packet_delivered'
  | 'presiding:synthesis_updated'
  | 'kiosk:card_tapped'
  | 'kiosk:page_scanned';

export interface TribunalEvent<T = unknown> {
  id: string;
  type: TribunalEventType;
  timestamp: string;
  caseId: string;
  payload: T;
}

export interface SpecialistStatusPayload {
  specialistId: string;
  benchId: 'A' | 'B' | 'C' | 'D' | 'E';
  status: SpecialistStatus;
  activity: ActivityType;
  currentTaskDescription?: string;
}

export interface BenchStatusPayload {
  benchId: 'A' | 'B' | 'C' | 'D' | 'E';
  status: BenchStatus;
  progressPercent: number;
}

