# CryptoBot Pro — Backend

Backend Node.js + Express para o CryptoBot Pro. Roda em **Railway** com **PostgreSQL** + **Redis** e conecta na **Binance Spot API** (REST + WebSocket).

## Stack
- Node 20+ · Express 4
- PostgreSQL (Railway) · Redis (Railway)
- JWT auth + bcrypt + rate limiting + helmet
- Binance (`node-binance-api`)
- Zod para validação

## Setup local
```bash
cp .env.example .env
# edite o .env
npm install
npm run migrate
npm run dev
```

## Deploy no Railway
1. Crie um novo projeto no Railway e adicione plugins **PostgreSQL** e **Redis**.
2. Crie um serviço a partir deste repositório (`backend/`).
3. Em **Variables**, copie tudo do `.env.example` e preencha:
   - `DATABASE_URL` e `REDIS_URL` já vêm dos plugins (use as variáveis de referência do Railway).
   - `JWT_SECRET` e `REFRESH_SECRET`: gere com `openssl rand -hex 32`.
   - `FRONTEND_URL`: o domínio do app Lovable (ex.: `https://bolt-bot.lovable.app`).
   - Chaves Binance: **sem permissão de saque** + IP whitelist do egress do Railway.
4. **Start command**: `npm start` (já é o default).
5. As migrations rodam automaticamente no boot (`src/db/migrate.js`).

## Rotas
Todas as rotas (exceto `/auth/*` e `/health`) exigem `Authorization: Bearer <jwt>`.

| Método | Rota                       | Descrição                          |
|--------|----------------------------|------------------------------------|
| GET    | `/health`                  | Healthcheck                        |
| POST   | `/api/auth/register`       | Cadastro (email + senha)           |
| POST   | `/api/auth/login`          | Login (retorna JWT + refresh)      |
| POST   | `/api/auth/refresh`        | Renovar JWT                        |
| GET    | `/api/bot/status`          | Estado do bot, latência, modo      |
| POST   | `/api/bot/toggle`          | Ligar/desligar bot                 |
| POST   | `/api/bot/mode`            | Alternar PAPER / REAL              |
| GET    | `/api/pnl/summary`         | P&L hoje/semana/mês + equity curve |
| GET    | `/api/trades/open`         | Trades em aberto                   |
| GET    | `/api/trades/recent`       | Histórico recente (?limit=)        |
| POST   | `/api/trades/:id/close`    | Fechar trade manual                |
| GET    | `/api/settings`            | Configurações do usuário           |
| PUT    | `/api/settings`            | Salvar configurações               |
| POST   | `/api/settings/telegram/test` | Testar Telegram                 |

## Segurança
- Chaves Binance criptografadas em DB (AES-256-GCM) — TODO em `src/lib/crypto.js`.
- `helmet`, CORS restrito a `FRONTEND_URL`, rate limit 100 req/min/IP.
- Logs de auditoria em `audit_logs`.
- Binance: **JAMAIS habilite saque**. Habilite IP whitelist com o IP do Railway.
