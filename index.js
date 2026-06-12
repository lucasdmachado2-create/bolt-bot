import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Binance from 'node-binance-api';
import { Telegraf } from 'telegraf';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

// Configuração Binance
const binance = new Binance().options({
  APIKEY: process.env.BINANCE_API_KEY,
  APISECRET: process.env.BINANCE_API_SECRET,
  useServerTime: true
});

// Configuração Telegram
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

app.use(express.json());

// --- FUNÇÃO DE ALERTA TELEGRAM ---
async function enviarAlertaTelegram(mensagem) {
    try {
        await bot.telegram.sendMessage(process.env.TELEGRAM_CHAT_ID, `🤖 [CryptoBot Pro]: ${mensagem}`);
    } catch (e) {
        console.error("Erro ao enviar Telegram:", e);
    }
}

// --- ROTAS DA API ---

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
        res.status(500).json({ error: 'Falha na Binance' });
    }
});

app.get('/api/bot/status', (req, res) => {
    res.json({ status: 'online', marketMode: 'BULL', uptimeHours: 73.0 });
});

// Rota de teste para ver se o Telegram está a funcionar
app.post('/api/test-telegram', async (req, res) => {
    await enviarAlertaTelegram("Teste de conexão institucional bem-sucedido!");
    res.json({ success: true });
});

// --- SERVIR FRONTEND ---
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 CryptoBot Pro rodando em ${PORT}`);
    enviarAlertaTelegram("Bot iniciado com sucesso!");
});
