import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../lib/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/summary', async (req, res) => {
  const uid = req.user.sub;
  const { rows: curve } = await pool.query(
    `SELECT date::text AS date, equity::float AS equity, pnl::float AS pnl
       FROM equity_snapshots WHERE user_id=$1 ORDER BY date ASC LIMIT 90`,
    [uid]
  );

  const agg = async (interval) => {
    const { rows } = await pool.query(
      `SELECT COALESCE(SUM(profit_usdt),0)::float AS s
         FROM trades WHERE user_id=$1 AND status='CLOSED' AND closed_at >= NOW() - $2::interval`,
      [uid, interval]
    );
    return rows[0].s;
  };

  const today = await agg('1 day');
  const week = await agg('7 days');
  const month = await agg('30 days');
  const balance = curve.at(-1)?.equity ?? 0;

  const pct = (v) => (balance > 0 ? (v / balance) * 100 : 0);

  res.json({
    balanceUsdt: balance,
    todayUsdt: today, todayPct: pct(today),
    weekUsdt: week, weekPct: pct(week),
    monthUsdt: month, monthPct: pct(month),
    equityCurve: curve,
  });
});

export default router;
