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
                    priceUSD,
                    valueUSD
                });
            } catch (err) {
                console.warn(`Price not available for ${pair}:`, err?.message || err);
            }
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { balance: totalBalanceUSD }
        });

        res.json({
            message: 'Total balance in USD calculated successfully',
            balanceUSD: totalBalanceUSD,
            assets: detailedBalances
        });

    } catch (err) {
        console.error('Error calculating Binance balance:', err);
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

        const apiKey = decrypt(user.apiKey);
        const apiSecret = decrypt(user.apiSecret);
        const client = new Spot(apiKey, apiSecret, { baseURL: SPOT_REST_API_TESTNET_URL });

        const balanceRes = await axios.get('http://localhost:3001/api/auth/balance', {
            headers: { Authorization: req.headers.authorization }
        });

        const { assets } = balanceRes.data;
        const pnlData = [];


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
            const pnlPercent = ((currentPrice - averageBuyPrice) / averageBuyPrice) * 100;

            pnlData.push({
                asset: asset.asset,
                amount: asset.amount,
                currentPrice: parseFloat(currentPrice.toFixed(4)),
                totalBought: parseFloat(totalBought.toFixed(8)),
                totalSold: parseFloat(totalSold.toFixed(8)),
                averageBuyPrice: parseFloat(averageBuyPrice.toFixed(4)),
                effectiveCost: parseFloat(effectiveCost.toFixed(2)),
                currentValue: parseFloat((currentPrice * currentAmount).toFixed(2)),
                profit: parseFloat(profit.toFixed(2)),
                pnlPercent: parseFloat(pnlPercent.toFixed(2))
            });
        }

        console.log('Final PNL Data:', pnlData);

        res.json({
            message: 'Profit and PNL calculated successfully',
            pnl: pnlData
        });

    } catch (err) {
        console.error('Error calculating profit and PNL:', err);
        res.status(500).json({ message: 'Error calculating profit and PNL', error: err.message });
    }
};

export const getBinanceTradeHistory = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Token not provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const apiKey = decrypt(user.apiKey);
        const apiSecret = decrypt(user.apiSecret);
        const client = new Spot(apiKey, apiSecret, { baseURL: SPOT_REST_API_TESTNET_URL });

        const tradesRes = await client.myTrades();
        const trades = tradesRes.data;

        res.json({
            message: 'Trade history retrieved successfully',
            trades
        });

    } catch (err) {
        console.error('Error retrieving Binance trade history:', err);
        res.status(500).json({ message: 'Error retrieving trade history', error: err.message });
    }
};