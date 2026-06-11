import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import { createClient } from 'redis';

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 8080;

// ==========================================
// A MÁGICA DO CORS: Lista VIP Automática
// ==========================================
app.use(cors({
    origin: function (origin, callback) {
        // Aceita automaticamente qualquer link que venha da Vercel
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

// 1. Conexão com o PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 2. Conexão com o Redis
const redisClient = createClient({
    url: process.env.REDIS_URL
});
redisClient.on('error', (err) => console.error('Erro no Redis:', err));

// Conectar ao banco e cache na inicialização
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
// ROTAS DA API (Contrato com o Frontend)
// ==========================================

app.get('/api/bot/status', async (req, res) => {
    res.json({
        status: 'online',
        mode: 'PAPER TRADING', // Quando integrarmos a Binance, isso vai mudar dinamicamente
        latency: '45ms',
        uptime: process.uptime()
    });
});

app.get('/api/pnl/summary', async (req, res) => {
    res.json({
        today: 12.50,
        week: 45.20,
        month: 120.00,
        balance: 5000.00
    });
});

app.post('/api/bot/toggle', async (req, res) => {
    const { active } = req.body;
    console.log(`Bot alterado para: ${active ? 'LIGADO' : 'DESLIGADO'}`);
    res.json({ success: true, message: `Bot ${active ? 'iniciado' : 'pausado'} com sucesso.` });
});

app.get('/api/trades/recent', async (req, res) => {
    res.json([]);
});

startServer();
