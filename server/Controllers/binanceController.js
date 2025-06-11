import { decrypt } from '../utils/cryptoUtils.js';
import prisma from '../ConfigDatabase/db.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { Spot } from '@binance/connector';

const SPOT_REST_API_TESTNET_URL = 'https://testnet.binance.vision';
const ALLOWED_ASSETS = ['XRP', 'BTC', 'SOL', 'BNB', 'ETH'];

export const getBinanceBalance = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Token not provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const cachedBalance = user.balance;

        res.json({
            message: 'Balance from DB',
            balanceUSD: cachedBalance,
            assets: user.balanceDetails || []
        });

        setImmediate(async () => {
            try {
                const apiKey = decrypt(user.apiKey);
                const apiSecret = decrypt(user.apiSecret);
                const client = new Spot(apiKey, apiSecret, { baseURL: SPOT_REST_API_TESTNET_URL });
                const result = await client.account();
                const balances = result.data.balances;

                let totalBalanceUSD = 0;
                const detailedBalances = [];

                for (const asset of balances) {
                    if (!ALLOWED_ASSETS.includes(asset.asset)) continue;

                    const free = parseFloat(asset.free);
                    const locked = parseFloat(asset.locked);
                    const total = free + locked;

                    if (total <= 0) continue;

                    const pair = `${asset.asset}USDT`;

                    try {
                        const response = await axios.get(`https://testnet.binance.vision/api/v3/ticker/price?symbol=${pair}`);
                        const priceUSD = parseFloat(response.data.price);
                        const valueUSD = total * priceUSD;
                        totalBalanceUSD += valueUSD;

                        detailedBalances.push({
                            asset: asset.asset,
                            amount: total,
                            priceUSD: parseFloat(priceUSD.toFixed(4)),
                            valueUSD: parseFloat(valueUSD.toFixed(2))
                        });

                    } catch (err) {
                        console.warn(`Error fetching price for ${pair}:`, err.message);
                    }
                }

                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        balance: totalBalanceUSD,
                        balanceDetails: detailedBalances
                    }
                });

                console.log(`Updated balance for ${user.id}: $${totalBalanceUSD.toFixed(2)}`);
                console.table(detailedBalances);

            } catch (e) {
                console.error('Failed to update balance in background:', e.message);
            }
        });

    } catch (err) {
        console.error('Error retrieving Binance balance:', err);
        res.status(500).json({ message: 'Error retrieving Binance balance', error: err.message });
    }
};

export const getBinanceProfitPNL = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Token not provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            message: 'PNL from DB',
            pnl: user.pnlDetails || [],
            profit: user.profit,
            pnlPercent: user.pnl
        });


        setImmediate(async () => {
            try {
                const apiKey = decrypt(user.apiKey);
                const apiSecret = decrypt(user.apiSecret);
                const client = new Spot(apiKey, apiSecret, { baseURL: SPOT_REST_API_TESTNET_URL });

                const balanceRes = await axios.get('http://localhost:3001/api/auth/balance', {
                    headers: { Authorization: req.headers.authorization }
                });

                const { assets } = balanceRes.data;
                let totalProfit = 0;
                let totalEffectiveCost = 0;

                for (const asset of assets) {
                    const symbol = asset.asset + 'USDT';
                    let allTrades = [];
                    let fromId = null;
                    let hasMore = true;

                    try {
                        await client.exchangeInfo({ symbol });

                        while (hasMore) {
                            const params = { symbol, limit: 500 };
                            if (fromId) params.fromId = fromId;

                            const tradeRes = await client.myTrades(symbol, params);
                            const trades = tradeRes.data;
                            allTrades = allTrades.concat(trades);

                            if (trades.length < 500) {
                                hasMore = false;
                            } else {
                                fromId = trades[trades.length - 1].id + 1;
                            }
                        }
                    } catch (err) {
                        console.warn(`Failed to fetch trades for ${symbol}:`, err?.response?.data || err.message);
                        continue;
                    }

                    let totalBought = 0;
                    let costBought = 0;
                    let totalSold = 0;

                    for (const trade of allTrades) {
                        const qty = parseFloat(trade.qty);
                        const price = parseFloat(trade.price);
                        const commission = (trade.commissionAsset === 'USDT') ? parseFloat(trade.commission) : 0;

                        if (trade.isBuyer) {
                            totalBought += qty;
                            costBought += qty * price + commission;
                        } else {
                            totalSold += qty;
                        }
                    }

                    const amountStillHeld = totalBought - totalSold;
                    if (amountStillHeld <= 0) continue;

                    const currentAmount = parseFloat(asset.amount);
                    const averageBuyPrice = costBought / totalBought;
                    const effectiveCost = averageBuyPrice * amountStillHeld;
                    const currentPrice = parseFloat(asset.priceUSD);
                    if (isNaN(currentPrice)) {
                        console.warn(`Invalid current price for asset ${asset.asset}: ${asset.priceUSD}`);
                        continue;
                    }

                    const profit = (currentPrice - averageBuyPrice) * currentAmount;
                    totalProfit += profit;
                    totalEffectiveCost += effectiveCost;
                }

                const globalPNLPercent = totalEffectiveCost > 0
                    ? (totalProfit / totalEffectiveCost) * 100
                    : 0;

                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        profit: parseFloat(totalProfit.toFixed(2)),
                        pnl: parseFloat(globalPNLPercent.toFixed(2))
                    }
                });

                console.log(`Updated PNL for ${user.id}: profit = $${totalProfit.toFixed(2)}, pnl = ${globalPNLPercent.toFixed(2)}%`);
            } catch (err) {
                console.error('Failed to update PNL in background:', err.message);
            }
        });

    } catch (err) {
        console.error('Error retrieving PNL:', err);
        res.status(500).json({ message: 'Error retrieving PNL', error: err.message });
    }
};


