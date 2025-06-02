import axios from 'axios';
import { SMA, RSI, MACD } from 'technicalindicators';
import prisma from '../ConfigDatabase/db.js';

const interval = '1h';
const limit = 100;

async function fetchRecentKlines(symbol = 'BTCUSDT', interval = '1h', limit = 100) {
    const url = 'https://api.binance.com/api/v3/klines';

    try {
        const response = await axios.get(url, {
            params: { symbol, interval, limit }
        });

        return response.data.map(k => ({
            openTime: new Date(k[0]),
            open: parseFloat(k[1]),
            high: parseFloat(k[2]),
            low: parseFloat(k[3]),
            close: parseFloat(k[4]),
            volume: parseFloat(k[5]),
        }));
    } catch (err) {
        console.error(`Error fetching klines:`, err.message);
        return [];
    }
}

export async function runBotForUser(userId, riskLevel = 'Low') {
    try {
        const userStrategy = await prisma.userStrategy.findFirst({
            where: {
                id_user: userId,
                status: true,
                bot: {
                    strategyRisk: riskLevel
                }
            },
            include: { bot: true }
        });

        if (!userStrategy || !userStrategy.bot) {
            console.error(`No strategy or bot found for user ${userId} with risk ${riskLevel}`);
            return;
        }

        const bot = userStrategy.bot;
        const symbol = bot.strategyName.split(' ')[0] + 'USDT';
        const klines = await fetchRecentKlines(symbol, interval, limit);
        const closes = klines.map(k => k.close);


        if (closes.length < Math.max(bot.defaultMaMid, bot.defaultRSIPeriod, bot.defaultMacdSlow)) {
            console.log(`Not enough data for indicators. Required: ${Math.max(bot.defaultMaMid, bot.defaultRSIPeriod, bot.defaultMacdSlow)} candles.`);
            return;
        }

        const maShort = SMA.calculate({ period: bot.defaultMaShort, values: closes });
        const maMedium = SMA.calculate({ period: bot.defaultMaMid, values: closes });
        const rsi = RSI.calculate({ period: bot.defaultRSIPeriod, values: closes });
        const macd = MACD.calculate({
            values: closes,
            fastPeriod: bot.defaultMacdFast,
            slowPeriod: bot.defaultMacdSlow,
            signalPeriod: bot.defaultMacdSignal,
            SimpleMAOscillator: false,
            SimpleMASignal: false
        });

        const lastClose = closes.at(-1);
        const maS = maShort.at(-1);
        const maM = maMedium.at(-1);
        const rsiLast = rsi.at(-1);
        const macdHist = macd.at(-1)?.histogram;

        console.log(`User ${userId} (${riskLevel}) | ${symbol} => Last Close: ${lastClose}, MA Short: ${maS}, MA Medium: ${maM}, RSI: ${rsiLast}, MACD Histogram: ${macdHist}`);
        if ([maS, maM, rsiLast, macdHist].some(val => val === undefined || isNaN(val))) {
            console.log(`Indicator values incomplete. Skipping.`);
            return;
        }

        let action = 'HOLD';

        if (!userStrategy.inPosition && maS > maM && macdHist > 0 && rsiLast < 50) {
            const amountToBuy = userStrategy.currentBalance / lastClose;

            await prisma.userStrategy.update({
                where: { id: userStrategy.id },
                data: {
                    inPosition: true,
                    lastAction: 'BUY',
                    buy_price: lastClose,
                    amountHeld: amountToBuy,
                    currentBalance: 0
                }
            });

            action = 'BUY';
            console.log(`BUY: Bought ${amountToBuy} ${symbol.split('/')[0]} at ${lastClose}`);
        }

        else if (userStrategy.inPosition && maS < maM && macdHist < 0 && rsiLast > 30) {
            const balanceAfterSell = userStrategy.amountHeld * lastClose;

            await prisma.userStrategy.update({
                where: { id: userStrategy.id },
                data: {
                    inPosition: false,
                    lastAction: 'SELL',
                    buy_price: 0,
                    amountHeld: 0,
                    currentBalance: balanceAfterSell
                }
            });

            action = 'SELL';
            console.log(`SELL: Sold at ${lastClose}, new balance: ${balanceAfterSell}`);
        }

        console.log(`User ${userId} (${riskLevel}) | ${symbol} => Action: ${action}`);
    } catch (err) {
        console.error(`Error running bot for user ${userId}:`, err.message);
    }
}
