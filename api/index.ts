import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { IncomingMessage, ServerResponse } from 'http';
import app from '../backend/src/app';
import { ensureReady } from '../backend/src/bootstrap';

/**
 * Vercel serverless entry — same Express + Mongoose stack as local `backend`.
 * Frontend calls `/api/*` on the same origin; vercel.json rewrites those here.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureReady();
  } catch (error) {
    console.error('Failed to initialize API:', error);
    res.status(503).json({
      message: 'Service unavailable — check MongoDB connection and env vars',
    });
    return;
  }

  app(req as unknown as IncomingMessage, res as unknown as ServerResponse);
}
