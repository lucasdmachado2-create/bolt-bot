import 'dotenv/config';
import express from 'express';
import Binance from 'node-binance-api';

const app = express();
const PORT = process.env.PORT || 8080;

// Inicializa conexão com Binance
const binance = new Binance().options({
  APIKEY: process.env.BINANCE_API_KEY,
  APISECRET: process.env.BINANCE_API_SECRET,
  useServerTime: true
});

app.get('/', (req, res) => {
    res.send('CryptoBot Pro está online!');
});

// Rota de teste para validar a conexão com a Binance
app.get('/api/test-binance', async (req, res) => {
    try {
        const balance = await binance.balance();
        res.json({ 
            status: 'Conexão Sucesso', 
            saldo_usdt: balance.USDT ? balance.USDT.available : 'Saldo não encontrado' 
        });
    } catch (e) {
        res.status(500).json({ erro: 'Falha na conexão: ' + e.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
