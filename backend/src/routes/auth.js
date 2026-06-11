import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { signAccess, signRefresh, verifyRefresh } from '../lib/auth.js';

const router = Router();
const ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

const credSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = credSchema.parse(req.body);
    const hash = await bcrypt.hash(password, ROUNDS);
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1,$2) RETURNING id, email',
      [email, hash]
    );
    const user = rows[0];
    await pool.query('INSERT INTO settings (user_id) VALUES ($1)', [user.id]);
    await pool.query('INSERT INTO bot_state (user_id) VALUES ($1)', [user.id]);
    const access = signAccess({ sub: user.id, email: user.email });
    const refresh = signRefresh({ sub: user.id });
    res.json({ user, access, refresh });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'email_in_use' });
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = credSchema.parse(req.body);
    const { rows } = await pool.query('SELECT id, email, password_hash FROM users WHERE email=$1', [email]);
    const u = rows[0];
    if (!u || !(await bcrypt.compare(password, u.password_hash))) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }
    const access = signAccess({ sub: u.id, email: u.email });
    const refresh = signRefresh({ sub: u.id });
    res.json({ user: { id: u.id, email: u.email }, access, refresh });
  } catch (e) { next(e); }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refresh } = req.body;
    const payload = verifyRefresh(refresh);
    const access = signAccess({ sub: payload.sub });
    res.json({ access });
  } catch {
    res.status(401).json({ error: 'invalid_refresh' });
  }
});

export default router;
