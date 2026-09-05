import 'dotenv/config';
import app from './app';
import { ensureReady } from './bootstrap';

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  await ensureReady();

  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
