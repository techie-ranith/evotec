import cors from 'cors';
import express from 'express';
import { ensureReady } from './bootstrap';
import { dbReadyState } from './config/db';
import authRoutes from './routes/auth.routes';
import formRoutes from './routes/form.routes';

const app = express();

const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://evotec-frontend.vercel.app',
];

function allowedOrigins(): Set<string> | true {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (raw === '*') {
    return true;
  }

  const fromEnv = raw
    ? raw.split(',').map((o) => o.trim()).filter(Boolean)
    : [];

  return new Set([...DEFAULT_ORIGINS, ...fromEnv]);
}

export const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    const allowed = allowedOrigins();
    if (!origin || allowed === true || allowed.has(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

/** Ensure Mongo is connected before any API route (required on Vercel). */
app.use(async (req, res, next) => {
  if (req.method === 'OPTIONS' || req.path === '/' || req.path === '/api/health') {
    next();
    return;
  }

  try {
    await ensureReady();
    next();
  } catch (error) {
    console.error('DB init failed:', error);
    res.status(503).json({
      message:
        'Database unavailable. Check MONGODB_URI and Atlas Network Access (allow 0.0.0.0/0 for Vercel).',
    });
  }
});

app.get('/', (_req, res) => {
  res.json({
    name: 'Evotec API',
    ok: true,
    health: '/api/health',
    docs: 'See README for auth and form endpoints',
  });
});

app.get('/api/health', async (_req, res) => {
  let db = dbReadyState();
  try {
    await ensureReady();
    db = dbReadyState();
  } catch (error) {
    res.status(503).json({
      ok: false,
      db,
      env: process.env.VERCEL ? 'vercel' : 'local',
      message:
        error instanceof Error ? error.message : 'Database connection failed',
    });
    return;
  }

  res.json({
    ok: true,
    db,
    env: process.env.VERCEL ? 'vercel' : 'local',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;
