export interface ChamberOfficial {
  id: string;
  name: string;
  role: string;
  description: string;
}

export const MESSENGER: ChamberOfficial = {
  id: 'MESSENGER',
  name: 'Chamber Messenger',
  role: 'Inter-Bench Courier & Packet Validator',
  description: 'Reliably coordinates and transports validated bench packets from Chairs A10, B10, C10, D10, and E10 to the AI Presiding Reviewer without inventing or altering findings.'
};

export const PRESIDING_REVIEWER: ChamberOfficial = {
  id: 'PRESIDING_REVIEWER',
  name: 'AI Presiding Reviewer',
  role: 'Tribunal Synthesizer & Case Summarizer',
  description: 'Synthesizes accepted bench packets into an understandable overview, highlighting key obligations, material concerns, questions for clarification, and legal caveats.'
};

