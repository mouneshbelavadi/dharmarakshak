import dotenv from 'dotenv';
import { createApp } from './app.js';

dotenv.config();

const port = process.env.MAIN_API_PORT ? parseInt(process.env.MAIN_API_PORT, 10) : 4000;
const app = createApp();

app.listen(port, () => {
  console.log(`[DHARMARAKSHA-API] Server started on port ${port}`);
});