export const getBinanceTradeHistory = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Token not provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const allUserTrades = await prisma.historyTrade.findMany({
            where: { id_user: user.id },
            orderBy: { timestamp: 'desc' }
        });

        res.json({
            message: 'Trades from DB',
            trades: allUserTrades
        });

        setImmediate(async () => {
            const apiKey = decrypt(user.apiKey);
            const apiSecret = decrypt(user.apiSecret);
            const client = new Spot(apiKey, apiSecret, { baseURL: SPOT_REST_API_TESTNET_URL });

            for (const symbol of ['BTCUSDT', 'ETHUSDT', 'XRPUSDT', 'SOLUSDT', 'BNBUSDT']) {
                try {
                    const tradesRes = await client.myTrades(symbol);
                    const trades = tradesRes.data;
                    if (!trades || trades.length === 0) continue;

                    const currentPriceRes = await client.tickerPrice(symbol);
                    const currentPrice = parseFloat(currentPriceRes.data.price);

                    for (const trade of trades) {
                        const exists = await prisma.historyTrade.findUnique({
                            where: { tradeId: trade.id }
                        });
                        if (exists) continue;

                        const qty = parseFloat(trade.qty);
                        const price = parseFloat(trade.price);
                        const quoteQty = parseFloat(trade.quoteQty);
                        const isBuyer = trade.isBuyer;
                        const gainLoss = (currentPrice - price) * qty * (isBuyer ? 1 : -1);

                        await prisma.historyTrade.create({
                            data: {
                                tradeId: trade.id,
                                id_user: user.id,
                                symbol,
                                price,
                                amount: qty,
                                quoteQuantity: quoteQty,
                                gain_loss: parseFloat(gainLoss.toFixed(4)),
                                isBuyer,
                                timestamp: new Date(trade.time)
                            }
                        });
                    }
                } catch (err) {
                    console.warn(`Error syncing trades for ${symbol}:`, err.message);
                }
            }
        });

    } catch (err) {
        console.error('Error retrieving trade history:', err);
        res.status(500).json({ message: 'Error retrieving trade history', error: err.message });
    }
};


export const getUserUSDTBalanceEndpoint = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Token not provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const apiKey = decrypt(user.apiKey);
        const apiSecret = decrypt(user.apiSecret);
        const client = new Spot(apiKey, apiSecret, { baseURL: SPOT_REST_API_TESTNET_URL });

        const result = await client.account();
        const balances = result.data.balances;

        const usdtAsset = balances.find(asset => asset.asset === 'USDT');
        if (!usdtAsset) {
            return res.status(200).json({ message: 'USDT not found', usdt: null });
        }

        const free = parseFloat(usdtAsset.free);
        const locked = parseFloat(usdtAsset.locked);
        const total = free + locked;

        if (total <= 0) {
            return res.status(200).json({ message: 'No USDT balance', usdt: null });
        }

        const priceUSD = 1;
        const valueUSD = total * priceUSD;

        const usdt = {
            asset: 'USDT',
            amount: total,
            priceUSD: priceUSD,
            valueUSD: parseFloat(valueUSD.toFixed(2))
        };

        res.status(200).json({
            message: 'USDT balance found',
            usdt
        });

    } catch (err) {
        console.error('Erro ao obter saldo de USDT:', err);
        res.status(500).json({ message: 'Erro interno ao obter saldo de USDT', error: err.message });
    }
};




