import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../lib/auth.js';

const router = Router();
router.use(requireAuth);

const mapRow = (r) => ({
  id: r.id,
  symbol: r.symbol,
  side: r.side,
  status: r.status,
  mode: r.mode,
  executionType: r.execution_type,
  entryPrice: +r.entry_price,
  currentPrice: r.current_price != null ? +r.current_price : undefined,
  exitPrice: r.exit_price != null ? +r.exit_price : undefined,
  stopPrice: +r.stop_price,
  takeProfitPrice: +r.take_profit_price,
  trailingActive: r.trailing_active,
  atrAtEntry: r.atr_at_entry != null ? +r.atr_at_entry : 0,
  quantity: +r.quantity,
  positionSizeUsdt: +r.position_size_usdt,
  profitUsdt: +r.profit_usdt,
  profitPct: +r.profit_pct,
  closeReason: r.close_reason ?? undefined,
  safetyOrdersCount: r.safety_orders_count,
  openedAt: r.opened_at,
  closedAt: r.closed_at ?? undefined,
});

router.get('/open', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM trades WHERE user_id=$1 AND status='OPEN' ORDER BY opened_at DESC`,
    [req.user.sub]
  );
  res.json(rows.map(mapRow));
});

router.get('/recent', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 200);
  const { rows } = await pool.query(
    `SELECT * FROM trades WHERE user_id=$1 AND status='CLOSED'
       ORDER BY closed_at DESC NULLS LAST LIMIT $2`,
    [req.user.sub, limit]
  );
  res.json(rows.map(mapRow));
});

router.post('/:id/close', async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE trades SET status='CLOSED', close_reason='MANUAL', closed_at=NOW(),
            exit_price=COALESCE(current_price, entry_price)
       WHERE id=$1 AND user_id=$2 AND status='OPEN' RETURNING *`,
    [req.params.id, req.user.sub]
  );
  if (!rows[0]) return res.status(404).json({ error: 'not_found' });
  await pool.query('INSERT INTO audit_logs (user_id, action, payload, ip) VALUES ($1,$2,$3,$4)',
    [req.user.sub, 'trade.close_manual', { id: req.params.id }, req.ip]);
  res.json(mapRow(rows[0]));
});

export default router;
