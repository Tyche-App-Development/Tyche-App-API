import prisma from '../ConfigDatabase/db.js';
import jwt from 'jsonwebtoken';
import { runBotForUser } from '../bot/btc_bot.js';

export const createUserStrategy = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Token not provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const { symbol, risk, amount } = req.body;

        if (!symbol || !risk || !amount) {
            return res.status(400).json({ message: 'Missing symbol, risk or amount' });
        }

        const coin = symbol.split('/')[0];

        const bot = await prisma.bot.findFirst({
            where: {
                strategyName: { contains: coin },
                strategyRisk: risk
            }
        });

        if (!bot) {
            return res.status(404).json({ message: `No bot found for ${coin} with ${risk} risk` });
        }

        const priceData = await prisma.priceData.findFirst({
            where: { id_symbol: symbol },
            orderBy: { timestamp: 'desc' }
        });

        if (!priceData) {
            return res.status(404).json({ message: `No price data found for ${symbol}` });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user || user.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        const strategy = await prisma.userStrategy.create({
            data: {
                id_user: userId,
                id_bot: bot.id,
                id_priceData: priceData.id,
                status: true,
                buy_price: priceData.price,
                initialBalance: amount,
                currentBalance: amount,
                inPosition: false,
                amountHeld: 0,
                lastAction: 'NONE'
            }
        });


        await prisma.user.update({
            where: { id: userId },
            data: {
                balance: {
                    decrement: amount
                }
            }
        });


        await runBotForUser(userId, risk);

        res.status(201).json({
            message: 'User strategy created, balance updated and bot started successfully',
            strategy
        });

    } catch (err) {
        console.error('Failed to create user strategy:', err.message);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};
