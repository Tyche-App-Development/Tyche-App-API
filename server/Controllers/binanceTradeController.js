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

        const symbol = req.body.symbol || 'BTCUSDT';
        const quantity = req.body.quantity || '0.001';

        const checkSymbol = await client.exchangeInfo({ symbol });
        if (!checkSymbol || !checkSymbol.data.symbols.length) {
            return res.status(400).json({ message: `Par ${symbol} não é suportado na Binance Testnet` });
        }

        const buy = await client.newOrder(symbol, 'BUY', 'MARKET', { quantity });

        res.json({
            message: `Trade de compra executada com sucesso para ${symbol}`,
            buyOrder: buy.data
        });

    } catch (err) {
        console.error('Erro ao executar trade de compra:', err.response?.data || err.message);
        res.status(500).json({ message: 'Erro ao executar trade de compra na Binance', error: err.message });
    }
};
