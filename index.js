import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import { createClient } from 'redis';

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 8080;

// ==========================================
// CORS (Vercel VIP)
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
// ROTAS DA API
// ==========================================

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

app.get('/api/pnl/summary', async (req, res) => {
    res.json({
        todayUsdt: 12.50, todayPct: 0.25,
        weekUsdt: 45.20, weekPct: 0.90,
        monthUsdt: 120.00, monthPct: 2.40,
        balanceUsdt: 5000.00,
        equityCurve: [
            { time: new Date(Date.now() - 86400000 * 2).toISOString(), value: 4880 },
            { time: new Date(Date.now() - 86400000 * 1).toISOString(), value: 4950 },
            { time: new Date().toISOString(), value: 5000 }
        ]
    });
});

// A ROTA QUE FALTAVA (Settings / Configurações)
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
    res.json({ success: true, message: 'Configurações salvas com sucesso' });
});

app.post('/api/bot/toggle', async (req, res) => {
    const { active } = req.body;
    res.json({ success: true, message: `Bot ${active ? 'iniciado' : 'pausado'}` });
});

app.get('/api/trades/recent', async (req, res) => {
    res.json([
        {
            id: '1',
            pair: 'BTC/USDT',
            type: 'BUY',
            side: 'BUY',
            price: 65000.00,
            amount: 0.1,
            profit: 15.50,
            status: 'CLOSED',
            // Data real para o toLocaleString não quebrar!
            timestamp: new Date().toISOString(),
            date: new Date().toISOString() 
        }
    ]);
});

startServer();
