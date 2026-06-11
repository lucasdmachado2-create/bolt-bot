import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { pool } from './db/pool.js';
import { redis } from './lib/redis.js';
import { runMigrations } from './db/migrate.js';

import authRoutes from './routes/auth.js';
import botRoutes from './routes/bot.js';
import pnlRoutes from './routes/pnl.js';
import tradesRoutes from './routes/trades.js';
import settingsRoutes from './routes/settings.js';

const app = express();
const PORT = process.env.PORT || 8080;
const FRONTEND_URL = process.env.FRONTEND_URL || '*';

app.set('trust proxy', 1);
app.use(helmet());
app.use(express.json({ limit: '256kb' }));
app.use(morgan('tiny'));

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (FRONTEND_URL === '*' || origin === FRONTEND_URL || origin.endsWith('.lovable.app')) {
        return cb(null, true);
      }
      return cb(new Error('CORS bloqueado'));
    },
    credentials: true,
  })
);

app.use(
  rateLimit({
    windowMs: 60_000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/health', (_req, res) => res.json({ ok: true, uptime: process.uptime() }));

app.use('/api/auth', authRoutes);
app.use('/api/bot', botRoutes);
app.use('/api/pnl', pnlRoutes);
app.use('/api/trades', tradesRoutes);
app.use('/api/settings', settingsRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'internal_error' });
});

async function boot() {
  try {
    await redis.connect();
    console.log('✅ Redis conectado');
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL conectado');
    await runMigrations();
    console.log('✅ Migrations aplicadas');
    app.listen(PORT, () => console.log(`🚀 CryptoBot Pro API na porta ${PORT}`));
  } catch (e) {
    console.error('❌ Falha no boot:', e);
    process.exit(1);
  }
}
boot();
