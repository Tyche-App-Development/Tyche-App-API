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


export const getUserStrategyInfo = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Token not provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const userStrategies = await prisma.userStrategy.findMany({
            where: {
                id_user: user.id,
                status: true
            },
            include: {
                bot: true,
                priceData: true
            },
            orderBy: {
                updated_at: 'desc'
            }
        });

        if (userStrategies.length === 0) {
            return res.status(404).json({ message: 'Nenhuma estratégia encontrada' });
        }

        const strategiesData = userStrategies.map(userStrategy => {
            const pnlValue = userStrategy.currentBalance - userStrategy.initialBalance;
            const pnlPercentage = ((userStrategy.currentBalance - userStrategy.initialBalance) / userStrategy.initialBalance) * 100;

            return {
                id: userStrategy.id,
                botName: userStrategy.bot.strategyName,
                pnl: {
                    value: parseFloat(pnlValue.toFixed(2)),
                    percentage: parseFloat(pnlPercentage.toFixed(2))
                },
                balance: {
                    current: userStrategy.currentBalance,
                    initial: userStrategy.initialBalance,
                    held: userStrategy.amountHeld
                },
                trading: {
                    pair: `${userStrategy.priceData.id_symbol || 'BTC'}`,
                    currentPrice: userStrategy.priceData.price,
                    priceChange: userStrategy.priceData.changePercent || 0
                },
                position: {
                    inPosition: userStrategy.inPosition,
                    buyPrice: userStrategy.buy_price,
                    lastAction: userStrategy.lastAction
                },
                botConfig: {
                    risk: userStrategy.bot.strategyRisk,
                    description: userStrategy.bot.strategyDescription,
                    timeInterval: userStrategy.bot.timeInterval
                },
                createdAt: userStrategy.created_at,
                updatedAt: userStrategy.updated_at
            };
        });

        res.status(200).json({
            message: "Strategy data found",
            count: strategiesData.length,
            strategies: strategiesData
        });

        setImmediate(async () => {
            try {
                for (const userStrategy of userStrategies) {
                    const symbol = userStrategy.priceData.symbol || 'BTCUSDT';

                    try {
                        const priceResponse = await axios.get(
                            `https://testnet.binance.vision/api/v3/ticker/24hr?symbol=${symbol}`
                        );

                        const currentPrice = parseFloat(priceResponse.data.lastPrice);
                        const priceChangePercent = parseFloat(priceResponse.data.priceChangePercent);

                        await prisma.priceData.update({
                            where: { id: userStrategy.id_priceData },
                            data: {
                                price: currentPrice,
                                changePercent: priceChangePercent,
                                updated_at: new Date()
                            }
                        });

                        if (userStrategy.inPosition && userStrategy.amountHeld > 0) {
                            const newCurrentBalance = userStrategy.initialBalance +
                                (currentPrice - userStrategy.buy_price) * userStrategy.amountHeld;

                            await prisma.userStrategy.update({
                                where: { id: userStrategy.id },
                                data: {
                                    currentBalance: newCurrentBalance,
                                    updated_at: new Date()
                                }
                            });
                        }

                        console.log(`Updated strategy ${userStrategy.id}: ${symbol} = $${currentPrice}`);
                    } catch (priceError) {
                        console.error(`Failed to update price for strategy ${userStrategy.id}:`, priceError.message);
                    }
                }
            } catch (err) {
                console.error('Failed to update strategies in background:', err.message);
            }
        });

    } catch (err) {
        console.error('Error retrieving strategy info:', err);
        res.status(500).json({ message: 'Error retrieving strategy info', error: err.message });
    }
};