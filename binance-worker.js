import 'dotenv/config';
import Binance from 'node-binance-api';
import { Telegraf } from 'telegraf';

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

const binance = new Binance().options({
  APIKEY: process.env.BINANCE_API_KEY,
  APISECRET: process.env.BINANCE_API_SECRET,
  useServerTime: true
});

const bot = botToken ? new Telegraf(botToken) : null;

async function checkBalance() {
  try {
    const info = await binance.accountInfo();
    console.log("=== SISTEMA OK ===");
    
    // Procura saldo USDT real na conta
    const usdtBalance = info.balances.find(b => b.asset === 'USDT');
    const saldoDisponivel = usdtBalance ? parseFloat(usdtBalance.free) : 0;
    
    console.log(`Saldo USDT disponível: ${saldoDisponivel}`);
    
    if (bot && chatId) {
      await bot.telegram.sendMessage(chatId, `🤖 *CryptoBot Pro Ativo!*\n\nConexão com a Binance estabelecida com sucesso.\nSaldo Atual: *$${saldoDisponivel.toFixed(2)} USDT*`, { parse_mode: 'Markdown' });
    }
  } catch (error) {
    console.error("Erro na checagem:", error.message);
  }
}

// Executa assim que o container liga
checkBalance();
