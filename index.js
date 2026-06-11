import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Binance from 'node-binance-api';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

// Configuração Profissional da Binance
const binance = new Binance().options({
  APIKEY: process.env.BINANCE_API_KEY,
  APISECRET: process.env.BINANCE_API_SECRET,
  useServerTime: true
});

app.use(express.json());

// --- ROTAS DA API ---

// 1. Status Geral
app.get('/api/bot/status', (req, res) => {
    res.json({
        status: 'online', marketMode: 'BULL', uptimeHours: 73.0,
        btcOpenInterest: 12840000000, btcFundingRate: 0.0089,
        ethOpenInterest: 7210000000, ethFundingRate: 0.0112,
        marketPulse: 64, fearGreed: 58
    });
});

// 2. Resumo Financeiro (PnL) e Equity Curve (Sincronizado)
app.get('/api/pnl/summary', async (req, res) => {
    try {
        const balances = await binance.balance();
        const usdtBalance = balances.USDT ? parseFloat(balances.USDT.available) : 5000.00;

        res.json({
            todayUsdt: 142.38, todayPct: 1.21,
            weekUsdt: 487.10, weekPct: 4.32,
            monthUsdt: 1812.55, monthPct: 18.10,
            balanceUsdt: usdtBalance,
            equityCurve: [
                { date: '2026-06-09', equity: 4880, pnl: 50 },
                { date: '2026-06-10', equity: 4950, pnl: 70 },
                { date: '2026-06-11', equity: usdtBalance, pnl: 142.38 }
            ]
        });
    } catch (error) {
        res.status(500).json({ error: 'Falha ao buscar saldo' });
    }
});

// 3. Trades Recentes (Formatados para o TradeRow)
app.get('/api/trades/recent', (req, res) => {
    res.json([
        {
            id: '1', symbol: 'SOL/USDT', executionType: 'LIMIT',
            entryPrice: 178.42, exitPrice: 181.05, profitUsdt: 8.12,
            profitPct: 1.21, status: 'CLOSED', timestamp: new Date().toISOString()
        },
        {
            id: '2', symbol: 'AR/USDT', executionType: 'LIMIT',
            entryPrice: 41.20, exitPrice: 40.86, profitUsdt: -7.45,
            profitPct: -1.49, status: 'CLOSED', timestamp: new Date().toISOString()
        }
    ]);
});

// --- SERVIR FRONTEND ---
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Motor CryptoBot Pro Institucional rodando na porta ${PORT}`));
