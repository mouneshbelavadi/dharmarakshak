import {
  AudioSource,
  IndianLanguage,
  SpeechConversationTurnRequest,
  SpeechConversationTurnResponse,
  GroundedQuestionRequest
} from '@dharmaraksha/shared-contracts';
import { sarvamSpeechService } from './sarvam-speech-service.js';
import { geminiGroundingService } from './gemini-grounding-service.js';

interface ActiveAudioSession {
  caseId: string;
  activeSource: AudioSource;
  isSpeaking: boolean;
  currentTurnId?: string;
  interruptedTurnIds: Set<string>;
  lastActivityAt: string;
}

export class AudioTurnManager {
  private sessions: Map<string, ActiveAudioSession> = new Map();

  /**
   * Process a complete voice conversation turn:
   * 1. Check & set single active audio source
   * 2. Sarvam STT (speech to text + language detection)
   * 3. Handle silence or empty audio gracefully
   * 4. Grounded Gemini Q&A with exact document citations
   * 5. Check if turn was interrupted
   * 6. Sarvam TTS in preferred/corrected language
   */
  public async processVoiceTurn(
    request: SpeechConversationTurnRequest,
    authorizedSessionId?: string
  ): Promise<SpeechConversationTurnResponse> {
    const startTime = Date.now();
    const caseId = request.caseId;
    const turnId = `speech-turn-${caseId}-${Date.now()}`;

    // 1. Maintain Single Active Audio Source & Stop Previous Audio
    const session = this.getOrCreateSession(caseId, request.source);
    // Switch active source cleanly
    session.activeSource = request.source;
    // Mark previous turn as superseded to prevent competing audio
    session.isSpeaking = false;
    session.currentTurnId = turnId;

    try {
      // 2. Sarvam STT Transcription & Language Detection
      const sttResult = await sarvamSpeechService.transcribe({
        audioBase64: request.audioBase64,
        mimeType: request.mimeType,
        source: request.source,
        languageHint: request.correctedLanguage || request.preferredLanguage
      });

      // 3. Handle Silence or Unrecognized Audio
      if (!sttResult.transcript || sttResult.transcript.trim().length === 0) {
        const silenceMessage = 'I did not detect any speech. Please tap the microphone button and ask your question clearly.';
        return {
          turnId,
          userTranscript: '',
          detectedLanguage: sttResult.detectedLanguage,
          correctedLanguage: request.correctedLanguage,
          answerText: silenceMessage,
          spokenSummary: silenceMessage,
          sources: [],
          answerStatus: 'clarification_requested',
          sourceStatus: 'preliminary_unreviewed',
          isInterrupted: false,
          activeAudioSource: request.source,
          latencyMs: Date.now() - startTime,
          timestamp: new Date().toISOString()
        };
      }

      // Check if user interrupted before Gemini QA
      if (session.interruptedTurnIds.has(turnId)) {
        return this.createInterruptedResponse(turnId, sttResult.transcript, sttResult.detectedLanguage, request.source, startTime);
      }

      // 4. Grounded Gemini Q&A
      // Language determination: user-corrected language takes precedence, then preferred, then detected
      const effectiveLanguage: IndianLanguage =
        request.correctedLanguage || request.preferredLanguage || sttResult.detectedLanguage;

      const groundedReq: GroundedQuestionRequest = {
        caseId: request.caseId,
        sessionId: authorizedSessionId,
        questionText: sttResult.transcript,
        documentScope: request.documentScope || 'all',
        targetDocumentId: request.targetDocumentId,
        languagePreference: effectiveLanguage,
        snapshotVersion: request.snapshotVersion,
        mode: 'voice'
      };

      const { turn, spokenSummary } = await geminiGroundingService.answerQuestion(groundedReq, authorizedSessionId);

      // Check if user interrupted before TTS synthesis
      if (session.interruptedTurnIds.has(turnId)) {
        return this.createInterruptedResponse(turnId, sttResult.transcript, sttResult.detectedLanguage, request.source, startTime);
      }

      // 5. Sarvam Speech Synthesis (TTS) in the effective language
      let answerAudioBase64: string | undefined;
      let answerAudioMimeType: string | undefined;

      try {
        const ttsResult = await sarvamSpeechService.synthesize({
          text: spokenSummary,
          targetLanguage: effectiveLanguage,
          pace: 1.0
        });
        answerAudioBase64 = ttsResult.audioBase64;
        answerAudioMimeType = ttsResult.mimeType;
      } catch (err: any) {
        console.warn(`[AudioTurnManager] TTS failed: ${err.message}. Providing text-only answer.`);
      }

      // Mark session speaking state
      session.isSpeaking = Boolean(answerAudioBase64);

      return {
        turnId,
        userTranscript: sttResult.transcript,
        detectedLanguage: sttResult.detectedLanguage,
        correctedLanguage: request.correctedLanguage,
        answerText: turn.answerText,
        answerAudioBase64,
        answerAudioMimeType,
        spokenSummary,
        sources: turn.sources,
        answerStatus: turn.answerStatus,
        sourceStatus: turn.sourceStatus,
        isInterrupted: false,
        activeAudioSource: request.source,
        latencyMs: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    } catch (err: any) {
      console.error(`[AudioTurnManager] Error processing voice turn: ${err.message}`);
      // Graceful network/service failure handling
      const fallbackMsg = `Voice service temporarily encountered an error: ${err.message}. Please try again or type your question below.`;
      return {
        turnId,
        userTranscript: '',
        detectedLanguage: request.preferredLanguage || 'en',
        answerText: fallbackMsg,
        spokenSummary: fallbackMsg,
        sources: [],
        answerStatus: 'completed',
        sourceStatus: 'preliminary_unreviewed',
        isInterrupted: false,
        activeAudioSource: request.source,
        latencyMs: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Signal immediate interruption (Stop Speaking button or user speaking again).
   * Stops active speech immediately.
   */
  public interrupt(caseId: string, turnId?: string): boolean {
    const session = this.sessions.get(caseId);
    if (!session) return false;

    session.isSpeaking = false;
    if (turnId) {
      session.interruptedTurnIds.add(turnId);
    } else if (session.currentTurnId) {
      session.interruptedTurnIds.add(session.currentTurnId);
    }
    return true;
  }

  /**
   * Switch the active audio source cleanly (e.g. from phone to board mic).
   */
  public setActiveAudioSource(caseId: string, source: AudioSource): void {
    const session = this.getOrCreateSession(caseId, source);
    session.activeSource = source;
  }

  public getActiveAudioSource(caseId: string): AudioSource {
    const session = this.sessions.get(caseId);
    return session ? session.activeSource : 'phone_microphone';
  }

  public isAssistantSpeaking(caseId: string): boolean {
    const session = this.sessions.get(caseId);
    return session ? session.isSpeaking : false;
  }

  public stopSpeaking(caseId: string): void {
    this.interrupt(caseId);
  }

  private getOrCreateSession(caseId: string, defaultSource: AudioSource): ActiveAudioSession {
    if (!this.sessions.has(caseId)) {
      this.sessions.set(caseId, {
        caseId,
        activeSource: defaultSource,
        isSpeaking: false,
        interruptedTurnIds: new Set(),
        lastActivityAt: new Date().toISOString()
      });
    }
    return this.sessions.get(caseId)!;
  }

  private createInterruptedResponse(
    turnId: string,
    transcript: string,
    lang: IndianLanguage,
    source: AudioSource,
    startTime: number
  ): SpeechConversationTurnResponse {
    return {
      turnId,
      userTranscript: transcript,
      detectedLanguage: lang,
      answerText: '[Speech output interrupted by user]',
      spokenSummary: '',
      sources: [],
      answerStatus: 'completed',
      sourceStatus: 'preliminary_unreviewed',
      isInterrupted: true,
      activeAudioSource: source,
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }
}

export const audioTurnManager = new AudioTurnManager();

