import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import { createClient } from 'redis';

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 8080;

// ==========================================
// A MÁGICA DO CORS
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
        console.error('❌ Erro fatal na inicialização:', error);
    }
}

// ==========================================
// ROTAS DA API: O MAPA EXATO DA VERCEL
// ==========================================

// Rota de Status e Métricas
app.get('/api/bot/status', async (req, res) => {
    res.json({
        status: 'online',
        marketMode: 'BULL', // Pede texto: 'BULL', 'BEAR' ou 'NEUTRAL'
        uptimeHours: 24.5, // O culpado 1! Precisava ser número.
        btcOpenInterest: 18500000000, // Culpado 2! Precisava ser número grande para dividir por 1e9
        btcFundingRate: 0.0015,
        ethOpenInterest: 8200000000,
        ethFundingRate: 0.0012,
        marketPulse: 75,
        fearGreed: 82
    });
});

// Rota de Saldo e PnL (Lucro)
app.get('/api/pnl/summary', async (req, res) => {
    res.json({
        todayUsdt: 12.50,
        todayPct: 0.25,
        weekUsdt: 45.20,
        weekPct: 0.90,
        monthUsdt: 120.00,
        monthPct: 2.40,
        balanceUsdt: 5000.00,
        equityCurve: [
            // Pacote à prova de balas: todos os nomes de variáveis possíveis para o gráfico
            { time: '01 Jun', date: '01 Jun', name: '01 Jun', value: 4880, balance: 4880, amount: 4880, pnl: 4880, usdt: 4880 },
            { time: '05 Jun', date: '05 Jun', name: '05 Jun', value: 4950, balance: 4950, amount: 4950, pnl: 4950, usdt: 4950 },
            { time: '10 Jun', date: '10 Jun', name: '10 Jun', value: 5000, balance: 5000, amount: 5000, pnl: 5000, usdt: 5000 }
        ]
    });
});

// Rota do botão Ligar/Desligar
app.post('/api/bot/toggle', async (req, res) => {
    const { active } = req.body;
    res.json({ success: true, message: `Bot ${active ? 'iniciado' : 'pausado'}` });
});

// Rota dos Trades Recentes
app.get('/api/trades/recent', async (req, res) => {
    res.json([]); // Enviamos vazio para a interface não tentar formatar o que não existe
});

startServer();
