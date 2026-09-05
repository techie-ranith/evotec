import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { IncomingMessage, ServerResponse } from 'http';
import app from '../src/app';
import { ensureReady } from '../src/bootstrap';

function applyCors(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;
  const allowed = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://evotec-frontend.vercel.app',
    ...(process.env.CORS_ORIGIN || '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  ];

  if (origin && (process.env.CORS_ORIGIN?.trim() === '*' || allowed.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,PATCH,DELETE,OPTIONS'
    );
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

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
