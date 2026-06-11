import { pool } from './pool.js';

const SQL = `
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  totp_secret   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  user_id              UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  binance_api_key      TEXT DEFAULT '',
  binance_api_secret   TEXT DEFAULT '',
  whale_alert_key      TEXT DEFAULT '',
  crypto_panic_key     TEXT DEFAULT '',
  telegram_token       TEXT DEFAULT '',
  telegram_chat_id     TEXT DEFAULT '',
  report_email         TEXT DEFAULT '',
  default_entry_usdt   NUMERIC DEFAULT 500,
  atr_stop_multiplier  NUMERIC DEFAULT 1.5,
  max_daily_loss_pct   NUMERIC DEFAULT 2,
  max_open_trades      INT DEFAULT 5,
  safety_orders_enabled BOOLEAN DEFAULT TRUE,
  dca_enabled          BOOLEAN DEFAULT FALSE,
  real_mode_enabled    BOOLEAN DEFAULT FALSE,
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bot_state (
  user_id      UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  running      BOOLEAN DEFAULT FALSE,
  mode         TEXT DEFAULT 'PAPER',
  started_at   TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS trades (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
  symbol              TEXT NOT NULL,
  side                TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'OPEN',
  mode                TEXT NOT NULL,
  execution_type      TEXT,
  entry_price         NUMERIC NOT NULL,
  current_price       NUMERIC,
  exit_price          NUMERIC,
  stop_price          NUMERIC NOT NULL,
  take_profit_price   NUMERIC NOT NULL,
  trailing_active     BOOLEAN DEFAULT FALSE,
  atr_at_entry        NUMERIC,
  quantity            NUMERIC NOT NULL,
  position_size_usdt  NUMERIC NOT NULL,
  profit_usdt         NUMERIC DEFAULT 0,
  profit_pct          NUMERIC DEFAULT 0,
  close_reason        TEXT,
  safety_orders_count INT DEFAULT 0,
  opened_at           TIMESTAMPTZ DEFAULT NOW(),
  closed_at           TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_trades_user_status ON trades(user_id, status);
CREATE INDEX IF NOT EXISTS idx_trades_user_closed ON trades(user_id, closed_at DESC);

CREATE TABLE IF NOT EXISTS equity_snapshots (
  id        BIGSERIAL PRIMARY KEY,
  user_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  date      DATE NOT NULL,
  equity    NUMERIC NOT NULL,
  pnl       NUMERIC NOT NULL,
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID,
  action     TEXT NOT NULL,
  payload    JSONB,
  ip         TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;

export async function runMigrations() {
  await pool.query('CREATE EXTENSION IF NOT EXISTS "citext"');
  await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
  await pool.query(SQL);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations().then(() => { console.log('migrations ok'); process.exit(0); })
    .catch((e) => { console.error(e); process.exit(1); });
}
