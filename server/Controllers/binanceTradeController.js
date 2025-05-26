import { Spot } from '@binance/connector';
import jwt from 'jsonwebtoken';
import { decrypt } from '../utils/cryptoUtils.js';
import prisma from '../ConfigDatabase/db.js';

export const executeTestTrade = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Token not provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const apiKey = decrypt(user.apiKey);
        const apiSecret = decrypt(user.apiSecret);
        const client = new Spot(apiKey, apiSecret, {
            baseURL: 'https://testnet.binance.vision',
        });

        const tradesToExecute = [
            { symbol: 'BTCUSDT', quantity: '0.001' },
            { symbol: 'XRPUSDT', quantity: '10' },
            { symbol: 'SOLUSDT', quantity: '0.2' },
            { symbol: 'BNBUSDT', quantity: '0.05' }
        ];

        const executedTrades = [];

        for (const trade of tradesToExecute) {
            try {
                const checkSymbol = await client.exchangeInfo({ symbol: trade.symbol });
                if (!checkSymbol || !checkSymbol.data.symbols.length) {
                    executedTrades.push({
                        symbol: trade.symbol,
                        success: false,
                        message: `Par ${trade.symbol} não é suportado.`
                    });
                    continue;
                }

                const order = await client.newOrder(trade.symbol, 'BUY', 'MARKET', { quantity: trade.quantity });

                executedTrades.push({
                    symbol: trade.symbol,
                    success: true,
                    message: `Trade executada com sucesso para ${trade.symbol}`,
                    data: order.data
                });

            } catch (tradeErr) {
                console.warn(`Erro ao executar trade para ${trade.symbol}:`, tradeErr.response?.data || tradeErr.message);
                executedTrades.push({
                    symbol: trade.symbol,
                    success: false,
                    message: `Erro ao executar trade para ${trade.symbol}`,
                    error: tradeErr.response?.data || tradeErr.message
                });
            }
        }

        res.json({
            message: 'Execução de múltiplas trades finalizada',
            results: executedTrades
        });

    } catch (err) {
        console.error('Erro ao executar trades:', err.message);
        res.status(500).json({ message: 'Erro ao executar trades na Binance', error: err.message });
    }
};
