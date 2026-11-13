import dotenv from 'dotenv';
export * from './orchestrator.js';
export * from './routing/routing-planner.js';
export * from './scheduling/task-claim-store.js';
export * from './execution/specialist-executor.js';
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

