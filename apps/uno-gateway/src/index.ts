import dotenv from 'dotenv';
import { createGateway } from './gateway.js';

dotenv.config();

const port = process.env.UNO_GATEWAY_PORT ? parseInt(process.env.UNO_GATEWAY_PORT, 10) : 5000;
const app = createGateway();

app.listen(port, () => {
  console.log(`[DHARMARAKSHA-Gateway] UNO Q Gateway active on port ${port}`);
});

