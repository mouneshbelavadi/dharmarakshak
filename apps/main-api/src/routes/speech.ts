import { Router, Request, Response } from 'express';
import { requireCaseAccess } from '../auth/auth-service.js';
import { sarvamSpeechService } from '../services/sarvam-speech-service.js';
import { audioTurnManager } from '../services/audio-turn-manager.js';
import { geminiLiveTokenService } from '../services/gemini-live-token-service.js';
import { AudioSource } from '@dharmaraksha/shared-contracts';

export const speechRouter = Router();

// Full Voice Conversation Turn: Audio In -> Sarvam STT -> Grounded QA -> Sarvam TTS Audio Out
speechRouter.post('/cases/:id/speech/turn', requireCaseAccess, async (req: Request, res: Response) => {
  const caseId = req.params.id;
  const {
    audioBase64,
    mimeType = 'audio/wav',
    source = 'phone_microphone',
    preferredLanguage,
    correctedLanguage,
    documentScope,
    targetDocumentId,
    snapshotVersion
  } = req.body;

  if (!audioBase64 || typeof audioBase64 !== 'string') {
    return res.status(400).json({
      error: 'MISSING_AUDIO',
      message: 'audioBase64 is required for a speech conversation turn.'
    });
  }

  try {
    const sessionId = (req as any).userSession?.sessionId || 'sess-anonymous';
    const turnResponse = await audioTurnManager.processVoiceTurn(
      {
        caseId,
        sessionId,
        audioBase64,
        mimeType,
        source: source as AudioSource,
        preferredLanguage,
        correctedLanguage,
        documentScope,
        targetDocumentId,
        snapshotVersion
      },
      sessionId
    );

    res.status(200).json({ success: true, turn: turnResponse });
  } catch (err: any) {
    res.status(500).json({ error: 'VOICE_TURN_ERROR', message: err.message });
  }
});

// Standalone Sarvam STT Transcription endpoint
speechRouter.post('/cases/:id/speech/transcribe', requireCaseAccess, async (req: Request, res: Response) => {
  const { audioBase64, mimeType = 'audio/wav', source = 'phone_microphone', languageHint } = req.body;

  if (!audioBase64) {
    return res.status(400).json({ error: 'MISSING_AUDIO', message: 'audioBase64 is required.' });
  }

  try {
    const result = await sarvamSpeechService.transcribe({
      audioBase64,
      mimeType,
      source: source as AudioSource,
      languageHint
    });

    res.status(200).json({ success: true, transcription: result });
  } catch (err: any) {
    res.status(500).json({ error: 'STT_ERROR', message: err.message });
  }
});

// Standalone Sarvam TTS Synthesis endpoint
speechRouter.post('/cases/:id/speech/synthesize', requireCaseAccess, async (req: Request, res: Response) => {
  const { text, targetLanguage = 'en', speakerGender, pace } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'MISSING_TEXT', message: 'text is required for speech synthesis.' });
  }

  try {
    const result = await sarvamSpeechService.synthesize({
      text,
      targetLanguage,
      speakerGender,
      pace
    });

    res.status(200).json({ success: true, synthesis: result });
  } catch (err: any) {
    res.status(500).json({ error: 'TTS_ERROR', message: err.message });
  }
});

// Immediate Interruption / Stop Speaking endpoint
speechRouter.post('/cases/:id/speech/interrupt', requireCaseAccess, (req: Request, res: Response) => {
  const caseId = req.params.id;
  const { turnId } = req.body;

  const stopped = audioTurnManager.interrupt(caseId, turnId);
  res.status(200).json({ success: true, interrupted: stopped });
});

// Switch active audio source (Phone Microphone vs Board Microphone)
speechRouter.post('/cases/:id/speech/source', requireCaseAccess, (req: Request, res: Response) => {
  const caseId = req.params.id;
  const { source } = req.body;

  if (source !== 'phone_microphone' && source !== 'board_microphone') {
    return res.status(400).json({ error: 'INVALID_SOURCE', message: 'Source must be phone_microphone or board_microphone.' });
  }

  audioTurnManager.setActiveAudioSource(caseId, source);
  res.status(200).json({ success: true, activeAudioSource: source });
});

// Issue ephemeral token for optional Gemini Live session mode
speechRouter.post('/cases/:id/speech/live-token', requireCaseAccess, (req: Request, res: Response) => {
  const caseId = req.params.id;
  const sessionId = (req as any).userSession?.sessionId || 'sess-anonymous';

  const token = geminiLiveTokenService.issueLiveSessionToken(caseId, sessionId);
  res.status(200).json({ success: true, liveToken: token });
});

// List supported Indian languages
speechRouter.get('/cases/:id/speech/languages', requireCaseAccess, (_req: Request, res: Response) => {
  const languages = sarvamSpeechService.getSupportedLanguages();
  res.status(200).json({ success: true, languages });
});

