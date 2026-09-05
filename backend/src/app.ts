import cors from 'cors';
import express from 'express';
import authRoutes from './routes/auth.routes';
import formRoutes from './routes/form.routes';

const app = express();

function corsOrigins(): string[] | boolean {
  const raw = process.env.CORS_ORIGIN;
  if (!raw || raw.trim() === '*') {
    return true;
  }
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

app.use(
  cors({
    origin: corsOrigins(),
    credentials: true,
  })
);
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    name: 'Evotec API',
    ok: true,
    health: '/api/health',
    docs: 'See README for auth and form endpoints',
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, env: process.env.VERCEL ? 'vercel' : 'local' });
});

app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;
