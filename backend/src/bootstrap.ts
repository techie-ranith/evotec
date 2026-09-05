import { connectDB } from './config/db';
import { seedAdmin } from './utils/seedAdmin';

let ready: Promise<void> | null = null;

/** Connect DB + seed admin once (cached across warm serverless invocations). */
export function ensureReady(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await connectDB();
      await seedAdmin();
    })().catch((error) => {
      ready = null;
      throw error;
    });
  }
  return ready;
}
