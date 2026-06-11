import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// ROTA DA API: O seu cérebro de trading
app.get('/api/pnl/summary', (req, res) => {
    res.json({
        todayUsdt: 12.50, todayPct: 0.25,
        weekUsdt: 45.20, weekPct: 0.90,
        monthUsdt: 120.00, monthPct: 2.40,
        balanceUsdt: 5000.00,
        equityCurve: [
            { date: '2026-06-09', equity: 4880, pnl: 50 },
            { date: '2026-06-10', equity: 4950, pnl: 70 },
            { date: '2026-06-11', equity: 5000, pnl: 50 }
        ]
    });
});

// SERVIR O FRONTEND: O Railway passa a ser o seu servidor único
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 CryptoBot Pro Institucional rodando em http://localhost:${PORT}`);
});
