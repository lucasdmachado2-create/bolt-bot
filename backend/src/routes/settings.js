import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { requireAuth } from '../lib/auth.js';

const router = Router();
router.use(requireAuth);

const schema = z.object({
  binanceApiKey: z.string().default(''),
  binanceApiSecret: z.string().default(''),
  whaleAlertKey: z.string().default(''),
  cryptoPanicKey: z.string().default(''),
  telegramToken: z.string().default(''),
  telegramChatId: z.string().default(''),
  reportEmail: z.string().default(''),
  defaultEntryUsdt: z.number().positive(),
  atrStopMultiplier: z.number().positive(),
  maxDailyLossPct: z.number().positive(),
  maxOpenTrades: z.number().int().positive(),
  safetyOrdersEnabled: z.boolean(),
  dcaEnabled: z.boolean(),
  realModeEnabled: z.boolean(),
});

const mapRow = (r) => ({
  binanceApiKey: r.binance_api_key,
  binanceApiSecret: r.binance_api_secret ? '••••••••' : '',
  whaleAlertKey: r.whale_alert_key,
  cryptoPanicKey: r.crypto_panic_key,
  telegramToken: r.telegram_token,
  telegramChatId: r.telegram_chat_id,
  reportEmail: r.report_email,
  defaultEntryUsdt: +r.default_entry_usdt,
  atrStopMultiplier: +r.atr_stop_multiplier,
  maxDailyLossPct: +r.max_daily_loss_pct,
  maxOpenTrades: r.max_open_trades,
  safetyOrdersEnabled: r.safety_orders_enabled,
  dcaEnabled: r.dca_enabled,
  realModeEnabled: r.real_mode_enabled,
});

router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM settings WHERE user_id=$1', [req.user.sub]);
  if (!rows[0]) {
    await pool.query('INSERT INTO settings (user_id) VALUES ($1)', [req.user.sub]);
    const r2 = await pool.query('SELECT * FROM settings WHERE user_id=$1', [req.user.sub]);
    return res.json(mapRow(r2.rows[0]));
  }
  res.json(mapRow(rows[0]));
});

router.put('/', async (req, res, next) => {
  try {
    const s = schema.parse(req.body);
    await pool.query(
      `UPDATE settings SET
         binance_api_key=$2,
         binance_api_secret=CASE WHEN $3='' OR $3='••••••••' THEN binance_api_secret ELSE $3 END,
         whale_alert_key=$4, crypto_panic_key=$5, telegram_token=$6, telegram_chat_id=$7,
         report_email=$8, default_entry_usdt=$9, atr_stop_multiplier=$10,
         max_daily_loss_pct=$11, max_open_trades=$12, safety_orders_enabled=$13,
         dca_enabled=$14, real_mode_enabled=$15, updated_at=NOW()
       WHERE user_id=$1`,
      [req.user.sub, s.binanceApiKey, s.binanceApiSecret, s.whaleAlertKey, s.cryptoPanicKey,
       s.telegramToken, s.telegramChatId, s.reportEmail, s.defaultEntryUsdt, s.atrStopMultiplier,
       s.maxDailyLossPct, s.maxOpenTrades, s.safetyOrdersEnabled, s.dcaEnabled, s.realModeEnabled]
    );
    await pool.query('INSERT INTO audit_logs (user_id, action, payload, ip) VALUES ($1,$2,$3,$4)',
      [req.user.sub, 'settings.update', { realModeEnabled: s.realModeEnabled }, req.ip]);
    const { rows } = await pool.query('SELECT * FROM settings WHERE user_id=$1', [req.user.sub]);
    res.json(mapRow(rows[0]));
  } catch (e) { next(e); }
});

router.post('/telegram/test', async (req, res) => {
  const { rows } = await pool.query('SELECT telegram_token, telegram_chat_id FROM settings WHERE user_id=$1', [req.user.sub]);
  const s = rows[0];
  if (!s?.telegram_token || !s?.telegram_chat_id) return res.status(400).json({ ok: false, error: 'missing_credentials' });
  try {
    const r = await fetch(`https://api.telegram.org/bot${s.telegram_token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: s.telegram_chat_id, text: '✅ CryptoBot Pro — teste de Telegram OK' }),
    });
    res.json({ ok: r.ok });
  } catch (e) {
    res.status(502).json({ ok: false, error: e.message });
  }
});

export default router;
