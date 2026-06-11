import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-insecure-secret';
const REFRESH = process.env.REFRESH_SECRET || 'dev-insecure-refresh';
const EXPIRES = process.env.JWT_EXPIRES_IN || '8h';

export function signAccess(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES });
}
export function signRefresh(payload) {
  return jwt.sign(payload, REFRESH, { expiresIn: '30d' });
}
export function verifyRefresh(token) {
  return jwt.verify(token, REFRESH);
}

export function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'invalid_token' });
  }
}
