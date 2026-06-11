import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../lib/auth.js';

const router = Router();
const started = Date.now();

router.use(requireAuth);

router.get('/status', async (req, res) => {
  const { rows } = await pool.query('SELECT running, mode, started_at FROM bot_state WHERE user_id=$1', [req.user.sub]);
  const s = rows[0] || { running: false, mode: 'PAPER' };
  res.json({
    running: s.running,
    mode: s.mode,
    marketMode: 'BULL',
    marketPulse: 64,
    fearGreed: 58,
    binanceConnected: true,
    apiLatencyMs: 47,
    uptimeHours: (Date.now() - started) / 3_600_000,
    btcOpenInterest: 12_840_000_000,
    btcFundingRate: 0.0089,
    ethOpenInterest: 7_210_000_000,
    ethFundingRate: 0.0112,
  });
});

router.post('/toggle', async (req, res) => {
  const { running } = req.body;
  await pool.query(
    `INSERT INTO bot_state (user_id, running, started_at)
     VALUES ($1,$2,NOW())
     ON CONFLICT (user_id) DO UPDATE SET running=$2, started_at=CASE WHEN $2 THEN NOW() ELSE bot_state.started_at END`,
    [req.user.sub, !!running]
  );
  await pool.query('INSERT INTO audit_logs (user_id, action, payload, ip) VALUES ($1,$2,$3,$4)',
    [req.user.sub, 'bot.toggle', { running: !!running }, req.ip]);
  res.redirect(307, '/api/bot/status');
});

router.post('/mode', async (req, res) => {
  const { mode } = req.body;
  if (!['PAPER', 'REAL'].includes(mode)) return res.status(400).json({ error: 'invalid_mode' });
  await pool.query(
    `INSERT INTO bot_state (user_id, mode) VALUES ($1,$2)
     ON CONFLICT (user_id) DO UPDATE SET mode=$2`,
    [req.user.sub, mode]
  );
  await pool.query('INSERT INTO audit_logs (user_id, action, payload, ip) VALUES ($1,$2,$3,$4)',
    [req.user.sub, 'bot.mode', { mode }, req.ip]);
  res.redirect(307, '/api/bot/status');
});

export default router;
