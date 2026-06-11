import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import { createClient } from 'redis';

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 8080;

// ==========================================
// CORS (Apenas a Vercel passa pelo porteiro)
// ==========================================
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || origin.includes('vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Bloqueado pelo CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

// ==========================================
// BANCOS DE DADOS
// ==========================================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.error('Erro no Redis:', err));

async function startServer() {
    try {
        await redisClient.connect();
        console.log('✅ Conectado ao Redis');
        
        await pool.query('SELECT NOW()');
        console.log('✅ Conectado ao PostgreSQL');
        
        app.listen(PORT, () => {
            console.log(`🚀 Motor CryptoBot Pro rodando na porta ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Erro fatal:', error);
    }
}

// ==========================================
// ROTAS DA API: O CONTRATO EXATO COM A VERCEL
// ==========================================

// 1. Status Geral e Métricas de Mercado
app.get('/api/bot/status', async (req, res) => {
    res.json({
        status: 'online',
        marketMode: 'BULL',
        uptimeHours: 24.5,
        btcOpenInterest: 18500000000,
        btcFundingRate: 0.0015,
        ethOpenInterest: 8200000000,
        ethFundingRate: 0.0012,
        marketPulse: 75,
        fearGreed: 82
    });
});

// 2. Resumo Financeiro (PnL) e Gráfico de Equity
app.get('/api/pnl/summary', async (req, res) => {
    res.json({
        todayUsdt: 12.50, todayPct: 0.25,
        weekUsdt: 45.20, weekPct: 0.90,
        monthUsdt: 120.00, monthPct: 2.40,
        balanceUsdt: 5000.00,
        equityCurve: [
            // As palavras exatas exigidas pelo EquityChart.tsx
            { date: '2026-06-09', equity: 4880, pnl: 50 },
            { date: '2026-06-10', equity: 4950, pnl: 70 },
            { date: '2026-06-11', equity: 5000, pnl: 50 }
        ]
    });
});

// 3. Configurações (Evita o erro 404)
app.get('/api/settings', async (req, res) => {
    res.json({
        binanceApiKey: '',
        binanceSecret: '',
        telegramToken: '',
        whaleAlertKey: '',
        cryptopanicKey: ''
    });
});

app.post('/api/settings', async (req, res) => {
    res.json({ success: true, message: 'Configurações salvas' });
});

// 4. Ligar/Desligar Bot
app.post('/api/bot/toggle', async (req, res) => {
    const { active } = req.body;
    res.json({ success: true, message: `Bot ${active ? 'iniciado' : 'pausado'}` });
});

// 5. Trades Recentes (Nomes exatos exigidos pelo TradeRow.tsx)
app.get('/api/trades/recent', async (req, res) => {
    res.json([
        {
            id: '1',
            symbol: 'BTC/USDT',
            executionType: 'MARKET',
            entryPrice: 65000.00,
            currentPrice: 66000.00,
            exitPrice: 66000.00,
            profitUsdt: 15.50,
            profitPct: 1.54,
            status: 'CLOSED',
            timestamp: new Date().toISOString()
        },
        {
            id: '2',
            symbol: 'ETH/USDT',
            executionType: 'LIMIT',
            entryPrice: 3500.00,
            currentPrice: 3480.00,
            exitPrice: 3480.00,
            profitUsdt: -20.00,
            profitPct: -0.57,
            status: 'CLOSED',
            timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hora atrás
        }
    ]);
});

startServer();
