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

// --- ROTAS DA API (DADOS REAIS) ---
app.get('/api/pnl/summary', async (req, res) => {
    try {
        const balances = await binance.balance();
        const usdtBalance = balances.USDT ? parseFloat(balances.USDT.available) : 0;

        res.json({
            todayUsdt: 0, 
            balanceUsdt: usdtBalance,
            equityCurve: [
                { date: new Date().toISOString().split('T')[0], equity: usdtBalance, pnl: 0 }
            ]
        });
    } catch (error) {
        console.error('Erro na sincronia Binance:', error);
        res.status(500).json({ error: 'Falha ao sincronizar com a Binance' });
    }
});

// --- SERVIR O FRONTEND ---
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Motor CryptoBot Pro ativo e sincronizado na porta ${PORT}`);
});
