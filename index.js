import 'dotenv/config';
import express from 'express';
import Binance from 'node-binance-api';

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/api/test-binance', async (req, res) => {
    // 1. Verificar se as variáveis estão a chegar ao Node.js
    const key = process.env.BINANCE_API_KEY;
    const secret = process.env.BINANCE_API_SECRET;

    if (!key || !secret) {
        return res.json({ erro: "Variáveis de ambiente não encontradas pelo servidor" });
    }

    try {
        // 2. Inicialização explícita
        const binance = new Binance().options({
            APIKEY: key,
            APISECRET: secret,
            useServerTime: true,
            verbose: true // Isso vai imprimir logs no console do Railway
        });

        // 3. Teste de balance com timeout
        const balance = await binance.balance();
        res.json({ status: 'Sucesso', saldo: balance });
        
    } catch (e) {
        // Log detalhado do erro
        console.error("ERRO DETALHADO:", e);
        res.json({ erro: 'Falha na conexão: ' + (e.message || 'Erro desconhecido') });
    }
});

app.listen(PORT, () => console.log('Servidor rodando na porta ' + PORT));
