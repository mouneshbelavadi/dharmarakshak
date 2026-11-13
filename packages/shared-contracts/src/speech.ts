import { IndianLanguage } from './session.js';
import { GroundedSourceAnchor, QaAnswerStatus, QaSourceStatus } from './qa.js';

export type AudioSource = 'phone_microphone' | 'board_microphone';

export interface SpeechRecognitionRequest {
  audioBase64: string;
  mimeType: string;
  sampleRate?: number;
  languageHint?: IndianLanguage;
  source: AudioSource;
  model?: 'saaras:v2' | 'saarika:v2';
}

export interface SpeechRecognitionResponse {
  transcript: string;
  detectedLanguage: IndianLanguage;
  confidence: number;
  isCodeSwitching: boolean;
  detectedScript?: string;
  languageName: string;
}

export interface SpeechSynthesisRequest {
  text: string;
  targetLanguage: IndianLanguage;
  speakerGender?: 'female' | 'male';
  pace?: number;
  model?: 'bulbul:v1' | 'bulbul:v2';
}

export interface SpeechSynthesisResponse {
  audioBase64: string;
  mimeType: string;
  durationMs: number;
  languageCode: IndianLanguage;
}

export interface SpeechConversationTurnRequest {
  caseId: string;
  sessionId?: string;
  audioBase64: string;
  mimeType: string;
  source: AudioSource;
  preferredLanguage?: IndianLanguage;
  correctedLanguage?: IndianLanguage;
  documentScope?: 'all' | 'specific';
  targetDocumentId?: string;
  snapshotVersion?: number;
}

export interface SpeechConversationTurnResponse {
  turnId: string;
  userTranscript: string;
  detectedLanguage: IndianLanguage;
  correctedLanguage?: IndianLanguage;
  answerText: string;
  answerAudioBase64?: string;
  answerAudioMimeType?: string;
  spokenSummary: string;
  sources: GroundedSourceAnchor[];
  answerStatus: QaAnswerStatus;
  sourceStatus: QaSourceStatus;
  isInterrupted?: boolean;
  activeAudioSource: AudioSource;
  latencyMs: number;
  timestamp: string;
}

export interface GeminiLiveSessionToken {
  token: string;
  caseId: string;
  sessionId: string;
  expiresAt: string;
  mode: 'gemini_live';
  endpointUrl: string;
  allowedAudioFormats: string[];
}

export interface BoardAudioStatus {
  isHardwarePresent: boolean;
  isRecording: boolean;
  deviceId: string;
  deviceLabel: string;
  sampleRate: number;
  channels: number;
}

