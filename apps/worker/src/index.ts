import dotenv from 'dotenv';
import { BackgroundOrchestrator } from './orchestrator.js';

dotenv.config();

console.log('[DHARMARAKSHA-Worker] Worker daemon starting up...');
const orchestrator = new BackgroundOrchestrator();
orchestrator.start();

process.on('SIGTERM', () => {
  orchestrator.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  orchestrator.stop();
  process.exit(0);
});

