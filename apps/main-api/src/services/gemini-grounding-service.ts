import {
  IndianLanguage,
  QuestionAnswerTurn,
  GroundedQuestionRequest
} from '@dharmaraksha/shared-contracts';
import { qaTurnService } from './qa-turn-service.js';

export interface GroundedAnswerResult {
  turn: QuestionAnswerTurn;
  spokenSummary: string;
}

export class GeminiGroundingService {
  /**
   * Produce document-grounded answers citing exact document title, page number, and clause.
   * Generates both screen text with full citations and concise spoken summary for TTS.
   */
  public async answerQuestion(
    request: GroundedQuestionRequest,
    authorizedSessionId?: string
  ): Promise<GroundedAnswerResult> {
    // 1. Process through QA turn service to obtain authoritative grounded response
    const turn = await qaTurnService.processQuestion(request, authorizedSessionId);

    // 2. Generate concise spoken summary for voice output
    // Specification S5 requirement: "spoken responses can use short references while the screen holds full citations"
    const spokenSummary = this.generateSpokenSummary(turn);

    return {
      turn,
      spokenSummary
    };
  }

  /**
   * Format a concise 1-2 sentence spoken summary suitable for audio playback.
   */
  private generateSpokenSummary(turn: QuestionAnswerTurn): string {
    // If ambiguous scope clarification was requested
    if (turn.answerStatus === 'clarification_requested') {
      return turn.clarificationQuestion || turn.answerText;
    }

    // If targeted review was scheduled
    if (turn.answerStatus === 'targeted_review_scheduled') {
      return 'A targeted legal review task has been scheduled for this query. The results will appear on your screen once evaluated.';
    }

    // If absent from documents
    if (turn.answerStatus === 'absent_from_documents') {
      return 'The scanned documents do not contain information answering this question. Please check if an attachment is missing.';
    }

    // If stale snapshot rejected
    if (turn.answerStatus === 'stale_version_rejected') {
      return 'This question references an older document version. Please ask using the latest documents.';
    }

    // For completed grounded answers, create a clean spoken version without bracketed markdown citations
    let cleaned = turn.answerText
      .replace(/\[Doc[^\]]+\]/g, '')
      .replace(/\(Page \d+, Clause [^\)]+\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Attach brief short reference if sources exist
    if (turn.sources.length > 0) {
      const topSource = turn.sources[0];
      const docRef = topSource.documentTitle || 'your document';
      const clauseRef = topSource.clauseReference ? `, ${topSource.clauseReference}` : '';
      cleaned = `According to ${docRef}${clauseRef}: ${cleaned}`;
    }

    // Truncate spoken summary to maximum 2 sentences for natural speech delivery
    const sentences = cleaned.split(/(?<=[.?!])\s+/);
    if (sentences.length > 2) {
      return sentences.slice(0, 2).join(' ');
    }
    return cleaned;
  }
}

export const geminiGroundingService = new GeminiGroundingService();

